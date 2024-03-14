package com.blitz.androidchatexample.viewmodel

import android.content.SharedPreferences
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
import com.blitz.androidchatexample.models.PersistentChat
import com.blitz.androidchatexample.models.StartChatRequest
import com.blitz.androidchatexample.repository.WebSocketManager
import com.blitz.androidchatexample.utils.CommonUtils.Companion.parseErrorMessage
import com.blitz.androidchatexample.utils.ContentType
import kotlinx.coroutines.launch

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository,
    private val sharedPreferences: SharedPreferences
) : ViewModel() {
    private val chatConfiguration = Config
    private val _isLoading = MutableLiveData(false)
    val isLoading: MutableLiveData<Boolean> = _isLoading
    private val _startChatResponse = MutableLiveData<Resource<StartChatResponse>>()
    private val startChatResponse: LiveData<Resource<StartChatResponse>> = _startChatResponse
    private val _createParticipantConnectionResult = MutableLiveData<CreateParticipantConnectionResult?>()
    val createParticipantConnectionResult: MutableLiveData<CreateParticipantConnectionResult?> = _createParticipantConnectionResult
    private val webSocketManager = WebSocketManager()
    private val _messages = MutableLiveData<List<Message>>()
    val messages: LiveData<List<Message>> = _messages
    private val _webSocketUrl = MutableLiveData<String?>()
    val webSocketUrl: MutableLiveData<String?> = _webSocketUrl
    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: LiveData<String?> = _errorMessage

    // LiveData for actual string values, updates will reflect in the UI
    private val _liveContactId = MutableLiveData<String?>(sharedPreferences.getString("contactID", null))
    val liveContactId: LiveData<String?> = _liveContactId

    private val _liveParticipantToken = MutableLiveData<String?>(sharedPreferences.getString("participantToken", null))
    val liveParticipantToken: LiveData<String?> = _liveParticipantToken

    // Setters that update LiveData, which in turn update the UI
    private var contactId: String?
        get() = liveContactId.value
        set(value) {
            sharedPreferences.edit().putString("contactID", value).apply()
            _liveContactId.value = value
        }

    private var participantToken: String?
        get() = liveParticipantToken.value
        set(value) {
            sharedPreferences.edit().putString("participantToken", value).apply()
            _liveParticipantToken.value = value  // Reflect the new value in LiveData
        }

    fun clearContactId() {
        sharedPreferences.edit().remove("contactID").apply()
        _liveContactId.value = null
    }

    fun clearParticipantToken() {
        sharedPreferences.edit().remove("participantToken").apply()
        _liveParticipantToken.value = null
    }

    fun initiateChat() {
        viewModelScope.launch {
            _isLoading.value = true
            _messages.postValue(emptyList()) // Clear existing messages
            if (participantToken != null) {
                participantToken?.let { createParticipantConnection(it) }
            } else if (contactId != null) {
                startChat(contactId)
            } else {
                startChat(null) // Start a fresh chat if no tokens are present
            }
        }
    }

    private fun startChat(sourceContactId: String?) {
        viewModelScope.launch {
            _isLoading.value = true
            val participantDetails = ParticipantDetails(displayName = chatConfiguration.customerName)
            val persistentChat: PersistentChat? = sourceContactId?.let { PersistentChat(it, "ENTIRE_PAST_SESSION") }
            val request = StartChatRequest(
                connectInstanceId = chatConfiguration.connectInstanceId,
                contactFlowId = chatConfiguration.contactFlowId,
                participantDetails = participantDetails,
                persistentChat = persistentChat
            )
            when (val response = chatRepository.startChat(startChatRequest = request)) {
                is Resource.Success -> {
                    response.data?.data?.startChatResult?.let { result ->
                        this@ChatViewModel.contactId = result.contactId
                        this@ChatViewModel.participantToken = result.participantToken
                        createParticipantConnection(result.participantToken)
                    } ?: run {
                        _isLoading.value = false
                    }
                }
                is Resource.Error -> {
                    _errorMessage.value = response.message
                    _isLoading.value = false
                    clearContactId()
                }

                is Resource.Loading -> _isLoading.value = true
            }
        }
    }

    private fun createParticipantConnection(participantToken: String) {
        viewModelScope.launch {
            _isLoading.value = true // Start loading
            chatRepository.createParticipantConnection(
                participantToken,
                object : AsyncHandler<CreateParticipantConnectionRequest, CreateParticipantConnectionResult> {
                    override fun onError(exception: Exception?) {
                        Log.e("ChatViewModel", "CreateParticipantConnection failed: ${exception?.localizedMessage}")
                        clearParticipantToken()
                        _errorMessage.value = parseErrorMessage(exception?.localizedMessage)
                        _isLoading.postValue(false)
                    }
                    override fun onSuccess(request: CreateParticipantConnectionRequest?, result: CreateParticipantConnectionResult?) {
                        viewModelScope.launch {
                            result?.let { connectionResult ->
                                _createParticipantConnectionResult.value = connectionResult
                                val websocketUrl = connectionResult.websocket?.url
                                _webSocketUrl.value = websocketUrl
                                websocketUrl?.let { wsUrl ->
                                    webSocketManager.createWebSocket(
                                        wsUrl,
                                        this@ChatViewModel::onMessageReceived,
                                        this@ChatViewModel::onWebSocketError
                                    )
                                }
                                connectionResult.connectionCredentials?.connectionToken?.let { cToken ->
                                    val transcriptsResource =
                                        chatRepository.getAllTranscripts(cToken)
                                    if (transcriptsResource is Resource.Success) {
                                        transcriptsResource.data?.transcript?.let { transcriptItems ->
                                            Log.d("ChatViewModel:GetTranscript",
                                                transcriptItems.toString()
                                            )
                                            webSocketManager.formatAndProcessTranscriptItems(
                                                transcriptItems.reversed()
                                            )
                                        }
                                    } else {
                                        Log.e(
                                            "ChatViewModel",
                                            "Error fetching transcripts: ${transcriptsResource.message}"
                                        )
                                        _errorMessage.value = parseErrorMessage("Error fetching transcripts: ${transcriptsResource.message}")
                                    }
                                }
                                _isLoading.postValue(false) // End loading
                            } ?: run {
                                Log.e(
                                    "ChatViewModel",
                                    "CreateParticipantConnection returned null result"
                                )
                                _errorMessage.value = parseErrorMessage("CreateParticipantConnection returned null result")
                                _isLoading.postValue(false) // End loading
                            }
                        }
                    }
                }
            )
        }
    }

    private fun onMessageReceived(message: Message) {
        // Log the current state before the update
        viewModelScope.launch {

            Log.i("ChatViewModel", "Received message: $message")

            // Construct the new list with modifications based on the received message
            val updatedMessages = _messages.value.orEmpty().toMutableList().apply {
                // Filter out typing indicators and apply message status updates or add new messages
                removeIf { it.text == "..." }
                if (message.contentType == ContentType.META_DATA.type) {
                    val index = indexOfFirst { it.messageID == message.messageID }
                    if (index != -1) {
                        this[index] = get(index).copy(status = message.status)
                    }
                } else {
                    // Exclude customer's typing events
                    if (!(message.text == "..." && message.participant == chatConfiguration.customerName)) {
                        add(message)
                    }
                }
            }

            // Update messages LiveData in a thread-safe manner
            _messages.value =updatedMessages

            // Additional logic like sending 'Delivered' events
            if (message.participant == chatConfiguration.agentName && message.contentType.contains("text")) {
                val content = "{\"messageId\":\"${message.messageID}\"}"
                sendEvent(content, ContentType.MESSAGE_DELIVERED)
            }
        }
    }


    private fun onWebSocketError(errorMessage: String) {
        // Handle WebSocket errors
        _isLoading.postValue(false)
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
        clearParticipantToken()
    }

    fun clearErrorMessage() {
        _errorMessage.value = null
    }

}
