# Overview

Adding chat to your website is possible with a few easy steps. This solutions spins up an [Amazon API Gateway](https://aws.amazon.com/api-gateway/) endpoint that triggers an [AWS Lambda](https://aws.amazon.com/lambda/) function. This Lambda function invokes the [Amazon Connect](https://aws.amazon.com/connect/) Service [StartChatContact](https://docs.aws.amazon.com/en_pv/connect/latest/APIReference/API_StartChatContact.html) API and returns the result from that call. Once you have the StartChatContact API you can either pass that response to the prebuilt widget to get a quick implementation going or you can build your own customer chat experience by using the [Amazon Connect Chat JS]( https://github.com/amazon-connect/amazon-connect-chatjs)  library. 

## CloudFormation Deployment Steps

### Pre-requisites

You need an Amazon Connect instance to deploy this [CloudFormation](https://aws.amazon.com/cloudformation/) template. You can use an existing one or create a new one by following our onboarding guide [here](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-get-started.html).

If you are using an existing instance, you may need to make a few changes to your instance to enable Chat. Follow the steps [here](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/README.md#enabling-chat-in-an-existing-amazon-connect-contact-center) to see what changes you need to make.

### Steps

| Region | Launch Button |
| ------ | ------------- |
| us-east-1 (N. Virginia) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3.amazonaws.com/us-east-1.start-chat-contact-api-cfn/cloudformation.yaml) |
| us-west-2 (Oregon) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://us-west-2.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-us-west-2.amazonaws.com/us-west-2.start-chat-contact-api-cfn/cloudformation.yaml) |
| ap-southeast-2 (Sydney) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://ap-southeast-2.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-ap-southeast-2.amazonaws.com/ap-southeast-2.start-chat-contact-api-cfn/cloudformation.yaml) |
| ap-northeast-1 (Tokyo) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://ap-northeast-1.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-ap-northeast-1.amazonaws.com/ap-northeast-1.start-chat-contact-api-cfn/cloudformation.yaml) |
| eu-central-1 (Frankfurt) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-eu-central-1.amazonaws.com/eu-central-1.start-chat-contact-api-cfn/cloudformation.yaml) |
| eu-west-2 (London) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://eu-west-2.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-eu-west-2.amazonaws.com/eu-west-2.start-chat-contact-api-cfn/cloudformation.yaml) |
| ap-southeast-1 (Singapore) | [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://ap-southeast-1.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3-ap-southeast-1.amazonaws.com/ap-southeast-1.start-chat-contact-api-cfn/cloudformation.yaml) |


1) Deploy the CloudFormation template from one of the links above.
    - Enter the Contact Flow id and Instance Id that you would like to test with. These are added as Lambda environment variables.
        - `contactFlowId`: You can find the contact flow id when viewing a contact flow. For example, if the arn for your flow is 'arn:aws:connect:us-west-2:123456789012:instance/11111111-1111-1111-1111-111111111111/contact-flow/22222222-2222-2222-2222-222222222222', the contact flow id is '22222222-2222-2222-2222-222222222222'
        - `instanceId`: This is the id of the instance you want to use. You can find this on the Amazon Connect console or when viewing the contact flow. For example, if the arn for your flow is 'arn:aws:connect:us-west-2:123456789012:instance/11111111-1111-1111-1111-111111111111/contact-flow/22222222-2222-2222-2222-222222222222', the instance id is '11111111-1111-1111-1111-111111111111'
2) Once the stack has launched you can call the API from your website. Follow the steps below to see how you can call this API using our pre-built chat widget or by building out your own UX.
    
## Prebuilt Chat Widget
If you want to add the customer chat widget (that is available in the Test Chat experience in the Amazon Connect website) to your website, here are the steps to do so. You can also refer to the `widgetIndex.html` file in this repo to see an example of how to use the widget.

Note: you will want to show the widget only when there is a conversation in progress. If the widget is visible when there is no conversation, you will just see a loading spinner.

1. In your website's html code, import the 'amazon-connect-chat-interface.js' file from this repo.

    ```html
    <script src="amazon-connect-chat-interface.js"></script>
    ```

2. Initialize the Chat Interface on page load. Note: you need to update this to include the root id of the div where the customer chat widget will live.

    ```js
    $(document).ready((a) => {
      connect.ChatInterface.init({
        containerId: 'root', // This is the id of the container where you want the widget to reside
        headerConfig: {      // Use the optional headerConfig and footerConfig to customize your widget
          isHTML: true,
          render: () => {
            return (`<html code here/>`)
          }
        },
        footerConfig: {
          isHTML: true,
          render: () => {
            return (`<html code here/>`)
          }
        }
      });
    });
    ```

