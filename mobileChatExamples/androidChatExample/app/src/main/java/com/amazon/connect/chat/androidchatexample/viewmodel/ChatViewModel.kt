package com.amazon.connect.chat.androidchatexample.viewmodel

import android.app.Activity
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.util.Log
import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amazon.connect.chat.androidchatexample.Config
import com.amazon.connect.chat.androidchatexample.models.ParticipantDetails
import com.amazon.connect.chat.androidchatexample.models.StartChatRequest
import com.amazon.connect.chat.androidchatexample.models.StartChatResponse
import com.amazon.connect.chat.androidchatexample.network.Resource
import com.amazon.connect.chat.androidchatexample.repository.ChatRepository
import com.amazon.connect.chat.androidchatexample.utils.CommonUtils
import com.amazon.connect.chat.sdk.ChatSession
import com.amazon.connect.chat.sdk.model.ChatDetails
import com.amazon.connect.chat.sdk.model.ContentType
import com.amazon.connect.chat.sdk.model.Event
import com.amazon.connect.chat.sdk.model.GlobalConfig
import com.amazon.connect.chat.sdk.model.Message
import com.amazon.connect.chat.sdk.model.MessageReceiptType
import com.amazon.connect.chat.sdk.model.TranscriptItem
import com.amazonaws.services.connectparticipant.model.ScanDirection
import com.amazonaws.services.connectparticipant.model.SortKey
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import java.net.URL
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatSession: ChatSession, // Injected ChatSession instance
    private val chatRepository: ChatRepository, // Chat repository for API calls
    private val sharedPreferences: SharedPreferences // Shared preferences for storing participant token
) : ViewModel() {

    // If you are not using Hilt, you can initialize ChatSession like this
    // private val chatSession = ChatSessionProvider.getChatSession(context)

    // Configuration instance for chat settings
    private val chatConfiguration = Config

    // LiveData for tracking loading state
    private val _isLoading = MutableLiveData(false)
    val isLoading: MutableLiveData<Boolean> = _isLoading

    // LiveData for tracking chat session activity state
    private val _isChatActive = MutableLiveData(false)
    val isChatActive: MutableLiveData<Boolean> = _isChatActive

    // LiveData to hold the URI of the selected file for attachment
    private val _selectedFileUri = MutableLiveData(Uri.EMPTY)
    val selectedFileUri: MutableLiveData<Uri> = _selectedFileUri

    // State to store chat transcript items (messages and events)
    var messages = mutableStateListOf<TranscriptItem>()
        private set

    // LiveData for handling error messages
    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: LiveData<String?> = _errorMessage

    // LiveData to hold participant token from shared preferences
    private val _liveParticipantToken = MutableLiveData<String?>(sharedPreferences.getString("participantToken", null))
    val liveParticipantToken: LiveData<String?> = _liveParticipantToken

    // Property to get or set participant token in shared preferences
    private var participantToken: String?
        get() = liveParticipantToken.value
        set(value) {
            sharedPreferences.edit().putString("participantToken", value).apply()
            _liveParticipantToken.value = value  // Update LiveData with new token
        }

    // Clear participant token from shared preferences
    fun clearParticipantToken() {
        sharedPreferences.edit().remove("participantToken").apply()
        _liveParticipantToken.value = null
    }

    // Initialize ViewModel (add additional initialization logic if needed)
    init {
        // Initialization logic can be added here if necessary
    }

    // Configure the chat session with global settings
    private suspend fun configureChatSession() {
        val globalConfig = GlobalConfig(region = chatConfiguration.region)
        chatSession.configure(globalConfig)
        setupChatHandlers(chatSession)
    }

    // Setup event handlers for the chat session
    private suspend fun setupChatHandlers(chatSession: ChatSession) {
        chatSession.onConnectionEstablished = {
            Log.d("ChatViewModel", "Connection established.")
            _isChatActive.value = true
        }

        chatSession.onMessageReceived = { transcriptItem ->
            // Handle received websocket message if needed
        }

        chatSession.onTranscriptUpdated = { transcriptList ->
            Log.d("ChatViewModel", "Transcript onTranscriptUpdated last 3 items: ${transcriptList.takeLast(3)}")
            viewModelScope.launch {
                onUpdateTranscript(transcriptList)
            }
        }

        chatSession.onChatEnded = {
           Log.d("ChatViewModel", "Chat ended.")
            _isChatActive.value = false
        }

        chatSession.onConnectionBroken = {
            Log.d("ChatViewModel", "Connection broken.")
        }

        chatSession.onConnectionReEstablished = {
            Log.d("ChatViewModel", "Connection re-established.")
            _isChatActive.value = true
        }

        chatSession.onChatSessionStateChanged = {
            Log.d("ChatViewModel", "Chat session state changed: $it")
            _isChatActive.value = it
        }

        chatSession.onDeepHeartBeatFailure = {
            Log.d("ChatViewModel", "Deep heartbeat failure")
        }
    }

    // Initiate chat either by starting a new session or reconnecting using an existing token
    fun initiateChat() {
        viewModelScope.launch {
            configureChatSession() // Configure chat session first

            _isLoading.value = true
            messages = mutableStateListOf() // Clear existing messages

            // Check if participant token exists for reconnecting
            participantToken?.let {
                val chatDetails = ChatDetails(participantToken = it)
                createParticipantConnection(chatDetails)
            } ?: run {
                startChat() // Start a fresh chat if no token is found
            }
        }
    }

    // Start a new chat session by sending a StartChatRequest to the repository
    private fun startChat() {
        viewModelScope.launch {
            _isLoading.value = true
            val participantDetails = ParticipantDetails(displayName = chatConfiguration.customerName)
            val request = StartChatRequest(
                connectInstanceId = chatConfiguration.connectInstanceId,
                contactFlowId = chatConfiguration.contactFlowId,
                participantDetails = participantDetails
            )
            when (val response = chatRepository.startChat(endpoint = chatConfiguration.startChatEndpoint,startChatRequest = request)) {
                is Resource.Success -> {
                    response.data?.data?.startChatResult?.let { result ->
                        this@ChatViewModel.participantToken = result.participantToken
                        handleStartChatResponse(result)
                    } ?: run {
                        _isLoading.value = false
                    }
                }
                is Resource.Error -> {
                    _errorMessage.value = response.message
                    _isLoading.value = false
                }

                is Resource.Loading -> _isLoading.value = true
            }
        }
    }

    // Handle the response after starting a chat session
    private fun handleStartChatResponse(result: StartChatResponse.Data.StartChatResult) {
        viewModelScope.launch {
            val chatDetails = ChatDetails(
                contactId = result.contactId,
                participantId = result.participantId,
                participantToken = result.participantToken
            )
            createParticipantConnection(chatDetails)
        }
    }

    // Create a connection to the participant chat session
    private fun createParticipantConnection(chatDetails: ChatDetails) {
        viewModelScope.launch {
            _isLoading.value = true // Set loading state
            val result = chatSession.connect(chatDetails) // Attempt connection
            _isLoading.value = false // Clear loading state

            if (result.isSuccess) {
                Log.d("ChatViewModel", "Connection successful $result")
            } else if (result.isFailure) {
                Log.e("ChatViewModel", "Connection failed: ${result.exceptionOrNull()}")
                _errorMessage.value = result.exceptionOrNull()?.message
            }
        }
    }

    // Update the transcript when new messages or events are received
    private fun onUpdateTranscript(transcriptList: List<TranscriptItem>) {
        messages.clear()
        viewModelScope.launch {
            val updatedMessages = transcriptList.map { transcriptItem ->
                // Customize events if needed
                if (transcriptItem is Event) {
                    CommonUtils.customizeEvent(transcriptItem)
                }
                CommonUtils.getMessageDirection(transcriptItem) // Customize message direction
                transcriptItem
            }
            messages.addAll(updatedMessages)
        }
    }

    // Send a text message through the chat session
    fun sendMessage(text: String) {
        viewModelScope.launch {
            if (text.isNotEmpty()) {
                val result = chatSession.sendMessage(ContentType.RICH_TEXT, text)
                result.onSuccess {
                    // Handle success - update UI or state as needed
                }.onFailure { exception ->
                    // Handle failure - update UI or state, log error, etc.
                    Log.e("ChatViewModel", "Error sending message: ${exception.message}")
                }
            }
        }
    }

    // Send an event through the chat session
    fun sendEvent(content: String = "", contentType: ContentType) {
        viewModelScope.launch {
            val result = chatSession.sendEvent(contentType, content)
            result.onSuccess {
                // Handle success - update UI or state as needed
            }.onFailure { exception ->
                // Handle failure - update UI or state, log error, etc.
                Log.e("ChatViewModel", "Error sending event: ${exception.message}")
            }
        }
    }

    // Send a read receipt for a message when it appears
    suspend fun sendReadEventOnAppear(message: Message) {
        chatSession.sendMessageReceipt(message, MessageReceiptType.MESSAGE_READ)
    }


    // Fetch the chat transcript
    fun fetchTranscript(onCompletion: (Boolean) -> Unit) {
        viewModelScope.launch {
            chatSession.getTranscript(ScanDirection.BACKWARD, SortKey.DESCENDING, 30, null, messages?.get(0)?.id).onSuccess {
                Log.d("ChatViewModel", "Transcript fetched successfully")
                onCompletion(true)
            }.onFailure {
                Log.e("ChatViewModel", "Error fetching transcript: ${it.message}")
                onCompletion(false)
            }
        }
    }

    // End the chat session and clear the participant token
    fun endChat() {
        clearParticipantToken()
        viewModelScope.launch {
            chatSession.disconnect() // Disconnect from chat session
        }
    }

    // Clear error messages
    fun clearErrorMessage() {
        _errorMessage.value = null
    }

    // Request code for selecting an attachment
    private val PICK_ATTACHMENT = 2

    // Open the file picker for selecting an attachment
    fun openFile(activity: Activity) {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
        }
        activity.startActivityForResult(intent, PICK_ATTACHMENT) // Start activity for result
    }

    // Upload a selected attachment to the chat session
    fun uploadAttachment(fileUri: Uri) {
        viewModelScope.launch {
            chatSession.sendAttachment(fileUri)
        }
    }

    // Download an attachment using its ID and file name
    suspend fun downloadAttachment(attachmentId: String, fileName: String): Result<URL> {
        return chatSession.downloadAttachment(attachmentId, fileName)
    }
}