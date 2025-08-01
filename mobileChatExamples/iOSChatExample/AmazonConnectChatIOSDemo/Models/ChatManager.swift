// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation
import SwiftUI
import AmazonConnectChatIOS

class ChatManager: ObservableObject {
    // MARK: - Published Properties
    @Published var messages: [AmazonConnectChatIOS.TranscriptItem] = [] // Array to hold chat messages
    @Published var error: ErrorMessage? // Holds error messages if any occur
    @Published var shouldShowRestoreChatPrompt: Bool = false // Indicates if a restore chat prompt should be shown
    @Published var isChatEnded: Bool? = false // Indicates if the chat has ended
    @Published var isChatActive: Bool = false // Indicates if the chat is currently active
    @Published var participantTokenExists: Bool = UserDefaults.standard.string(forKey: Constants.participantTokenKey) != nil // Checks if a participant token exists in UserDefaults
    @Published var contactIdExists: Bool = UserDefaults.standard.string(forKey: Constants.contactIdKey) != nil // Checks if a contactId exists in UserDefaults
    
    // Property to hold the participant token, which triggers a handler when changed
    var participantToken: String? {
        didSet {
            handleParticipantTokenChange()
        }
    }
    
    var contactId: String? {
        didSet {
            handleContactIdChange()
        }
    }
    
    // MARK: - Properties
    private var config = Config() // Configuration for the chat
    private let networkManager: NetworkManager // Handles network operations
    var chatSession: ChatSessionProtocol // The chat session protocol instance
    var previousTranscriptNextToken: String?
    
    // MARK: - Initializer
    init() {
        // Initialize the network manager with a default HTTP client
        networkManager = NetworkManager(httpClient: DefaultHttpClient())
        // Create a global configuration with the region from the config
        let globalConfig = GlobalConfig(region: config.region)
        // Assign the shared chat session instance
        self.chatSession = ChatSession.shared
        // Configure the chat session with the global configuration
        chatSession.configure(config: globalConfig)
        // Setup handlers for various chat session events
        setupChatSessionHandlers(chatSession: chatSession)
        
        let customLogger = CustomLogger()
        SDKLogger.configureLogger(customLogger)
    }
    
    // MARK: - Init Chat
    /// Initiates a chat session, either by starting a new one or restoring a previous session
    func initiateChat(with config: Config, completion: @escaping (Bool) -> Void) {
        if !isChatActive {
            // Clear existing messages
            self.messages.removeAll()
            // Handle connection completion
            let handleConnectionCompletion: (Bool) -> Void = { success in
                if success {
                    completion(true)
                } else {
                    self.error = ErrorMessage(message: "Error setting up the chat session.")
                    completion(false)
                }
            }
            
            // Check if a participant token is saved in UserDefaults
            if let savedToken = UserDefaults.standard.string(forKey: "participantToken") {
                self.participantToken = savedToken
                let chatDetails = ChatDetails(participantToken: self.participantToken!)
                self.createParticipantConnection(usingSavedToken: false, chatDetails: chatDetails, completion: completion)
            } else {
                // Start a new chat contact
                startChatContact(name: config.customerName, completion: handleConnectionCompletion)
            }

        } else {
            completion(true)
        }
    }
    
