// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation
import SwiftUI
import AWSConnect
import AWSConnectParticipant

class ChatManager : ObservableObject{
    @Published var messages: [Message] = []
    @Published var websocketManager: WebsocketManager!
    private let config = Config()
    private let networkManager: NetworkManager
    var websocketUrl: String?
    var connectParticipantClient: AWSConnectParticipant?
    var connectionToken: String?
    @Published var shouldShowRestoreChatPrompt: Bool = false
    @Published var error: ErrorMessage?
    @Published var isChatEnded: Bool? = false
    
    
    @Published var contactIdExists: Bool = UserDefaults.standard.string(forKey: "contactID") != nil
    var contactId: String? {
        didSet {
            DispatchQueue.main.async {
                if let contactId = self.contactId {
                    // ContactId is present, save it and update existence status
                    self.saveContactId(contactId)
                    print("Contact Id is set")
                    self.contactIdExists = true // Reflect the contactId's presence
                } else {
                    print("Contact Id is nill")
                    // ContactId is nil, reflect its absence
                    self.contactIdExists = false
                }
            }
        }
    }
    
    @Published var participantTokenExists: Bool = UserDefaults.standard.string(forKey: "participantToken") != nil
    var participantToken: String? {
        didSet {
            DispatchQueue.main.async {
                if let token = self.participantToken {
                    // Token is present, save it and update existence status
                    self.saveParticipantToken(token)
                    self.participantTokenExists = true // Reflect the token's presence
                } else {
                    // Token is nil, reflect its absence
                    // This else block might be used if you explicitly set participantToken to nil somewhere in your logic
                    self.participantTokenExists = false
                }
            }
        }
    }
    
    init() {
        networkManager = NetworkManager(httpClient: DefaultHttpClient())
        // `accessKey`,`secretKey` and `forKey` are set to empty on purpose. This is just to initiate AWS service. DO NOT NEED TO CHANGE ANYTHING HERE.
        let credentials = AWSStaticCredentialsProvider(accessKey: "", secretKey: "")
        // `region` is important, credentials are passed as empty as it was a mandatory parameter.
        let participantService = AWSServiceConfiguration(region: config.region,
                                                         credentialsProvider: credentials)!
        AWSConnectParticipant.register(with: participantService, forKey: "")
        connectParticipantClient = AWSConnectParticipant.init(forKey: "")
    }
    
    // Create a computed property to expose a @Binding to messages
    var messagesBinding: Binding<[Message]> {
        Binding(
            get: { self.messages },
            set: { self.messages = $0 }
        )
    }
    
    // Create a computed property to expose a @Binding to websocketManager
    var websocketManagerBinding: Binding<WebsocketManager?> {
        Binding(
            get: { self.websocketManager },
            set: { self.websocketManager = $0 }
        )
    }

    
    
    func initiateChat(completion: @escaping (Bool) -> Void) {
        if self.websocketUrl == nil {
            self.messages.removeAll()
            
            // Define a closure within this scope that uses the 'completion' from initiateChat
            let handleConnectionCompletion: (Bool) -> Void = { success in
                if success {
                    self.setupWebSocket()
                    self.getTranscript { allTranscriptItems in
                        DispatchQueue.main.async {
                            self.websocketManager.formatAndProcessTranscriptItems(allTranscriptItems.reversed())
                            completion(true)  // Here 'completion' is accessible
                        }
                    }
                } else {
                    DispatchQueue.main.async {
                        self.error = ErrorMessage(message: "Error setting up the chat session.")
                        self.removeParticipantToken()  // Ensure clean start for next session attempt
                        completion(false)  // And here as well
                    }
                }
            }
            
            if let savedToken = UserDefaults.standard.string(forKey: "participantToken") {
                self.participantToken = savedToken
                self.createParticipantConnection(usingSavedToken: true, completion: handleConnectionCompletion)
            } else {
                startChatContact(name: config.customerName,completion: handleConnectionCompletion)
            }
        } else {
            completion(true)  // Already have an active session
        }
    }
    
    
    // Handle incoming message
    // Update messages and send appropriate events
    func handleIncomingMessage(_ message: Message) {
        DispatchQueue.main.async {
            // To remove typing indicator from previous messages
            self.messages.removeAll { $0.text == "..." }
            // Check for message receipts
            if (message.contentType == ContentType.metaData.rawValue) {
                // To update the message receipts
                if let row = self.messages.firstIndex(where: {$0.messageID == message.messageID && !$0.text.isEmpty}) {
                    self.messages[row].status = message.status
                }
                // Do not show typing event for customer
            }else if !(message.text == "..." && message.participant == self.config.customerName){
                // Show the message as usual
                DispatchQueue.main.async {
                    self.messages.append(message)
                }
            }
            
            // Sends a `Delivered` event back to agent.
            if (!message.text.isEmpty && message.participant == self.config.agentName && message.contentType.contains("text")){
                let content = "{\"messageId\":\"\(message.messageID!)\"}"
                self.sendEvent(contentType: .messageDelivered, content: content)
            }
        }
    }
    
