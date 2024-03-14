package com.blitz.androidchatexample.models

import com.blitz.androidchatexample.utils.ContentType
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import java.util.UUID

enum class MessageType{
    SENDER,
    RECEIVER,
    COMMON
}

data class Message (
    var participant: String?,
    var text: String,
    val id: UUID = UUID.randomUUID(),
    var contentType: String,
    var messageType: MessageType,
    var timeStamp: String? = null,
    var messageID: String? = null,
    var status: String? = null,
    var isRead: Boolean = false
){
    val content: MessageContent?
        get() = when (contentType) {
            ContentType.PLAIN_TEXT.type -> PlainTextContent.decode(text)
            ContentType.RICH_TEXT.type -> PlainTextContent.decode(text) // You can replace this with a rich text class later
            ContentType.INTERACTIVE_TEXT.type -> decodeInteractiveContent(text)
            else -> null // Handle unsupported content types
        }

    // Helper method to decode interactive content
    private fun decodeInteractiveContent(text: String): InteractiveContent? {
        val jsonData = text.toByteArray(Charsets.UTF_8)
        val genericTemplate = try {
            Json { ignoreUnknownKeys = true }.decodeFromString<GenericInteractiveTemplate>(String(jsonData))
        } catch (e: SerializationException) {
            null
        }
        return when (genericTemplate?.templateType) {
            QuickReplyContent.templateType -> QuickReplyContent.decode(text)
            ListPickerContent.templateType -> ListPickerContent.decode(text)
            // Add cases for each interactive message type, decoding as appropriate.
            else -> {
                println("Unsupported interactive content type: ${genericTemplate?.templateType}")
                null
            }
        }
    }

}