// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation

struct TranscriptResponse: Codable {
    let initialContactId: String
    let nextToken: String
    let transcript: [TranscriptItem]

    struct TranscriptItem: Codable {
        let absoluteTime: String
        let content: String?
        let contentType: String
        let displayName: String
        let id: String
        let participantId: String
        let participantRole: String
        let type: String
        let messageMetadata: MessageMetadata?

        struct MessageMetadata: Codable {
            let messageId: String
            let receipts: [Receipt]?

            struct Receipt: Codable {
                let deliveredTimestamp: String?
                let readTimestamp: String?
                let recipientParticipantId: String
            }
        }

        enum CodingKeys: String, CodingKey {
            case absoluteTime = "AbsoluteTime"
            case content = "Content"
            case contentType = "ContentType"
            case displayName = "DisplayName"
            case id = "Id"
            case participantId = "ParticipantId"
            case participantRole = "ParticipantRole"
            case type = "Type"
            case messageMetadata = "MessageMetadata"
        }
    }

    enum CodingKeys: String, CodingKey {
        case initialContactId = "InitialContactId"
        case nextToken = "NextToken"
        case transcript = "Transcript"
    }
}
