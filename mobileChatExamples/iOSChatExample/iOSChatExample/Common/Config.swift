// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/*
 Find InstanceId: https://docs.aws.amazon.com/connect/latest/adminguide/find-instance-arn.html
 Find ContactFlowId: https://docs.aws.amazon.com/connect/latest/adminguide/find-contact-flow-id.html
 */

import Foundation
import AWSConnect

class Config {
    
//    let startChatEndPoint: String = ""
//    let instanctId: String = ""
//    let contactFlowId: String = ""
//    let region: AWSRegionType =  // .USEast1/.USWest1 :https://docs.aws.amazon.com/general/latest/gr/rande.html
//    let agentName = "A"
//    let customerName = "C"
//    
//    let startChatEndPoint: String = "https://z1rl17iwcd.execute-api.us-west-2.amazonaws.com/Prod/"
//        let instanctId: String = "3b4fb544-a89c-43e4-b364-042e63d660cc"
//        let contactFlowId: String = "2de9e031-e0ed-44dd-a26a-58a4cede6085"
//        let region: AWSRegionType = .USWest2
//    
    
    // Chat Interactive
//    let startChatEndPoint: String = "https://gjo44gvozj.execute-api.us-west-2.amazonaws.com/Prod/"
//    let instanctId: String = "7f18d5d6-8e42-4613-9014-84503d17e7da"
//    let contactFlowId: String = "99bb23b4-1800-46f5-a50a-7315c9dc5c2b"
//    let region: AWSRegionType = .USWest2
//
//    

      // Chat Plain
      let startChatEndPoint: String = "https://3r4nj9r68b.execute-api.us-east-1.amazonaws.com/Prod/"
      let instanceId: String = "6ceda8ca-5e6e-4a60-9bfb-4994cc1fec79"
      let contactFlowId: String = "c8d90d07-a28c-4a97-9dfb-f4785b98d8d2"
      let region: AWSRegionType = .USEast1


      let agentName = "AGENT"
      let customerName = "CUSTOMER"
    
    
}
