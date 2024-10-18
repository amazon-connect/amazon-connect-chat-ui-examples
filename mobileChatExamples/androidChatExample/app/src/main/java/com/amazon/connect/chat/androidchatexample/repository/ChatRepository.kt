package com.amazon.connect.chat.androidchatexample.repository

import com.amazon.connect.chat.androidchatexample.models.StartChatRequest
import com.amazon.connect.chat.androidchatexample.models.StartChatResponse
import com.amazon.connect.chat.androidchatexample.network.ApiInterface
import com.amazon.connect.chat.androidchatexample.network.Resource
import dagger.hilt.android.scopes.ActivityScoped
import org.json.JSONObject
import retrofit2.HttpException
import javax.inject.Inject

@ActivityScoped
class ChatRepository @Inject constructor(
    private val apiInterface: ApiInterface
) {

    // StartChat API: https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html
    // Android SDK Docs: https://github.com/aws-amplify/aws-sdk-android
    suspend fun startChat(startChatRequest: StartChatRequest, endpoint: String): Resource<StartChatResponse> {
        return try {
            val response = apiInterface.startChat(endpoint,startChatRequest)
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


}