3. Start the chat based on a user action. You will want to add fields for the customer name, username, and enableAttachments because those fields are used in the Lambda function that was created. Note: you need to update this to include the API Gateway endpoint that was created in the CloudFormation stack. To see examples of the success and failure handlers, refer to the [example implementation](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/cloudformationTemplates/asyncCustomerChatUX/website/index.html#L283).

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
      instanceId: "${instanceId}",
      featurePermissions: {
        "ATTACHMENTS": enableAttachments==='true',  // this is the override flag from user for attachments
        }
    },successHandler, failureHandler)
```

## Creating your own Chat UX

If you want to build your own Chat widget instead of using our prebuilt one, follow these step by step directions. If you want to see a complete example of how to use [ChatJS](https://github.com/amazon-connect/amazon-connect-chat-js), look at the  `customBuildIndex.html` file.

1) First, you need deploy the backend API as instructed above.
2) Once your stack is deployed, go to the [API Gateway console](https://console.aws.amazon.com/apigateway/home), select the API, go to the Stages menu item, and select the `Prod` stage. You will then see the `Invoke URL`. This is the URL you will invoke to start the chat.
![api gateway url diagram](images/apiGatewayUrl.png)
3) Gather the contact flow ID and contact flow ID you want to use. If you don't have a contact flow, use the `Sample inbound flow` one in your instance that is created by default. You can find these IDs when viewing a contact flow. For example, if the arn for your flow is `arn:aws:connect:us-west-2:123456789012:instance/11111111-1111-1111-1111-111111111111/contact-flow/22222222-2222-2222-2222-222222222222`, the instance ID is `11111111-1111-1111-1111-111111111111` and the contact flow ID is `22222222-2222-2222-2222-222222222222`
![contact flow ids diagram](images/contactFlowIds.png)
4) Download the [compiled ChatJS source](https://github.com/amazon-connect/amazon-connect-chatjs/blob/master/dist/amazon-connect-chat.js) and save it locally.
5) Create an `index.html` file in the same directory as the ChatJS source
6) Set up your `index.html` file by importing ChatJS and creating the html elements you will use. These include an entry for the customer's name, a chat content input field, an area for the chat transcript to show up, and buttons to start the chat, get the transcript, send a typing event, and end the chat. 

```html
<!DOCTYPE html>
<html>

<head>
    <title></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <script src="https://code.jquery.com/jquery-3.1.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script type="text/javascript" src="amazon-connect-chat.js"></script>
</head>
<body>
    <div>
        <section class="section-main" id="section-main">
            <header>
                <h1>Amazon Connect - Custom Implementation of Customer Chat</h1>
            </header>

            <form name="contactDetails" id="contactDetails" style="padding-top: 30px; padding: 5px;">
                <div>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <input name="firstName" type="text" id="firstName" placeholder="First Name"
                                        style="width:161px;">
                                </td>
                                <td style="padding-left: 10px;">
                                    <input type="submit" style="padding-left: 10px;" class="submit" id="startChat"
                                        value="Start Chat"></input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </form>
            
            <div style="padding: 5px;"><textarea type="text" id="chatContent"></textarea></div>
            <div style="padding: 5px;"><input type="button" id="sendChat" value="Send chat"></div>
            <div style="padding-top: 10px; display: inline-flex">
                <div style="padding: 5px;"><input type="button" id="getTranscript" value="Get Transcript"></div>
                <div style="padding: 5px;"><input type="button" id="sendTyping" value="Send typing"></div>
                <div style="padding: 5px;"><input type="button" id="endChat" value="End chat"></div>
            </div>
            <div style="padding: 5px;"><textarea readonly id="chatTranscript"></textarea></div>
        </section>
    </div>

    <script>
    </script>
</body>
```
7) Once you have the outline ready, the first step is to set up the chat session. Add the below code to set the global config in the `<script>` section of your `index.html` file. You are also creating a global variable, `session`, that will be initialized at a later step.

```js
var session;

