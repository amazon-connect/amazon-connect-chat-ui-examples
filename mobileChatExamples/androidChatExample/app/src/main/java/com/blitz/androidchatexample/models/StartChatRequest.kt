package com.blitz.androidchatexample.models

import com.google.gson.annotations.SerializedName

data class StartChatRequest(
    @SerializedName("InstanceId") val connectInstanceId: String,
    @SerializedName("ContactFlowId") val contactFlowId: String,
    @SerializedName("ParticipantDetails") val participantDetails: ParticipantDetails,
    @SerializedName("SupportedMessagingContentTypes") val supportedMessagingContentTypes: List<String> = listOf("text/plain", "text/markdown")
)

data class ParticipantDetails(
    @SerializedName("DisplayName") val displayName: String
)