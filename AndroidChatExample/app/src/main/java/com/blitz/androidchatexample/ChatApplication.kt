package com.blitz.androidchatexample

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ChatApplication: Application() {
    override fun onCreate() {
        super.onCreate()
    }
}