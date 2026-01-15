// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Foundation
import AmazonConnectChatIOS
import AWSConnectParticipant

/// Example: Partial Custom Client - Override only specific methods
/// 
/// This example demonstrates selective method override where you only implement
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
        // For proxy routing, use PassThroughCustomClient (Example 2) instead
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
    
    // All other acps methods (sendEvent, getTranscript, startAttachmentUpload, 
    // completeAttachmentUpload, getAttachment, disconnectParticipantConnection) 
    // automatically use parent AWSClient implementation - no code needed!
}
