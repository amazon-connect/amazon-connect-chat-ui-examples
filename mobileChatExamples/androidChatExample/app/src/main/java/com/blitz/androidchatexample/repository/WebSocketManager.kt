package com.blitz.androidchatexample.repository

import android.util.Log
import com.blitz.androidchatexample.Config
import com.blitz.androidchatexample.models.Message
import com.blitz.androidchatexample.models.MessageType
import com.blitz.androidchatexample.models.TranscriptItem
import com.blitz.androidchatexample.utils.CommonUtils
import com.blitz.androidchatexample.utils.ContentType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

class WebSocketManager {
    private val client: OkHttpClient = OkHttpClient.Builder()
        .pingInterval(60, TimeUnit.SECONDS)
        .build()
    private var webSocket: WebSocket? = null
    private lateinit var messageCallBack : (Message) -> Unit
    private val chatConfiguration = Config

    fun createWebSocket(url: String, onMessageReceived: (Message) -> Unit, onConnectionFailed: (String) -> Unit) {
        val request = Request.Builder().url(url).build()
        this.messageCallBack = onMessageReceived
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                // Handle WebSocket open event
                sendMessage("{\"topic\": \"aws/subscribe\", \"content\": {\"topics\": [\"aws/chat\"]}}")
            }

            override fun onMessage(ws: WebSocket, text: String) {
                Log.i("text@onMessage",text)
                websocketDidReceiveMessage(text)
            }

            override fun onClosing(ws: WebSocket, code: Int, reason: String) {
                // Handle WebSocket closing event
            }

            override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                // Handle WebSocket closed event
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                onConnectionFailed(t.message ?: "Unknown Error")
            }
        })
    }

    fun websocketDidReceiveMessage(text: String) {
        val json = JSONObject(text)
        val content = json.opt("content")
        if (content is String) {
            val contentJson = JSONObject(content)
            contentJson?.let {
                if (it.has("Type") && it.has("ContentType")) {
                    val type = it.getString("Type")
                    val contentType = it.getString("ContentType")
                    when {
                        type == "MESSAGE" -> handleMessage(it)
                        contentType == ContentType.JOINED.type -> handleParticipantJoined(it)
                        contentType == ContentType.LEFT.type -> handleParticipantLeft(it)
                        contentType == ContentType.TYPING.type -> handleTyping(it)
                        contentType == ContentType.ENDED.type -> handleChatEnded(it)
                        contentType == ContentType.META_DATA.type -> handleMetadata(it)
                    }
                }
            }
        }
    }

    private fun handleMessage(innerJson: JSONObject) {
        val participantRole = innerJson.getString("ParticipantRole")
        val messageId = innerJson.getString("Id")
        var messageText = innerJson.getString("Content")
        val messageType = if (participantRole.equals(chatConfiguration.customerName, ignoreCase = true)) MessageType.SENDER else MessageType.RECEIVER
        val time = CommonUtils.formatTime(innerJson.getString("AbsoluteTime"))
        val message = Message(
            participant = participantRole,
            text = messageText,
            contentType = innerJson.getString("ContentType"),
            messageType = messageType,
            timeStamp = time,
            messageID = messageId
        )
        this.messageCallBack(message)
    }

    private fun handleParticipantJoined(innerJson: JSONObject) {
        val participantRole = innerJson.getString("ParticipantRole")
        val messageText = "$participantRole has joined"
        val message = Message(
            participant = participantRole,
            text = messageText,
            contentType = innerJson.getString("ContentType"),
            messageType = MessageType.COMMON
        )
        this.messageCallBack(message)
    }

    private fun handleParticipantLeft(innerJson: JSONObject) {
        val participantRole = innerJson.getString("ParticipantRole")
        val messageText = "$participantRole has left"
        val message = Message(
            participant = participantRole,
            text = messageText,
            contentType = innerJson.getString("ContentType"),
            messageType = MessageType.COMMON
        )
        this.messageCallBack(message)
    }

    private fun handleTyping(innerJson: JSONObject) {
        val participantRole = innerJson.getString("ParticipantRole")
        val time = CommonUtils.formatTime(innerJson.getString("AbsoluteTime"))
        val messageType = if (participantRole.equals(chatConfiguration.customerName, ignoreCase = true)) MessageType.SENDER else MessageType.RECEIVER
        val message = Message(
            participant = participantRole,
            text = "...",
            contentType = innerJson.getString("ContentType"),
            messageType = messageType,
            timeStamp = time
        )
        this.messageCallBack(message)    }

    private fun handleChatEnded(innerJson: JSONObject) {
        val message = Message(
            participant = "System Message",
            text = "The chat has ended.",
            contentType = innerJson.getString("ContentType"),
            messageType = MessageType.COMMON
        )
        this.messageCallBack(message)
    }

    private fun handleMetadata(innerJson: JSONObject) {
        val messageMetadata = innerJson.getJSONObject("MessageMetadata")
        val messageId = messageMetadata.getString("MessageId")
        val receipts = messageMetadata.optJSONArray("Receipts")
        var status = "Delivered"
        val time = CommonUtils.formatTime(innerJson.getString("AbsoluteTime"))
        receipts?.let {
            for (i in 0 until it.length()) {
                val receipt = it.getJSONObject(i)
                if (receipt.optString("ReadTimestamp").isNotEmpty()) {
                    status = "Read"
                }
            }
        }
        val message = Message(
            participant = "",
            text = "",
            contentType = innerJson.getString("ContentType"),
            messageType = MessageType.SENDER,
            timeStamp = time,
            messageID = messageId,
            status = status
        )
        this.messageCallBack(message)
    }


    fun closeWebSocket() {
        CoroutineScope(Dispatchers.IO).launch {
            webSocket?.close(1000, null)
        }
    }

    fun sendMessage(message: String) {
        CoroutineScope(Dispatchers.IO).launch {
            webSocket?.send(message)
        }
    }

    fun formatAndProcessTranscriptItems(transcriptItems: List<TranscriptItem>) {
        transcriptItems.forEach { item ->
            val participantRole = item.participantRole

            // Create the message content in JSON format
            val messageContentJson = JSONObject().apply {
                put("Id", item.id ?: "")
                put("ParticipantRole", participantRole)
                put("AbsoluteTime", item.absoluteTime ?: "")
                put("ContentType", item.contentType ?: "")
                put("Content", item.content ?: "")
                put("Type", item.type)
                put("DisplayName", item.displayName ?: "")
            }

            // Convert JSON object to String format
            val messageContentString = messageContentJson.toString()

            // Prepare the message in the format expected by WebSocket
            val wrappedMessageString = "{\"content\":\"${messageContentString.replace("\"", "\\\"")}\"}"

            // Send the formatted message string via WebSocket
            websocketDidReceiveMessage(wrappedMessageString)
        }
    }

}

