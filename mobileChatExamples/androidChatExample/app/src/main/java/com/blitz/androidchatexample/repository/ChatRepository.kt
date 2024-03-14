package com.blitz.androidchatexample.repository

import com.amazonaws.AmazonClientException
import com.amazonaws.AmazonServiceException
import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.regions.Region
import com.amazonaws.services.connectparticipant.AmazonConnectParticipantAsyncClient
import com.amazonaws.services.connectparticipant.model.CreateParticipantConnectionRequest
import com.amazonaws.services.connectparticipant.model.CreateParticipantConnectionResult
import com.amazonaws.services.connectparticipant.model.DisconnectParticipantRequest
import com.amazonaws.services.connectparticipant.model.GetTranscriptRequest
import com.amazonaws.services.connectparticipant.model.GetTranscriptResult
import com.amazonaws.services.connectparticipant.model.SendEventRequest
import com.amazonaws.services.connectparticipant.model.SendEventResult
import com.amazonaws.services.connectparticipant.model.SendMessageRequest
import com.amazonaws.services.connectparticipant.model.SendMessageResult
import com.blitz.androidchatexample.Config
import com.blitz.androidchatexample.models.MessageMetadata
import com.blitz.androidchatexample.models.Receipt
import com.blitz.androidchatexample.models.StartChatRequest
import com.blitz.androidchatexample.models.StartChatResponse
import com.blitz.androidchatexample.models.TranscriptItem
import com.blitz.androidchatexample.models.TranscriptResponse
import com.blitz.androidchatexample.network.ApiInterface
import com.blitz.androidchatexample.network.Resource
import com.blitz.androidchatexample.utils.ContentType
import dagger.hilt.android.scopes.ActivityScoped
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import retrofit2.HttpException
import java.lang.Exception
import javax.inject.Inject

