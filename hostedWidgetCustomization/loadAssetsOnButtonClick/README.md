# Load widget assets when button is clicked

Improve page load speed by only fetching widget static assets on button click, versus on page load.

> Also refer to the Admin Guide documentation: https://docs.aws.amazon.com/connect/latest/adminguide/customize-widget-launch.html

![](./loadAssetsOnButtonClick.gif)

## Setup

1. Render a button element on your website

```html
<button id="launch-widget-btn">Launch a Chat</button>
```

2. Add the event listener to load the assets on button click

```html
<script>
  var buttonElem = document.getElementById("launch-widget-btn");

  buttonElem.addEventListener("click", function () {
    (function (w, d, x, id) {
      s = d.createElement("script");
      s.src =
        "https://<REPLACE_ME>.cloudfront.net/amazon-connect-chat-interface-client.js";
      s.async = 1;
      s.id = id;
      d.getElementsByTagName("head")[0].appendChild(s);
      w[x] =
        w[x] ||
        function () {
          (w[x].ac = w[x].ac || []).push(arguments);
        };
    })(window, document, "amazon_connect", "<REPLACE_ME>");
    amazon_connect("styles", {
      openChat: { color: "#000", backgroundColor: "#3498fe" },
      closeChat: { color: "#fff", backgroundColor: "#123456" },
    });
    // ALSO: further customize the widget styles: https://docs.aws.amazon.com/connect/latest/adminguide/pass-custom-styles.html
    amazon_connect("snippetId", "<REPLACE_ME");
    amazon_connect("customLaunchBehavior", {
      skipIconButtonAndAutoLaunch: true,
    });
  });
</script>
```

## Snippet Customizations

```diff
- <script type="text/javascript">
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
+   amazon_connect('customLaunchBehavior', {
+     skipIconButtonAndAutoLaunch: true,
+   });
- </script>
```
