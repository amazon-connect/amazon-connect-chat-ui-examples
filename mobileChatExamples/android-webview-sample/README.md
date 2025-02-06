# Amazon Connect Communication Widget WebView Sample for Android

This sample shows how to run a communication widget application inside an Android WKWebView. The sample itself is a bare-bones Android app that loads aWebView, which then navigates to a specified URL. Currently Android Chromium WebView does not support grabbing media device label, so you may need to make some minor changes to your application in order for Chromium WebView to work correctly.

### Pre-requisites:
- Android Studio 4.2.2+ installed on your machine


## Create a communication widget and embed it
If you'd like to use a communication widget from within a WKWebView in Android, you first need to embed it in a browser so that the widget appears when you load the WKWebView. Follow the instructions for the [Amazon Connect Communication Widget Documentation](https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html) in order to create and embed a communication widget.

After you've embedded a communication widget, there are two ways you can use this example:

### Option 1: Use widget's script
You can directly copy widget's script inside `AppConfig.kt` and toggle `loadJS` to `true`.

```kotlin
object AppConfig {
    // If true, load the inline JS snippet.
    // If false, load the remote URL defined in 'url'.
    var loadJS: Boolean = true

    // Your JavaScript snippet. This snippet can include its own <script> tags.
    // (Be sure your snippet is complete and valid.)
    var jsSnippet: String = """
    <script type="text/javascript">
          (function(w, d, x, id){
            ....
        </script>
    """.trimIndent()

    ...
}
```

### Option 2: Use widget's URL
Copy the URL of the webpage where the widget is embedded, then replace the variable `url` in `AppConfig.kt` with it.

For example:
```kotlin
object AppConfig {
    // If true, load the inline JS snippet.
    // If false, load the remote URL defined in 'url'.
    var loadJS: Boolean = false

    ...

    // PUT YOUR WEBSITE URL HERE
    var url: String = "<WIDGET_URL_HERE>"
}
}
```
You can now build and run the Android application.

#### Communication Widget Configurations for WebView

https://github.com/user-attachments/assets/8ee49fe1-160e-4160-91ad-129fb65a5ebb

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

In this WebView example, the function to navigate on frame close is handled by `WebViewFragment.kt`, where the `JSInterface`'s `widgetFrameClosed()` method triggers the navigation event. The trigger to execute the navigation is handled via the `WIDGET_FRAME_CLOSED` event, which needs to be emitted from within the WebView when the widget frame closes.

To emit the `widgetFrameClosed` event, we need to modify the `registerCallback` snippet field in the widget snippet code. Here is an example code snippet used to emit `widgetFrameClosed` from within the WebView:

```javascript
amazon_connect('registerCallback', {
  'WIDGET_FRAME_CLOSED': () => {
    AndroidBridge.widgetFrameClosed();
  },
});
```
In `WebViewFragment.kt`, this is handled as follows:

```kotlin
jsInterface = JSInterface(requireContext(), mWebView, object : JSInterface.WidgetCloseListener {
    override fun onWidgetFrameClosed() {
        parentFragmentManager.popBackStack()
    }
})
```

