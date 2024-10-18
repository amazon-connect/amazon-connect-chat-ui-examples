package com.amazon.connect.chat.androidchatexample.views

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.amazon.connect.chat.androidchatexample.utils.CommonUtils
import com.amazon.connect.chat.androidchatexample.viewmodel.ChatViewModel
import com.amazon.connect.chat.sdk.model.ContentType
import com.amazon.connect.chat.sdk.model.Event
import com.amazon.connect.chat.sdk.model.ListPickerContent
import com.amazon.connect.chat.sdk.model.Message
import com.amazon.connect.chat.sdk.model.MessageDirection
import com.amazon.connect.chat.sdk.model.PlainTextContent
import com.amazon.connect.chat.sdk.model.QuickReplyContent
import com.amazon.connect.chat.sdk.model.TranscriptItem
import java.net.URL

@Composable
fun ChatMessageView(
    transcriptItem: TranscriptItem,
    viewModel: ChatViewModel,
    recentOutgoingMessageID: String?,
    onPreviewAttachment: (URL, String) -> Unit
) {
    when (transcriptItem) {
        is Message -> {
            when (transcriptItem.messageDirection) {
                MessageDirection.OUTGOING -> {
                    if (transcriptItem.attachmentId != null) {
                        AttachmentMessageView(transcriptItem, viewModel, recentOutgoingMessageID, onPreviewAttachment)
                    } else {
                        SenderChatBubble(transcriptItem, recentOutgoingMessageID)
                    }
                }
                MessageDirection.INCOMING -> {
                    when (val content = transcriptItem.content) {
                        is PlainTextContent -> {
                            if (transcriptItem.attachmentId != null) {
                                AttachmentMessageView(transcriptItem, viewModel, recentOutgoingMessageID, onPreviewAttachment)
                            } else {
                                ReceiverChatBubble(transcriptItem)
                            }
                        }
                        is QuickReplyContent -> QuickReplyContentView(transcriptItem, content)
                        is ListPickerContent -> ListPickerContentView(transcriptItem, content)
                        else -> Text(text = "Unsupported message type, View is missing")
                    }
                }
                MessageDirection.COMMON -> CommonChatBubble(transcriptItem)
                null -> CommonChatBubble(transcriptItem)
            }
        }
        // Add handling for other TranscriptItem subclasses if necessary
        is Event -> {
            EventView(transcriptItem)
        }
        else -> Text(text = "Unsupported transcript item type")
    }
}


@Composable
fun SenderChatBubble(message: Message, recentOutgoingMessageID: String? = null) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 6.dp),
        contentAlignment = Alignment.CenterEnd,
    ) {
        Column(
            modifier = Modifier
                .padding(8.dp)
                .background(Color.White, RoundedCornerShape(8.dp))
                .fillMaxWidth(0.80f),
            horizontalAlignment = Alignment.End,
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 2.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                message.displayName?.let {
                    Text(
                        text = it.ifEmpty { message.participant },
                        color = Color.Black,
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier
                            .weight(1f)
                            .padding(end = 4.dp),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Text(
                    text = CommonUtils.formatTime(message.timeStamp) ?: "",
                    color = Color.Gray,
                    style = MaterialTheme.typography.bodySmall
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Color(0xFFABCDEF),
                        RoundedCornerShape(8.dp)
                    )
                    .padding(8.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .padding(8.dp)
                ) {
                    Text(
                        text = message.text,
                        color = Color.Black,
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier
                            .weight(1f)
                            .padding(end = 8.dp)
                    )
                }

            }

            message.metadata?.status?.let {
                if (message.id == recentOutgoingMessageID) {
                    Text(
                        text = it.status,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
            }
        }
    }
}

@Composable
fun ReceiverChatBubble(message: Message) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 6.dp),
        contentAlignment = Alignment.CenterStart,
    ) {
        Column(
            modifier = Modifier
                .padding(8.dp)
                .background(Color.White, RoundedCornerShape(8.dp))
                .fillMaxWidth(0.80f),
            horizontalAlignment = Alignment.End,
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 2.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                message.displayName?.let {
                    Text(
                        text = it.ifEmpty { message.participant },
                        color = Color.Black,
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier
                            .weight(1f)
                            .padding(end = 4.dp),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Text(
                    text = CommonUtils.formatTime(message.timeStamp) ?: "",
                    color = Color.Gray,
                    style = MaterialTheme.typography.bodySmall
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Color(0xFFEDEDED),
                        RoundedCornerShape(8.dp)
                    )
                    .padding(8.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .padding(8.dp)
                ) {
                    Text(
                        text = message.text,
                        color = Color.Black,
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier
                            .weight(1f)
                            .padding(end = 8.dp),
                        overflow = TextOverflow.Ellipsis
                    )
                }

            }
        }
    }
}

@Composable
fun CommonChatBubble(message: Message) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = message.text,
            color = Color.Gray,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .widthIn(max = LocalConfiguration.current.screenWidthDp.dp * 0.75f)
        )
    }
}

@Composable
fun EventView(event: Event) {

    val isTypingEvent = event.contentType == ContentType.TYPING.type &&
            event.eventDirection == MessageDirection.INCOMING
    val padding: Dp
    val alignment: Alignment

    if (isTypingEvent) {
        alignment = Alignment.CenterStart
        padding = 0.dp
    } else {
        alignment = Alignment.Center
        padding = 8.dp
    }

    if (event.eventDirection != MessageDirection.OUTGOING) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(padding)
                .padding(top = 6.dp),
            contentAlignment = alignment
        ) {
            if (isTypingEvent) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Color(0xFFFFFFFF),
                            RoundedCornerShape(8.dp)
                        )
                        .padding(8.dp)
                ) {
                    event.displayName?.let {
                        Text(
                            text = it,
                            color = Color.Black,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier
                                .padding(4.dp),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                    TypingIndicator()
                }
            } else if (event.eventDirection == MessageDirection.COMMON) {
                event.text?.let {
                    Text(
                        style = MaterialTheme.typography.bodyLarge,
                        text = it,
                        color = Color.Black,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .widthIn(max = LocalConfiguration.current.screenWidthDp.dp * 0.75f)
                    )
                }
            }
        }
    }
}

