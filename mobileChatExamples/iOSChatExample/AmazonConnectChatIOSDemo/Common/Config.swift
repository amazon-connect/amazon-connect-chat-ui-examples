// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/*
 Find InstanceId: https://docs.aws.amazon.com/connect/latest/adminguide/find-instance-arn.html
 Find ContactFlowId: https://docs.aws.amazon.com/connect/latest/adminguide/find-contact-flow-id.html
 */

import Foundation
import AWSCore

class Config: ObservableObject {
    @Published var startChatEndPoint: String = "<UPDATE_ME>"
    @Published var instanceId: String = "<UPDATE_ME>"
    @Published var contactFlowId: String = "<UPDATE_ME>"
    @Published var region: AWSRegionType = .USWest2 // .USWest1 :https://docs.aws.amazon.com/general/latest/gr/rande.html
    @Published var agentName = "Agent"
    @Published var customerName = "Customer"

}
