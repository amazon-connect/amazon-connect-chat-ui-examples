/*
 * AppConfig.kt
 * Android WebView Sample Demo
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package com.amazonaws.android_webview_sample

object AppConfig {
    // If true, load the inline JS snippet.
    // If false, load the remote URL defined in 'url'.
    var loadJS: Boolean = true

    // While using snippet, this URL should be allowlisted while creating the widget.
    // https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html#chat-widget-domains
    var BASE_URL = "<YOUR_BASE_URL>"

    // Your JavaScript snippet. This snippet can include its own <script> tags.
    // (Be sure your snippet is complete and valid.)
    var jsSnippet: String = """
    <script type="text/javascript">
          (function(w, d, x, id){
            ...
            
          amazon_connect('displayType', 'WEBVIEW');
          amazon_connect('registerCallback', {
             'CONNECTION_ESTABLISHED': () => {
                const persistedChatSession = sessionStorage.getItem('persistedChatSession');
                AndroidBridge.persistedChatSessionToken(persistedChatSession);
              },
              'CHAT_ENDED': () => {
                AndroidBridge.clearPersistedChatSessionToken();
              }
              'WIDGET_FRAME_CLOSED': () => {
                AndroidBridge.widgetFrameClosed();
              },
          });
        </script>
    """.trimIndent()

    // PUT YOUR WEBSITE URL HERE
    var url: String = "..."
}
