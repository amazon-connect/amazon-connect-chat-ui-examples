# Submit form to launch a new chat

Submit a form to launch a new chat and pass in values as contact attributes.

This option allows you to launch a widget on form submission as well as pass values submitted to form as contact attributes.

> Also refer to the Admin Guide documentation: https://docs.aws.amazon.com/connect/latest/adminguide/customize-widget-launch.html

![](./formSubmitLaunchChat.gif)

## Setup
1. Create a form on your website:
```html
    <form id="chatForm" onsubmit="return submitForm()">
        <input type="text" id="firstName" placeholder="Enter your first name" required>
        <button id="launch-widget-btn" type="submit">Start Chat</button>
    </form>
```
2. Host the snippet code on your website:
```html
     <!-- EXAMPLE SNIPPET - Edit all '<REPLACE_ME>' values -->
    <script type="text/javascript">
        function submitForm() {
            (function (w, d, x, id) {
                s = d.createElement('script');
                s.src = 'https://<REPLACE_ME>.cloudfront.net/amazon-connect-chat-interface-client.js';
                s.async = 1;
                s.id = id;
                d.getElementsByTagName('head')[0].appendChild(s);
                w[x] = w[x] || function () { (w[x].ac = w[x].ac || []).push(arguments) };
            })(window, document, 'amazon_connect', '<REPLACE_ME>' /* Connect Widget ID */);

            amazon_connect('styles', { openChat: { color: '#ffffff', backgroundColor: '#123456' }, closeChat: { color: '#ffffff', backgroundColor: '#123456' } });
            amazon_connect('snippetId', '<REPLACE_ME>' /* Connect Widget Snippet ID */);
            amazon_connect('supportedMessagingContentTypes', ['text/plain', 'text/markdown']);

            const customerName = document.getElementById('firstName').value;

            // Pass customer name as contact attribute
            amazon_connect('contactAttributes', {
                customer_name: customerName
            });

            amazon_connect('customerDisplayName', function (callback) {
                callback(customerName);
            });

            amazon_connect("customLaunchBehavior", {
                skipIconButtonAndAutoLaunch: true,
            });

            //Make the page doesn't refresh on form submission
            return false;
        };
    </script>
```