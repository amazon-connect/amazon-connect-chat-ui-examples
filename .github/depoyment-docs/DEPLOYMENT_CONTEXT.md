## Deployment Context

For [ui-examples](https://github.com/amazon-connect/amazon-connect-chat-ui-examples), we display "Launch stack" buttons for every cloudFormation example.

There are eight s3 buckets, one in each supported region, for each example.

Each have the following file structure:

```
- <my-s3-bucket>
  |_ cloudformation.yml
  |_ deployment/
     |_ lambda code
     |_ SDK code
```

Each file must be replaced, and permissions set to public.

This script will speed up the process to upload files quickly.

## Current Buckets

### [`startChatContactAPI`](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI)

```
- startChatContactAPI
  |_ cloudformation.yml
  |_ deployment/
     |_ ChatSDK.zip
     |_ start-chat-contact.zip 
```

Deployed to the following s3 buckets:

- `ap-northeast-1.start-chat-contact-api-cfn` Asia Pacific (Tokyo) ap-northeast-1
- `ap-southeast-1.start-chat-contact-api-cfn` Asia Pacific (Singapore) ap-southeast-1
- `ap-southeast-2.start-chat-contact-api-cfn` Asia Pacific (Sydney) ap-southeast-2
- `ca-central-1.start-chat-contact-api-cfn` Canada (Central) ca-central-1
- `eu-central-1.start-chat-contact-api-cfn` EU (Frankfurt) eu-central-1	
- `eu-west-2.start-chat-contact-api-cfn` EU (London) eu-west-2	
- `us-east-1.start-chat-contact-api-cfn` US East (N. Virginia) us-east-1
- `us-west-2.start-chat-contact-api-cfn` US West (Oregon) us-west-2

### [`urlPreviewForAsyncChat`](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/urlPreviewForAsyncChat)

```
- urlPreviewForAsyncChat
  |_ cloudformation.yaml
  |_ deployment/
    |_ contact-flows/
      |_ Basic Chat Disconnect Flow
    |_ contact-flows
      |_ Basic-Chat
    |_ css/
      |_ styles.css
    |_ js/
      |_ amazon-connect-chat-interface.js
    |_ ChatSDK.zip
    |_ create-website.zip
    |_ custom-resource-helper.zip
    |_ favicon.ico
    |_ s3-notification-lambda.zip
    |_ start-chat-contact.zip
    |_ update-chat-dbb
    |_ urlPreviewFunction.zip
    |_ urlPreviewLayer.zip
```

Deployed to the following s3 buckets:

- `ap-northeast-1.amazon-connect-url-preview-for-async-chat-cfn` Asia Pacific (Tokyo) ap-northeast-1
- `ap-southeast-1.amazon-connect-url-preview-for-async-chat-cfn` Asia Pacific (Singapore) ap-southeast-1
- `ap-southeast-2.amazon-connect-url-preview-for-async-chat-cfn` Asia Pacific (Sydney) ap-southeast-2
- `ca-central-1.amazon-connect-url-preview-for-async-chat-cfn` Canada (Central) ca-central-1
- `eu-central-1.amazon-connect-url-preview-for-async-chat-cfn` EU (Frankfurt) eu-central-1	
- `eu-west-2.amazon-connect-url-preview-for-async-chat-cfn` EU (London) eu-west-2	
- `us-east-1.amazon-connect-url-preview-for-async-chat-cfn` US East (N. Virginia) us-east-1
- `us-west-2.amazon-connect-url-preview-for-async-chat-cfn` US West (Oregon) us-west-2

<!--
### [`asyncCustomerChatUX `](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/asyncCustomerChatUX)
 
# asyncCustomerChatUX
# export LOCAL_BUCKET_FOLDER="asyncCustomerChatUX"
# export BUCKET_TO_UPDATE="amazon-connect-url-preview-for-async-chat-cfn"
# export FILES_TO_UPLOAD=(
#     "cloudformation.yaml"
#     "deployment/contact-flows/Basic Chat Disconnect Flow"
#     "deployment/contact-flows/Basic-Chat"
#     "deployment/css/styles.css"
#     "deployment/js/amazon-connect-chat-interface.js"
#     "deployment/ChatSDK.zip"
#     "deployment/create-website.zip"
#     "deployment/custom-resource-helper.zip"
#     "deployment/s3-notification-lambda.zip"
#     "deployment/start-chat-contact.zip"
#     "deployment/update-chat-ddb"
# )

Deployed to the following s3 buckets:

- `ap-northeast-1.amazon-connect-advanced-customer-chat-cfnn` Asia Pacific (Tokyo) ap-northeast-1
- `ap-southeast-1.amazon-connect-advanced-customer-chat-cfn` Asia Pacific (Singapore) ap-southeast-1
- `ap-southeast-2.amazon-connect-advanced-customer-chat-cfn` Asia Pacific (Sydney) ap-southeast-2
- `ca-central-1.amazon-connect-advanced-customer-chat-cfn` Canada (Central) ca-central-1
- `eu-central-1.amazon-connect-advanced-customer-chat-cfn` EU (Frankfurt) eu-central-1	
- `eu-west-2.amazon-connect-advanced-customer-chat-cfn` EU (London) eu-west-2	
- `us-east-1.amazon-connect-advanced-customer-chat-cfn` US East (N. Virginia) us-east-1
- `us-west-2.amazon-connect-advanced-customer-chat-cfn` US West (Oregon) us-west-2
-->