@ActivityScoped
class ChatRepository @Inject constructor(
    private val apiInterface: ApiInterface
) {
    private var connectParticipantClient: AmazonConnectParticipantAsyncClient =
        AmazonConnectParticipantAsyncClient()
    private val chatConfiguration = Config

    init {
        connectParticipantClient.setRegion(Region.getRegion(chatConfiguration.region))
    }

    // StartChat API: https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html
    // Android SDK Docs: https://github.com/aws-amplify/aws-sdk-android
    suspend fun startChat(startChatRequest: StartChatRequest): Resource<StartChatResponse> {
        return try {
            val response = apiInterface.startChat(startChatRequest)
            Resource.Success(response)
        } catch (e: HttpException) {
            val errorBody = e.response()?.errorBody()?.string()
            val errorMessage = parseErrorMessageFromJson(errorBody)
            Resource.Error(errorMessage ?: "Unknown error occurred")
        } catch (e: Exception) {
            Resource.Error("An unknown error occurred: ${e.localizedMessage}")
        }
    }

    private fun parseErrorMessageFromJson(jsonString: String?): String? {
        return try {
            JSONObject(jsonString).getJSONObject("data").getJSONObject("Error").getString("message")
        } catch (e: Exception) {
            null // Return null if there is an issue parsing the JSON
        }
    }


    /// Creates the participant's connection. https://docs.aws.amazon.com/connect-participant/latest/APIReference/API_CreateParticipantConnection.html
    /// - Parameter participantToken: The ParticipantToken as obtained from StartChatContact API response.
    fun createParticipantConnection(
        token: String,
        handler: AsyncHandler<CreateParticipantConnectionRequest, CreateParticipantConnectionResult>
    ) {
        val createParticipantConnectionRequest = CreateParticipantConnectionRequest().apply {
            setType(listOf("WEBSOCKET", "CONNECTION_CREDENTIALS"))
            participantToken = token
        }
        connectParticipantClient.createParticipantConnectionAsync(
            createParticipantConnectionRequest,
            handler
        )
    }

    suspend fun sendMessage(
        token: String,
        text: String
    ): Result<SendMessageResult> = withContext(Dispatchers.IO) {
        return@withContext try {
            val sendMessageRequest = SendMessageRequest().apply {
                connectionToken = token
                content = text
                contentType = "text/plain"
            }
            val response = connectParticipantClient.sendMessage(sendMessageRequest)
            Result.success(response)
        } catch (e: AmazonClientException) {
            // Handle client-side exceptions
            Result.failure(e)
        } catch (e: AmazonServiceException) {
            // Handle service-side exceptions
            Result.failure(e)
        }
    }

    suspend fun sendEvent(
        token: String,
        _contentType: ContentType,
        _content: String = ""
    ): Result<SendEventResult> = withContext(Dispatchers.IO) {
        return@withContext try {
            val sendEventRequest = SendEventRequest().apply {
                connectionToken = token
                content = _content
                contentType = _contentType.type
            }
            val response = connectParticipantClient.sendEvent(sendEventRequest)
            Result.success(response)
        } catch (e: AmazonClientException) {
            // Handle client-side exceptions
            Result.failure(e)
        } catch (e: AmazonServiceException) {
            // Handle service-side exceptions
            Result.failure(e)
        }
    }

    suspend fun disconnectParticipant(
        token: String,
    ) = withContext(Dispatchers.IO) {
        return@withContext try {
            val disconnectParticipantRequest = DisconnectParticipantRequest().apply {
                connectionToken = token
            }
            val response =
                connectParticipantClient.disconnectParticipant(disconnectParticipantRequest)
            Result.success(response)
        } catch (e: AmazonClientException) {
            // Handle client-side exceptions
            Result.failure(e)
        } catch (e: AmazonServiceException) {
            // Handle service-side exceptions
            Result.failure(e)
        }
    }

    suspend fun getAllTranscripts(connectionToken: String): Resource<TranscriptResponse> {
        var accumulatedItems = mutableListOf<TranscriptItem>()
        var fullResponse: TranscriptResponse? = null
        var nextToken: String? = null

        do {
            val response = getTranscript(connectionToken, nextToken)
            if (response is Resource.Success) {
                response.data?.let {
                    accumulatedItems.addAll(it.transcript)
                    nextToken = it.nextToken
                    fullResponse = it.copy(transcript = accumulatedItems)  // Create new response with all items
                }
            } else {
                return Resource.Error("Failed to fetch all transcript items.")
            }
        } while (nextToken != null && nextToken!!.isNotEmpty())

        return Resource.Success(fullResponse ?: return Resource.Error("Failed to obtain full transcript response."))
    }

    private suspend fun getTranscript(connectionToken: String, nextToken: String? = null): Resource<TranscriptResponse> = withContext(Dispatchers.IO) {
        try {
            val request = GetTranscriptRequest().apply {
                this.connectionToken = connectionToken
                this.nextToken = nextToken
                this.maxResults = 100 // Adjust as needed
                this.scanDirection = "BACKWARD" // Or "FORWARD" as needed
            }

            val result = connectParticipantClient.getTranscript(request)
            val transcriptItems: List<TranscriptItem> = result.transcript.map { apiItem ->
                TranscriptItem(
                    absoluteTime = apiItem.absoluteTime,
                    content = apiItem.content,
                    contentType = apiItem.contentType,
                    displayName = apiItem.displayName,
                    id = apiItem.id,
                    participantId = apiItem.participantId,
                    participantRole = apiItem.participantRole,
                    type = apiItem.type,
                    messageMetadata = apiItem.messageMetadata?.let { metadata ->
                        MessageMetadata(
                            messageId = metadata.messageId,
                            receipts = metadata.receipts?.map { receipt ->
                                Receipt(
                                    deliveredTimestamp = receipt.deliveredTimestamp,
                                    readTimestamp = receipt.readTimestamp,
                                    recipientParticipantId = receipt.recipientParticipantId
                                )
                            }
                        )
                    }
                )
            }

            // Create the full response object
            val fullResponse = TranscriptResponse(
                initialContactId = result.initialContactId,
                nextToken = result.nextToken,
                transcript = transcriptItems
            )

            Resource.Success(fullResponse)

        } catch (e: Exception) {
            Resource.Error(e.message ?: "Unknown error occurred while fetching chat transcript.")
        }
    }



}
