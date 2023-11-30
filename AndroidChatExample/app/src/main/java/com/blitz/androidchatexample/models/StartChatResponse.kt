package com.blitz.androidchatexample.models

import com.google.gson.annotations.SerializedName

data class StartChatResponse(
    @SerializedName("data") val data: Data
) {
    data class Data(
        @SerializedName("startChatResult") val startChatResult: StartChatResult
    ) {
        data class StartChatResult(
            @SerializedName("ContactId") val contactId: String,
            @SerializedName("ParticipantId") val participantId: String,
            @SerializedName("ParticipantToken") val participantToken: String
        )
    }
}
