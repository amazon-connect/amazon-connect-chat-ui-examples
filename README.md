## Amazon Connect Chat Ui Examples

This repo contains examples on how to implement the Customer side of Amazon Connect Chat. Please refer to the README under each solution to see the complete details as to what each solution does and how to deploy it.

Before working on projects in this repo, we suggest taking time to follow [the public AWS documentation](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-get-started.html) on Amazon Connect around Chat.

At the moment, these are the solutions in this repo:

1) cloudformationTemplates/asyncCustomerChatUX
    The Async Customer Chat solution spins up a website that uses a pre-built chat widget for the customer side. It also contains AWS resources that help enable the asynchronous chat experience across devices.
2) cloudformationTemplates/startChatContactAPI
    The Start Chat Contact API solution creates a simple API to start the chat from the customer side. Use this solution if you want to custom build your customer chat widget. There is also an example html file in this repo that shows you how to make subsequent calls to Chat JS to send messages between the customer and agent after the chat is started.

## License Summary

This sample code is made available under the MIT-0 license. See the LICENSE file.