connect.ChatSession.setGlobalConfig({
    region: "us-east-1" // TODO: update with the region your Amazon Connect instance is in
});
```

8) Next, you will call the [StartChatContact API](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html) in the Amazon Connect Service. This call to StartChatContact is made through the API that was deployed by the stack. You need to fill in a few fields here: contact flow id, instance id, and the API Gateway endpoint. Add this code after the function to set the global config. 

```js
$(function () {
    $('#contactDetails').submit(function (e) {
        e.preventDefault();

        customerName = $('#firstName').val();
        if (!customerName) {
            alert('you must enter a name');
        } else {
            var contactFlowId = "12345678-1234-1234-1234-123456789012"; // TODO: Fill in
            var instanceId = "12345678-1234-1234-1234-123456789012"; // TODO: Fill in
            var apiGatewayEndpoint = "https://0123456789.execute-api.us-east-1.amazonaws.com/Prod"; // TODO: Fill in 
            
            document.getElementById("contactDetails").reset();

            var initiateChatRequest = {
                ParticipantDetails: {
                    DisplayName: customerName
                },
                ContactFlowId: contactFlowId,
                InstanceId: instanceId
            };

            $.ajax({
                url: apiGatewayEndpoint,
                type: "POST",
                async: false,
                data: JSON.stringify(initiateChatRequest),
                success: function(result) {
                    console.log("Success!");
                    console.log(JSON.stringify(result));
                },
                error: function(result) {
                    console.log("Error:");
                    console.log(result);
                }
            });
        }
    });
});
```
9) At this point you can test your implementation by opening your index.html file, entering a name, and clicking `Start Chat`. If you inspect the console of your browser, you should see a success log.
10) Now that you can successfully call ACS.StartChatContact(), you need to complete the chat initialization by making a call to ChatJS to establish the chat session. You will do this in the success function after your ajax call to start the chat. Pass the result from the call to start chat to ChatJS and ChatJS will handle the rest of the steps to establish the connection.

```js
success: function(result) {
    console.log("Success!");
    console.log(JSON.stringify(result));
    session = connect.ChatSession.create({
        chatDetails: result.data.startChatResult,
        type: "CUSTOMER"
    });
},
```
11) Once the session is created, you need to give function definitions for the APIs available in ChatJS that respond to events and messages. You can define the functions within the `complete` function after the ajax call. Your ajax call will now look like this:

```js
$.ajax({
    url: apiGatewayEndpoint,
    type: "POST",
    async: false,
    data: JSON.stringify(initiateChatRequest),
    success: function(result) {
        console.log("Success!");
        console.log(JSON.stringify(result));
        session = connect.ChatSession.create({
            chatDetails: result.data.startChatResult,
            type: "CUSTOMER"
        });
    },
    error: function(result) {
        console.log("Error:");
        console.log(result);
    },
    complete: function(data) {
        session.connect().then((response) => {
            console.log("Successful connection: " + JSON.stringify(response));
            return response;
        }, (error) => {
            console.log("Unsuccessful connection " + JSON.stringify(error));
            return Promise.reject(error);
        });

        session.onConnectionEstablished((data) => {
            console.log("Established!");
        })

        session.onMessage((message) => {
            console.log("Received message: " + JSON.stringify(message));
        });

        session.onTyping((typingEvent) => {
            console.log("Received typing event: " + JSON.stringify(typingEvent));
        });

        session.onConnectionBroken((data) => {
            console.log("Connection broken.");
        });
    }
});
```
12) Now that the reactive functions have definitions, the final step is to add definitions for all the APIs that can be triggered by the customer. Add this functions under the ajax call within the `<script>` section.

```js
$(document).ready((a) => {
    $("#sendChat").click(() => { 
        sendChat();
    });

    $("#getTranscript").click(() => { 
        getTranscript();
    });

    $("#endChat").click(() => { 
        endChat();
    });

    $("#sendTyping").click(() => { 
        sendTypingEvent();
    });
});

function sendChat() {
    var message = document.getElementById("chatContent").value;
    console.log("Clicked with message " + message);

    session.controller.sendMessage({
        message: message,
        contentType: "text/plain"
    })
}

function getTranscript() {
    session.getTranscript({
        scanDirection: "BACKWARD",
        sortOrder: "ASCENDING",
        maxResults: 15
    }).then(response => {
        console.log("Current transcript: ");
        console.log(JSON.stringify(response.data.Transcript));
        $('#chatTranscript').text(JSON.stringify(response.data.Transcript));
    });
}

function endChat() {
    session.controller.disconnectParticipant();
}

function sendTypingEvent() {
    session.controller.sendEvent({
        contentType: "application/vnd.amazonaws.connect.event.typing"
    });
}
```

13) That's it! Now if you test your index.html file all of the buttons should work and if you inspect the console you will see logs for the events being sent and received through ChatJs.


## Enabling interactive messages
If you want to enable interactive messages for Amazon Connect Chat the customer chat widget (that is available in the Test Chat experience in the Amazon Connect website) to your website, read the blog on how to [easily set up interactive messages for your Amazon Connect chatbot](https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/) for detailed instructions.

*What are interactive messages for Amazon Connect Chat?*

Interactive messages are pre-configured responses that your users can select from, making it easy for your customers to quickly resolve their issues through chat. Interactive messages can be designed using the new Amazon Connect Chat templates, which include several different customer display options like list pickers, list pickers with images, and time pickers. These are sent by Amazon Connect Chat using Amazon Lex chatbots. Interactive messages configured through Lex will be validated in the Amazon Connect contact flow to ensure that they have been configured correctly.


## Enabling attachments
If you want to enable sending attachments for Amazon Connect Chat the customer chat widget, follow the instructions in the [documentation](https://docs.aws.amazon.com/connect/latest/adminguide/enable-attachments.html)  to enable your Amazon Connect instance for attachments. Once enabled, you can mark the  `ATTACHMENTS` flag in `connect.ChatInterface.initiateChat` as `true`. Example below:

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
      instanceId: "${instanceId}",
      featurePermissions: {
        "ATTACHMENTS": true,  // this is the override flag from user for attachments
        }
    },successHandler, failureHandler)
```
