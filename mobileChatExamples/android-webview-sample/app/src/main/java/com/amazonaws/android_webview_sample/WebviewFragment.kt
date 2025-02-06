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
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.amazonaws.android_webview_sample.databinding.FragmentWebviewBinding

class WebViewFragment : Fragment() {

    private var binding: FragmentWebviewBinding? = null
    private val WEBRTC_PERM = arrayOf(Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA)

    private var mWebView: WebView? = null
    private lateinit var jsInterface: JSInterface

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentWebviewBinding.inflate(inflater, container, false)
        setHasOptionsMenu(true)
        return binding!!.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Initialize WebView
        mWebView = binding?.activityMainWebview
        setUpWebView()

        loadWebViewContent()

        requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (mWebView?.canGoBack() == true) {
                        mWebView?.goBack()
                    } else {
                        parentFragmentManager.popBackStack()
                    }
                }
            });
    }

    /**
     * Checks if WebRTC permissions (mic/camera) are granted.
     */
    private fun hasWebRTCPermissions(): Boolean {
        return WEBRTC_PERM.all { perm ->
            ContextCompat.checkSelfPermission(requireContext(), perm) == PackageManager.PERMISSION_GRANTED
        }
    }

    private val requestPermissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.all { it.value }
        if (allGranted) {
            Log.d("WebViewFragment", "WebRTC permissions granted")
        } else {
            Log.d("WebViewFragment", "WebRTC permissions denied")
        }
    }

    /**
     * Sets up WebView properties, JavaScript interface, and permissions.
     */
    private fun setUpWebView() {
        mWebView?.settings?.apply {
            javaScriptEnabled = true
            mediaPlaybackRequiresUserGesture = false
            domStorageEnabled = true
        }

        // Attach JavaScript interface
        jsInterface = JSInterface(requireContext(), mWebView, object : JSInterface.WidgetCloseListener {
            override fun onWidgetFrameClosed() {
                parentFragmentManager.popBackStack()
            }
        })

        mWebView?.addJavascriptInterface(jsInterface, "AndroidBridge")

        // Handle page loading completion
        mWebView?.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                jsInterface.injectPersistedSession()
            }
        }

        // Check and request WebRTC permissions only if needed
        if (!hasWebRTCPermissions()) {
            requestPermissionsLauncher.launch(WEBRTC_PERM)
        }

        // Handle WebRTC permissions
        mWebView?.webChromeClient = object : WebChromeClient() {
            override fun getDefaultVideoPoster(): Bitmap {
                return Bitmap.createBitmap(10, 10, Bitmap.Config.ARGB_8888)
            }

            override fun onPermissionRequest(request: PermissionRequest) {
                activity?.runOnUiThread { request.grant(request.resources) }
            }
        }
    }

    /**
     * Loads either the inline JavaScript snippet or a remote URL into WebView.
     */
    private fun loadWebViewContent() {
        mWebView?.let { webView ->
            val content = if (AppConfig.loadJS) {
                """
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <title>Chat</title>
                      </head>
                      <body>
                        ${AppConfig.jsSnippet}
                      </body>
                    </html>
                """.trimIndent()
            } else {
                AppConfig.url
            }

            // Use a valid base URL when loading inline JS
            if (AppConfig.loadJS) {
                webView.loadDataWithBaseURL(AppConfig.BASE_URL, content, "text/html", "UTF-8", null)
            } else {
                webView.loadUrl(content)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }
}