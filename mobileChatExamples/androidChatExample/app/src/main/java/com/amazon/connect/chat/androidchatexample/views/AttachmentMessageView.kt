package com.amazon.connect.chat.androidchatexample.views

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.amazon.connect.chat.androidchatexample.utils.CommonUtils
import com.amazon.connect.chat.androidchatexample.viewmodel.ChatViewModel
import com.amazon.connect.chat.sdk.model.Message
import com.amazon.connect.chat.sdk.model.MessageDirection
import kotlinx.coroutines.launch
import java.net.URL

@Composable
fun AttachmentMessageView(
    message: Message,
    chatViewModel: ChatViewModel,
    recentOutgoingMessageID: String?,
    onPreviewAttachment: (URL, String) -> Unit  // Callback to handle file preview
) {
    var isDownloading by remember { mutableStateOf(false) }
    var downloadError by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxWidth(),
        contentAlignment = if (message.messageDirection == MessageDirection.INCOMING) Alignment.CenterStart else Alignment.CenterEnd
    ) {
        Column(
            modifier = Modifier
                .padding(8.dp)
                .background(Color.White, RoundedCornerShape(8.dp))
                .fillMaxWidth(0.80f),
            horizontalAlignment = Alignment.End
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
                        modifier = Modifier.weight(1f).padding(end = 4.dp),
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
                        if (message.messageDirection == MessageDirection.INCOMING) Color(0xFFEDEDED)
                        else Color(0xFFABCDEF),
                        RoundedCornerShape(8.dp)
                    )
                    .padding(8.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clickable {
                            coroutineScope.launch {
                            isDownloading = true
                            val result = message.attachmentId?.let {
                                chatViewModel.downloadAttachment(
                                    it, message.text)
                            }
                            isDownloading = false
                            result?.fold(
                                onSuccess = { uri ->
                                    onPreviewAttachment(uri, message.text)
                                },
                                onFailure = { error ->
                                    downloadError = "Failed to download attachment: ${error.localizedMessage}"
                                }
                            )
                            }
                        }
                        .padding(8.dp)
                ) {
                    Text(
                        text = message.text,
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color(0xFF0056b3),
                        modifier = Modifier
                            .weight(1f)
                            .padding(end = 8.dp),
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (isDownloading) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp))
                    } else {
                        Icon(
                            imageVector = Icons.Default.Description,
                            contentDescription = "Attachment",
                            tint = Color(0xFF0056b3)
                        )
                    }
                }
                downloadError?.let {
                    Text(
                        text = it,
                        color = Color.Red,
                        fontSize = 10.sp,
                        modifier = Modifier.padding(start = 8.dp)
                    )
                }
            }

            if (message.messageDirection == MessageDirection.OUTGOING && message.id == recentOutgoingMessageID) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    Text(
                        text = CommonUtils.customMessageStatus(message.metadata?.status),
                        fontSize = 10.sp,
                        color = Color.Gray,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}