    // MARK: - Setup Handlers
    /// Sets up various handlers for chat session events
    private func setupChatSessionHandlers(chatSession: ChatSessionProtocol) {
        self.chatSession.onConnectionEstablished = { [weak self] in
            print("Chat connection established.")
            DispatchQueue.main.async {
                self?.isChatActive = true
            }
        }
        
        self.chatSession.onConnectionReEstablished = { [weak self] in
            print("Chat connection reestablished.")
            DispatchQueue.main.async {
                self?.isChatActive = true
            }
        }
        
        self.chatSession.onMessageReceived = { [weak self] transcriptItem in
            // This callback can be leveraged if you choose to integrate/handle the transcript on your own.
        }
            
        self.chatSession.onTranscriptUpdated = { [weak self] transcriptData in
            self?.previousTranscriptNextToken = transcriptData.previousTranscriptNextToken
            
            // Log transcript items for debugging
            print("🔍 TRANSCRIPT_LOG: === TRANSCRIPT UPDATED ===")
            print("🔍 TRANSCRIPT_LOG: Total items: \(transcriptData.transcriptList.count)")
            for (index, item) in transcriptData.transcriptList.enumerated() {
                if let event = item as? Event {
                    print("🔍 TRANSCRIPT_LOG: [\(index)] EVENT - ContentType: \(event.contentType), Text: \(event.text ?? "nil"), DisplayName: \(event.displayName ?? "nil"), Participant: \(event.participant ?? "nil")")
                    
                    // Special logging for idle-related events
                    if event.contentType.contains("participant.idle") || 
                       event.contentType.contains("participant.returned") || 
                       event.contentType.contains("participant.autodisconnection") {
                        print("🚨 IDLE_EVENT: \(event.contentType) - \(event.displayName ?? "Unknown") - \(event.text ?? "")")
                    }
                } else if let message = item as? Message {
                    print("🔍 TRANSCRIPT_LOG: [\(index)] MESSAGE - Text: \(message.text), DisplayName: \(message.displayName ?? "nil"), Participant: \(message.participant ?? "nil")")
                } else {
                    print("🔍 TRANSCRIPT_LOG: [\(index)] OTHER - Type: \(type(of: item)), ID: \(item.id)")
                }
            }
            print("🔍 TRANSCRIPT_LOG: === END TRANSCRIPT ===")
            
            // Apply transcript updates
            self?.updateTranscript(transcriptData.transcriptList)
        }
        
        self.chatSession.onChatEnded = { [weak self] in
            print("Chat has ended.")
            DispatchQueue.main.async {
                self?.isChatEnded = true
            }
        }
        
        self.chatSession.onConnectionBroken = {
            print("Connection was lost.")
        }
        
        self.chatSession.onDeepHeartbeatFailure = {
            print("Received deep heartbeat failure.")
        }
        
        // MARK: - Participant State Events
        
        self.chatSession.onParticipantIdle = { eventData in
            let displayName = eventData.displayName ?? "Unknown"
            let participantRole = eventData.participantRole ?? "Unknown"
            let participantId = eventData.participantId ?? "Unknown"
            let timestamp = eventData.absoluteTime ?? "Unknown"
            print("😴 PARTICIPANT IDLE: \(displayName) (\(participantRole)) went idle [ID: \(participantId)] at \(timestamp)")
            
            // Example: Check if it's an agent who went idle
            if eventData.participantRole == "AGENT" {
                print("   → Agent went idle - show 'Agent is away' notification to customer")
                print("   → Consider offering callback option or queue position")
            } else if eventData.participantRole == "CUSTOMER" {
                print("   → Customer went idle - update status in agent dashboard")
                print("   → Set idle timer for potential auto-disconnect")
            }
        }
        
        self.chatSession.onParticipantReturned = { eventData in
            let displayName = eventData.displayName ?? "Unknown"
            let participantRole = eventData.participantRole ?? "Unknown"
            let participantId = eventData.participantId ?? "Unknown"
            let timestamp = eventData.absoluteTime ?? "Unknown"
            print("🔄 PARTICIPANT RETURNED: \(displayName) (\(participantRole)) returned from idle [ID: \(participantId)] at \(timestamp)")
            
            // Example: Check if it's an agent who returned
            if eventData.participantRole == "AGENT" {
                print("   → Agent returned - hide 'Agent is away' notification")
                print("   → Customer can continue chatting normally")
            } else if eventData.participantRole == "CUSTOMER" {
                print("   → Customer returned - update status to active in agent dashboard")
                print("   → Cancel any pending auto-disconnect timers")
            }
        }
        
        self.chatSession.onAutoDisconnection = { eventData in
            let displayName = eventData.displayName ?? "Unknown"
            let participantRole = eventData.participantRole ?? "Unknown"
            let participantId = eventData.participantId ?? "Unknown"
            let timestamp = eventData.absoluteTime ?? "Unknown"
            print("🚪 AUTO DISCONNECTION: \(displayName) (\(participantRole)) was automatically disconnected [ID: \(participantId)] at \(timestamp)")
            
            // Example: Handle different participant types
            if eventData.participantRole == "CUSTOMER" {
                print("   → Customer disconnected due to inactivity")
                print("   → Show reconnection options and chat transcript")
                print("   → Offer callback or email transcript options")
            } else if eventData.participantRole == "AGENT" {
                print("   → Agent disconnected - initiate chat transfer process")
                print("   → Notify customer of agent change")
                print("   → Queue chat for next available agent")
            }
        }
        
        // MARK: - Communication Events
        
        self.chatSession.onTyping = { eventData in
            let displayName = eventData.displayName ?? "Unknown"
            let participantRole = eventData.participantRole ?? "Unknown"
            let participantId = eventData.participantId ?? "Unknown"
            print("🔤 TYPING: \(displayName) (\(participantRole)) is typing... [ID: \(participantId)]")
            
            // Example: Show typing indicator in UI
            if eventData.participantRole == "AGENT" {
                print("   → Show agent typing indicator in chat UI")
            } else if eventData.participantRole == "CUSTOMER" {
                print("   → Show customer typing indicator in agent dashboard")
            }
        }
        
        self.chatSession.onReadReceipt = { eventData in
            let displayName = eventData.displayName ?? "Unknown"
            let participantRole = eventData.participantRole ?? "Unknown"
            let messageId = eventData.messageId ?? "Unknown"
            let timestamp = eventData.absoluteTime ?? "Unknown"
            print("✅ READ RECEIPT: Message \(messageId) read by \(displayName) (\(participantRole)) at \(timestamp)")
            
            // Example: Update message status in UI
            if eventData.participantRole == "AGENT" {
                print("   → Update message status to 'Read by Agent' in customer view")
            } else if eventData.participantRole == "CUSTOMER" {
                print("   → Update message status to 'Read by Customer' in agent dashboard")
            }
        }
        
        self.chatSession.onDeliveredReceipt = { eventData in
            let displayName = eventData.displayName ?? "Unknown"
            let participantRole = eventData.participantRole ?? "Unknown"
            let messageId = eventData.messageId ?? "Unknown"
            let timestamp = eventData.absoluteTime ?? "Unknown"
            print("📬 DELIVERED RECEIPT: Message \(messageId) delivered to \(displayName) (\(participantRole)) at \(timestamp)")
            
            // Example: Update message status in UI
            if eventData.participantRole == "AGENT" {
                print("   → Update message status to 'Delivered to Agent'")
            } else if eventData.participantRole == "CUSTOMER" {
                print("   → Update message status to 'Delivered to Customer'")
            }
        }
        
        // MARK: - Participant Management Events
        
        self.chatSession.onParticipantInvited = { eventData in
            let displayName = eventData.displayName ?? "Unknown"
            let participantRole = eventData.participantRole ?? "Unknown"
            let participantId = eventData.participantId ?? "Unknown"
            let timestamp = eventData.absoluteTime ?? "Unknown"
            print("👋 PARTICIPANT INVITED: \(displayName) (\(participantRole)) joined the chat [ID: \(participantId)] at \(timestamp)")
            
            // Example: Handle different participant types
            if eventData.participantRole == "AGENT" {
                print("   → New agent joined - show 'Agent \(displayName) joined' message in chat")
                print("   → Update participant list in UI")
            } else if eventData.participantRole == "SUPERVISOR" {
                print("   → Supervisor joined for monitoring - show supervisor presence indicator")
                print("   → Enable supervisor-specific features")
            } else if eventData.participantRole == "CUSTOMER" {
                print("   → Additional customer joined - enable multi-customer chat features")
            }
        }
        
        self.chatSession.onParticipantDisplayNameUpdated = { eventData in
            let newDisplayName = eventData.displayName ?? "Unknown"
            let participantRole = eventData.participantRole ?? "Unknown"
            let participantId = eventData.participantId ?? "Unknown"
            let timestamp = eventData.absoluteTime ?? "Unknown"
            print("✏️ DISPLAY NAME UPDATED: Participant \(participantId) (\(participantRole)) changed name to '\(newDisplayName)' at \(timestamp)")
            
            // Example: Update participant name in UI
            print("   → Update participant name in conversation view")
            print("   → Refresh participant list and message history")
            print("   → Show 'Name changed to \(newDisplayName)' notification")
            
            // Role-specific handling
            if eventData.participantRole == "AGENT" {
                print("   → Update agent name in customer chat interface")
            } else if eventData.participantRole == "CUSTOMER" {
                print("   → Update customer name in agent dashboard")
            }
        }
        
        // MARK: - Advanced Events
        
        self.chatSession.onChatRehydrated = { eventData in
            let timestamp = eventData.absoluteTime ?? "Unknown"
            let contactId = eventData.initialContactId ?? "Unknown"
            print("🔄 CHAT REHYDRATED: Previous chat session restored at \(timestamp) [Contact: \(contactId)]")
            
            // Example: Handle chat rehydration
            print("   → Loading previous conversation history...")
            print("   → Restoring chat state and participant information")
            print("   → Show 'Previous conversation restored' message to user")
            print("   → Re-establish connection with existing participants")
            
            // Additional context
            if let contentType = eventData.contentType {
                print("   → Event type: \(contentType)")
            }
            if let messageId = eventData.messageId {
                print("   → Rehydration event ID: \(messageId)")
            }
        }
    }
    
