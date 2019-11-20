# Overview

Adding chat to your website is possible with a few easy steps. This solutions spins up an [Amazon API Gateway](https://aws.amazon.com/api-gateway/) endpoint that triggers an [AWS Lambda](https://aws.amazon.com/lambda/) function. This Lambda function invokes the [Amazon Connect](https://aws.amazon.com/connect/) Service [StartChatContact](https://docs.aws.amazon.com/en_pv/connect/latest/APIReference/API_StartChatContact.html) API and returns the result from that call. Once you have the StartChatContact API you can either pass that response to the prebuilt widget to get a quick implementation going or you can build your own customer chat experience by using the [Amazon Connect Chat JS]( https://github.com/amazon-connect/amazon-connect-chat-js)  library. 

## CloudFormation Deployment Steps

### Pre-requisites

You need an Amazon Connect instance to deploy this [CloudFormation](https://aws.amazon.com/cloudformation/) template. You can use an existing one or create a new one by following our onboarding guide [here](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-get-started.html).

If you are using an existing instance, you may need to make a few changes to your instance to enable Chat.

1) Enable Chat Transcripts in the Amazon Connect console by viewing your instance settings and clicking on the 'Data Storage' section and adding an S3 bucket in the 'Chat Transcripts' section.
![screenshot of enabling chat transcripts](images/chatTranscript.png)
2) Enable Chat in your Routing Profile. Go into your instance's website and go to the Routing Profiles section. Edit the Routing Profile for your agent and add the Basic Queue to the profile with the chat channel enabled.
![screenshot of enabling chat on a routing profile](images/chatRoutingProfile.png)

### Steps

| Region | Launch Button |
| ------ | ------------- |
| us-east-1 (N. Virginia) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3.amazonaws.com/us-east-1.start-chat-contact-api-cfn/cloudformation.yaml) |
| us-west-2 (Oregon) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://us-west-2.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-us-west-2.amazonaws.com/us-west-2.start-chat-contact-api-cfn/cloudformation.yaml) |
| ap-southeast-2 (Sydney) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://ap-southeast-2.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-ap-southeast-2.amazonaws.com/ap-southeast-2.start-chat-contact-api-cfn/cloudformation.yaml) |
| ap-northeast-1 (Tokyo) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://ap-northeast-1.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-ap-northeast-1.amazonaws.com/ap-northeast-1.start-chat-contact-api-cfn/cloudformation.yaml) |
| eu-central-1 (Frankfurt) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-eu-central-1.amazonaws.com/eu-central-1.start-chat-contact-api-cfn/cloudformation.yaml) |


1) Deploy the CloudFormation template from one of the links above.
    - Enter the Contact Flow id and Instance Id that you would like to test with. These are added as Lambda environment variables.
        - `contactFlowId`: You can find the contact flow id when viewing a contact flow. For example, if the arn for your flow is 'arn:aws:connect:us-west-2:123456789012:instance/11111111-1111-1111-1111-111111111111/contact-flow/22222222-2222-2222-2222-222222222222', the contact flow id is '22222222-2222-2222-2222-222222222222'
        - `instanceId`: This is the id of the instance you want to use. You can find this on the Amazon Connect console or when viewing the contact flow. For example, if the arn for your flow is 'arn:aws:connect:us-west-2:123456789012:instance/11111111-1111-1111-1111-111111111111/contact-flow/22222222-2222-2222-2222-222222222222', the instance id is '11111111-1111-1111-1111-111111111111'
2) Once the stack has launched you can call the API from your website. Follow the steps below to see how you can call this API using our pre-built chat widget or by building out your own UX.
    
## Prebuilt Chat Widget
If you want to add the customer chat widget (that is available in the Test Chat experience in the Amazon Connect website) to your website, here are the steps to do so. You can also refer to the `widgetIndex.html` file in this repo to see an example of how to use the widget.

1. In your website's html code, import the 'amazon-connect-chat-interface.js' file from this repo.

    ```html
    <script src="amazon-connect-chat-interface.js"></script>
    ```

2. Initialize the Chat Interface on page load. Note: you need to update this to include the root id of the div where the customer chat widget will live.

    ```js
    $(document).ready((a) => {
      connect.ChatInterface.init({
        containerId: 'root' // This is the id of the container where you want the widget to reside
        });
    });
    ```

3. Start the chat based on a user action. You will want to add fields for the customer name and username because those fields are used in the Lambda function that was created. Note: you need to update this to include the API Gateway endpoint that was created in the CloudFormation stack.

    ```js
    connect.ChatInterface.initiateChat({
      name: customerName,
      username: username,
      region: ${region},
      apiGatewayEndpoint: "https://${apiId}.execute-api.${region}.amazonaws.com/Prod",
      contactAttributes: JSON.stringify({
        "customerName": customerName
      }),
      contactFlowId: "${contactFlowId}",
      instanceId: "${instanceId}"
    },successHandler, failureHandler)
    ```

## Creating your own Chat UX

If instead you want to build your own Chat widget instead of use our prebuilt one, follow these directions. There is an example file `customBuildIndex.html` that shows you how to call [Amazon Connect Chat JS]( https://github.com/amazon-connect/amazon-connect-chat-js) to send messages between the agent and customer.

There are two main steps: 
1) Call your lambda function to start the chat
2) Initiate the ChatSession

After that, you manage the interaction between the customer and agent based on the messages and events sent along the websocket connection. Refer to the Chat.js documentation for more details.

In the customBuildIndex.html file included in this repo, you can quickly test by downloading the file, updating a few fields (region, contactFlowId, instanceId, api gateway id), and then running it locally. If you inspect the console logs you will be able to see the messages received from the websocket.
