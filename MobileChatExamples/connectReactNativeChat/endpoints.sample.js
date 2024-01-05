/**
 * Please refer to "Prerequisites" in the README
 *
 * Reference:
 *    - Create an Amazon Connect Instance: https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html
 *    - Enable chat experience for an existing Connect instance: https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master#enabling-chat-in-an-existing-amazon-connect-contact-center
 *    - Create an Amazon Connect Contact Flow: https://docs.aws.amazon.com/connect/latest/adminguide/chat.html
 *    - Find the `instanceId`: https://docs.aws.amazon.com/connect/latest/adminguide/find-instance-arn.html
 *    - Find the `contactFlowId` for the: https://docs.aws.amazon.com/connect/latest/adminguide/find-contact-flow-id.html
 *    - For `apiGWId`, deploy a custom Amazon Connect Chat backend: https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI
 *
 */

export const GATEWAY = {
  region: "ap-southeast-2",
  apiGWId: "asdfasdf",
};

const ENDPOINTS = {
  contactFlowId: "asdf-5056-asdf-a672-asdf6a81ca6",
  instanceId: "asdf-078b-asdf-9264-asdf98f3c28",
  region: GATEWAY.region,
  apiGatewayEndpoint: `https://${GATEWAY.apiGWId}.execute-api.${GATEWAY.region}.amazonaws.com/Prod`,
  ccpUrl: "https://<instanceAlias>.my.connect.aws/ccp-v2", // optional - for reference
};

export default ENDPOINTS;
