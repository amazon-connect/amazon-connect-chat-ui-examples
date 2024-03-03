// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation

class NetworkManager {
    
    private let httpClient: HttpClient
    private let config = Config()
    
    init(httpClient: HttpClient) {
        self.httpClient = httpClient
    }
    
    func startChat(connectInstanceId: String,
                   contactFlowId: String,
                   displayName: String,
                   attributes: [String: String],
                   persistantChat: PersistantChat?,
                   onSuccess: @escaping (_ response: CreateStartChatResponse) -> Void,
                   onFailure: @escaping (_ error: Error) -> Void) {
        let url = config.startChatEndPoint
        if let ps = persistantChat{
            print("GetTranscript: calling START CHAT with contactID: \(ps.SourceContactId)")
        }
        let body = CreateStartChatRequest(connectInstanceId: connectInstanceId,
                                          contactFlowId: contactFlowId,
                                          participantDetails: ParticipantDetails(DisplayName: displayName),
                                          persistantChat: persistantChat)
        // Convert body to JSON for logging
        if let jsonData = try? JSONEncoder().encode(body),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            print("Request body for startChat: \(jsonString)")
        }
        self.httpClient.postJson(url, nil, body) { (data : CreateStartChatResponse) in
            onSuccess(data)
        } _: { error in
            onFailure(error)
        }
    }
}
