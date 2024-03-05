export SKIP_AUTHENTICATE="false" # default: false

export ACCOUNT_ID="<accountId>"
export CONSOLE_ROLE_NAME="<consoleRole>" # Admin

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

# startChatContactAPI
export LOCAL_BUCKET_FOLDER="startChatContactAPI"
export BUCKET_TO_UPDATE="start-chat-contact-proxy-cfn"
export FILES_TO_UPLOAD=(
    # "cloudformation.yaml"
    # "deployment/ChatSDK.zip"
    # "deployment/custom-resource-helper.zip"
    "deployment/start-chat-contact.zip"
)

# urlPreviewForAsyncChat
# export LOCAL_BUCKET_FOLDER="urlPreviewForAsyncChat"
# export BUCKET_TO_UPDATE="amazon-connect-url-preview-cfn"
# export FILES_TO_UPLOAD=(
#     "cloudformation.yaml"
#     "deployment/contact-flows/Basic Chat Disconnect Flow"
#     "deployment/contact-flows/Basic-Chat"
#     "deployment/css/style.css"
#     "deployment/js/amazon-connect-chat-interface.js"
#     "deployment/ChatSDK.zip"
#     "deployment/create-website.zip"
#     "deployment/custom-resource-helper.zip"
#     "deployment/favicon.ico"
#     "deployment/s3-notification-lambda.zip"
#     "deployment/start-chat-contact.zip"
#     "deployment/update-chat-ddb"
#     "deployment/urlPreviewFunction.zip"
#     "deployment/urlPreviewLayer.zip"
# )