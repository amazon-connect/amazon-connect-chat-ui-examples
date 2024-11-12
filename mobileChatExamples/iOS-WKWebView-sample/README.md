# Amazon Connect Communication Widget WKWebView Sample
This is a fork of [amazon-chime-sdk iOS webview sample](https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/iOS-WKWebView-sample).

## Summary

This sample shows how to run a communication widget application inside an iOS WKWebView. The sample itself is a bare-bones iOS app that loads a WKWebView, which then navigates to a specified URL. iOS 14.3 or later version is required if VoIP channel is enabled for the widget.

### Pre-requisites:
- XCode 12.3+ installed on your machine

### Create a communication widget and embed it 
If you'd like to use a communication widget from within a WKWebView in iOS, you first need to embed it in a browser so that the widget appears when you load the WKWebView. Follow the instructions for the [Amazon Connect Communication Widget Documentation](https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html) in order to create and embed a communication widget.

After you've embedded a communication widget, copy the URL of the webpage where the widget is embedded, then replace the variable `url` in `./AppConfiguration.swift` with it. 

For example:
```
struct AppConfiguration {
    static let url = "https://your-website"
}
```

You can now build and run the iOS application.

## Persistent Chat Example

https://github.com/user-attachments/assets/eb10d365-9491-4e71-8204-072330bd64c3

In the WebView example, persistent chat will allow the chat widget to re-connect to an existing chat contact as long as the chat contact is still active. This is great for scenarios where the user closes the app or turns off their phone and want to return to the existing conversation when re-launching the app.  All the persistent chat logic can be found in the [`HostedWidgetWebView.swift`](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/mikeliao/ios-webview-persistent-chat/mobileChatExamples/iOS-WKWebView-sample/WkWebView%20Demo/HostedWidgetWebView.swift) file.

### How does it work?

The hosted widget's persistent chat feature is managed via the `persistedChatSession` session storage item. In [`HostedWidgetWebView.swift`](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/mikeliao/ios-webview-persistent-chat/mobileChatExamples/iOS-WKWebView-sample/WkWebView%20Demo/HostedWidgetWebView.swift).  In order to get persistent chat working as an embedded WebView, we need to be able to store the `persistedChatSession` value on the app and then set the `persistedChatSession` key once the WebView loads the widget. The logic for receiving and saving the session storage data as well as setting the session storage data can be found in [`HostedWidgetWebView.swift`](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/mikeliao/ios-webview-persistent-chat/mobileChatExamples/iOS-WKWebView-sample/WkWebView%20Demo/HostedWidgetWebView.swift).

### Setup

In order for `persistedChatSession` to work, we also need to update our widget snippet to pass the `persistedChatSession` data back to the native app. We can achieve this by using the `registerCallback` snippet attribute and register callbacks for `CONNECTION_ESTABLISHED` to indicate when the session storage data is ready for retrieval and `CHAT_ENDED` to indicate when to clear the session storage data. Here is an example `registerCallback` snippet attribute that will enable the `persistentChatSession` functionality for WebViews.  See [Supported widget snippet fields in Amazon Connect that are customizable
](https://docs.aws.amazon.com/connect/latest/adminguide/supported-snippet-fields.html) for more details on snippet attributes.

```
  amazon_connect('registerCallback', {
    'CONNECTION_ESTABLISHED': () => {
      const persistedChatSession = sessionStorage.getItem('persistedChatSession');
      window?.webkit?.messageHandlers?.persistedChatSessionToken?.postMessage(persistedChatSession);
    },
    'CHAT_ENDED': () => {
      window?.webkit?.messageHandlers?.clearPersistedChatSessionToken?.postMessage(null);
    }
  });
```