    // MARK: - Message Handling
    private func updateTranscript(_ updatedItems: [TranscriptItem]) {
        DispatchQueue.main.async {
            for item in updatedItems {
                // Determine message direction
                CommonUtils.getMessageDirection(from: item)
                
                if let event = item as? Event {
                    // Customize the event
                    CommonUtils.customizeEvent(from: event)
                }
                
                if let message = item as? Message {
                    // Send message receipt
                    self.chatSession.sendMessageReceipt(for: message, eventType: .messageDelivered)
                }
            }
            // Update the messages array
            self.messages = updatedItems
        }
    }
    
    // MARK: - Start Chat Contact
    /// Starts a new chat contact or restores a previous session if available
    private func startChatContact(name: String, completion: @escaping (Bool) -> Void) {
        // Attributes to be sent with the chat initiation request
        let attributes = ["DisplayName": name, "City": "Seattle"]
        
        // Create PersistentChat only if previousContactId is not null
       var persistentChat: PersistentChat? = nil
        if let previousId = UserDefaults.standard.string(forKey: Constants.contactIdKey), !previousId.isEmpty {
           print("previous contact Id is : \(previousId)")
           persistentChat = PersistentChat(SourceContactId: previousId,
                                           RehydrationType: "ENTIRE_PAST_SESSION") // Or "FROM_SEGMENT"
       }
        
        networkManager.startChat(endpoint: config.startChatEndPoint, connectInstanceId: config.instanceId, contactFlowId: config.contactFlowId, displayName: name, attributes: attributes, persistantChat: persistentChat) { response in
            self.handleStartChatResponse(response, completion: completion)
        } onFailure: { error in
            self.handleStartChatFailure(error, completion: completion)
        }
    }
    