See [Supported widget snippet fields in Amazon Connect that are customizable
](https://docs.aws.amazon.com/connect/latest/adminguide/supported-snippet-fields.html) for more details on snippet fields.

## Persistent Chat Example

https://github.com/user-attachments/assets/22ae7e48-1950-4ed5-a76b-85512de67fa0

In the WebView example, persistent chat allows the chat widget to re-connect to an existing chat contact as long as the chat contact is still active. This is useful for scenarios where the user closes the app or turns off their phone and wants to return to the existing conversation when re-launching the app.

### How does it work?
The hosted widget's persistent chat feature is managed via the `persistedChatSession` session storage item. In `JSInterface.kt`, the Android app:

- The WebView stores the `persistedChatSession` locally and restores it upon reload, ensuring persistent chat functionality.
- The logic for receiving and saving the session storage data, as well as setting the session storage data, is handled inside `JSInterface.kt`.

### Setup
In order for `persistedChatSession` to work, we also need to update our widget snippet to pass the `persistedChatSession` data back to the native app.

We achieve this by using the `registerCallback` snippet attribute and registering callbacks for:

- `CONNECTION_ESTABLISHED` → Triggers when session storage data is ready for retrieval.
- `CHAT_ENDED` → Triggers when the session storage data should be cleared.

Here is an example `registerCallback` snippet attribute that enables the `persistedChatSession` functionality for WebViews:

```javascript
amazon_connect('registerCallback', {
  'CONNECTION_ESTABLISHED': () => {
    const persistedChatSession = sessionStorage.getItem('persistedChatSession');
    AndroidBridge.persistedChatSessionToken(persistedChatSession);
  },
  'CHAT_ENDED': () => {
    AndroidBridge.clearPersistedChatSessionToken();
  }
});
```

### How This Works with JSInterface.kt
Each JavaScript callback calls a corresponding method inside `JSInterface.kt`, which is registered in WebView using:
```kotlin
mWebView!!.addJavascriptInterface(jsInterface, "AndroidBridge")
```
This means JavaScript can call:
```javascript
AndroidBridge.persistedChatSessionToken(persistedChatSession);
```
...which maps to the following method in JSInterface.kt:

```kotlin
@JavascriptInterface
fun persistedChatSessionToken(token: String) {
    Log.d("JSInterface", "persistedChatSessionToken: $token")
    sharedPref.edit().putString("persistedChatSession", token).apply()
}
```
Similarly, when `CHAT_ENDED` is triggered:

```javascript
AndroidBridge.clearPersistedChatSessionToken();
```
This invokes:
```kotlin
@JavascriptInterface
fun clearPersistedChatSessionToken() {
    Log.d("JSInterface", "clearPersistedChatSessionToken")
    sharedPref.edit().remove("persistedChatSession").apply()
}
```
By handling session persistence inside JSInterface.kt, the chat session remains active even if the user navigates away and returns to the WebView.

## Integrate Amazon Connect API to enable Push Notification

1. Follow [FCM doc](https://firebase.google.com/docs/cloud-messaging) to enable push notification capability and register the end-user's device token.
1. Follow Amazon Connect [admin doc](https://docs.aws.amazon.com/connect/latest/adminguide/enable-push-notifications-for-mobile-chat.html) to register push notification after a chat is started on the hosted widget.
3. To modify the notification content, update `MyFirebaseMessagingService.kt` to configure the notification title, body and other behaviors. See [Receive messages in an Android app](https://firebase.google.com/docs/cloud-messaging/android/receive) in FCM documentation for more details.

Push Notifications are by default sent for all the agent and bot messages.
Example of push notification Payload for a chat message:
```
{
    "data": {
        "title": "",
        "body": "<connect message body>",
        "initialContactId": "initialContactId",
        "messageId": "messageId",
        "messageType": "MESSAGE",
        "contentType": "text/plain",
    }
}
```

#### To enable notifications in this example
> This example may have these things disabled by default, please make sure to enable it.
1. In the module-level `build.gradle.kts` (or `build.gradle`) file (usually `app/build.gradle.kts`):
    - Uncomment the line: `implementation("com.google.firebase:firebase-messaging-ktx:23.4.0")` (or similar) in the `dependencies` block.
    - Uncomment the line: `id("com.google.gms.google-services")` at the top of the file, under the plugins block.

2. In the project-level `build.gradle.kts` (or `build.gradle`) file:
    - Uncomment the line: `classpath("com.google.gms:google-services:4.4.1")` (or similar) in the `dependencies` block of the `buildscript` section.

3. Place the `google-services.json` file in the `app/src/main/` directory.

4. Add the `POST_NOTIFICATIONS` permission to the `AndroidManifest.xml` file (if missing).

