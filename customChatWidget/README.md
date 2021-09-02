# Amazon connect chat library usage

## Description

This library can be used by customers to place a chat Button or Icon, chat form, and a chat widget at the bottom right of their website. When this library is imported, using a script tag in the customers web page, it will expose AmazonCustomChatWidget.ChatInterface.init method to the global window DOM object. This method can be invoked with various properties, to get the Amazon Connect Chat in the website.

Customers who would like to use Amazon Connect Chat do not have to develop their chat widget from scratch, and worry about styling and positioning the chat widget with a chat form on their webpage. This plug-in takes care of styling and positioning the chat widget on your webpage with ease. On top of that, customers also have the flexibility to customize this library, if needed.

Below steps explain how Chat Widget works on a webpage

1. Customers have an option to have a button or an icon on their webpage.

   ![Chat Icon](customChatWidget/screenshots/ChatIcon.png)

   ![Chat Button](customChatWidget/screenshots/chatButton.png)

2. When the icon or the button is clicked, a chat form will be presented to the users. The fields in this chat form are configurable

   ![Chat Form](customChatWidget/screenshots/chatForm.png)

3. When this form is submitted by the user, the Chat Widget opens (Widget) that connects with Amazon Connect, for self service, and/or transfer to a chat agent..

   ![Chat Widget](customChatWidget/screenshots/chatForm.png)

## Prerequisites