    // Handles the successful response from starting a chat
    private func handleStartChatResponse(_ response: CreateStartChatResponse, completion: @escaping (Bool) -> Void) {
        DispatchQueue.main.async {
            let response = response.data.startChatResult
            // Save the participant token
            self.participantToken = response.participantToken
            self.contactId = response.contactId
            let chatDetails = ChatDetails(contactId: response.contactId, participantId: response.participantId, participantToken: response.participantToken)
            // Create a participant connection with the chat details
            self.createParticipantConnection(usingSavedToken: false, chatDetails: chatDetails, completion: completion)
        }
    }
    
    // Handles the failure response from starting a chat
    private func handleStartChatFailure(_ error: Error, completion: @escaping (Bool) -> Void) {
        DispatchQueue.main.async {
            self.error = ErrorMessage(message: "Failed to start chat: \(error.localizedDescription)")
            print("Failed to start chat: \(error.localizedDescription)")
            completion(false)
        }
    }
    
    // MARK: - AmazonConnectChatIOS SDK Calls
    /// Creates a participant connection using the provided chat details
    private func createParticipantConnection(usingSavedToken: Bool, chatDetails: ChatDetails, completion: @escaping (Bool) -> Void) {
        self.chatSession.connect(chatDetails: chatDetails) { [weak self] result in
            switch result {
            case .success:
                print("Participant connection successfully created.")
                completion(true)
            case .failure(let error):
                self?.handleConnectionFailure(error, completion: completion)
            }
        }
    }
    
