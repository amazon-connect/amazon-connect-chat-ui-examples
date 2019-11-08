# Overview

This solutions spins up an API Gateway method that invokes a Lambda function to call Amazon Connect Service's StartChatContact API and returns the result from that call. You should use this solution if you want to build out your own customer chat widget instead of using the pre-built solution in the 'asyncCustomerChatUX/' directory in this repo. 

## Deployment Steps

1) Deploy the CloudFormation template from `https://s3-[region].amazonaws.com/[region].start-chat-contact-api-cfn/cloudformation.yaml`
    - Optionally you can enter your instance and contact flow id. These are added as environment variables in your Lambda function so you can always update those values later.
2) Once the stack has launched you can call the API from your website. If you want to use our pre-built Chat widget, follow the steps below. Otherwise you will want to import the ChatJS library to call the functions to send and receive chats.

## Adding this chat widget to your website

If you want to add this widget to your website instead of using the prebuilt UI, here are the steps to do so:

1. In your website's html code, import 'amazon-connect-chat-interface.js' and 'amazon-connect-chat-websockets.js'. Both of these files were copied into your S3 bucket that hosts the website created by this CloudFormation Template

    ```html
    <script src="amazon-connect-chat-interface.js"></script>
    <script src="amazon-connect-chat-websockets.js"></script>
    ```

2. Initialize the Chat Interface on page load:

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
