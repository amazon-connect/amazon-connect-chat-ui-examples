#!/bin/bash

aws cloudformation create-stack \
    --template-body file:///home/chart/GitHub/amazon-connect-lex-chat-ui/cloudformationTemplates/asyncCustomerChatUX/cloudformation.yaml \
    --stack-name DevOps-Chatbot-Deploy \
    --parameters file://parameters.yaml \
    --capabilities CAPABILITY_IAM \
    --profile new-dev-sso

