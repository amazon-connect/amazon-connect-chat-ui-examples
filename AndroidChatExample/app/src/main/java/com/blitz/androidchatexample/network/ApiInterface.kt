package com.blitz.androidchatexample.network

import com.blitz.androidchatexample.models.StartChatRequest
import com.blitz.androidchatexample.models.StartChatResponse
import retrofit2.http.Body
import retrofit2.http.POST
import javax.inject.Singleton

@Singleton
interface ApiInterface {
    @POST("Prod/")
    suspend fun startChat(@Body request: StartChatRequest): StartChatResponse
}