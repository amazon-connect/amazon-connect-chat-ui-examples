# Amazon Connect Communication Widget WKWebView Sample
This is a fork of [amazon-chime-sdk Android webview sample](https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/android-webview-sample).

## Summary

This sample shows how to run a communication widget application inside an Android WKWebView. The sample itself is a bare-bones Android app that loads a WKWebView, which then navigates to a specified URL. Currently Android Chromium WebView does not support grabbing media device label, so you may need to make some minor changes to your application in order for Chromium WebView to work correctly.

### Pre-requisites:
- Android Studio 4.2.2+ installed on your machine

### Create a communication widget and embed it
If you'd like to use a communication widget from within a WKWebView in Android, you first need to embed it in a browser so that the widget appears when you load the WKWebView. Follow the instructions for the [Amazon Connect Communication Widget Documentation](https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html) in order to create and embed a communication widget.

After you've embedded a communication widget, copy the URL of the webpage where the widget is embedded, then replace the variable `url` in `./app/java/AppConfig.kt` with it.

For example:
```
struct AppConfiguration {
    static let url = "https://your-website"
}
```

You can now build and run the Android application.  
