// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/*
 Find InstanceId: https://docs.aws.amazon.com/connect/latest/adminguide/find-instance-arn.html
 Find ContactFlowId: https://docs.aws.amazon.com/connect/latest/adminguide/find-contact-flow-id.html
 */

import Foundation
import AWSCore

class Config: ObservableObject {
    @Published var startChatEndPoint: String = ""
    @Published var instanceId: String = ""
    @Published var contactFlowId: String = ""
    @Published var region: AWSRegionType = .USWest2 // .USEast1
    @Published var agentName = "Agent"
    @Published var customerName = "Customer"
    
}
