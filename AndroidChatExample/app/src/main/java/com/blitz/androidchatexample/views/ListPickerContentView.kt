package com.blitz.androidchatexample.views

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.blitz.androidchatexample.R
import com.blitz.androidchatexample.models.ListPickerContent
import com.blitz.androidchatexample.models.ListPickerElement
import com.blitz.androidchatexample.models.Message
import com.blitz.androidchatexample.viewmodel.ChatViewModel

@Composable
fun ListPickerContentView(
    message: Message,
    content: ListPickerContent
) {
    var showListPicker by remember { mutableStateOf(true) }
    val viewModel: ChatViewModel = hiltViewModel()

    if (message.participant != null) {
        Text(
            text = message.participant!!,
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.padding(start = 8.dp, bottom = 4.dp)
        )
    }
    if (showListPicker) {
        Column(
            modifier = Modifier
                .padding(start = 8.dp)
                .clip(RoundedCornerShape(size = 10.dp))
                .widthIn(max = LocalConfiguration.current.screenWidthDp.dp * 0.75f)
                .background(color = Color(0xFF9FB980))
                .padding(horizontal = 10.dp, vertical = 10.dp)
        ) {
            if (!content.imageUrl.isNullOrEmpty()) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(content.imageUrl)
                        .crossfade(true)
                        .build(),
                    placeholder = painterResource(R.drawable.placeholder),
                    contentDescription = "Content Description",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .padding(bottom = 8.dp)
                        .clip(RoundedCornerShape(size = 10.dp))
                        .fillMaxWidth()
                )
            }
            Text(
                text = content.title,
                style = MaterialTheme.typography.titleSmall,
            )
            content.subtitle?.let {
                Text(
                    text = content.subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
            content.options.forEach { element ->
                ListPickerOption(element) {
                    // When an option is selected
                    viewModel.sendMessage(element.title)
                    showListPicker = false
                }
            }
        }
    }else {
        Surface(
            color = Color(0xFF8BC34A),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier
                .padding(start = 8.dp)
                .background(Color(0xFF8BC34A), shape = RoundedCornerShape(10.dp))
                .widthIn(max = LocalConfiguration.current.screenWidthDp.dp * 0.75f)
        ) {
            Column(modifier = Modifier.padding(10.dp)) {
                Text(
                    text = content.title,
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
    }
}

@Composable
fun ListPickerOption(
    element: ListPickerElement,
    onOptionSelected: () -> Unit,
) {
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 8.dp)
            .clickable(onClick = onOptionSelected),
        colors = CardDefaults.cardColors(
            containerColor = Color.White,
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            element.imageData?.let { imageUrl ->
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(imageUrl)
                        .crossfade(true)
                        .build(),
                    placeholder = painterResource(R.drawable.placeholder),
                    contentDescription = "Content Description",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .clip(RoundedCornerShape(size = 10.dp))
                        .size(40.dp)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = element.title,
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold
                )
                element.subtitle?.let { subtitle ->
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
            }
        }
    }
}

