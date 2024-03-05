# Updating the CloudFormation Template Assets

## Prerequisites

- Gain access to the AWS Account (`533267401313`), follow the steps listed in [this Quip](https://quip-amazon.com/4zxjAXyttjeI)
- Install [AWS CLI (v2)](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

## Deployment

Follow these instructions to update the S3 assets. A local folder will be mirrored to the S3 bucket, and set to public

1. Create a local folder named in `startChatContactAPI` or `urlPreviewForAsync` (in the same directory as `deploymentScript.sh`)

2. Update `config.sh` file, pointing to the desired account and S3 bucket

```diff
+ export ACCOUNT_ID="<AccountId>"
+ export CONSOLE_ROLE_NAME="<ConsoleRoleName>"

- export LOCAL_BUCKET_FOLDER="<REPLACE_ME>"
+ export LOCAL_BUCKET_FOLDER="startChatContactAPI"
  export BUCKET_TO_UPDATE="start-chat-contact-api-cfn"
+ export FILES_TO_UPLOAD=(
    # "cloudformation.yaml"
    # "deployment/ChatSDK.zip"
    # "deployment/custom-resource-helper.zip"
+   "deployment/start-chat-contact.zip" # UPDATE one at a time
 )

  export REGIONS_TO_UPDATE=(
    "us-west-2"
    "us-east-1"
    "ap-southeast-2"
    "ap-northeast-1"
    "eu-central-1"
    "eu-west-2"
    "ap-southeast-1"
    "ca-central-1"
    "ap-northeast-2"
    # "af-south-1" # TODO
  )
```

3. Run `syncScript.sh` to make sure you have WRITE access to the buckets

```sh
sudo chmod +x ./syncScript.sh 
./syncScript.sh
```

4. Run `deployScript.sh` to upload the desired files!

```sh
sudo chmod +x ./deployScript.sh 
./deployScript.sh
```

## `startChatContactAPI` S3 Assets

- Bucket name: `<region>..start-chat-contact-proxy-cfn`
- Source: [startChatContactAPI](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI)

```
cloudformation.yaml
deployment/
  - ChatSDK.zip
  - custom-resource-helper.zip
  - start-chat-contact.zip
```

## `urlPreviewForAsync` S3 Assets

- Bucket name: `<region>.amazon-connect-url-preview-cfn`
- Source: [urlPreviewForAsyncChat](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/urlPreviewForAsyncChat)

```
cloudformation.yaml
deployment/
  - contact-flows/Basic Chat Disconnect Flow
  - contact-flows/Basic-Chat
  - css/styles.css
  - js/amazon-connect-chat-interface.js
  - ChatSDK.zip
  - create-website.zip
  - custom-resource-helper.zip
  - favicon.ico
  - s3-notification-lambda.zip
  - start-chat-contact.zip
  - update-chat-ddb
  - urlPreviewFunction.zip
  - urlPreviewLayer.zip
```