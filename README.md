# Amazon Connect Chat UI Examples

This repo contains examples on how to implement the customer side of Amazon Connect chat. Please refer to the README under each solution to see the complete details as to what each solution does and how to deploy it.

**New to Amazon Connect and looking to onboard with Chat/Messaging capabilities?** Refer to the [“Amazon Connect Chat Open Source Walkthrough”](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/.github/docs/AmazonConnectChatOpenSourceWalkthrough.md) documentation, and [“Hosted Widget vs Custom Builder Solution”](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/.github/docs/HostedWidgetVSCustomBuilderSolution.md) if building a customer-facing chat interface.

## Solutions

At the moment, these are the solutions in this repo:

1. **[cloudformationTemplates/startChatContactAPI](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI)**
   The Start Chat Contact API solution creates a simple API to start the chat from the customer side. Use this solution if you want to custom build your customer chat widget. There is also an example html file in this repo that shows you how to make subsequent calls to Chat JS to send messages between the customer and agent after the chat is started.
2. **[cloudformationTemplates/urlPreviewForAsyncChat](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/urlPreviewForAsyncChat)**
   The Url preview for async chat solution is an enhancement of the Async Customer Chat solution, which presents URL previews in chat. For example, entering `www.aws.com` in the chat window will display a rich preview with an image of the website for a better experience. There is also an example html file in this repo that shows you how to make subsequent calls to Chat JS to send messages between the customer and agent after the chat is started.
3. **[samTemplates/amazon-connect-interactive-messages-example](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/samTemplates/amazon-connect-interactive-messages-example)**
   Interactive messages in Amazon Connect Chat allow contact centers to provide personalized prompts and response options that customers can easily select from. This serverless application is a sample lambda function which implements Amazon Connect interactive message templates (lists, lists with images, and a time picker) as described in the AWS Contact Center blog post [How to enable interactive messages in Amazon Connect chat](https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/).

4. **[customChatWidget](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/customChatWidget)**
   Custom Chat Widget for Amazon Connect, with a Chat Form that can be easily plugged into a webpage. This solution helps customers to have Amazon Connect Custom Chat Widget in their website, by applying simple configuration parameters. It also makes customizing the `amazon-connect-interface.js` file easier, and can be used as an easy way to host custom widget on a webpage.

