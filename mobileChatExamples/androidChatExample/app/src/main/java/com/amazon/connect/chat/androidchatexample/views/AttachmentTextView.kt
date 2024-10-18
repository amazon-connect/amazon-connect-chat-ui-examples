package com.amazon.connect.chat.androidchatexample.views

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
@Composable
fun AttachmentTextView(
    text: String,
    selectedFileUri: String?,
    onTextChange: (String) -> Unit,
    onRemoveAttachment: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .background(
                shape = RoundedCornerShape(10.dp),
                color = Color.Gray.copy(alpha = 0.1f)
            )
            .fillMaxWidth() // Ensures the entire component takes the available width

    ) {
        selectedFileUri?.let { uri ->
            if (uri.isNotEmpty()) {
                Row(
                    modifier = Modifier
                        .padding(10.dp)
                        .background(Color.Gray.copy(alpha = 0.2f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = uri ?: "",
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        color = Color.Blue,
                        fontSize = 16.sp,
                        style = TextStyle(textDecoration = TextDecoration.Underline),
                        modifier = Modifier.align(Alignment.CenterVertically)
                    )
                    IconButton(onClick = { onRemoveAttachment()}) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Remove attachment",
                            tint = Color.Red)
                    }
                }
            }
        }

        TextField(
            value = text,
            onValueChange = { newText ->
                onTextChange(newText)
            },
            placeholder = { Text("Type a message") },
            colors = TextFieldDefaults.colors(),
            modifier = Modifier.fillMaxWidth()
        )
    }
}


@Composable
@Preview(showBackground = true)
fun PreviewAttachmentTextViewNoAttachment() {
    AttachmentTextView(
        text = "",
        selectedFileUri = null,
        onTextChange = {},
        onRemoveAttachment = {}
    )
}

@Composable
@Preview(showBackground = true)
fun PreviewAttachmentTextViewWithAttachment() {
    AttachmentTextView(
        text = "",
        selectedFileUri = "sample.pdf",
        onTextChange = {},
        onRemoveAttachment = {}
    )
}