    // Handles the failure response from creating a participant connection
    private func handleConnectionFailure(_ error: Error, completion: @escaping (Bool) -> Void) {
        print("Error in creating participant connection: \(error.localizedDescription)")
        self.error = ErrorMessage(message: "Error in creating participant connection: \(error.localizedDescription)")
        completion(false)
    }
    
    /// Sends a chat message with plain text content
    func sendChatMessage(messageContent: String) {
        self.chatSession.sendMessage(contentType: .plainText, message: messageContent) { [weak self] result in
            self?.handleMessageSendResult(result)
        }
    }
    
    // Handles the result of sending a chat message
    private func handleMessageSendResult(_ result: Result<Void, Error>) {
        DispatchQueue.main.async {
            if case .failure(let error) = result {
                self.error = ErrorMessage(message: "Error sending message: \(error.localizedDescription)")
            }
        }
    }
    
    /// Sends an attachment file
    func sendAttachment(file: URL) {
        self.chatSession.sendAttachment(file: file) { result in
            self.handleAttachmentSendResult(result)
            // Release access to the file
            file.stopAccessingSecurityScopedResource()
        }
    }
    
    // Handles the result of sending an attachment
    private func handleAttachmentSendResult(_ result: Result<Void, Error>) {
        DispatchQueue.main.async {
            switch result {
            case .success:
                print("Attachment sent successfully.")
            case .failure(let error):
                print("Error sending attachment: \(error.localizedDescription)")
            }
        }
    }
    
    /// Downloads an attachment file
    func downloadAttachment(attachmentId: String, filename: String, completion: @escaping (Result<URL, Error>) -> Void) {
        self.chatSession.downloadAttachment(attachmentId: attachmentId, filename: filename) { result in
            self.handleAttachmentDownloadResult(result, completion: completion)
        }
    }
    
    // Handles the result of downloading an attachment
    private func handleAttachmentDownloadResult(_ result: Result<URL, Error>, completion: @escaping (Result<URL, Error>) -> Void) {
        DispatchQueue.main.async {
            completion(result)
        }
    }
    
    /// Sends an event to the chat session
    func sendEvent(contentType: AmazonConnectChatIOS.ContentType, content: String = "") {
        self.chatSession.sendEvent(event: contentType, content: content) { [weak self] result in
            self?.handleEventSendResult(result)
        }
    }
    
    // Handles the result of sending an event
    private func handleEventSendResult(_ result: Result<Void, Error>) {
        DispatchQueue.main.async {
            if case .failure(let error) = result {
                self.error = ErrorMessage(message: "Error sending event: \(error.localizedDescription)")
            }
        }
    }
    
