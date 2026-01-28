// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import Foundation

struct CreateStartChatRequest: Codable {

    let connectInstanceId: String
    let contactFlowId: String
    let participantDetails: ParticipantDetails
    let persistantChat: PersistentChat?
    let SupportedMessagingContentTypes : [String] = ["text/plain", "text/markdown", "application/vnd.amazonaws.connect.message.interactive"]

    enum CodingKeys: String, CodingKey {
        case connectInstanceId = "ConnectInstanceId"
        case contactFlowId = "ContactFlowId"
        case participantDetails = "ParticipantDetails"
        case persistantChat = "PersistentChat"
        case SupportedMessagingContentTypes = "SupportedMessagingContentTypes"
    }
}

struct ParticipantDetails: Codable {
    let DisplayName: String
}
