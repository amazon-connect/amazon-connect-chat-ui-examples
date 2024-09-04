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
    
    // Property to hold the participant token, which triggers a handler when changed
    var participantToken: String? {
        didSet {
            handleParticipantTokenChange()
        }
    }
    
    // MARK: - Properties
    private var config = Config() // Configuration for the chat
    private let networkManager: NetworkManager // Handles network operations
    var chatSession: ChatSessionProtocol // The chat session protocol instance
    
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
            
        self.chatSession.onTranscriptUpdated = { [weak self] transcript in
            // Apply transcript updates
            self?.updateTranscript(transcript)
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
        networkManager.startChat(endpoint: config.startChatEndPoint, connectInstanceId: config.instanceId, contactFlowId: config.contactFlowId, displayName: name, attributes: attributes) { response in
            self.handleStartChatResponse(response, completion: completion)
        } onFailure: { error in
            self.handleStartChatFailure(error, completion: completion)
        }
    }
    
    // Handles the successful response from starting a chat
    private func handleStartChatResponse(_ response: CreateStartChatResponse, completion: @escaping (Bool) -> Void) {
        DispatchQueue.main.async {
            let response = response.data
            // Save the participant token
            self.participantToken = response.participantToken
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
    
    /// Fetches the chat transcript
    func fetchTranscript() {
        self.chatSession.getTranscript(scanDirection: .backward, sortOrder: .descending, maxResults: 30, nextToken: nil, startPosition: self.messages.first?.id) { [weak self] result in
            self?.handleFetchTranscriptResult(result)
        }
    }
    
    // Handles the result of fetching the chat transcript
    private func handleFetchTranscriptResult(_ result: Result<TranscriptResponse, Error>) {
        DispatchQueue.main.async {
            switch result {
            case .success(let response):
                print("Transcript loaded successfully")
            case .failure(let error):
                self.error = ErrorMessage(message: "Error fetching transcript: \(error.localizedDescription)")
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
    
    // MARK: - ErrorMessage Struct
    struct ErrorMessage: Identifiable, Equatable {
        let id = UUID() // Unique identifier for the error message
        let message: String // The error message string
    }
}

// MARK: - Constants
private struct Constants {
    static let participantTokenKey = "participantToken" // Key for saving the participant token in UserDefaults
}