    func sendReadEventOnAppear(
        message: Message
    ){
        if let row = self.messages.firstIndex(where: {
            $0.text == message.text && !$0.text.isEmpty && $0.contentType.contains(
                "text"
            ) && $0.participant != config.customerName &&
            !$0.isRead
        }) {
            let content = "{\"messageId\":\"\(messages[row].messageID!)\"}"
            sendEvent(
                contentType: .messageRead,
                content: content
            )
            messages[row].isRead = true
        }
    }
    
    
    // MARK: - Persistant Chat
    
    // Save participant token
    private func saveParticipantToken(_ token: String) {
        UserDefaults.standard.set(token, forKey: "participantToken")
    }
    
    // Remove participant token
    func removeParticipantToken() {
        UserDefaults.standard.removeObject(forKey: "participantToken")
        DispatchQueue.main.async {
            self.participantTokenExists = false // Reflect token removal
        }
    }
    
    // Save contactId
    private func saveContactId(_ contactID: String) {
        print("Contact Id is saved")
        UserDefaults.standard.set(contactID, forKey: "contactID")
    }
    
    // Remove contactId
    func removeContactId() {
        print("Contact Id is removed")
        UserDefaults.standard.removeObject(forKey: "contactID")
        DispatchQueue.main.async {
            self.contactIdExists = false // Reflect contactID removal
        }
    }
    
    // New method to setup WebSocket and fetch transcript
    private func setupWebSocket() {
        guard let wsUrl = self.websocketUrl else {
            DispatchQueue.main.async {
                self.error = ErrorMessage(message: "Error setting up the chat. Please try again later.")
            }
            return
        }
        self.websocketManager = WebsocketManager(wsUrl: wsUrl, onRecievedMessage: self.handleIncomingMessage)
    }

    
    // MARK: - API and SDK calls
    
    // StartChat API: https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html
    // IOS SDK Docs: https://github.com/aws-amplify/aws-sdk-ios/tree/main
    
