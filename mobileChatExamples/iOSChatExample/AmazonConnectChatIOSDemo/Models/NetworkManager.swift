// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation

class NetworkManager {
    
    private let httpClient: HttpClient
    private let config = Config()
    
    init(httpClient: HttpClient) {
        self.httpClient = httpClient
    }
    
    func startChat(endpoint: String,
                   connectInstanceId: String,
                   contactFlowId: String,
                   displayName: String,
                   attributes: [String: String],
                   onSuccess: @escaping (_ response: CreateStartChatResponse) -> Void,
                   onFailure: @escaping (_ error: Error) -> Void) {
        let url = endpoint
        let body = CreateStartChatRequest(connectInstanceId: connectInstanceId,
                                          contactFlowId: contactFlowId,
                                          participantDetails: ParticipantDetails(DisplayName: displayName))
        
        self.httpClient.postJson(url, nil, body) { (data : CreateStartChatResponse) in
            onSuccess(data)
        } _: { error in
            onFailure(error)
        }
    }
}
