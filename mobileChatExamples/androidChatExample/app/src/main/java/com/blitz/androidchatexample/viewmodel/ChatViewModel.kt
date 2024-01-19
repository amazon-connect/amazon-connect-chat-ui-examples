package com.blitz.androidchatexample.viewmodel

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.blitz.androidchatexample.models.StartChatResponse
import com.blitz.androidchatexample.network.Resource
import com.blitz.androidchatexample.repository.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import androidx.lifecycle.viewModelScope
import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.connectparticipant.model.CreateParticipantConnectionRequest
import com.amazonaws.services.connectparticipant.model.CreateParticipantConnectionResult
import com.blitz.androidchatexample.Config
import com.blitz.androidchatexample.models.Message
import com.blitz.androidchatexample.models.ParticipantDetails
import com.blitz.androidchatexample.models.StartChatRequest
import com.blitz.androidchatexample.repository.WebSocketManager
import com.blitz.androidchatexample.utils.ContentType
import kotlinx.coroutines.launch

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository
) : ViewModel() {
    private val chatConfiguration = Config
    private val _isLoading = MutableLiveData(false)
    val isLoading: MutableLiveData<Boolean> = _isLoading
    private val _startChatResponse = MutableLiveData<Resource<StartChatResponse>>()
    val startChatResponse: LiveData<Resource<StartChatResponse>> = _startChatResponse
    private val _createParticipantConnectionResult = MutableLiveData<CreateParticipantConnectionResult?>()
    val createParticipantConnectionResult: MutableLiveData<CreateParticipantConnectionResult?> = _createParticipantConnectionResult
    private val webSocketManager = WebSocketManager()
    private val _messages = MutableLiveData<List<Message>>()
    val messages: LiveData<List<Message>> = _messages
    private val _webSocketUrl = MutableLiveData<String?>()
    val webSocketUrl: MutableLiveData<String?> = _webSocketUrl

    fun startChat() {
        viewModelScope.launch {
            _isLoading.value = true
            // Clear the messages
            _messages.postValue(emptyList())
            try {
                // Create StartChatRequest from configuration
                val participantDetails =
                    ParticipantDetails(displayName = chatConfiguration.customerName)
                val request = StartChatRequest(
                    connectInstanceId = chatConfiguration.connectInstanceId,
                    contactFlowId = chatConfiguration.contactFlowId,
                    participantDetails = participantDetails
                )
                val response = chatRepository.startChat(startChatRequest = request)
                _startChatResponse.value = response
                if (startChatResponse != null) {
                    createParticipantConnection()
                }else{
                    _isLoading.postValue(false)
                }
            } catch (e: Exception) {
                _startChatResponse.value = Resource.Error(e.localizedMessage ?: "Unknown Error")
                _isLoading.postValue(false)
            }
        }
    }

    private fun createParticipantConnection() {
        val startChatResponse = startChatResponse.value
        if (startChatResponse is Resource.Success) {
            val chatResponseData = startChatResponse.data?.data
            // Now you can use chatResponseData
            if (chatResponseData != null) {
                chatRepository.createParticipantConnection(
                    chatResponseData.startChatResult.participantToken,
                    object :
                        AsyncHandler<CreateParticipantConnectionRequest, CreateParticipantConnectionResult> {
                        override fun onError(exception: Exception?) {
                            // Handle error
                            print(exception)
                            _isLoading.postValue(false)
                        }

                        override fun onSuccess(
                            request: CreateParticipantConnectionRequest?,
                            result: CreateParticipantConnectionResult?
                        ) {
                            // Handle success
                            result?.let {
                                _createParticipantConnectionResult.postValue(result)
                                _isLoading.postValue(false)
                                val websocketUrl = result.websocket?.url
                                _webSocketUrl.postValue(websocketUrl)
                                websocketUrl?.let {
                                    webSocketManager.createWebSocket(it, this::onMessageReceived, this::onWebSocketError)
                                }
                            }
                        }
                        private fun onMessageReceived(message: Message) {
                            // Handle incoming WebSocket messages
                            Log.i("Received messages", message.toString())

                            // Remove typing indicators
                            val filteredMessages = _messages.value.orEmpty().filterNot { it.text == "..." }

                            // Handle message receipts or regular message
                            val updatedMessages = if (message.contentType == ContentType.META_DATA.type) {
                                filteredMessages.map { if (it.messageID == message.messageID) it.copy(status = message.status) else it }
                            } else {
                                // Exclude customer's typing events
                                if (!(message.text == "..." && message.participant == chatConfiguration.customerName)) {
                                    filteredMessages + message
                                } else {
                                    filteredMessages
                                }
                            }

                            // Update messages LiveData
                            _messages.postValue(updatedMessages)

                            // Send a 'Delivered' event if the message is from the agent
                            if (message.participant == chatConfiguration.agentName && message.contentType.contains("text")) {
                                val content = "{\"messageId\":\"${message.messageID}\"}"
                                sendEvent(content, ContentType.MESSAGE_DELIVERED)
                            }
                        }
                        private fun onWebSocketError(errorMessage: String) {
                            // Handle WebSocket errors
                            _isLoading.postValue(false)
                        }
                    })
            }
        }
    }

    fun sendMessage(text: String) {
        if (text.isNotEmpty()) {
            createParticipantConnectionResult.value?.connectionCredentials?.let { credentials ->
                viewModelScope.launch {
                    val result = chatRepository.sendMessage(credentials.connectionToken, text)
                    result.onSuccess {
                        // Handle success - update UI or state as needed
                    }.onFailure { exception ->
                        // Handle failure - update UI or state, log error, etc.
                        Log.e("ChatViewModel", "Error sending message: ${exception.message}")
                    }
                }
            }
        }
    }

    fun sendEvent(content: String = "", contentType: ContentType) {
        createParticipantConnectionResult.value?.connectionCredentials?.let { credentials ->
            viewModelScope.launch {
                val result = chatRepository.sendEvent(credentials.connectionToken, contentType,content)
                result.onSuccess {
                    // Handle success - update UI or state as needed
                }.onFailure { exception ->
                    // Handle failure - update UI or state, log error, etc.
                    Log.e("ChatViewModel", "Error sending Event: ${exception.message}")
                }
            }
        }
    }

    fun sendReadEventOnAppear(message: Message) {
        val messagesList = (_messages.value ?: return).toMutableList()
        val index = messagesList.indexOfFirst {
            it.text == message.text && it.text.isNotEmpty() && it.contentType.contains("text")
                    && it.participant != chatConfiguration.customerName && !it.isRead
        }
        if (index != -1) {
            val messageId = messagesList[index].messageID ?: return
            val content = "{\"messageId\":\"$messageId\"}"
            sendEvent(content,ContentType.MESSAGE_READ)
            messagesList[index] = messagesList[index].copy(isRead = true)
            _messages.postValue(messagesList) // Safely post the updated list to the LiveData
        }
    }

    fun endChat(){
        createParticipantConnectionResult.value?.connectionCredentials?.let { credentials ->
            viewModelScope.launch {
                val result = chatRepository.disconnectParticipant(credentials.connectionToken)
                result.onSuccess {
                    // Handle success - update UI or state as needed
                    _webSocketUrl.value = null
                }.onFailure { exception ->
                    // Handle failure - update UI or state, log error, etc.
                    Log.e("ChatViewModel", "Error sending message: ${exception.message}")
                }
            }
        }
    }



}
