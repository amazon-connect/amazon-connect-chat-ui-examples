package com.blitz.androidchatexample.repository

import com.amazonaws.AmazonClientException
import com.amazonaws.AmazonServiceException
import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.regions.Region
import com.amazonaws.services.connectparticipant.AmazonConnectParticipantAsyncClient
import com.amazonaws.services.connectparticipant.model.CreateParticipantConnectionRequest
import com.amazonaws.services.connectparticipant.model.CreateParticipantConnectionResult
import com.amazonaws.services.connectparticipant.model.DisconnectParticipantRequest
import com.amazonaws.services.connectparticipant.model.SendEventRequest
import com.amazonaws.services.connectparticipant.model.SendEventResult
import com.amazonaws.services.connectparticipant.model.SendMessageRequest
import com.amazonaws.services.connectparticipant.model.SendMessageResult
import com.blitz.androidchatexample.Config
import com.blitz.androidchatexample.models.StartChatRequest
import com.blitz.androidchatexample.models.StartChatResponse
import com.blitz.androidchatexample.network.ApiInterface
import com.blitz.androidchatexample.network.Resource
import com.blitz.androidchatexample.utils.ContentType
import dagger.hilt.android.scopes.ActivityScoped
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
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
        } catch (e: Exception) {
            Resource.Error("An unknown error occurred: ${e.localizedMessage}")
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
    )= withContext(Dispatchers.IO) {
        return@withContext try {
            val disconnectParticipantRequest = DisconnectParticipantRequest().apply {
                connectionToken = token
            }
            val response = connectParticipantClient.disconnectParticipant(disconnectParticipantRequest)
            Result.success(response)
        } catch (e: AmazonClientException) {
            // Handle client-side exceptions
            Result.failure(e)
        } catch (e: AmazonServiceException) {
            // Handle service-side exceptions
            Result.failure(e)
        }
    }


}
