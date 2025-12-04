#  Lambda forAmazon Connect Chat Interactive Messaging [Lex V2]

> 🔗 Link: https://serverlessrepo.aws.amazon.com/applications/us-west-2/533267401313/amazon-connect-interactive-messages-example-lex-v2

An AWS [Serverless Application Model](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) (AWS SAM) template to deploy a boilerplate **AWS Lambda** and **Amazon Lex** V2 bot, enabling interactive message in Amazon Connect chat.

Interactive messages are pre-configured responses that your users can select from, making it easy for your customers to quickly resolve their issues through chat. Interactive messages can be designed using the new Amazon Connect Chat templates, which include several different customer display options (shared below), and are sent by Amazon Connect Chat using **Amazon Lex** chatbots.

![Interactive Messages Thumbnail](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/samTemplates/amazon-connect-interactive-messages-example-lex-v2/docs/AmazonConnectLexLambdaArchitecture.png)

## Specifications

- Amazon Lex V2
- AWS Lambda Runtime: `nodejs22.x`

## Prerequisites

- An [AWS Account](https://aws.amazon.com/console/) with access to Lambda, Amazon Connect, and Amazon Lex
- An **Amazon Connect** instance set up in your account [[Guide: Create an Amazon Connect instance](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html)]

## Setup Instructions

> #### Security Notice
> ⚠️ This is example code not intended for production use. Dependencies may contain known vulnerabilities. Please update all dependencies before using in any production environment.

### 1. Deploy Sample Lambda Function

1. Log in to the [AWS Console](https://console.aws.amazon.com/console/home).
2. Deploy the sample Lambda function by visiting [this link](https://serverlessrepo.aws.amazon.com/applications/us-west-2/533267401313/amazon-connect-interactive-messages-example-lex-v2) and following the deployment instructions.

### 2. Create Amazon Lex Bot

1. Download the [`InteractiveMsg_LexBotV2_Export.zip`](./InteractiveMsg_LexBotV2_Export.zip) file.
2. Navigate to the Amazon Lex page in the AWS Console.
3. Click "Action" > "Import" and choose the downloaded ZIP file, named "MyNewLexV2Bot"

<!-- TODO: add screenshot (like the LexV1 blog: https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/ )-->

### 3. Associate Lex Bot with Lambda Function

1. In the AWS Console, open the new bot "MyNewLexV2Bot".
2. Go to Aliases > TestBotAlias > Alias language support: English (US).
3. Set the source to `serverless-xxxx` and click "Save".
4. Ensure the InteractiveMessageIntent is linked to the Lambda:
   - Go to Versions > DRAFT > All languages > English (US) > Intents
   - Check "Use a Lambda function for initialization and validation"
5. Build the bot: Versions > DRAFT > English (US) > Build

<!-- TODO: add screenshot (like the LexV1 blog: https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/ )-->

### 4. Link Lex Bot to Amazon Connect Instance

1. Go to the Amazon Connect page in the AWS Console.
2. Click on your instance alias to open instance settings.
3. Navigate to the "Flows" tab.
4. Scroll to "Amazon Lex" and select your bot from the dropdown.

<!-- TODO: add screenshot (like the LexV1 blog: https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/ )-->

### 5. Create Contact Flow

1. Download the [`InteractiveMsg_ContactFlowLexV2_Export.zip`](./InteractiveMsg_ContactFlowLexV2_Export.json) file.
2. Log in to your Amazon Connect instance.
3. Go to `https://<YOUR-INSTANCE>.my.connect.aws/contact-flows`.
4. Click "Create" > "Save" dropdown > "Import", named "InteractiveMessaging"
5. Import the downloaded ZIP file.
6. Edit the "Get customer input" contact flow block:
   - Select your Lex bot
   - Click "Save contact flow block"
7. Click "Publish" to save your entire contact flow.

<!-- TODO: add screenshot (like the LexV1 blog: https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/ )-->

### 6. Test the Setup

1. Visit `https://<YOUR-INSTANCE>.my.connect.aws/test-chat`.
2. Open settings and set it to use your new contact flow: "InteractiveMessaging".
3. Launch the chat widget and type `help` to test the interaction.

![Lex Bot Message on Test Chat Page](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/samTemplates/amazon-connect-interactive-messages-example-lex-v2/docs/TestChatPageExample.png)

## Diagrams

Interactive Message System Diagram

![Interactive Message System Diagram](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/samTemplates/amazon-connect-interactive-messages-example-lex-v2/docs/interactive-message-diagram.png)

Interactive Message Flow Chart

![Interactive Message Flow Chart](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/samTemplates/amazon-connect-interactive-messages-example-lex-v2/docs/InteractiveMessageUIExample_FlowChart.png)

Interactive Message Chat Experience

![Interactive Message Chat Experience](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/blob/master/samTemplates/amazon-connect-interactive-messages-example-lex-v2/docs/InteractiveMessageChatFlow.png)

## Supported Regions

- us-east-1 (N. Virginia)
- us-west-2 (Oregon)
- ap-southeast-2 (Sydney)
- ap-northeast-1 (Tokyo)
- eu-central-1 (Frankfurt)
- eu-west-2 (London)
- ap-southeast-1 (Singapore)
- ca-central-1 (Canada)
- ap-northeast-2 (South Korea)
- af-south-1 (Cape Town)

## [Maintainers Only] Publish New Serverless Application Repository Version

This SAM template is manually published to one account/region. You can view the **Serverless Application Repository** here: https://console.aws.amazon.com/serverlessrepo/home?region=us-west-2#/published-applications/arn:aws:serverlessrepo:us-west-2:533267401313:applications~amazon-connect-interactive-messages-example-lex-v2

This is published live here: https://serverlessrepo.aws.amazon.com/applications/us-west-2/533267401313/amazon-connect-interactive-messages-example-lex-v2

### Prerequisites

- Install SAM CLI (`brew install aws-sam-cli`)
- Access to account: `533267401313` (ask @spenlep-amzn)

### Installation

```sh
git clone https://github.com/amazon-connect/amazon-connect-chat-ui-examples.git
cd amazon-connect-chat-ui-examples
cd samTemplates/amazon-connect-interactive-messages-example-lex-v2
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_SESSION_TOKEN="your-session-token"
```

### Steps

1. Make changes to source code locally

2. Bump the version number in `template.yaml`,  `package.yml`, and `package.json`
   ```diff
   - SemanticVersion: 2.0.1
   + SemanticVersion: 2.0.2
   ```

3. Validate the samTemplate

  ```bash
  sam validate --region us-west-2 --lint
  sam build
  ```

4. Update the `package.yml` by running:
   ```bash
   sam package --output-template-file packaged.yaml --s3-bucket amazon-connect-interactive-message-blog-assets-lex-v2 --region us-west-2
   ```

5. Commit the updated files:
   ```bash
   git add package.yml template.yml path-to-my-updated-code
   ```

6. Create a pull request

7. Publish the **Serverless Application Repository**:

> ⚠️ Notice: only run this command under **Two Person Review**

   ```bash
   sam publish --template packaged.yaml --region us-west-2
   ```

## License

This sample code is made available under the MIT-0 license. See the [LICENSE](LICENSE) file for details.

## Additional Resources

- [Interactive Messages Documentation](https://docs.aws.amazon.com/connect/latest/adminguide/interactive-messages.html)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon Connect Documentation](https://docs.aws.amazon.com/connect/)
- [Amazon Lex Documentation](https://docs.aws.amazon.com/lex/)

For any questions or support, please open an issue in this repository.
