# Amazon Connect Chat Open Source Walkthrough

## Overview

[Amazon Connect](https://aws.amazon.com/connect) is an omni-channel contact center solution which includes support for chat (real time messaging between business and end-customer). An out-of-box agent workspace UI is included in the Connect console, along with a communications widget fully managed and hosted for the customer chat UI.

Alternatively, AWS Customer can also build a custom agent UI from scratch using [ChatJS](https://www.npmjs.com/package/amazon-connect-chatjs) and [Streams](https://www.npmjs.com/package/amazon-connect-streams) libraries, and/or a custom customer chat UI with just ChatJS. ChatJS and Streams are open-source JavaScript libraries published to npm. These are wrappers around the [AWS Javascript SDK](https://aws.amazon.com/sdk-for-javascript/), which are calling the [Amazon Connect Participant Service Public APIs](https://docs.aws.amazon.com/connect-participant/latest/APIReference/Welcome.html). Connect has also open-sourced the hosted widget chat interface code for customer to fork.

AWS Customers have multiple options for integrating chat into their contact center depending on use-case and size of the business.


## Customer Chat Interface

To support your customers through chat, you can add a chat widget to your website that is hosted by Amazon Connect. You can configure the chat widget in the Amazon Connect console: customize the font and colors, and secure the widget so that it can be launched only from your website. As a result, you will have a short code snippet that you add to your website.

Because Amazon Connect hosts the widget, it ensures that the latest version is always live on your website.

To get started, follow the Hosted Widget [Admin Guide Documentation](https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html)

!["Hosted Widget Diagram"](/.github/screenshots/HostedWidgetCustomerChatUISnippetCodeDiagram.png)

### Build Your Own Widget

Alternatively, solutions are available to build your own widget to fully customize the customer-facing chat UI. To learn more, follow the [HostedWidgetVSCustomBuilderSolution.md](./HostedWidgetVSCustomBuilderSolution.md) guide.

!["Build Your Own Widget"](/.github/screenshots/BuildYourOwnCustomerChatUIDiagram.png)


## Agent Chat Interface

To support your customers through chat, contact center agents can use the Amazon Connect Agent Workspace - also known as the Contact Control Panel (CCP).

To get started, refer to [“How to use the CCP to chat with contacts”](https://docs.aws.amazon.com/connect/latest/adminguide/chat-with-connect-contacts.html) in the Admin Guide.

<img alt="CCP Pre-built Agent UI" src="/.github/screenshots/PreBuiltCCPChatUIScreenshot.png" width="250px">

## Build Your Own Agent Workspace UI

Alternatively, solutions are available to build your own agent chat application. This can be done using the Javascript [ChatJS](https://www.npmjs.com/package/amazon-connect-chatjs) and [Streams](https://www.npmjs.com/package/amazon-connect-streams) libraries available on npm.

!["Build Your Own Agent UI"](/.github/screenshots/BuildYourOwnAgentChatUIDiagram.png)

## Appendix

- "Download and customize our open source example" - https://docs.aws.amazon.com/connect/latest/adminguide/download-chat-example.html
- ChatJS - https://github.com/amazon-connect/amazon-connect-chatjs
- Streams - https://github.com/amazon-connect/amazon-connect-streams
- ChatInterface Source Code - https://github.com/amazon-connect/amazon-connect-chat-interface
- `@aws-sdk/client-connectparticipant` - https://www.npmjs.com/package/@aws-sdk/client-connectparticipant
- `@aws-sdk/client-connect` - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/connect/