#!/bin/bash

############
#Parameters#
############
profile='new-dev-sso'
stackName='DevOps-Chatbot-Deploy'

##############
#Start Deploy#
##############
aws cloudformation create-stack \
    --template-body file:///home/chart/GitHub/amazon-connect-lex-chat-ui/cloudformationTemplates/asyncCustomerChatUX/cloudformation.yaml \
    --stack-name $stackName \
    --parameters file://parameters.yaml \
    --capabilities CAPABILITY_IAM \
    --profile $profile

################
#Monitor Deploy#
################
#Initilize stackStatus so it can be used outside of loop
stackStatus=""
until [[ "$stackStatus" == '"UPDATE_COMPLETE"' || "$stackStatus" == '"CREATE_COMPLETE"' || "$stackStatus" == '"UPDATE_ROLLBACK_COMPLETE"' ]]; do
  sleep 5
  resources=$(aws cloudformation describe-stack-resources --stack-name $stackName --profile $profile)
  echo $resources | jq --raw-output '
    [
      .StackResources | .[]
      | { LogicalResourceId: .LogicalResourceId,
        ResourceStatus: .ResourceStatus }
    ]
    |  [.[]| with_entries( .key |= ascii_downcase ) ]
            |    (.[0] |keys_unsorted | @tsv)               # print headers
               , (.[]|.|map(.) |@tsv)                       # print table
  ' | column -t
  stackStatus=$(aws cloudformation describe-stacks --stack-name $stackName --profile $profile | jq .Stacks[].StackStatus)
  echo "Stack Staus: $stackStatus"
  echo "---------------------------------------"
done
echo "Stack Staus: $stackStatus"
echo "$CfAction finished"