# Script Usage

Script to interactivly upload/mirror ui-example files to all s3 buckets. This avoids tedious drag n drop in AWS console, including manual public access permission change.

Deploy to all eight regions at once, one example at a time.

## Reference

- Setup: `aws-cli/2.8.9 Python/3.9.11 Darwin/21.6.0 exe/x86_64 prompt/off`
- Quip: https://quip-amazon.com/4zxjAXyttjeI/Steps-for-github-ui-example-package-S3-bucket-files-update
- Repo: https://github.com/amazon-connect/amazon-connect-chat-ui-examples

## Usage

0. Mirror the s3 bucket in a local folder, for example:

```
- startChatContactAPI/
    |_ cloudformation.yml
    |_ deployment/
        |_ ChatSDK.zip
        |_ start-chat-contact.zip 
- syncScript.sh
- deployScript.sh
```

1. Update `config.sh` file

First, we point the account that owns the ui-examples s3 bucket.

```diff
+ export ACCOUNT_ID="<AccountId>"
+ export CONSOLE_ROLE_NAME="<ConsoleRoleName>"
```

2. Update `config.sh` file, pointing to the newer local file(s)

Then, we choose one ui-example to update, and specify the files to upload:

```bash
# ...
# Update all regions back to back?
export REGIONS_TO_UPDATE=(
    "us-west-2"
    "us-east-1"
    "ap-southeast-2"
    "ap-northeast-1"
    "eu-central-1"
    "eu-west-2"
    "ap-southeast-1"
    "ca-central-1"
)

# startChatContactAPI
export LOCAL_BUCKET_FOLDER="startChatContactAPI"
export BUCKET_TO_UPDATE="start-chat-contact-api-cfn"
export FILES_TO_UPLOAD=(
    # "cloudformation.yaml"
    # "deployment/ChatSDK.zip"
    # "deployment/custom-resource-helper.zip"
    "deployment/start-chat-contact.zip" # UPDATE JUST ME
)
```

3. Run `syncScript.sh` to test S3 bucket access (READ-ONLY)

This script will authenticate with the account, and verify all expected buckets are present.

```sh
sudo chmod +x ./syncScript.sh 
./syncScript.sh
```

4. Run `deployScript.sh` for interactive deployment to S3 (MODIFYING)

This script will prompt `upload/ignore` for each file, and replaces existing in the s3 upon upload

```sh
sudo chmod +x ./deployScript.sh 
./deployScript.sh
```

5. Repeat steps 2 through 4, for each ui-example

Map to a different local/remote folder for the next example

```bash
export LOCAL_BUCKET_FOLDER="otherExampleFolderName"
export BUCKET_TO_UPDATE="other-cfn-example-s3-key"
export FILES_TO_UPLOAD=(
    # "cloudformation.yaml"
    "deployment/ChatSDK.zip"
    # "deployment/custom-resource-helper.zip"
    # "deployment/start-chat-contact.zip"
)
```

