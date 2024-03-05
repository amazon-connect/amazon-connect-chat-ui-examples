/**
 * UPDATE ME - add endpoints after deploying the CFN template
 *
 * CloudFormation Template: https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI
 * 
 * Prerequisites:
 *  - Amazon Connect Instance: https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html
 *  - InstanceId: https://docs.aws.amazon.com/connect/latest/adminguide/find-instance-arn.html
 *  - ContactFlowId: https://docs.aws.amazon.com/connect/latest/adminguide/find-contact-flow-id.html
 */

var contactFlowId = "12345678-1234-1234-1234-123456789012"; // TODO: Fill in
var instanceId = "12345678-1234-1234-1234-123456789012"; // TODO: Fill in
var apiGatewayEndpoint = "https://<api-id>.execute-api.<region>.amazonaws.com/Prod/"; // TODO: Fill in with the API Gateway endpoint created by your CloudFormation template
var region = "<region>"; // TODO: Fill in