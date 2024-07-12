//
//  InstanceConfig.swift
//  AmazonConnectChatIOSDemo
//
//  Created by Mittal, Rajat on 7/8/24.
//


import Foundation

struct InstanceConfig {
    let instanceName: String
    let apiEndpoint: String
    let instanceId: String
    let contactFlowId: String
}


let instanceConfigs: [InstanceConfig] = [
    InstanceConfig(instanceName: "mobile-sdk-bug-bash-1", apiEndpoint: "https://bqo00ujzld.execute-api.us-west-2.amazonaws.com/Prod", instanceId: "e816d0f3-eda3-46e4-bc67-9999e621eff6", contactFlowId: "f22bfa3b-400e-4250-939d-90a79eb1cd24"),
    InstanceConfig(instanceName: "mobile-sdk-bug-bash-2", apiEndpoint: "https://0epn6aav6c.execute-api.us-west-2.amazonaws.com/Prod", instanceId: "2fb8e2eb-27be-4985-8f79-36167ad67809", contactFlowId: "34660115-5658-45ef-8a34-0c67f29e0cc3"),
    InstanceConfig(instanceName: "mobile-sdk-bug-bash-3", apiEndpoint: "https://kopg30tz0m.execute-api.us-west-2.amazonaws.com/Prod", instanceId: "9e330fe8-389b-4e51-b6b2-c249462d7e33", contactFlowId: "a1acd643-869d-45a0-b758-d380214580cd"),
    InstanceConfig(instanceName: "mobile-sdk-bug-bash-4", apiEndpoint: "https://90xvfcmagf.execute-api.us-west-2.amazonaws.com/Prod", instanceId: "e1583b31-180b-40b2-b178-de14431c2c05", contactFlowId: "7cd7a051-a9ab-4976-8771-1308ac0a36a2"),
    InstanceConfig(instanceName: "mobile-sdk-bug-bash-5", apiEndpoint: "https://7iuw47fpze.execute-api.us-west-2.amazonaws.com/Prod", instanceId: "ab9cd0bb-4b48-41ba-89b5-dbce21578da0", contactFlowId: "6172d249-c10d-44ab-b58f-6f239bb04f89"),
    InstanceConfig(instanceName: "mobile-sdk-bug-bash-6", apiEndpoint: "https://i082cw29k6.execute-api.us-west-2.amazonaws.com/Prod", instanceId: "e3680738-5a08-400c-b225-5fffd49285b4", contactFlowId: "6554f608-d29b-405b-ad00-79a1ea38fff3"),
    InstanceConfig(instanceName: "mobile-sdk-bug-bash-7", apiEndpoint: "https://g1rsx96di3.execute-api.us-west-2.amazonaws.com/Prod", instanceId: "9b2cc5d5-870f-41a3-b109-373625a4484b", contactFlowId: "d981e631-a352-4184-b701-26677a299b1a"),
    InstanceConfig(instanceName: "mobile-sdk-bug-bash-8", apiEndpoint: "https://u5te1a9q3a.execute-api.us-west-2.amazonaws.com/Prod", instanceId: "20e49202-d94d-4ff2-9b92-760d3198a6eb", contactFlowId: "dca6571a-80e9-449a-a616-f44930dd7f5d"),
    InstanceConfig(instanceName: "mobile-sdk-bug-bash-9", apiEndpoint: "https://bq3xb2274f.execute-api.us-west-2.amazonaws.com/Prod", instanceId: "cd1e2eab-a207-43a5-a23f-84cce38b37cf", contactFlowId: "d00ee1da-a718-4cbd-9464-afca04081c41"),
    InstanceConfig(instanceName: "mobile-sdk-bug-bash-10", apiEndpoint: "https://ww6m6wbu2l.execute-api.us-west-2.amazonaws.com/Prod", instanceId: "e9f55232-fb94-4ce3-8430-f07746b61bf3", contactFlowId: "7215f209-6dbe-4f66-b5cc-e5a153e52f7c")
]
