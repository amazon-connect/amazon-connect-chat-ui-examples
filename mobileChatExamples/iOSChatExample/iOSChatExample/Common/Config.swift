// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/*
 Find InstanceId: https://docs.aws.amazon.com/connect/latest/adminguide/find-instance-arn.html
 Find ContactFlowId: https://docs.aws.amazon.com/connect/latest/adminguide/find-contact-flow-id.html
 */

import Foundation
import AWSConnect

class Config {
  let startChatEndPoint: String = ""
  let instanceId: String = ""
  let contactFlowId: String = ""
  let region: AWSRegionType = // .USEast1/.USWest1 :https://docs.aws.amazon.com/general/latest/gr/rande.html
  let agentName = "Agent"
  let customerName = "Customer"
}
