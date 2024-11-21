#!/bin/bash

source ./config.sh
source ./colors.sh

# ----- [ Execute S3 file uploads ] ------

echo -e "\n${BLUE}[UPLOAD] Upload files to S3${NC}"

for BUCKET_REGION in ${REGIONS_TO_UPDATE[@]}; do
    S3_BUCKET="$BUCKET_REGION.$BUCKET_TO_UPDATE"

    for FILE_NAME in ${FILES_TO_UPLOAD[@]}; do
        FILE_PATH="./$LOCAL_BUCKET_FOLDER/$FILE_NAME"
        S3_ARN="s3://$S3_BUCKET"

        read -p "    Confirm file [$FILE_NAME] change in [$S3_BUCKET]? (upload/delete/ignore) " -n 6 -r
        if [[ $REPLY == "upload" ]];
        then
            uploadDryRun=$(aws s3 cp $FILE_PATH $S3_ARN --dryrun)
            echo -e "    $uploadDryRun"

            echo -e "\n${PURPLE}    [START] uploading $FILE_NAME to $S3_BUCKET${NC}"

            aws s3 cp $FILE_PATH "$S3_ARN/$FILE_NAME" || (echo -e "${RED}  FAIL: failed to upload [$FILE_PATH]${NC}" && exit 1)
        
            aws s3api put-object-acl --bucket $S3_BUCKET --key $FILE_NAME --acl public-read || (echo -e "${RED}  FAIL: failed to set file public access [$FILE_PATH]${NC}" && exit 1)

            echo -e "${GREEN}    [SUCCESS] uploaded [$FILE_NAME] to [$S3_BUCKET]${NC}"

            echo -e "${BLUE}    [COMPLETE] updated [$FILE_NAME] in [$S3_BUCKET]${NC} \xE2\x9C\x94\n"
        elif [[ $REPLY == "delete" ]];
        then
            echo -e "\n${PURPLE}    [START] deletion of $FILE_NAME in $S3_BUCKET${NC}"

            read -p "    Confirm file [$FILE_NAME] deletion in [$S3_BUCKET]? (y/n) " -n 1 -r
            if [[ $REPLY =~ ^[Yy]$ ]]
            then
                aws s3 rm $S3_ARN --recursive --exclude "*" --include $FILE_NAME || (echo -e "${RED}  FAIL: failed to delete [$FILE_PATH]${NC}" && exit 1)
            fi

            echo -e "\n${GREEN}    [SUCCESS] deleting [$FILE_NAME] in [$S3_BUCKET]${NC}"

            echo -e "${BLUE}    [COMPLETE] updated [$FILE_NAME] in [$S3_BUCKET]${NC} \xE2\x9C\x94\n"
        else
            echo -e "${RED}    IGNORE: no change given: [$FILE_PATH]${NC}"
        fi
    done

    echo -e "\n${YELLOW}    [URL] Launch template stack:${NC} https://$BUCKET_REGION.console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=uiExamplesStack&templateURL=https://s3.amazonaws.com/$BUCKET_REGION.$BUCKET_TO_UPDATE/cloudformation.yaml"
done

echo -e "\n${GREEN}[DONE] Finished updating files in s3${NC}"
