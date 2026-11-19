# Amazon Connect Chat Widget - Full Screen Demo

A demonstration of how to launch the Amazon Connect hosted chat widget in a new browser window with full screen embedded view. This implementation showcases chat widget integration with proper error handling, persistence across tabs, and responsive full-screen layout.

> ⚠️ Important: as of May 2025, the hosted widget doesn't have official support for Hosted Widget embedded mode on desktop browser. Mobile devices do support full screen. This demo uses css overrides to enable full screen for desktop: `#amazon-connect-chat-widget [class*="acFrameContainer-"]`

![New Browser Window Widget Recording](./hosted-widget-new-window-recording.gif)

## Prerequisites

- An Amazon Connect instance
- Access to create/modify chat widgets in your Amazon Connect instance
- Basic understanding of HTML/JavaScript

## Setup Instructions

1. **Get Your Amazon Connect Widget Code**
   - Go to your Amazon Connect instance and create or get your existing chat widget
   - Follow the [official instructions](https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html) to create a widget if needed

2. **Allow-list your Domain**
  - Go to your Amazon Connect instance and open Communications Widget page
  - Follow the [official instructions](https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html#chat-widget-domains) for adding your domain
  - For local testing, be sure to add `http://localhost:3000`

3. **Configure the Widget**
   - Open `index.html`
   - Locate the commented widget configuration section
   - Replace the placeholder code with your actual widget snippet:

```diff
<html>
  <body>
  <!-- ... -->
  </body>

    <script>
    // ...

-   // YOUR HOSTED WIDGET SNIPPET CODE
+   // Replace with your actual widget configuration
+   (function(w, d, x, id) {
+       s = d.createElement('script');
+       s.src = 'example.com';  // Replace with your actual source URL
+       s.async = 1;
+       s.id = id;
+       d.getElementsByTagName('head')[0].appendChild(s);
+       w[x] = w[x] || function() { (w[x].ac = w[x].ac || []).push(arguments) };
+   })(window, document, 'amazon_connect', '<widgetId>');  // Replace <widgetId>
+
+   amazon_connect('styles', {
+       iconType: 'CHAT',
+       openChat: { color: '#ffffff', backgroundColor: '#123456' },
+       closeChat: { color: '#ffffff', backgroundColor: '#123456' }
+   });
+   amazon_connect('snippetId', '<snippetId>');  // Replace <snippetId>
+   amazon_connect('supportedMessagingContentTypes', [
+       'text/plain',
+       'text/markdown',
+       'application/vnd.amazonaws.connect.message.interactive',
+       'application/vnd.amazonaws.connect.message.interactive.response'
+   ]);

+   // Auto-launch configuration
+   // Launch Behavior: https://docs.aws.amazon.com/connect/latest/adminguide/customize-widget-launch.html#load-assets
+   amazon_connect("customLaunchBehavior", {
+     skipIconButtonAndAutoLaunch: true,
+     alwaysHideWidgetButton: true
+   });

+   // Reconnect to  the ongoing chat session across browser tabs
+   // Chat Persistence: https://docs.aws.amazon.com/connect/latest/adminguide/customize-widget-launch.html#chat-persistence-across-tabs
+   amazon_connect('registerCallback', {
+     'CONNECTION_ESTABLISHED': (eventName, { chatDetails, data }) => {
+       document.cookie = `activeChat=${sessionStorage.getItem("persistedChatSession")}; SameSite=None; Secure`;
+     },
+     'CHAT_ENDED': () => {
+       document.cookie = "activeChat=; SameSite=None; Secure";
+     }
+   });
+   const cookie = document.cookie.split('; ').find(c => c.startsWith('activeChat='));
+   if (cookie) {
+     const activeChatValue = cookie.split('=')[1];
+     sessionStorage.setItem('persistedChatSession', activeChatValue);
+   }
    </script>
<html>
```

## Running the Demo

### Option 1: Direct Browser Access

Open the file directly in your browser:
```
file:///path/to/your/index.html
```

Note: Some features might be limited when using direct file access due to browser security restrictions. Using a local server (Option 1) is recommended.

### Option 2: Using Node.js

```bash
# Check Node.js version
node --version  # Should be v20.x.x or newer

# Start local server
npx live-server index.html --port=3000

# Access the demo at http://localhost:3000
```

## Features

- Full screen embedded chat widget
- Responsive layout
- Chat session persistence across tabs

## Documentation References

- [Adding Chat to Your Website](https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html)
- [Chat Widget Launch Behavior](https://docs.aws.amazon.com/connect/latest/adminguide/customize-widget-launch.html#load-assets)
- [Custom Styles](https://docs.aws.amazon.com/connect/latest/adminguide/pass-custom-styles.html)
- [Chat Persistence](https://docs.aws.amazon.com/connect/latest/adminguide/customize-widget-launch.html#chat-persistence-across-tabs)

For best results, ensure your browser allows popups for the demo URL.
