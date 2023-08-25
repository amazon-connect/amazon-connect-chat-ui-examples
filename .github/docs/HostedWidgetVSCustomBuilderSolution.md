# Hosted Widget vs Custom Builder Solution Documentation

## Overview

[Amazon Connect](https://aws.amazon.com/connect) is an omni-channel contact center solution which includes support for chat (real time messaging between business and end-customer). An out-of-box fully managed/hosted communications widget is provided for the customer chat UI. This enables customer to copy/paste a simple code snippet to set up in minutes.

Alternatively, AWS Customer can also build a custom customer-facing chat UI with ChatJS (an open-source JavaScript library published to npm). This is a wrapper around the AWS Javascript SDK, which calls the [Amazon Connect Participant Service Public APIs](https://docs.aws.amazon.com/connect-participant/latest/APIReference/Welcome.html). The hosted widget chat interface code has also been open sourced, and is available for customer to fork to avoid re-writing boilerplate code. 

AWS Customers have multiple options for integrating chat into their contact center depending on use-case and size of the business.

## Hosted Widget

Simple copy/paste snippet solution to render customer chat interface on your website, fully hosted and managed by Amazon Connect. Always receive the latest features without redeploying.

### Prerequisites
- An Amazon Connect Instance ([guide](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html))

### Usage:

```html
<script type="text/javascript">
  (function(w,d,x,id){s=d.createElement('script');s.src='https://asdf5slbvr0vu.cloudfront.net/amazon-connect-chat-interface-client.js';s.async=1;s.id=id;d.getElementsByTagName('head')[0].appendChild(s);w[x]=w[x]||function(){(w[x].ac=w[x].ac||[]).push(arguments)}})(window,document,'amazon_connect','asdf-92ac-asdf-adfe-asdf0c3bfd');

  amazon_connect('styles', { openChat: { color: '#ffffff', backgroundColor: '#07b62a'}, closeChat: { color: '#ffffff', backgroundColor: '#07b62a'} });
  amazon_connect('snippetId', 'asdf1234asdf1234adsf1234=');
  amazon_connect('supportedMessagingContentTypes', [ 'text/plain', 'text/markdown' ]);
</script>
```

!["Hosted Widget Diagram"](/.github/screenshots/HostedWidgetCustomerChatUISnippetCodeDiagram.png)

### Features

> For latest features, refer to Admin Guide documentation along with [#Features](https://github.com/amazon-connect/amazon-connect-chat-interface/blob/master/DOCUMENTATION.md#features) in README

* Theme Configuration
* Branding (logo, naming)
* Message Receipts
* Rich Text Formatting
* Interactive Messages (Lex Bot)
* File Attachments
* Browser Refresh (reconnect to ongoing chat)
* Persistent Chat (resume previous chat)
* Custom Chat Duration (configurable duration of the chat session (auto-timeout))
* Browser Notifications
* Passing Attribute to Contact Flow

## Build Your Own Widget

Customer builder solutions for a completely customized chat interface application.

!["Build Your Own Widget"](/.github/screenshots/BuildYourOwnCustomerChatUIDiagram.png)

### Prerequisites

- An Amazon Connect Instance ([guide](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html))
- An Amazon Connect Contact Flow, ready to receive chat contacts ([guide](https://docs.aws.amazon.com/connect/latest/adminguide/web-and-mobile-chat.html))
- Custom Amazon Connect Chat backend ([guide](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/cloudformationTemplates/startChatContactAPI/README.md))
  Your chat application must make a call to the [StartChatContact](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html) Public API to initiate a chat. This is provided in the AWS-SDK but requires credentials (not recommended in browser). We recommend deploying your own chat backend with the [StartChatContact CFN template](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/cloudformationTemplates/startChatContactAPI/README.md) (as a proxy to Amazon Connect).

  > After creating a chat, your application will call the [ParticipantService](https://docs.aws.amazon.com/connect-participant/latest/APIReference/Welcome.html) Public API during the chat session, which can be called from the browser (without credentials)

### Options

Several approaches are available for chat interface custom builders:

1) Build chat application/widget from scratch with [AWS-SDK](https://aws.amazon.com/developer/tools)

  **Description**: A low-level implementation using the AWS SDK, available in multiple languages.

  - Deploy a [chat backend CloudFormation template](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/cloudformationTemplates/startChatContactAPI/README.md), which uses [`@aws-sdk/client-connect`](https://www.npmjs.com/package/@aws-sdk/client-connect) to call [StartChatContact](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html) Public API.
  - Use [`@aws-sdk/client-connectparticipant`](https://www.npmjs.com/package/@aws-sdk/client-connectparticipant) to call [ParticipantService](https://docs.aws.amazon.com/connect-participant/latest/APIReference/Welcome.html) Public API

2)  Build chat application/widget from [ChatJS](https://www.npmjs.com/package/amazon-connect-chatjs) (wrapper around [`@aws-sdk/client-connectparticipant`](https://www.npmjs.com/package/@aws-sdk/client-connectparticipant))

  **Description**: Use the Javascript npm library to build on top of basic chat functionality

  - Deploy a [chat backend CloudFormation template](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/cloudformationTemplates/startChatContactAPI/README.md), which uses [`@aws-sdk/client-connect`](https://www.npmjs.com/package/@aws-sdk/client-connect) to call [StartChatContact](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html) Public API.
  - Subscribe to provided [ChatJS](https://www.npmjs.com/package/amazon-connect-chatjs) events, follow the [README](https://github.com/amazon-connect/amazon-connect-chatjs) documentation

3) Fork the open-source [amazon-connect-chat-interface.js](https://github.com/amazon-connect/amazon-connect-chat-interface) to build custom chat application/widget

  **Description**: Clone the pre-built chat application code and fully customize the chat interface.

  - Deploy a [chat backend CloudFormation template](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/cloudformationTemplates/startChatContactAPI/README.md), which uses [`@aws-sdk/client-connect`](https://www.npmjs.com/package/@aws-sdk/client-connect) to call [StartChatContact](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html) Public API.
  - Fork the open source chat interface code from [GitHub](https://github.com/amazon-connect/amazon-connect-chat-interface)
  - Follow documentation provided in the [README](https://github.com/amazon-connect/amazon-connect-chat-interface)

## Features

* Interactive Messages (Lex Bot) - [Blog Post](https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/) / [Documentation](https://docs.aws.amazon.com/connect/latest/adminguide/interactive-messages.html)
* Attachments (File Sharing) - [Documentation](https://docs.aws.amazon.com/connect/latest/adminguide/enable-attachments.html)
* Persistent Chat (resume previous chat) - [Documentation](https://docs.aws.amazon.com/connect/latest/adminguide/chat-persistence.html)

## Related

The following open source code may also be helpful when building a custom widget:

- [customChatWidget](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/customChatWidget) - example widget icon button code for your website, paired with a chat interface
- [connectReactNativeChat](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/connectReactNativeChat) - demo application for using ChatJS with React Native