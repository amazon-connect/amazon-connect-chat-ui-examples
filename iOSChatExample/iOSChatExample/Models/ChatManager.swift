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
    var participantToken: String?
    var connectionToken: String?

    init() {
        networkManager = NetworkManager(httpClient: DefaultHttpClient())
        let credentials = AWSStaticCredentialsProvider(accessKey: "", secretKey: "")
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
    
    func initiateChat() {
        if self.websocketUrl == nil {
            self.messages.removeAll()
            self.startChatContact(name: config.customerName)
            self.createParticipantConnection()
            // Since websocketUrl is used immediately after being checked for nil,
            // it might be better to guard unwrap it to prevent potential runtime crashes.
            guard let wsUrl = self.websocketUrl else {
                print("Websocket URL is nil")
                return
            }
            // Set up your WebSocket connection
            self.websocketManager = WebsocketManager(
                wsUrl: wsUrl,
                onRecievedMessage: { message in
                    self.handleIncomingMessage(message)
                }
            )
        }
    }
    
    // Handle incoming message
    // Update messages and send appropriate events
    func handleIncomingMessage(_ message: Message) {
        
        // To remove typing indicator from previous messages
        self.messages.removeAll { $0.text == "..." }
        // Check for message receipts
        if (message.contentType == ContentType.metaData.rawValue) {
            // To update the message receipts
            if let row = self.messages.firstIndex(where: {$0.messageID == message.messageID && !$0.text.isEmpty}) {
                self.messages[row].status = message.status
            }
            // Do not show typing event for customer
        }else if !(message.text == "..." && message.participant == config.customerName){
            // Show the message as usual
            DispatchQueue.main.async {
                self.messages.append(message)
            }
        }
        
        // Sends a `Delivered` event back to agent.
        if (!message.text.isEmpty && message.participant == config.agentName && message.contentType.contains("text")){
            let content = "{\"messageId\":\"\(message.messageID!)\"}"
            self.sendEvent(contentType: .messageDelivered, content: content)
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
    
    
    // MARK: - API and SDK calls
    
    /// Initiates a flow to start a new chat for the customer. Response of this API provides a token required to obtain credentials from the CreateParticipantConnection API in the Amazon Connect Participant Service.
    /// - Parameters:
    ///  - name: Information identifying the participant as part of  ParticipantDetails Object.
    ///  - Attributes  : A custom key-value pair using an attribute map
    ///  - ContactFlowId  : The identifier of the flow for initiating the chat. To see the ContactFlowId in the Amazon Connect console user interface, on the navigation menu go to Routing, Contact Flows.     Choose the flow. On the flow page, under the name of the flow, choose Show additional flow information. The ContactFlowId is the last part of the ARN.
    ///  - InstanceId  : The identifier of the Amazon Connect instance. You can find the instance ID in the Amazon Resource Name (ARN) of the instance.
    func startChatContact(name: String){
        let city = "Seattle"
        let attributes = [
            "DisplayName": name,
            "City": city
        ]
        let group = DispatchGroup()
        group.enter()
        self.networkManager.startChat(connectInstanceId: self.config.instanctId,
                                      contactFlowId: self.config.contactFlowId,
                                      displayName: name,
                                      attributes: attributes) { response in
            self.participantToken = response.data.startChatResult.participantToken
            group.leave()
        } onFailure: { error in
            group.leave()
        }
        group.wait()
    }
    
    
    /// Creates the participant's connection. https://docs.aws.amazon.com/connect-participant/latest/APIReference/API_CreateParticipantConnection.html
    /// - Parameter participantToken: The ParticipantToken as obtained from StartChatContact API response.
    func createParticipantConnection() {
        let createParticipantConnectionRequest = AWSConnectParticipantCreateParticipantConnectionRequest()
        createParticipantConnectionRequest?.participantToken = self.participantToken
        createParticipantConnectionRequest?.types = ["WEBSOCKET", "CONNECTION_CREDENTIALS"]
        connectParticipantClient?
            . createParticipantConnection (createParticipantConnectionRequest!)
            .continueWith(block: {
                (task) -> Any? in
                self.connectionToken = task.result!.connectionCredentials!.connectionToken
                self.websocketUrl = task.result!.websocket!.url
                return nil
            }
            ).waitUntilFinished()
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
        let disconnectParticipantRequest = AWSConnectParticipantDisconnectParticipantRequest()
        disconnectParticipantRequest?.connectionToken = self.connectionToken
        connectParticipantClient?.disconnectParticipant(disconnectParticipantRequest!)
            .continueWith(block: {
                (task) -> Any? in
                return nil
            }).waitUntilFinished()
        self.websocketUrl = nil
    }
}
