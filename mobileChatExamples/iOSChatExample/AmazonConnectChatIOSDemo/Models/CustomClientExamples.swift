// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation
import AmazonConnectChatIOS
import AWSConnectParticipant

// MARK: - Partial Custom Client

/// Example: Partial Custom Client - Override only specific methods
/// 
/// This example demonstrates selective ACPS method override where you only implement
/// the methods you need to customize (e.g., for logging, monitoring, or custom headers).
/// All non-overridden methods automatically use the parent AWSClient implementation.
///
/// Use Case: Add logging/monitoring to specific API calls without reimplementing everything
class PartialCustomClient: AWSClient {
    
    override init() {
        super.init()
        
        // Configure the parent AWSClient with default settings
        let defaultConfig = GlobalConfig(region: Config().region)
        self.configure(with: defaultConfig)
    }
    
    // Override only createParticipantConnection - add custom behavior then call parent
    override func createParticipantConnection(participantToken: String, completion: @escaping (Result<ConnectionDetails, Error>) -> Void) {
        // CUSTOM LOGIC: Add your monitoring, logging, or light modifications here
        // For proxy routing, use CompleteCustomClient instead
        print("[Custom Client] Creating participant connection")
        
        // Call parent implementation to use real AWS API
        super.createParticipantConnection(participantToken: participantToken, completion: completion)
    }
    
    // Override only sendMessage - add custom behavior then call parent
    override func sendMessage(connectionToken: String, contentType: ContentType, message: String, completion: @escaping (Result<AWSConnectParticipantSendMessageResponse, Error>) -> Void) {
        // CUSTOM LOGIC: Add message filtering, logging, analytics, etc.
        print("[Custom Client] Sending message")
        
        // Call parent implementation to use real AWS API
        super.sendMessage(connectionToken: connectionToken, contentType: contentType, message: message, completion: completion)
    }
    
    // All other ACPS methods (sendEvent, getTranscript, startAttachmentUpload, 
    // completeAttachmentUpload, getAttachment, disconnectParticipantConnection) 
    // automatically use parent AWSClient implementation - no code needed!
}

// MARK: - Complete Custom Client

/// Example: Complete Custom Client - Override all methods for full control
///
/// This example demonstrates complete method override where you implement all ACPS methods
/// to have full control over API interactions (e.g., for proxy routing, custom authentication).
///
/// Use Case: Route all API calls through corporate proxy with custom headers/authentication
///
/// NOTE: This example calls parent implementation for demonstration. In production, you would:
/// 1. Route requests through your proxy/gateway
/// 2. Add custom authentication headers
/// 3. Implement proper error handling and retries
/// 4. Parse real AWS responses
class CompleteCustomClient: AWSClient {
    
    override init() {
        super.init()
        // Configure parent with region - will be reconfigured by SDK with full GlobalConfig
        let config = GlobalConfig(region: Config().region)
        self.configure(with: config)
    }
    
    override func createParticipantConnection(participantToken: String, completion: @escaping (Result<ConnectionDetails, Error>) -> Void) {
        // CUSTOM LOGIC: Add your proxy routing here
        // Example: Route to https://your-proxy.com/connect-participant
        //          Add custom headers: Authorization, API keys, etc.
        print("[Custom Client] createParticipantConnection - add proxy routing here")
        
        // Call parent to use real AWS API (replace this with your proxy call in production)
        super.createParticipantConnection(participantToken: participantToken, completion: completion)
    }
    
    override func sendMessage(connectionToken: String, contentType: ContentType, message: String, completion: @escaping (Result<AWSConnectParticipantSendMessageResponse, Error>) -> Void) {
        // CUSTOM LOGIC: Add your proxy routing and custom headers here
        // Example: Add WAF tokens, authentication headers, etc.
        print("[Custom Client] sendMessage - add custom headers here")
        
        // Call parent to use real AWS API (replace this with your proxy call in production)
        super.sendMessage(connectionToken: connectionToken, contentType: contentType, message: message, completion: completion)
    }
    
    override func sendEvent(connectionToken: String, contentType: ContentType, content: String, completion: @escaping (Result<AWSConnectParticipantSendEventResponse, Error>) -> Void) {
        // CUSTOM LOGIC: Add your proxy routing here
        print("[Custom Client] sendEvent")
        
        // Call parent to use real AWS API (replace this with your proxy call in production)
        super.sendEvent(connectionToken: connectionToken, contentType: contentType, content: content, completion: completion)
    }
    
    override func getTranscript(getTranscriptArgs: AWSConnectParticipantGetTranscriptRequest, completion: @escaping (Result<AWSConnectParticipantGetTranscriptResponse, Error>) -> Void) {
        // CUSTOM LOGIC: Add your proxy routing here
        print("[Custom Client] getTranscript")
        
        // Call parent to use real AWS API (replace this with your proxy call in production)
        super.getTranscript(getTranscriptArgs: getTranscriptArgs, completion: completion)
    }
    
    override func disconnectParticipantConnection(connectionToken: String, completion: @escaping (Result<AWSConnectParticipantDisconnectParticipantResponse, Error>) -> Void) {
        // CUSTOM LOGIC: Add your proxy routing here
        print("[Custom Client] disconnectParticipantConnection")
        
        // Call parent to use real AWS API (replace this with your proxy call in production)
        super.disconnectParticipantConnection(connectionToken: connectionToken, completion: completion)
    }
    
    override func startAttachmentUpload(connectionToken: String, contentType: String, attachmentName: String, attachmentSizeInBytes: Int, completion: @escaping (Result<AWSConnectParticipantStartAttachmentUploadResponse, Error>) -> Void) {
        // CUSTOM LOGIC: Add your proxy routing here
        print("[Custom Client] startAttachmentUpload")
        
        // Call parent to use real AWS API (replace this with your proxy call in production)
        super.startAttachmentUpload(connectionToken: connectionToken, contentType: contentType, attachmentName: attachmentName, attachmentSizeInBytes: attachmentSizeInBytes, completion: completion)
    }
    
    override func completeAttachmentUpload(connectionToken: String, attachmentIds: [String], completion: @escaping (Result<AWSConnectParticipantCompleteAttachmentUploadResponse, Error>) -> Void) {
        // CUSTOM LOGIC: Add your proxy routing here
        print("[Custom Client] completeAttachmentUpload")
        
        // Call parent to use real AWS API (replace this with your proxy call in production)
        super.completeAttachmentUpload(connectionToken: connectionToken, attachmentIds: attachmentIds, completion: completion)
    }
    
    override func getAttachment(connectionToken: String, attachmentId: String, completion: @escaping (Result<AWSConnectParticipantGetAttachmentResponse, Error>) -> Void) {
        // CUSTOM LOGIC: Add your proxy routing here
        print("[Custom Client] getAttachment")
        
        // Call parent to use real AWS API (replace this with your proxy call in production)
        super.getAttachment(connectionToken: connectionToken, attachmentId: attachmentId, completion: completion)
    }
}