    /// Initiates a flow to start a new chat for the customer. Response of this API provides a token required to obtain credentials from the CreateParticipantConnection API in the Amazon Connect Participant Service.
    /// - Parameters:
    ///  - name: Information identifying the participant as part of  ParticipantDetails Object.
    ///  - Attributes  : A custom key-value pair using an attribute map
    ///  - ContactFlowId  : The identifier of the flow for initiating the chat. To see the ContactFlowId in the Amazon Connect console user interface, on the navigation menu go to Routing, Contact Flows.     Choose the flow. On the flow page, under the name of the flow, choose Show additional flow information. The ContactFlowId is the last part of the ARN.
    ///  - InstanceId  : The identifier of the Amazon Connect instance. You can find the instance ID in the Amazon Resource Name (ARN) of the instance.
    func startChatContact(name: String, completion: @escaping (Bool) -> Void) {
        let attributes = ["DisplayName": name, "City": "Seattle"]
        
        // Create PersistentChat only if previousContactId is not null
        var persistentChat: PersistantChat? = nil
        if let previousId = UserDefaults.standard.string(forKey: "contactID"), !previousId.isEmpty {
            print("previous contact Id is : \(previousId)")
            persistentChat = PersistantChat(SourceContactId: previousId,
                                            RehydrationType: "ENTIRE_PAST_SESSION") // Or "FROM_SEGMENT"
        }
        
        // Start new chat or continue without restoring the previous session
        self.networkManager.startChat(connectInstanceId: self.config.instanceId, contactFlowId: self.config.contactFlowId, displayName: name, attributes: attributes, persistantChat: persistentChat) { response in
            DispatchQueue.main.async {
                self.participantToken = response.data.startChatResult.participantToken
                self.saveParticipantToken(response.data.startChatResult.participantToken)
                self.contactId = response.data.startChatResult.contactId
                self.saveContactId(response.data.startChatResult.contactId)
                self.createParticipantConnection(usingSavedToken: false, completion: completion)
            }
        } onFailure: { error in
            DispatchQueue.main.async {
                self.error = ErrorMessage(message: "Failed to start chat: \(error.localizedDescription)")
                self.removeContactId()
                self.removeParticipantToken()
                completion(false)
            }
        }
    }
    
    
    /// Creates the participant's connection. https://docs.aws.amazon.com/connect-participant/latest/APIReference/API_CreateParticipantConnection.html
    /// - Parameter participantToken: The ParticipantToken as obtained from StartChatContact API response.
    func createParticipantConnection(usingSavedToken: Bool, completion: @escaping (Bool) -> Void) {
        let request = AWSConnectParticipantCreateParticipantConnectionRequest()
        request?.participantToken = self.participantToken
        request?.types = ["WEBSOCKET", "CONNECTION_CREDENTIALS"]
        
        connectParticipantClient?.createParticipantConnection(request!).continueWith { task in
            DispatchQueue.main.async {
                if let error = task.error {
                    self.error = ErrorMessage(message: "Error in creating participant connection: \(error.localizedDescription)")
                    self.removeParticipantToken()
                    completion(false)
                } else if let result = task.result {
                    self.connectionToken = result.connectionCredentials?.connectionToken
                    self.websocketUrl = result.websocket?.url
                    completion(true)
                } else {
                    self.error = ErrorMessage(message: "Unknown error occurred")
                    self.removeParticipantToken()
                    completion(false)
                }
            }
        }
    }
    
    
    /// To send a message using participant SDK.
    /// - Parameters:
    ///   - messageContent: The content of the message.
    ///   - connectionToken: The authentication token associated with the connection - Received from Participant Connection
    ///   -  contentType: text/plain, text/markdown, application/json, and application/vnd.amazonaws.connect.message.interactive.response
    func sendChatMessage(messageContent: String) {
        let sendMessageRequest = AWSConnectParticipantSendMessageRequest()
        sendMessageRequest?.connectionToken = self.connectionToken
        sendMessageRequest?.content = messageContent
        sendMessageRequest?.contentType = "text/plain"
        connectParticipantClient?
            .sendMessage(sendMessageRequest!)
            .continueWith(block: {
                (task) -> Any? in
                return nil
            })
    }
    
    
    /// Sends an event such as typing, joined, left etc.
    /// - Parameters:
    ///   - contentType: The content type of the request
    ///   - content: The content of the event to be sent (for example, message text). For content related to message receipts, this is supported in the form of a JSON string.
    func sendEvent(contentType: ContentType, content: String = "") {
        let sendEventRequest = AWSConnectParticipantSendEventRequest()
        sendEventRequest?.connectionToken = self.connectionToken
        sendEventRequest?.contentType = contentType.rawValue
        sendEventRequest?.content = content // Set the content here
        connectParticipantClient?
            .sendEvent(sendEventRequest!)
            .continueWith(block: {
                (task) -> Any? in
                return nil
            })
    }
    
    
    /// Disconnects a participant.
    /// - Parameter connectionToken: The authentication token associated with the connection - Received from Participant Connection
    func endChat() {
        self.removeParticipantToken()
        let disconnectParticipantRequest = AWSConnectParticipantDisconnectParticipantRequest()
        disconnectParticipantRequest?.connectionToken = self.connectionToken
        connectParticipantClient?.disconnectParticipant(disconnectParticipantRequest!)
            .continueWith(block: {
                (task) -> Any? in
                return nil
            }).waitUntilFinished()
        self.websocketUrl = nil
    }
    
    
    // Gets the transcipt of current session
    /// - Parameter connectionToken: Received from Participant Connection established using Participant token of previous session
    func getTranscript(nextToken: String? = nil, allTranscriptItems: [AWSConnectParticipantItem] = [], completion: @escaping ([AWSConnectParticipantItem]) -> Void) {
        var updatedAllTranscriptItems = allTranscriptItems
        let getTranscriptRequest = AWSConnectParticipantGetTranscriptRequest()
        getTranscriptRequest?.connectionToken = self.connectionToken
        getTranscriptRequest?.maxResults = 100
        getTranscriptRequest?.nextToken = nextToken
        getTranscriptRequest?.scanDirection = .backward
        
        connectParticipantClient?.getTranscript(getTranscriptRequest!).continueWith { (task) -> AnyObject? in
            if let error = task.error {
                print("Error in getting transcript: \(error.localizedDescription)")
                completion(updatedAllTranscriptItems)  // Call completion even if there's an error
                return nil
            }
            
            guard let result = task.result, let transcriptItems = result.transcript else {
                print("No result or incorrect type from getTranscript")
                completion(updatedAllTranscriptItems)  // Call completion even if there's no result
                return nil
            }
            
            updatedAllTranscriptItems += transcriptItems  // Accumulate transcript items
            
            if let nextToken = result.nextToken, !nextToken.isEmpty {
                // If there's more data, continue fetching
                print("GetTranscript: calling again with next token")
                self.getTranscript(nextToken: nextToken, allTranscriptItems: updatedAllTranscriptItems, completion: completion)
            } else {
                // If there's no more data, call the completion handler
                print("GetTranscript: completion method called with transcript: \(updatedAllTranscriptItems)")
                completion(updatedAllTranscriptItems)
            }
            
            return nil
        }
    }
    
}

extension ChatManager {
    
    struct ErrorMessage: Identifiable, Equatable {
        let id = UUID() // Conformance to Identifiable
        let message: String
    }
    
}
