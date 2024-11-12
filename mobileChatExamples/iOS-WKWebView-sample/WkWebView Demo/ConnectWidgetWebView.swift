//
//  ConnectWidgetWebView.swift
//  WkWebView Demo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import WebKit

class ConnectWidgetWebView: WKWebView, WKScriptMessageHandler, WKNavigationDelegate {
    init() {
        // Initialize configuration and user content controller
        let configuration = WKWebViewConfiguration()
        let contentController = WKUserContentController()
        
        configuration.allowsInlineMediaPlayback = true
        configuration.allowsPictureInPictureMediaPlayback = true
        configuration.userContentController = contentController
        
        super.init(frame: .zero, configuration: configuration)
        self.navigationDelegate = self
            
        contentController.add(self, name: "persistedChatSessionToken")
        contentController.add(self, name: "clearPersistedChatSessionToken")
        
        
        // Uncomment below code to print WebView's console.log statements into XCode terminal
        // Be sure to uncomment the code in the userContentController func as well.

//        contentController.add(self, name: "consoleLog")
//        let jsCode = """
//        window.console.log = (function(oriLogFunc){
//            return function(...messages) {
//                messages.forEach(msg => {
//                    window.webkit.messageHandlers.consoleLog.postMessage(msg.toString());
//                });
//                oriLogFunc.apply(console, messages);
//            };
//        })(window.console.log);
//        """
//        let consoleLogScript = WKUserScript(source: jsCode, injectionTime: .atDocumentStart, forMainFrameOnly: false)
//        configuration.userContentController.addUserScript(consoleLogScript)
        
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
        if let persistedChatSession = UserDefaults.standard.string(forKey: "persistedChatSession") {
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
        
        // Uncomment below code to print WebView's console.log statements into XCode terminal
        // Be sure to uncomment the code in the init func as well.
//        if message.name == "consoleLog", let logMessage = message.body as? String {
//            print("WebView console.log: \(logMessage)")
//        }
        
        if message.name == "persistedChatSessionToken", let persistedChatSession = message.body as? String{
            UserDefaults.standard.set(persistedChatSession, forKey: "persistedChatSession")
        } else if message.name == "clearPersistedChatSessionToken" {
            UserDefaults.standard.removeObject(forKey: "persistedChatSession")
        }
    }
}
