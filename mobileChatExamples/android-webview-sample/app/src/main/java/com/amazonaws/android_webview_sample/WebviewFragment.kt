/*
 * WebviewFragment.kt
 * Android WebView Sample Demo
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package com.amazonaws.android_webview_sample

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.amazonaws.android_webview_sample.databinding.FragmentWebviewBinding
import java.util.Arrays


class WebViewFragment : Fragment() {
    private var binding: FragmentWebviewBinding? = null
    private val WEBRTC_PERM = arrayOf(
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.CAMERA
    )
    var mWebView: WebView? = null
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentWebviewBinding.inflate(inflater, container, false)
        return binding!!.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Grab the xml element
        mWebView = binding!!.activityMainWebview
        SetUpWebView()

        // Load the url
        mWebView!!.loadUrl(AppConfig.url)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }

    private fun HasWebRTCPermissions(): Boolean {
        return Arrays.stream(WEBRTC_PERM).allMatch { it: String? ->
            ContextCompat.checkSelfPermission(
                requireContext(), it!!
            ) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun SetUpWebView() {
        // Enable Javascript and disable media gesturing
        val webSettings = mWebView?.settings
        webSettings?.javaScriptEnabled = true
        webSettings?.mediaPlaybackRequiresUserGesture = false
        webSettings?.domStorageEnabled = true

        //Create a new webview instance.
        mWebView?.webViewClient = WebViewClient()

        // Ask for application permissions
        if (!HasWebRTCPermissions()) {
            requestPermissions(WEBRTC_PERM, 1)
        }
        // Grant permissions to the browser
        mWebView!!.webChromeClient = object : WebChromeClient() {
            override fun getDefaultVideoPoster(): Bitmap? {
                return Bitmap.createBitmap(10, 10, Bitmap.Config.ARGB_8888)
            }
            override fun onPermissionRequest(request: PermissionRequest) {
                Log.d("UserAgent", mWebView!!.settings.userAgentString)
                activity!!.runOnUiThread { request.grant(request.resources) }
            }
        }
    }
}