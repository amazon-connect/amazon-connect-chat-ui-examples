package com.blitz.androidchatexample.models

data class TranscriptResponse(
    val initialContactId: String,
    val nextToken: String?,
    val transcript: List<TranscriptItem>
)

data class TranscriptItem(
    val absoluteTime: String,
    val content: String?,
    val contentType: String,
    val displayName: String?,
    val id: String,
    val participantId: String?,
    val participantRole: String?,
    val type: String,
    val messageMetadata: MessageMetadata?
)

data class MessageMetadata(
    val messageId: String,
    val receipts: List<Receipt>?
)

data class Receipt(
    val deliveredTimestamp: String?,
    val readTimestamp: String?,
    val recipientParticipantId: String
)
