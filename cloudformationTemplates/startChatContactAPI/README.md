# Overview

This solutions spins up an API Gateway method that invokes a Lambda function to call Amazon Connect Service's StartChatContact API and returns the result from that call. You should use this solution if you want to build out your own customer chat widget instead of using the pre-built solution in the 'startChatContactAPI/' directory in this repo. 

## Deployment Steps

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
| us-east-1 (N. Virginia) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-us-east-1.amazonaws.com/us-east-1.start-chat-contact-api-cfn/cloudformation.yaml) |
| us-west-2 (Oregon) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://us-west-2.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-us-west-2.amazonaws.com/us-west-2.start-chat-contact-api-cfn/cloudformation.yaml) |
| ap-southeast-2 (Sydney) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://ap-southeast-2.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-ap-southeast-2.amazonaws.com/ap-southeast-2.start-chat-contact-api-cfn/cloudformation.yaml) |
| ap-northeast-1 (Tokyo) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://ap-northeast-1.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-ap-northeast-1.amazonaws.com/ap-northeast-1.start-chat-contact-api-cfn/cloudformation.yaml) |
| eu-central-1 (Frankfurt) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-eu-central-1.amazonaws.com/eu-central-1.start-chat-contact-api-cfn/cloudformation.yaml) |


1) Deploy the CloudFormation template from `https://s3-[region].amazonaws.com/[region].start-chat-contact-api-cfn/cloudformation.yaml`
    - Enter the Contact Flow id and Instance Id that you would like to test with. These are added as Lambda environment variables.
        - `contactFlowId`: You can find the contact flow id when viewing a contact flow. For example, if the arn for your flow is 'arn:aws:connect:us-west-2:123456789012:instance/11111111-1111-1111-1111-111111111111/contact-flow/22222222-2222-2222-2222-222222222222', the contact flow id is '22222222-2222-2222-2222-222222222222'
        - `instanceId`: This is the id of the instance you want to use. You can find this on the Amazon Connect console or when viewing the contact flow. For example, if the arn for your flow is 'arn:aws:connect:us-west-2:123456789012:instance/11111111-1111-1111-1111-111111111111/contact-flow/22222222-2222-2222-2222-222222222222', the instance id is '11111111-1111-1111-1111-111111111111'
    2) Once the stack has launched you can call the API from your website. Follow the steps below to see how you can call this API using our pre-build chat widge or by building out your own UX.

## Adding the pre-built widget to your website

If you want to add this widget to your website instead of using the prebuilt UI, here are the steps to do so:

1.  Download 'amazon-connect-chat-interface.js' from this folder and import it into your website's html code.

    ```html
    <script src="amazon-connect-chat-interface.js"></script>
    ```

2. Initialize the Chat Interface on page load and tell the widget which DOM element will be the root element for the widget.

    ```js
    $(document).ready((a) => {
      connect.ChatInterface.init({
        containerId: 'root' // This is the id of the container where you want the widget to reside
        });
    });
    ```

3. Start the chat based on a user action. You will want to add fields for the customer name and username because those fields are used in the Lambda function that was created.

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

If instead you want to build your own Chat widget instead of use our prebuilt one, follow these directions. There is an example file customBuildIndex.html that shows you how to call [Amazon Connect Chat JS]( https://github.com/amazon-connect/amazon-connect-chat-js) to send messages between the agent and customer.

There are two main steps: 
1) Call your lambda function to start the chat
2) Initiate the ChatSession

After that, you manage the interaction between the customer and agent based on the messages and events sent along the websocket connection. Refer to the Chat.js documentation for more details.

In the customBuildIndex.html file included in this repo, you can quickly test by downloading the file, updating a few fields (region, contactFlowId, instanceId, api gateway id), and then running it locally. If you inspect the console logs you will be able to see the messages received from the websocket.
