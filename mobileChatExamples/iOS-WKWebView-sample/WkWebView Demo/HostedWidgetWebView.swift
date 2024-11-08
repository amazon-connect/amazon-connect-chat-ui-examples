//
//  HostedWidgetWebView.swift
//  WkWebView Demo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import WebKit

class HostedWidgetWebView: WKWebView, WKScriptMessageHandler, WKNavigationDelegate {
    init() {
        // Initialize configuration and user content controller
        let configuration = WKWebViewConfiguration()
        let contentController = WKUserContentController()
        
        configuration.allowsInlineMediaPlayback = true
        configuration.allowsPictureInPictureMediaPlayback = true
        configuration.userContentController = contentController
        
        super.init(frame: .zero, configuration: configuration)
        self.navigationDelegate = self
            
        contentController.add(self, name: "consoleLog")
        contentController.add(self, name: "persistedChatSessionToken")
        contentController.add(self, name: "clearPersistedChatSessionToken")
        let targetUrl = AppConfiguration.url
        guard let url = URL(string: targetUrl) else {
            return
        }
        self.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData))
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {        
        // Set session storage with stored values after WebView finishes loading
        if let persistedChatSession = UserDefaults.standard.string(forKey: "persistedChatSession"),
           let activeChatSession = UserDefaults.standard.string(forKey: "activeChatSession") {
            writeSessionStorage(forKey: "persistedChatSession", value: persistedChatSession)
        }
    }
    
    func readSessionStorage(forKey key: String, completion: @escaping (String?) -> Void) {
        let getSessionStorageItemJsCode = "sessionStorage.getItem('\(key)');"
        self.evaluateJavaScript(getSessionStorageItemJsCode) { result, error in
            if let error = error {
                print("Error reading session storage: \(error)")
                completion(nil)
                return
            }
            completion(result as? String)
        }
    }
    
    func writeSessionStorage(forKey key: String, value: String) {
        let setSessionStorageItemJsCode = "sessionStorage.setItem('\(key)', '\(value)');"
        self.evaluateJavaScript(setSessionStorageItemJsCode, completionHandler: nil)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "persistedChatSessionToken", let persistedChatSession = message.body as? String{
            UserDefaults.standard.set(persistedChatSession, forKey: "persistedChatSession")
        } else if message.name == "clearPersistedChatSessionToken" {
            UserDefaults.standard.removeObject(forKey: "persistedChatSession")
        }
    }
}
