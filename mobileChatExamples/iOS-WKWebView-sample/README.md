# Amazon Connect Communication Widget WebView Sample for iOS

This sample shows how to run a communication widget application inside an iOS WKWebView. The sample itself is a bare-bones iOS app that loads a WKWebView, which then navigates to a specified URL. iOS 14.3 or later version is required if VoIP channel is enabled for the widget.

### Pre-requisites:
- XCode 12.3+ installed on your machine

## Create a communication widget and embed it 
If you'd like to use a communication widget from within a WKWebView in iOS, you first need to embed it in a browser so that the widget appears when you load the WKWebView. Follow the instructions for the [Amazon Connect Communication Widget Documentation](https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html) in order to create and embed a communication widget.

After you've embedded a communication widget, there are two ways you can use this example:

### Option 1: Use widget's script
You can directly copy widget's script inside `AppConfiguration.swift` and toggle `loadJS` to `true`.

```swift
struct AppConfiguration {
    /// Set to `true` to load the JavaScript snippet mode.
    /// Set to `false` to load the remote URL.
    static let loadJS = true
    
    /// Your JavaScript snippet that already includes <script> tags.
    static let jsSnippet = """
        <script type="text/javascript">
          (function(w, d, x, id){
            ....
        </script>
    """
    ...
}

```

### Option 2: Use widget's URL
Copy the URL of the webpage where the widget is embedded, then replace the variable `url` in `AppConfiguration.swift` with it.

For example:
```swift
struct AppConfiguration {
    /// Set to `true` to load the JavaScript snippet mode.
    /// Set to `false` to load the remote URL.
    static let loadJS = false
    
    ...
    
    /// The remote URL to load if loadJS is false.
    static let url = "WIDGET_URL_HERE"
}
```

You can now build and run the iOS application.

#### Communication Widget Configurations for WebView

https://github.com/user-attachments/assets/fa260675-7f45-4beb-96ce-57564664fd67

### WebView DisplayType

For a more tailored Communication Widget WebView experience, try adding the `WEBVIEW` displayType snippet field in your widget script that is hosted by the WebView.

Here are the differences when using the `WEBVIEW` displayType:
* The widget will always render in fullscreen mode
* The widget will no longer have a minimize button
* The widget will auto-launch upon initialization
* The widget will auto-launch upon becoming visible

Here is an example code snippet to set the widget to use `WEBVIEW` displayType.
```
amazon_connect('displayType', 'WEBVIEW');
```

### Navigation on Widget Frame Close

For a more integrated WebView experience, consider adding navigation controls when the communication widget closes.

In this WebView example, the function to navigate on frame close is passed from `ConnectWidgetViewController.swift` into `ConnectWidgetWebView.swift` via `ConnectWidgetWebView`'s `onWidgetFrameClose` property. The trigger to execute the navigation is handled by the `widgetFrameClosed` content controller event in `ConnectWidgetWebView.swift`. This event needs to be triggered from within the WebView when the widget frame closes.

To emit the `widgetFrameClosed` event, we need to modify the `registerCallback` snippet field in the snippet code. Here is an example code snippet used to emit `widgetFrameClosed` from within the WebView:

```
amazon_connect('registerCallback', {
  'WIDGET_FRAME_CLOSED': () => {
    window?.webkit?.messageHandlers?.widgetFrameClosed?.postMessage(null)
  },
});
```

See [Supported widget snippet fields in Amazon Connect that are customizable
](https://docs.aws.amazon.com/connect/latest/adminguide/supported-snippet-fields.html) for more details on snippet fields.

## Persistent Chat Example

https://github.com/user-attachments/assets/eb10d365-9491-4e71-8204-072330bd64c3

In the WebView example, persistent chat will allow the chat widget to re-connect to an existing chat contact as long as the chat contact is still active. This is great for scenarios where the user closes the app or turns off their phone and want to return to the existing conversation when re-launching the app.  All the persistent chat logic can be found in the [`HostedWidgetWebView.swift`](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/mikeliao/ios-webview-persistent-chat/mobileChatExamples/iOS-WKWebView-sample/WkWebView%20Demo/HostedWidgetWebView.swift) file.

### How does it work?

The hosted widget's persistent chat feature is managed via the `persistedChatSession` session storage item. In [`HostedWidgetWebView.swift`](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/mikeliao/ios-webview-persistent-chat/mobileChatExamples/iOS-WKWebView-sample/WkWebView%20Demo/HostedWidgetWebView.swift).  In order to get persistent chat working as an embedded WebView, we need to be able to store the `persistedChatSession` value on the app and then set the `persistedChatSession` key once the WebView loads the widget. The logic for receiving and saving the session storage data as well as setting the session storage data can be found in [`HostedWidgetWebView.swift`](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/mikeliao/ios-webview-persistent-chat/mobileChatExamples/iOS-WKWebView-sample/WkWebView%20Demo/HostedWidgetWebView.swift).

### Setup

In order for `persistedChatSession` to work, we also need to update our widget snippet to pass the `persistedChatSession` data back to the native app. We can achieve this by using the `registerCallback` snippet attribute and register callbacks for `CONNECTION_ESTABLISHED` to indicate when the session storage data is ready for retrieval and `CHAT_ENDED` to indicate when to clear the session storage data. Here is an example `registerCallback` snippet attribute that will enable the `persistentChatSession` functionality for WebViews.  See [Supported widget snippet fields in Amazon Connect that are customizable
](https://docs.aws.amazon.com/connect/latest/adminguide/supported-snippet-fields.html) for more details on snippet fields.

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

## Integrate Amazon Connect API to enable Push Notification

1. Follow [APNS doc](https://developer.apple.com/documentation/usernotifications/registering-your-app-with-apns) to enable push notification capability and register the end-user's device token.
1. Follow Amazon Connect [admin doc](https://docs.aws.amazon.com/connect/latest/adminguide/enable-push-notifications-for-mobile-chat.html) to register push notification after a chat is started on the hosted widget.
1. To modify the notification content, use [UNNotificationServiceExtension](https://developer.apple.com/documentation/usernotifications/unnotificationserviceextension). Update `PushNotificationExtension/NotificationService.swift` to configure the notification title, body and other behaviors. You can also manage the push notification behavior using [UNUserNotificationCenterDelegate](https://developer.apple.com/documentation/usernotifications/unusernotificationcenterdelegate).

Push Notifications are by default sent for all the agent and bot messages.
Example of push notification Payload for a chat message:
```
{
    "aps": {
        "alert": {
            "title": "",
            "body": "<connect message body>",
        },
        "mutable-content": 1,
        "content-available": 0
    },
    "initialContactId": "initialContactId",
    "messageId": "messageId",
    "messageType": "MESSAGE",
    "contentType": "text/plain",
};
```
