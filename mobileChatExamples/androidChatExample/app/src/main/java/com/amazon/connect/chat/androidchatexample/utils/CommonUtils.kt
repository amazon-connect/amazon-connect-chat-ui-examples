package com.amazon.connect.chat.androidchatexample.utils

import com.amazon.connect.chat.sdk.model.ContentType
import com.amazon.connect.chat.sdk.model.Event
import com.amazon.connect.chat.sdk.model.Message
import com.amazon.connect.chat.sdk.model.MessageDirection
import com.amazon.connect.chat.sdk.model.MessageStatus
import com.amazon.connect.chat.sdk.model.TranscriptItem
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object CommonUtils {

    fun formatTime(timeStamp: String): String {
        val utcFormatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }

        val date = utcFormatter.parse(timeStamp)
        return if (date != null) {
            val localFormatter = SimpleDateFormat("HH:mm", Locale.getDefault()).apply {
                timeZone = TimeZone.getDefault()
            }
            localFormatter.format(date)
        } else {
            timeStamp
        }
    }

    fun formatDate(currentTimeMillis: Long, forLogs: Boolean = false): String {
        val date = Date(currentTimeMillis)
        var utcFormatter: SimpleDateFormat? = null
        if (forLogs) {
            utcFormatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
        } else {
            utcFormatter = SimpleDateFormat("yyyy-MM-dd_HH-mm", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
        }
        return utcFormatter.format(date)
    }

    fun getMessageDirection(transcriptItem: TranscriptItem) {
        when (transcriptItem) {
            is Message -> {
                val participant = transcriptItem.participant?.lowercase()
                val direction = when (participant) {
                    "customer" -> MessageDirection.OUTGOING
                    "agent", "system" -> MessageDirection.INCOMING
                    else -> MessageDirection.COMMON
                }
                transcriptItem.messageDirection = direction
            }
            is Event -> {
                val participant = transcriptItem.participant?.lowercase() ?: return
                val direction = if (transcriptItem.contentType == ContentType.TYPING.type) {
                    when (participant) {
                        "customer" -> MessageDirection.OUTGOING
                        else -> MessageDirection.INCOMING
                    }
                } else {
                    MessageDirection.COMMON
                }
                transcriptItem.eventDirection = direction
            }
        }
    }

    fun customizeEvent(event: Event) {
        val displayNameOrParticipant = if (!event.displayName.isNullOrEmpty()) {
            event.displayName
        } else {
            event.participant
        } ?: "SYSTEM"

        when (event.contentType) {
            ContentType.JOINED.type -> {
                event.text = "$displayNameOrParticipant has joined the chat"
                event.participant = "System"
            }
            ContentType.LEFT.type -> {
                event.text = "$displayNameOrParticipant has left the chat"
                event.participant = "System"
            }
            ContentType.ENDED.type -> {
                event.text = "The chat has ended"
                event.participant = "System"
            }
            else -> {
                // No customization needed for other content types
            }
        }
    }


    fun customMessageStatus(status: MessageStatus?): String {
        return when (status) {
            MessageStatus.Delivered -> "Delivered"
            MessageStatus.Read -> "Read"
            MessageStatus.Sending -> "Sending"
            MessageStatus.Failed -> "Failed to send"
            MessageStatus.Sent -> "Sent"
            MessageStatus.Custom -> status.customValue ?: "Custom status"
            else -> ""  // Returning empty string for unknown or null status
        }
    }
}