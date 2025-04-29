export const GATEWAY = {
  region: "us-west-2",
  apiGWId: "asdfasdf", // the API Gateway Id for your personal StartChatContact proxy backend
};

const ENDPOINTS = {
  contactFlowId: "asdf-5056-asdf-a672-asdf6a81ca6", // refer to "Prerequisites" in the README
  instanceId: "asdf-078b-asdf-9264-asdf98f3c28", // refer to "Prerequisites" in the README
  region: GATEWAY.region,
  apiGatewayEndpoint: `https://${GATEWAY.apiGWId}.execute-api.${GATEWAY.region}.amazonaws.com/Prod`,
  ccpUrl: "https://<instanceAlias>.my.connect.aws/ccp-v2", // optional - for reference
};

export default ENDPOINTS;
