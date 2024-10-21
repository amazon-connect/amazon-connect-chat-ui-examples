package com.amazon.connect.chat.androidchatexample.network

import com.amazon.connect.chat.androidchatexample.models.StartChatRequest
import com.amazon.connect.chat.androidchatexample.models.StartChatResponse
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Url
import javax.inject.Singleton

@Singleton
interface ApiInterface {
    @POST()
    suspend fun startChat(@Url url: String, @Body request: StartChatRequest): StartChatResponse
}