# Launch a new chat in a browser window

Launch the widget from a button element anywhere on your website.

This option allows you to launch the chat widget when the customer clicks on a button on your website. For example, you may choose a button named ‘Contact Us’ or ‘Chat With Us’ on your website that launches the chat widget. You also have the option to hide the default chat widget icon until the widget has been opened.

> Also refer to the Admin Guide documentation: https://docs.aws.amazon.com/connect/latest/adminguide/customize-widget-launch.html

![](./customWidgetLaunchButton.gif)

## Setup

1. Render a button element on your website

```html
<button id="launch-widget-btn">Launch a Chat</button>
```

2. Configure the `programaticLaunch` function (in the widget snippet code)

```js
amazon_connect("customLaunchBehavior", {
  skipIconButtonAndAutoLaunch: true,
  alwaysHideWidgetButton: true,
  programaticLaunch: function (launchCallback) {
    var launchWidgetBtn = document.getElementById("launch-widget-btn");
    if (launchWidgetBtn) {
      launchWidgetBtn.addEventListener("click", launchCallback);
      window.onunload = function () {
        launchWidgetBtn.removeEventListener("click", launchCallback);
        return;
      };
    }
  },
});
```

## Snippet Customizations

```diff
<script type="text/javascript">
  (function(w, d, x, id){
    s=d.createElement('script');
    s.src='https://<REPLACE_ME>.cloudfront.net/amazon-connect-chat-interface-client.js';
    s.async=1;
    s.id=id;
    d.getElementsByTagName('head')[0].appendChild(s);
    w[x] =  w[x] || function() { (w[x].ac = w[x].ac || []).push(arguments) };
  })(window, document, 'amazon_connect', '<REPLACE_ME>');
  amazon_connect('styles', { openChat: { color: '#ffffff', backgroundColor: '#07b62a'}, closeChat: { color: '#ffffff', backgroundColor: '#07b62a'} });
  amazon_connect('snippetId', '<REPLACE_ME>');
  amazon_connect('supportedMessagingContentTypes', [ 'text/plain', 'text/markdown' ]);
  // ALSO: how to pass contact attributes: https://docs.aws.amazon.com/connect/latest/adminguide/pass-contact-attributes-chat.html
  amazon_connect('customerDisplayName', function(callback) {
    const displayName = '<REPLACE_ME>';
    callback(displayName);
  });
+ amazon_connect('customLaunchBehavior', {
+   skipIconButtonAndAutoLaunch: true,
+   alwaysHideWidgetButton: true,
+   programaticLaunch: (function(launchCallback) {
+       var launchWidgetBtn = document.getElementById('launch-widget-btn');
+       if (launchWidgetBtn) {
+           launchWidgetBtn.addEventListener('click', launchCallback);
+           window.onunload = function() {
+           launchWidgetBtn.removeEventListener('click', launchCallback);
+           return;
+           }
+       }
+   })
+ });
</script>
```