5. **[connectReactNativeChat](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/connectReactNativeChat)**
   React Native demo Chat application for Amazon Connect. This cross-platform solution implements basic Chat JS functionality and is fully customizable. Follow the provided documentation to build with [`amazon-connect-chatjs@^1.5.0`](https://github.com/amazon-connect/amazon-connect-chatjs).
   
6. **[startChatContactAPILocalProxy](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/startChatContactAPILocalProxy)**
   Solution to run local proxy server for the Amazon Connect [StartChatContact](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html) Public API. Can be used during local development when building a custom chat interface, prior to deploying a production CloudFormation chat backend.

6. **[hostedWidgetCustomization](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/hostedWidgetCustomization)**
   Additional ways to configure the Amazon Connect Hosted Widget on your website and further personalize the branding. This sample code covers several common use cases for customizing the widget snippet code. [Learn more](https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html)

7. **[iOSChatExample](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/iOSChatExample)**/**[AndroidChatExample](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/AndroidChatExample)**
   These native mobile examples of the AWS Connect chat widget are designed for easy integration with a focus on customization. Out-of-the-box ready yet fully adaptable, they offer developers the perfect starting point for incorporating a chat feature that can be fine-tuned to any customer’s requirements.


## Resources

Here are a few resources to help you implement chat in your contact center:

- [Amazon Connect ChatJS](https://github.com/amazon-connect/amazon-connect-chatjs)
- [Amazon Connect Streams](https://github.com/aws/amazon-connect-streams)
- [Amazon Connect Service SDK](https://docs.aws.amazon.com/connect/latest/APIReference/Welcome.html) (Download the SDK [here](https://github.com/aws/))
- [Amazon Connect Participant Service SDK](https://docs.aws.amazon.com/connect-participant/latest/APIReference/Welcome.html) (Download the SDK [here](https://github.com/aws/))
- [iOS Mobile SDK](https://github.com/aws-amplify/aws-sdk-ios)
  - [Amazon Connect Participant Service](https://cocoapods.org/pods/AWSConnectParticipant)
  - [Amazon Connect Service](https://cocoapods.org/pods/AWSConnect)
- [Android SDK](https://github.com/aws-amplify/aws-sdk-android)
- [Open source code for the Chat Interface](https://github.com/amazon-connect/amazon-connect-chat-interface)

## Approaches

### Option 0: Pre-built Amazon Connect Hosted Widget Snippet

> Follow the Admin Guide Documentation: https://docs.aws.amazon.com/connect/latest/adminguide/add-chat-to-website.html

Add a chat widget to your website that is hosted by Amazon Connect. You can configure the chat widget in the Amazon Connect console: customize the font and colors, and secure the widget so that it can be launched only from your website. As a result, you will have a short code snippet that you add to your website, with latest version always live on your website.

```html
<script type="text/javascript">
  (function(w, d, x, id){s=d.createElement('script');s.src='https://1234lbvr0vu.cloudfront.net/amazon-connect-chat-interface-client.js';s.async=1;s.id=id;d.getElementsByTagName('head')[0].appendChild(s);w[x]=w[x]||function(){(w[x].ac=w[x].ac||[]).push(arguments)}})(window, document, 'amazon_connect', '360f3075-asfd-asfd-asdf-asdf');
  
  amazon_connect('styles', { openChat: { color: '#ffffff', backgroundColor: '#07b62a'}, closeChat: { color: '#ffffff', backgroundColor: '#07b62a'} });
  amazon_connect('snippetId', 'asdf1234asdf1234adsf1234=');
  amazon_connect('supportedMessagingContentTypes', [ 'text/plain', 'text/markdown' ]);
</script>
```

![Hosted Widget Snippet UI](/.github/screenshots/hosted-widget-chat-interface-screenshot.png)

### Option 1: Hosted Widget Snippet Integrated Custom UI (S3 Bucket/CDN)

> Fork the [amazon-connect-chat-interface](https://github.com/amazon-connect/amazon-connect-chat-interface) open source code, and follow steps listed in [HostedSnippetCustomBundleFileSetup.md](https://github.com/amazon-connect/amazon-connect-chat-interface/blob/master/.github/docs/HostedSnippetCustomBundleFileSetup.md) for a full setup walkthrough

Integrate a fully customized chat interface UI in the pre-built Hosted Widget, with all configurations available in the Connect Admin Console. The hosted widget can handle all of the logic to render the widget on your website and start chat sessions.

Host your own `amazon-connect-chat-interface.js` bundle file and provide the link in the widget snippet configuration. 

```diff
<script type="text/javascript">
  (function(w, d, x, id){s=d.createElement('script');s.src='https://1234lbvr0vu.cloudfront.net/amazon-connect-chat-interface-client.js';s.async=1;s.id=id;d.getElementsByTagName('head')[0].appendChild(s);w[x]=w[x]||function(){(w[x].ac=w[x].ac||[]).push(arguments)}})(window, document, 'amazon_connect', '360f3075-asdf-asdf-asdf-sadfsadf1234');
  
  amazon_connect('styles', { openChat: { color: '#ffffff', backgroundColor: '#07b62a'}, closeChat: { color: '#ffffff', backgroundColor: '#07b62a'} });
  amazon_connect('snippetId', 'asdf1234asdf1234adsf1234=');
  amazon_connect('supportedMessagingContentTypes', [ 'text/plain', 'text/markdown' ]);
+ amazon_connect('customerChatInterfaceUrl', 'https://...'); # TODO: put in your link to amazon-connect-chat-interface.js
</script>
```

![Host Widget Snippet Integrated Custom UI](/.github/screenshots/custom-bundle-file-interface.png)

### Option 2: Customized Widget and Chat Interface UI (Self-Hosted)

> Refer to the [customChatWidget example](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/customChatWidget) code, and follow steps listed in [CustomChatAndWidgetSelfHostedSetup.md](https://github.com/amazon-connect/amazon-connect-chat-interface/blob/master/.github/docs/CustomChatAndWidgetSelfHostedSetup.md) for a full setup walkthrough

Fully customize the chat interface UI for your website, add a form to collect user info, and customize how the widget is rendered. Host and manage the bundle file yourself, importing it with a `<script src="amazon-connect-chat-interface.js"></script>` tag.

![Custom Widget Experience](/.github/screenshots/custom-chat-widget-interface-screenshot.png)

**NOTE:** This approach requires a proxy to invoke the Amazon Connect Public [StartChatContact](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html) API. Refer to the [startChatContactAPI CloudFormation Template](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI) to deploy an API Gateway proxy solution.

![Custom Widget Experience Backend](/.github/screenshots/StartChatContactCFNTemplateArchitecture.png)

## Enabling Chat in an Existing Amazon Connect Contact Center

If your instance was created before the release of the chat feature, here's an overview of what you need to do to enable chat, as well as what has changed.

1. Because you have an existing instance, you'll need to enable chat testing mode to use the simulated environment we've provided for testing. Follow these steps: 
    1. In Amazon Connect, choose Users, Security profiles. 
    2. Select the security profile that you want update, such as Admin. 
    3. Expand Numbers and flows. 
    4. For Chat test mode choose Enable/Disable. 
    5. Choose Save. Now people who are assigned to that security profile will be able to use the simulated chat experience.  
    _Note: Another option is to create a new security profile specifically for testing chat and assign testers to that profile._
    ![screenshot of enabling chat on a security profile](.github/screenshots/securityProfile.png)

2. Enable Chat in your Routing Profile. Go into your instance's website and go to the Routing Profiles section. Edit the Routing Profile for your agent and add the Basic Queue to the profile with the chat channel enabled.
    ![screenshot of enabling chat on a routing profile](.github/screenshots/chatRoutingProfile.png)
3. Your existing contacts flows will also work for chat! You just need to update them to specify how you want them to work.
    We've added the following action blocks:

    - [Wait](https://docs.aws.amazon.com/connect/latest/adminguide/wait.html)
    - [Set disconnect flow](https://docs.aws.amazon.com/connect/latest/adminguide/set-disconnect-flow.html)

    And updated these blocks for chat:

    - [Play prompt](https://docs.aws.amazon.com/connect/latest/adminguide/play.html)
    - [Get customer input](https://docs.aws.amazon.com/connect/latest/adminguide/get-customer-input.html)
    - [Store customer input](https://docs.aws.amazon.com/connect/latest/adminguide/store-customer-input.html)
    - [Set recording behavior](https://docs.aws.amazon.com/connect/latest/adminguide/set-recording-behavior.html)

4. Your metric reports and the contact trace records will now reflect chat as a channel. Note the following metrics:

    - [Agent Activity](https://docs.aws.amazon.com/connect/latest/adminguide/real-time-metrics-definitions.html#agent-activity-state-real-time): This metric used to be named Agent Status. Existing reports that used Agent Status as the column name will start using Agent Activity as the column name.
    - [Availability](https://docs.aws.amazon.com/connect/latest/adminguide/real-time-metrics-definitions.html#availability-real-time): This metric has a new definition to account for chat. The change has no impact on metrics for voice calls.
    - [Capacity](https://docs.aws.amazon.com/connect/latest/adminguide/real-time-metrics-definitions.html#capacity-real-time): This is a new real-time metric.
    - [Contact State](https://docs.aws.amazon.com/connect/latest/adminguide/real-time-metrics-definitions.html#contact-state-real-time): This metric has a few changes so the states are better aligned to what the agent sees in the updated CCP.

    Check out the Real-time Metrics Definitions and Historical Metrics Definitions. These articles have been updated to reflect the addition of chat.

5. Enable Chat Transcripts in the Amazon Connect console by viewing your instance settings and clicking on the 'Data Storage' section and adding an S3 bucket in the 'Chat Transcripts' section.
    ![screenshot of enabling chat transcripts](.github/screenshots/chatTranscript.png)
6. If your business is using Amazon Lex bots in your contact center, and your Amazon Connect instance was created before October 12, 2018, we recommend doing the following step to ensure your service-linked role has "lex:PostText" permissions:
    - Add a new Amazon Lex bot (and then you can remove it). The act of adding the Amazon Lex bot will automatically update your permissions.
7. When you're ready to deploy the updated CCP, give the URL for it to those agents who are going handle voice and chat contacts, or only chat contacts. Those agents who are only handling voice contacts can continue using the original CCP. To learn more about the updated CCP interface, see [Chat with Contacts](https://docs.aws.amazon.com/connect/latest/adminguide/work-with-chats.html).
8. For instances created prior to October 12, 2018, the Test Chat experience in the Amazon Connect website is not available. Please follow instructions in the [asyncCustomerChatUX solution](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/asyncCustomerChatUX) to deploy your own sample customer UI and test chat.
9. Enable interactive messages for your chat widget in Amazon Connect by reading the blog on how to [easily set up interactive messages for your Amazon Connect chatbot](https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/) for detailed instructions.

## Troubleshooting and Support

Review the resources given in the README files for guidance on how to develop on this library. Additionally, search our [issues database](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/issues) to see if your issue is already addressed. If not please cut us an [issue](https://github.com/amazon-connect/amazon-connect-chat-interface/issues/new/choose) using the provided templates.

If you have more questions, or require support for your business, you can reach out to [AWS Customer support](https://aws.amazon.com/contact-us). You can review our support plans [here](https://aws.amazon.com/premiumsupport/plans/?nc=sn&loc=1).

## License Summary

This sample code is made available under the MIT-0 license. See the LICENSE file.
