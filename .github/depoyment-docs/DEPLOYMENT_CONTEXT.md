## Deployment Context

For [ui-examples](https://github.com/amazon-connect/amazon-connect-chat-ui-examples), we display "Launch stack" buttons for every cloudFormation example.

There are eight s3 buckets, one in each supported region, for each example.

Each have the following file structure:

```
- startChatContactAPI
  |_ cloudformation.yml
  |_ deployment/
     |_ ChatSDK.zip
     |_ start-chat-contact.zip 
```

Each file must be replaced, and permissions set to public.

This script will speed up the process to upload files quickly.

## Current Buckets

### [`startChatContactAPI`](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI)

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

Deployed to the following s3 buckets:

- `ap-northeast-1.amazon-connect-url-preview-for-async-chat-cfn` Asia Pacific (Tokyo) ap-northeast-1
- `ap-southeast-1.amazon-connect-url-preview-for-async-chat-cfn` Asia Pacific (Singapore) ap-southeast-1
- `ap-southeast-2.amazon-connect-url-preview-for-async-chat-cfn` Asia Pacific (Sydney) ap-southeast-2
- `ca-central-1.amazon-connect-url-preview-for-async-chat-cfn` Canada (Central) ca-central-1
- `eu-central-1.amazon-connect-url-preview-for-async-chat-cfn` EU (Frankfurt) eu-central-1	
- `eu-west-2.amazon-connect-url-preview-for-async-chat-cfn` EU (London) eu-west-2	
- `us-east-1.amazon-connect-url-preview-for-async-chat-cfn` US East (N. Virginia) us-east-1
- `us-west-2.amazon-connect-url-preview-for-async-chat-cfn` US West (Oregon) us-west-2

### [`asyncCustomerChatUX `](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/asyncCustomerChatUX)
 
Deployed to the following s3 buckets:

- `ap-northeast-1.amazon-connect-advanced-customer-chat-cfnn` Asia Pacific (Tokyo) ap-northeast-1
- `ap-southeast-1.amazon-connect-advanced-customer-chat-cfn` Asia Pacific (Singapore) ap-southeast-1
- `ap-southeast-2.amazon-connect-advanced-customer-chat-cfn` Asia Pacific (Sydney) ap-southeast-2
- `ca-central-1.amazon-connect-advanced-customer-chat-cfn` Canada (Central) ca-central-1
- `eu-central-1.amazon-connect-advanced-customer-chat-cfn` EU (Frankfurt) eu-central-1	
- `eu-west-2.amazon-connect-advanced-customer-chat-cfn` EU (London) eu-west-2	
- `us-east-1.amazon-connect-advanced-customer-chat-cfn` US East (N. Virginia) us-east-1
- `us-west-2.amazon-connect-advanced-customer-chat-cfn` US West (Oregon) us-west-2