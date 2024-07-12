// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/*
 Find InstanceId: https://docs.aws.amazon.com/connect/latest/adminguide/find-instance-arn.html
 Find ContactFlowId: https://docs.aws.amazon.com/connect/latest/adminguide/find-contact-flow-id.html
 */

import Foundation
import AWSCore

class Config: ObservableObject {
    @Published var startChatEndPoint: String = "https://3r4nj9r68b.execute-api.us-east-1.amazonaws.com/Prod/"
    @Published var instanceId: String = "6ceda8ca-5e6e-4a60-9bfb-4994cc1fec79"
    @Published var contactFlowId: String = "c8d90d07-a28c-4a97-9dfb-f4785b98d8d2"
    @Published var region: AWSRegionType = .USEast1 // .USWest1 :https://docs.aws.amazon.com/general/latest/gr/rande.html
    @Published var agentName = "Agent"
    @Published var customerName = "Customer"
    
    func update(from instanceConfig: InstanceConfig) {
        self.startChatEndPoint = instanceConfig.apiEndpoint
        self.instanceId = instanceConfig.instanceId
        self.contactFlowId = instanceConfig.contactFlowId
        self.region = .USWest2
    }
    
//    let startChatEndPoint: String = "https://3r4nj9r68b.execute-api.us-east-1.amazonaws.com/Prod/"
//    let instanceId: String = "6ceda8ca-5e6e-4a60-9bfb-4994cc1fec79"
//    let contactFlowId: String = "c8d90d07-a28c-4a97-9dfb-f4785b98d8d2"
//    let region: AWSRegionType = .USEast1 // .USWest1 :https://docs.aws.amazon.com/general/latest/gr/rande.html
    
    //    let startChatEndPoint: String = "https://jmg90g4gq6.execute-api.us-west-2.amazonaws.com/Prod/"
    //     let instanceId: String = "4869764f-a5c5-4c06-8927-b586ffe908d1"
    //     let contactFlowId: String = "4cff3282-9e3e-4100-8816-e5681276620f"
    //     let region: AWSRegionType = .USWest2
    
    //    let startChatEndPoint: String = "https://bckgq4zvh9.execute-api.us-west-2.amazonaws.com/Prod/"
    //     let instanceId: String = "a804164f-683f-45ca-95d0-dd037fffa535"
    //     let contactFlowId: String = "2b51c53d-d185-4045-9cae-9eee1c817324"
    //     let region: AWSRegionType = .USWest2
    
    
    //    let startChatEndPoint: String = "https://vsgxy28naj.execute-api.us-west-2.amazonaws.com/Prod/"
    //    let startChatEndPoint: String = "https://xou0t3xb8j.execute-api.us-west-2.amazonaws.com/Prod/"
    //      let instanceId: String = "dff8adb3-ad41-4c4c-9e0b-fe9514446d99"
    //      let contactFlowId: String = "78334415-c7d1-4301-9e06-d296b6e86dc5"
    //      let region: AWSRegionType = .USWest2 // .USWest1 :https://docs.aws.amazon.com/general/latest/gr/rande.html
    
}
