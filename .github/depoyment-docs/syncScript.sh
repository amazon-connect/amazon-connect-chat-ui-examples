#!/bin/bash

source ./config.sh
source ./colors.sh

# ------ [ AWS-CLI Authentication ] -------

if [[ $SKIP_AUTHENTICATE == "true" ]];
then
    echo -e "\n${BLUE}[LOGIN] skipping aws-cli credential configuration${NC}"
else
    echo -e "\n${BLUE}[LOGIN] configuring aws-cli credentials${NC}"
    ada credentials update --account=$ACCOUNT_ID --provider=isengard --role=$CONSOLE_ROLE_NAME --once || exit 1
    echo -e "${GREEN}  PASS: authenticated aws-cli credentials [accountId:$ACCOUNT_ID, roleName:$CONSOLE_ROLE_NAME] \xE2\x9C\x94${NC}"
fi

# ----- [ Check Account S3 Buckets ] ------

echo -e "\n${BLUE}[DEBUG] List all s3 buckets${NC}"
aws s3 ls || (echo -e "${RED}  FAIL: failed to list s3 buckets${NC}" && exit 1)
echo -e "${GREEN}   PASS: listed all s3 buckets \xE2\x9C\x94${NC}"

echo -e "\n${BLUE}[VERIFY] Check valid s3 buckets${NC}"

for BUCKET_REGION in ${REGIONS_TO_UPDATE[@]}; do
    S3_BUCKET="$BUCKET_REGION.$BUCKET_TO_UPDATE"
    
    bucketStatus=$(aws s3api head-bucket --bucket $S3_BUCKET 2>&1)    
    if echo "${bucketStatus}" | grep 'Not Found';
    then
        echo -e "${RED}  FAIL: bucket doesn't exist: $S3_BUCKET${NC}"
        exit 1
    elif echo "${bucketStatus}" | grep 'Forbidden';
    then
        # Please configure aws-cli with an IAM user, with programmitic access, and AmazonS3FullAccess permissions 
        echo -e "${RED}  FAIL: unauthorized to access: $S3_BUCKET${NC}"
        exit 1
    elif echo "${bucketStatus}" | grep 'Bad Request';
    then
        echo -e "${RED}  FAIL: Bucket name specified is less than 3 or greater than 63 characters: $S3_BUCKET${NC}"
        exit 1
    else
        echo -e "${GREEN}  PASS: $S3_BUCKET exists \xE2\x9C\x94${NC}"
    fi

    # bucketDiff=$(aws s3 sync ./$LOCAL_BUCKET_FOLDER s3://$S3_BUCKET --dryrun)
    # echo -e "\n${BLUE}[BUCKET DIFF] $S3_BUCKET${NC}"
    # echo -e "$bucketDiff\n"
done

# ----- [ Generate CFN template links ] ------

echo -e "\n${BLUE}[DEBUG] Output all CFN template links ${NC}"

for BUCKET_REGION in ${REGIONS_TO_UPDATE[@]}; do
    echo -e "\n${YELLOW}    [URL] Launch template stack:${NC} https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3.amazonaws.com/$BUCKET_REGION.$BUCKET_TO_UPDATE/cloudformation.yaml"
    echo -e "\n${YELLOW}    [![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=startChatContactAPI&templateURL=https://s3.amazonaws.com/$BUCKET_REGION.$BUCKET_TO_UPDATE/cloudformation.yaml)"
done

echo -e "\n${GREEN}[DONE] Finished updating files in s3${NC}"
