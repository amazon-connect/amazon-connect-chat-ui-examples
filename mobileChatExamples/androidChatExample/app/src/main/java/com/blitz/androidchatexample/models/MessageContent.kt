package com.blitz.androidchatexample.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

interface MessageContent {
}

// Plain Text
@Serializable
data class PlainTextContent(val text: String) : MessageContent {
    companion object{
        fun decode(text: String): MessageContent = PlainTextContent(text)
    }
}

// Generic Interactive Template
@Serializable
data class GenericInteractiveTemplate(
    val templateType: String
    // Other common properties
)

interface InteractiveContent : MessageContent {
}

// Quick Reply Content
@Serializable
data class QuickReplyElement(
    val title: String
)
@Serializable
data class QuickReplyContentData(
    val title: String,
    val subtitle: String? = null,
    val elements: List<QuickReplyElement>
)
@Serializable
data class QuickReplyData(
    val content: QuickReplyContentData
)
@Serializable
data class QuickReplyTemplate(
    val templateType: String,
    val version: String,
    val data: QuickReplyData
)
@Serializable
data class QuickReplyContent(
    val title: String,
    val subtitle: String? = null,
    val options: List<String>
) : InteractiveContent {
    companion object {
        const val templateType = "QuickReply"
        fun decode(text: String): InteractiveContent? {
            return try {
                val quickReply = Json.decodeFromString<QuickReplyTemplate>(text)
                val options = quickReply.data.content.elements.map { it.title }
                val title = quickReply.data.content.title
                val subtitle = quickReply.data.content.subtitle ?: "" // Fallback to empty string if null
                QuickReplyContent(title, subtitle, options)
            } catch (e: Exception) {
                println("Error decoding QuickReplyContent: ${e.message}")
                null
            }
        }
    }
}

// List Picker
@Serializable
data class ListPickerElement(
    val title: String,
    val subtitle: String? = null,
    val imageType: String? = null,
    val imageData: String? = null
)
@Serializable
data class ListPickerContentData(
    val title: String,
    val subtitle: String? = null,
    val imageType: String? = null,
    val imageData: String? = null,
    val elements: List<ListPickerElement>
)
@Serializable
data class ListPickerData(
    val content: ListPickerContentData
)
@Serializable
data class ListPickerTemplate(
    val templateType: String,
    val version: String,
    val data: ListPickerData
)
@Serializable
data class ListPickerContent(
    val title: String,
    val subtitle: String? = null,
    val imageUrl: String? = null,
    val options: List<ListPickerElement>
) : InteractiveContent {
    companion object {
        const val templateType = "ListPicker"
        fun decode(text: String): InteractiveContent? {
            return try {
                val listPicker = Json.decodeFromString<ListPickerTemplate>(text)
                val title = listPicker.data.content.title
                val subtitle = listPicker.data.content.subtitle ?: ""
                val options = listPicker.data.content.elements
                val imageUrl = listPicker.data.content.imageData ?: ""
                ListPickerContent(title, subtitle, imageUrl, options)
            } catch (e: Exception) {
                println("Error decoding ListPickerContent: ${e.message}")
                null
            }
        }
    }
}
