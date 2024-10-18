package com.amazon.connect.chat.androidchatexample

import com.amazonaws.regions.Regions

object Config {
    val connectInstanceId: String = ""
    val contactFlowId: String = ""
    val startChatEndpoint: String = "https://<endpoint>.execute-api.<region>.amazonaws.com/Prod/"
    val region: Regions = Regions.US_WEST_2
    val agentName = "AGENT"
    val customerName = "CUSTOMER"
}
