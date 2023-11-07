// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import Foundation

struct CreateStartChatResponse: Codable {

    let data: Data

    struct Data: Codable {
        let startChatResult: StartChatResult
        
        struct StartChatResult: Codable {
            let contactId: String
            let participantId: String
            let participantToken: String
            
            enum CodingKeys: String, CodingKey {
                case contactId = "ContactId"
                case participantId = "ParticipantId"
                case participantToken = "ParticipantToken"
            }
        }
    }

    enum CodingKeys: String, CodingKey {
        case data
    }
}

