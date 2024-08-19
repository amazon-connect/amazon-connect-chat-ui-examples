// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import Foundation

struct CreateStartChatRequest: Codable {

    let connectInstanceId: String
    let contactFlowId: String
    let participantDetails: ParticipantDetails
    let SupportedMessagingContentTypes : [String] = ["text/plain", "text/markdown"]

    enum CodingKeys: String, CodingKey {
        case connectInstanceId = "ConnectInstanceId"
        case contactFlowId = "ContactFlowId"
        case participantDetails = "ParticipantDetails"
        case SupportedMessagingContentTypes = "SupportedMessagingContentTypes"
    }
}

struct ParticipantDetails: Codable {
    let DisplayName: String
}
