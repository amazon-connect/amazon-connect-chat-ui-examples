//
//  AppConfiguration.swift
//  WkWebView Demo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

struct AppConfiguration {
    /// Set to `true` to load the JavaScript snippet mode.
    /// Set to `false` to load the remote URL.
    static let loadJS = true
    
    // While using snippet, this URL should be allowlisted while creating the widget.
    // https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html#chat-widget-domains
    static let BASE_URL = "<YOUR_BASE_URL>"
    
    /// Your JavaScript snippet that already includes <script> tags.
    static let jsSnippet = """
    <script type="text/javascript">
     ....

     amazon_connect('displayType', 'WEBVIEW');
      amazon_connect('registerCallback', {
        'CONNECTION_ESTABLISHED': () => {
          const persistedChatSession = sessionStorage.getItem('persistedChatSession');
          window?.webkit?.messageHandlers?.persistedChatSessionToken?.postMessage(persistedChatSession);
        },
        'CHAT_ENDED': () => {
          window?.webkit?.messageHandlers?.clearPersistedChatSessionToken?.postMessage(null);
        },
      'WIDGET_FRAME_CLOSED': () => {
        window?.webkit?.messageHandlers?.widgetFrameClosed?.postMessage(null)
      },
      });
    
    </script>
    """
    
    /// The remote URL to load if loadJS is false.
    static let url = "WIDGET_URL_HERE"
}
