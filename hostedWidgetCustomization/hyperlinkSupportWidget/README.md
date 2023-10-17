# Hyperlink support

Support a plain-text URL that launches the widget on page load.

This option allows you to configure the chat widget to launch on page load without waiting for the customer to click the chat icon. You can configure this on your website to create shareable hyperlinks.

> Also refer to the Admin Guide documentation: https://docs.aws.amazon.com/connect/latest/adminguide/customize-widget-launch.html

![](./hyperlinkSupportWidget.gif)

## Setup

1. Host the snippet code on your website:

```html
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
</script>
```

2. Configure the `skipIconButtonAndAutoLaunch` flag (in the widget snippet code)

```js
amazon_connect("customLaunchBehavior", {
  skipIconButtonAndAutoLaunch: true,
});
```

3. Test your url (e.g. `https://example.com/contact-us-chat`) after being deployed, it will auto-launch the widget on page load

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
+ });
</script>
```
