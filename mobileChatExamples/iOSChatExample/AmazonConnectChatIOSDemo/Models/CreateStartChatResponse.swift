// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import Foundation

struct CreateStartChatResponse: Codable {

    let status: String
    let data: StartChatResult

    struct StartChatResult: Codable {
        let contactId: String
        let participantId: String
        let participantToken: String
        let continuedFromContactId: String?

        // Define CodingKeys to map JSON keys to Swift properties
        enum CodingKeys: String, CodingKey {
            case contactId = "ContactId"
            case participantId = "ParticipantId"
            case participantToken = "ParticipantToken"
            case continuedFromContactId = "ContinuedFromContactId"
        }
    }

    // Define CodingKeys for top-level keys in the JSON response
    enum CodingKeys: String, CodingKey {
        case status
        case data
    }
}

