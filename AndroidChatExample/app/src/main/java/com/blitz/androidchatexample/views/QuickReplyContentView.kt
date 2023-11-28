package com.blitz.androidchatexample.views

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.blitz.androidchatexample.models.Message
import com.blitz.androidchatexample.models.QuickReplyContent
import com.blitz.androidchatexample.viewmodel.ChatViewModel

@Composable
fun QuickReplyContentView(message: Message, messageContent: QuickReplyContent) {
    var showQuickReplies by remember { mutableStateOf(true) }
    val viewModel: ChatViewModel = hiltViewModel()

    Column(
        modifier = Modifier.padding(8.dp)
    ) {
        if (message.participant != null) {
            Text(
                text = message.participant!!,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }
        Surface(
            color = Color(0xFF8BC34A),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier
                .background(Color(0xFF8BC34A), shape = RoundedCornerShape(10.dp))
                .widthIn(max = LocalConfiguration.current.screenWidthDp.dp * 0.75f)
        ) {
            Column(modifier = Modifier.padding(10.dp)) {
                Text(
                    text = messageContent.title,
                    color = Color.White
                )
                message.timeStamp?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White,
                        modifier = Modifier.align(Alignment.End).alpha(0.7f)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(4.dp))
        if (showQuickReplies) {
            messageContent.options.forEach { option ->
                FilledTonalButton(
                    onClick = {
                        viewModel.sendMessage(option)
                        showQuickReplies = false
                    }, modifier = Modifier.background(Color.White)
                ) {
                    Text(text = option, color = Color.Blue)
                }
            }
        }
    }
}

