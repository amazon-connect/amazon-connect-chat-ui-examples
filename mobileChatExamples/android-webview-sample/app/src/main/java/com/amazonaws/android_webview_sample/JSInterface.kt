/*
 * JSInterface.kt
 * JavaScript interface to allow callbacks from the WebView.
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package com.amazonaws.android_webview_sample

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView

class JSInterface(private val context: Context, private val webView: WebView?,
                  private val widgetCloseListener: WidgetCloseListener? = null) {

    interface WidgetCloseListener {
        fun onWidgetFrameClosed()
    }

    private val sharedPref: SharedPreferences =
        context.getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE)

    /**
     * Save persisted chat session token when received from WebView.
     * Called when CONNECTION_ESTABLISHED event occurs.
     */
    @JavascriptInterface
    fun persistedChatSessionToken(token: String) {
        Log.d("JSInterface", "Persisted chat session token received: $token")
        sharedPref.edit().putString("persistedChatSession", token).apply()
    }

    /**
     * Clear persisted chat session token when chat ends.
     * Called when CHAT_ENDED event occurs.
     */
    @JavascriptInterface
    fun clearPersistedChatSessionToken() {
        Log.d("JSInterface", "Clearing persisted chat session token")
        sharedPref.edit().remove("persistedChatSession").apply()
    }

    /**
     * Notify native app when the chat widget frame is closed.
     */
    @JavascriptInterface
    fun widgetFrameClosed() {
        Log.d("JSInterface", "Chat widget frame closed")
        widgetCloseListener?.onWidgetFrameClosed()
    }

    /**
     * Reads sessionStorage from WebView.
     */
    fun readSessionStorage(forKey: String, callback: (String?) -> Unit) {
        val jsCode = "sessionStorage.getItem('$forKey');"
        webView?.post {
            webView.evaluateJavascript(jsCode) { result ->
                if (result == "null") {
                    callback(null)
                } else {
                    callback(result)
                }
            }
        }
    }

    /**
     * When WebView finishes loading, inject persisted session data.
     */
    fun injectPersistedSession() {
        val token = sharedPref.getString("persistedChatSession", null) ?: return
        writeSessionStorage("persistedChatSession", token)
    }

    /**
     * Writes sessionStorage to WebView.
     */
    private fun writeSessionStorage(forKey: String, value: String) {
        val jsCode = "sessionStorage.setItem('$forKey', '$value');"
        webView?.post {
            webView.evaluateJavascript(jsCode, null)
        }
    }
}
