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
