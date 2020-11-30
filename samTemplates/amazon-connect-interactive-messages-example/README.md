# A Lambda function code hook for Amazon Connect Chat Interactive Messaging

Set up this AWS Lambda code hook to provide interactive message responses to an Amazon Lex chat bot

## Overview
This repository contains code for the Lambda Function, described in the AWS Contact Center blog post [How to enable interactive messages in Amazon Connect chat](https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/).


## Setup
Set up the Lambda function code hook as described below

* Login to the [AWS Console](https://console.aws.amazon.com/console/home) and choose a region such as `us-west-2`
* On the Services menu in the upper left, search for and then choose *AWS Lambda*
* On the *AWS Lambda* page, choose *Create Function* on the upper right corner. 
* Under Create function, choose the radio button for *Browse serverless app repository*
* Under the *Public applications* tab, search for `amazon-connect-interactive-messages-example` and click on it. Deep link [here](https://serverlessrepo.aws.amazon.com/applications/us-west-2/841676849665/amazon-connect-interactive-messages-example)
* On the *Review, configure, and deploy* page, review the *Application details* and click *Deploy*.
* Set up an Amazon Lex chat bot and connect it to the AWS Lambda function as decribed in the AWS Contact Center blog post [How to enable interactive messages in Amazon Connect chat](https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/)

## License Summary

This sample code is made available under the MIT-0 license. See the LICENSE file.
