import ENDPOINTS from "./endpoints";

export const ENABLE_REACTNATIVE_LOGBOX = false;
export const ENABLE_CHATJS_LOGS = true;

export const loggerConfig = {
  useDefaultLogger: true,
};

export const supportMessageContentTypes = ["text/plain"];
export const startChatRequestInput = {
  ...ENDPOINTS,
  name: "John",
  contactAttributes: JSON.stringify({
    customerName: "John",
  }),
  supportedMessagingContentTypes: supportMessageContentTypes.join(","),
};

export const CUSTOMER_USER = {
  _id: 1,
  name: "Customer",
  avatar: "https://i.pravatar.cc/100?img=11",
};

export const AGENT_USER = {
  _id: 2,
  name: "Agent",
  avatar:
    "https://www.bcbswy.com/wp-content/uploads/2020/05/20.06.26_bcbswy_avatar_@2.0x.png",
};