- Amazon Connect instance ready to receive chats.

  [Refer to : Enabling Chat in Existing Amazon Connect Contact Center section in this link](https://github.com/amazon-connect/chatPluginForWebpage/public/amazon-connect-chat-interface.js)

- An Amazon Connect Contact Flow ready to receive chats.

  [Refer to this link on how to create a contact flow for chat](https://docs.aws.amazon.com/connect/latest/adminguide/chat.html)

- Amazon Connect Chat backend. Please use the below link to deploy the chat backend

  https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/asyncCustomerChatUX

## Usage

- Import `amazon-connect-chat-interface.js` and `ACChat.js` using script tag in your HTML. Please note that the order of this import is important.

  [amazon-connect-chat-interface.js](https://github.com/amazon-connect/chatPluginForWebpage/public/amazon-connect-chat-interface.js)

  [ACChat.js](https://github.com/amazon-connect/chatPluginForWebpage/public/ACChat.js)

  ```html
  <script src="/amazon-connect-chat-interface.js"></script>
  <script src="/ACChat.min.js"></script>
  ```

- After ACChat.js is imported, it will expose AC.ChatInterface.init() method. This method can be invoked with certain properties, to place Amazon Connect Chat Widget on your website.
- Below description explains each of those properties

  1. containerId : Specify the html element ID where you would want to load the chat widget. Preferable to use the root ID# of the Body.
  2. initiationIcon: Can be 'icon' or 'button'.
  3. region: Specify the region where the API gateway was deployed. This property is used to access API gateway.
  4. name: Specify the name of the customer, this will be utilized during chat creation. This field is mandatory. It can have the below values:

     - A variable
     - A constant
     - Refer to the form input field `Name` like this: "refer|inputFields|Name".

  5. username: Specify the username of the customer , this will will also be utilized during during chat creation. This field is mandatory. It can have the below values:

     - A variable
     - A constant
     - Refer to the input field `UserName` like this: "refer|inputFields|UserName".

  6. apiGateway: Provide the API Gateway URL for your Amazon Connect Chat backend that was deployed using the Cloudformation template.

  "https://${apiId}.execute-api.${region}.amazonaws.com/Prod"

  7. Amazon Connect Contact Flow Id: Provide the contact flow ID and not the ARN.

     For example: If the Contact flow ARN : `arn:aws:connect:<region>:111111111111:instance/11111111-1111-1111-1111-1111111111/contact-flow/XXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX`, then the contact flow ID will be `XXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX`.

  8. Amazon Connect Instance Id: Provide your amazon connect instance ID and not the ARN.

     For example: If the Instance ARN : `arn:aws:connect:<region>:11111111111111:instance/XXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX` , then the instance ID will be `XXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX`.

  9. contactAttr: This is an object that can have keys and values. Basically these attributes will be sent to your contact flow during chat initiation.

  10. preChatForm: This form can be used in identifying the customer, by collecting customer's information, like their name or email. These attributes can also be sent to the Amazon Connect Contact Flow, so we don't have to identify the customer again in the bot, and can just proceed with verification. This will help to reduce Average Handle Time (AHT). This field is not mandatory. If not provided, no chat form will be presented to the customer.

      - visible: This can set to true/false.
      - inputFields: An array of objects. Each object has a name and a validation field. The name represents the label of the input field in the form and the validation field can be `required` or `notrequired`.

      ```js
      preChatForm:{
          visible: true,
          inputFields:[
              {
                   name: "Name",
      		   validation: "required"
              },
              {
                   name: "UserName",
      		   validation: "required"
              },
              {
                   name: "Email",
      		   validation: "notrequired"
              }
          ]
      }

      ```

  11. primaryColor: Specify the color of the Icon/Button, form and the chat widget.

  12. description: Specify the description that will be displayed in the chat widget.

- Below is a simple example on how ACChat can be invoked in a html page:

  [ACChat.js](https://github.com/amazon-connect/chatPluginForWebpage/public/index.html)

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta http-equiv="X-UA-Compatible" content="ie=edge" />
		<title>Chat</title>
	</head>
	<body>
		<div id="root"></div>
		<script src="/amazon-connect-chat-interface.js"></script>
		<script src="/ACChat.js"></script>
		<script>
			console.log(window);
			AC.ChatInterface.init({
				containerId: 'root',
				initiationIcon: 'icon', // icon/button
				region: 'us-east-1',
				name: 'refer|inputFields|Name', // **** Mandatory**** Add a constant or a variable for chat without form or if you have a form then you can refer it to the input fields like "refer|inputFields|Name"
				username: 'refer|inputFields|UserName', // **** Mandatory**** Add a constant or a variable for chat without form or if you have a form then you can refer it to the input fields like "refer|inputFields|UserName"
				apiGateway:
					'https://<XXXXXXXXX>.execute-api.us-east-1.amazonaws.com/Prod' /* API Gateway URI */,
				contactFlowId: 'XXXXXX-XXXX-XXX-XXX-XXXXXXX',
				instanceId: 'XXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX',
				contactAttr: {
					someKey1: 'someValue1',
					someKey2: 'someValue2',
				},
				preChatForm: {
					visible: true,
					inputFields: [
						{
							name: 'Name',
							validation: 'required',
						},
						{
							name: 'UserName',
							validation: 'required',
						},
						{
							name: 'Email',
							validation: 'notrequired',
						},
					],
				},
				primaryColor: '#003da5',
				description:
					'Welcome to Chat' /* the description that goes in the header*/,
			});
		</script>
	</body>
</html>
```

## How to customize ACChat.js

- The source code for ACChat.js in /chatPluginForWebpage/src folder can be used to customize Chat Icon , Chat Button and the Chat Form.

- In your Terminal, clone the repo: `git clone https://github.com/amazon-connect/amazon-connect-chat-ui-examples.git`

- Go to /customChatWidget.

- Run `npm install` to install node_modules.

- Now You can customize any of the components in `chatPluginForWebpage/src/components` according to your needs.

- Run `npm run build` to build a production package using Babel. The build process produces minified ACChat.js file, and stores it into the public folder. Please note that webpack.dev.js produces a development version, which includes console logs. For a production build, please use webpack.prod.js.

- For testing, run `npm run dev-build` to build a dev package using babel and webpack.dev.js and saves the built minified file into the public folder with name ACChat.js. The dev version will have console logs.

## Testing

- Once the build has completed, you can test index.html in /chatPluginForWebpage/public, using `Live Server` extension if you are using VS Code.

  [VS Code Live Server Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