    /// Resends a failed message using the SDK's resendFailedMessage API
    func resendFailedMessage(messageId: String) {
        self.chatSession.resendFailedMessage(messageId: messageId) { [weak self] result in
            self?.handleMessageResendResult(result, messageId: messageId)
        }
    }
    
    // Handles the result of resending a failed message
    private func handleMessageResendResult(_ result: Result<Void, Error>, messageId: String) {
        DispatchQueue.main.async {
            switch result {
            case .success:
                print("Message resent successfully for messageId: \(messageId)")
            case .failure(let error):
                print("Error resending message: \(error.localizedDescription)")
                self.error = ErrorMessage(message: "Error resending message: \(error.localizedDescription)")
            }
        }
    }
    
    /// Disconnects the chat session
    func disconnectChat() {
        // Remove the participant token
        removeParticipantToken()
        isChatEnded = true
        isChatActive = false
        self.chatSession.disconnect { [weak self] result in
            self?.handleChatDisconnectResult(result)
        }
    }
    
    // Handles the result of disconnecting the chat
    private func handleChatDisconnectResult(_ result: Result<Void, Error>) {
        DispatchQueue.main.async {
            if case .failure(let error) = result {
                self.error = ErrorMessage(message: "Error disconnecting: \(error.localizedDescription)")
            }
        }
    }
    
    /// Fetches the chat transcript recursively
    func fetchTranscript(nextToken: String? = nil, onCompletion: @escaping (Bool) -> Void) {
        self.chatSession.getTranscript(scanDirection: .backward, sortOrder: .descending, maxResults: 10, nextToken: self.previousTranscriptNextToken, startPosition: nil) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let response):
                    print("Transcript fetched successfully")                    
                    onCompletion(true)
                case .failure(let error):
                    print("Error fetching transcript: \(error.localizedDescription)")
                    self?.error = ErrorMessage(message: "Error fetching transcript: \(error.localizedDescription)")
                    onCompletion(false)
                }
            }
        }
    }


    // MARK: - Helpers
    /// Sends a read receipt for the specified message if it is a plain text message
    func sendReadEventOnAppear(message: Message) {
        self.chatSession.sendMessageReceipt(for: message, eventType: .messageRead)
    }
    
    // MARK: - Token Management
    /// Saves the participant token to UserDefaults
    private func saveParticipantToken(_ token: String) {
        UserDefaults.standard.set(token, forKey: Constants.participantTokenKey)
        participantTokenExists = true
    }
    
    /// Removes the participant token from UserDefaults
    func removeParticipantToken() {
        UserDefaults.standard.removeObject(forKey: Constants.participantTokenKey)
        participantTokenExists = false
    }
    
    /// Handles changes to the participant token
    private func handleParticipantTokenChange() {
        if let token = participantToken {
            saveParticipantToken(token)
        } else {
            participantTokenExists = false
        }
    }
    
    // MARK: - Contact Id Management
    /// Saves the contact Id to UserDefaults
    private func saveContactId(_ id: String) {
        UserDefaults.standard.set(id, forKey: Constants.contactIdKey)
        contactIdExists = true
    }
    
    /// Removes the contact Id from User Defaults
    func removeContactId() {
        UserDefaults.standard.removeObject(forKey: Constants.contactIdKey)
        contactIdExists = false
    }
    
    /// Handles changes to contact Id
    private func handleContactIdChange() {
        if let id = contactId {
            saveContactId(id)
        } else {
            contactIdExists = false
        }
    }
    
    // MARK: - ErrorMessage Struct
    struct ErrorMessage: Identifiable, Equatable {
        let id = UUID() // Unique identifier for the error message
        let message: String // The error message string
    }
}

// MARK: - Constants
private struct Constants {
    static let participantTokenKey = "participantToken" // Key for saving the participant token in UserDefaults
    static let contactIdKey = "contactId" // Key for saving the contact ID in UserDefaults
}
