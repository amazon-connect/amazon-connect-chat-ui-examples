#!/bin/bash

############
#Parameters#
############
profile='new-dev-sso'
stackName='DevOps-Chatbot-Deploy'
templateFilePath='/home/chart/GitHub/amazon-connect-lex-chat-ui/cloudformationTemplates/asyncCustomerChatUX/cloudformation.yaml'
parametersFilePath='parameters.yaml'
IAMcapabilities='CAPABILITY_IAM'

##############
#Start Deploy#
##############
#Run 
aws cloudformation create-stack \
    --template-body file://$templateFilePath \
    --stack-name $stackName \
    --parameters file://$parametersFilePath \
    --capabilities "$IAMcapabilities" \
    --profile $profile || echo "Stack may already exist, updating instead of creating." && \
aws cloudformation update-stack \
    --template-body file://$templateFilePath \
    --stack-name $stackName \
    --parameters file://$parametersFilePath \
    --capabilities "$IAMcapabilities" \
    --profile $profile || (echo "ERROR: Could not deploy or update.")

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