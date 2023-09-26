/**
 * UPDATE ME - add endpoints after deploying the CFN template
 *
 * Prerequisites:
 *  - Amazon Connect Instance: https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html
 *  - InstanceId: https://docs.aws.amazon.com/connect/latest/adminguide/find-instance-arn.html
 *  - ContactFlowId: https://docs.aws.amazon.com/connect/latest/adminguide/find-contact-flow-id.html
 */

var region = ""; // default: "us-west-2"
var contactFlowId = "12345678-1234-1234-1234-123456789012"; // TODO: Fill in. You can find the contact flow id when viewing a contact flow. For example, if the arn for your flow is 'arn:aws:connect:us-west-2:123456789012:instance/11111111-1111-1111-1111-111111111111/contact-flow/22222222-2222-2222-2222-222222222222', the contact flow id is '22222222-2222-2222-2222-222222222222'
var instanceId = "12345678-1234-1234-1234-123456789012"; // TODO: Fill in You can find the instance id when viewing a contact flow. For example, if the arn for your flow is 'arn:aws:connect:us-west-2:123456789012:instance/11111111-1111-1111-1111-111111111111/contact-flow/22222222-2222-2222-2222-222222222222', the instance id is '11111111-1111-1111-1111-111111111111'
var apiGatewayEndpoint = `https://<apiId>.execute-api.${region}.amazonaws.com/Prod`; // TODO: Fill in with the API Gateway endpoint created by your CloudFormation template.
