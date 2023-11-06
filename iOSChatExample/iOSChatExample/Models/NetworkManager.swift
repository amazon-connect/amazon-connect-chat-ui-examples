//
//  NetworkManager.swift
//  Chat
//
//  Created by Mittal, Rajat on 11/1/23.
//

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
                             onSuccess: @escaping (_ response: CreateStartChatResponse) -> Void,
                             onFailure: @escaping (_ error: Error) -> Void) {
        let url = config.startChatEndPoint
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
