# React Native + ChatJS Demo
 
A demo [Expo](https://expo.dev/) app for building custom Amazon Connect Chat in React Native. This cross-platform (Android, iOS, macOS, Windows, & Web) solution implements basic ChatJS functionality and is fully customizable.

> Built with `expo@~48.0.6`, `react-native-gifted-chat@^2.0.0`, and `Node.js v16`.

> React Native (v0.71.3) apps may target iOS 12.4 and Android 5.0 (API 21) or newer. You may use Windows, macOS, or Linux as your development operating system, though building and running iOS apps is limited to macOS. 

**Reference:**

- ChatJS Repository: https://github.com/amazon-connect/amazon-connect-chatjs
- NPM package: https://www.npmjs.com/package/amazon-connect-chatjs
- Documentation: https://docs.aws.amazon.com/connect/latest/adminguide/enable-chat-in-app.html

https://user-images.githubusercontent.com/60903378/229218472-bf2ba819-d7ea-46c9-9437-58290e8be962.mov

## Contents

- [Mobile Support](#mobile-support)
- [Local Development](#local-development)
- [Production Build](#production-build)
- [ChatJS Usage](#chatjs-usage)

## Mobile Support

Additional configuration is required to support ChatJS in React Native applications. Use `amazon-connect-chatjs@^1.5.0` and apply the changes below:

Install the supported ChatJS library using either Yarn:

```sh
$ yarn add amazon-connect-chatjs@^1.5.0
```

or npm:

```sh
$ npm install amazon-connect-chatjs@^1.5.0
```


#### Override Browser Network Health Check

If running ChatJS in a mobile React Native environment, override the default network setting online and check:

> `amazon-connect-websocket-manager.js` depencency will use `navigator.onLine`. Legacy browsers will always return `true`, but unsupported or mobile runtime will return `null/undefined`.

```js
/**
 * `amazon-connect-websocket-manager.js` depencency will use `navigator.onLine`
 * Unsupported or mobile runtime will return `null/undefined` - preventing websocket connections
 * Legacy browsers will always return `true` [ref: caniuse.com/netinfo]
 */
const customNetworkStatus = () => true;

connect.ChatSession.setGlobalConfig({
  webSocketManagerConfig: {
    isNetworkOnline: customNetworkStatus, // default: () => navigator.onLine
  }
});
```

#### Custom Network Health Check

Extending this, device-native network health checks can be used for React Native applications.

1. First, install the `useNetInfo` react hook:

```sh
$ npm install --save @react-native-community/netinfo
# source: https://github.com/react-native-netinfo/react-native-netinfo
```

2. Make sure to update permissions, Android requires the following line in `AndroidManifest.xml`: (for SDK version after 23)

```xml
<uses-permission
    android:name="android.permission.ACCESS_NETWORK_STATE"
/>
```

3. Set up the network event listener, and pass custom function to `setGlobalConfig`:

> Note: To configure `WebSocketManager`, `setGlobalConfig` must be invoked

```js
import ChatSession from "./ChatSession";
import NetInfo from "@react-native-community/netinfo";
import "amazon-connect-chatjs"; // ^1.5.0 - imports global "connect" object

/** 
 * By default, `isNetworkOnline` will be invoked every 250ms
 * Should only current status, and not make `NetInfo.fetch()` call
 * 
 * @return {boolean} returns true if currently connected to network
*/
let isOnline = true;
const customIsNetworkOnline = () => isOnline;

const ReactNativeChatComponent = (props) => {
  /** 
   * Network event listener native to device
   * Will update `isOnline` value asynchronously whenever network calls are made
  */
  const unsubscribeNetworkEventListener = NetInfo.addEventListener(state => {
    console.log('NetInfo eventListener - isConnected:',  state.isConnected);
    isOnline = state.isConnected;
  });
  useEffect(() => {
    return unsubscribeNetworkEventListener();
  }, []);
  const initializeChatJS = () => {
    // To configure WebSocketManager, setGlobalConfig must be invoked
    connect.ChatSession.setGlobalConfig({
      // ...
      webSocketManagerConfig: {
        isNetworkOnline: customIsNetworkOnline, // default: () => navigator.onLine
      }
    });
  }
  // ...
}
```

4. Optionally, this configuration can be dynamically set based on the `Platform`

```js
import { Platform } from 'react-native';
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
connect.ChatSession.setGlobalConfig({
  // ...
  webSocketManagerConfig: {
    ...(isMobile ? { isNetworkOnline: () => true } : {}), // use default behavior for browsers
  }
});
```

## Local Development

> Versions: Expo@~48.0.6, react-native@0.71.3, react-native-gifted-chat@^2.0.0, react@^18.2.0  
> Supported in Node v16+

> Setting up Android Emulator: https://docs.expo.dev/workflow/android-studio-emulator/  
> Setting up iPhone Emulator: https://docs.expo.dev/workflow/ios-simulator/

1. Deploy startChatContact backend (from CFN stack): https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI

```sh
$ cp endpoints.sample.js endpoints.js
```

```js
// <rootDir>/endpoints.js

export const GATEWAY = {
  region: "us-west-2",
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
```

2. Customize several global settings in the `config.js` file, including the `startChatRequestInput` request body.

```js
// <rootDir>/config.js

// Enable/disable ChatJS event logs
export const ENABLE_CHATJS_LOGS = false;

// Renders pop-up on device emulator screen from console.logs
export const ENABLE_REACTNATIVE_LOGBOX = false;

// Enable rich messaging, CCP sends "text/markdown" by default
// doc: https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html#API_StartChatContact_RequestSyntax
export const supportMessageContentTypes = ["text/plain"];

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

export const startChatRequestInput = {
  ...ENDPOINTS,
  name: "John",
  contactAttributes: JSON.stringify({
    customerName: "John",
  }),
  supportedMessagingContentTypes: supportMessageContentTypes.join(","),
};
```

3. Run the Expo demo application on an emulator

```sh
$ yarn
$ yarn run ios
$ yarn run web
$ yarn run android
$ npx expo run:ios -d # run on device plugged into laptop
```

4. Edit code, regenerate bundle files, and refresh Expo app

### Open Debugger

> If you need to clear cache, run `expo start -c`

- Physical device: 👋 shake it.
- iOS simulator: Cmd-Ctrl-Z in macOS.
- Android emulator: Cmd-M in macOS or Ctrl-Min Windows.

## Production Build

Create a production Expo build

```
$ rm app.json && cp app.prod.json app.json
$ CI=1 npx expo prebuild --platform all
```

## ChatJS Usage

ChatScreen uses three components:

- `initiateChat`: startChatContact request
- `ChatSession`: low-level abstraction on top of ChatJS
- `ChatWrapper`: manages chat state at the UI level, handling loading/disconnect
- `ChatWidget`: renders chat composer and transcript

```js
// src/api/initiateChat.js

/**
 * Initiate a chat session within Amazon Connect, proxying initial StartChatContact request
 * through your API Gateway.
 *
 * https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html
 */
const initiateChat = (input) => {
  const requestBody = {
    InstanceId: "asdf-5056-asdf-a672-asdf6a81ca6",
    ContactFlowId: "asdf-5056-asdf-a672-asdf6a81ca6",
    ParticipantDetails: {
      DisplayName: "John",
    },
    SupportedMessagingContentTypes: ["text/plain", "text/markdown"],
    ChatDurationInMinutes: 60,
  };

  return window
    .fetch(
      input.apiGatewayEndpoint,
      {
        headers: input.headers ? input.headers : new Headers(),
        method: "post",
        body: JSON.stringify(requestBody),
      },
      START_CHAT_CLIENT_TIMEOUT_MS // 5000
    )
    .then((res) => res.json.data)
    .catch((err) => console.error(err));
};
```

```js
// src/components/ChatSession.js

import "amazon-connect-chatjs"; // ^1.5.0

// Low-level abstraction on top of Chat.JS
class ChatJSClient {
  session = null;

  constructor(chatDetails, region) {
    this.session = connect.ChatSession.create({
      chatDetails: {
        contactId: chatDetails.startChatResult.ContactId,
        participantId: chatDetails.startChatResult.ParticipantId,
        participantToken: chatDetails.startChatResult.ParticipantToken,
      },
      type: "CUSTOMER",
      options: { region },
    });
  }

  connect() {
    // Intiate the websocket connection. After the connection is established, the customer's chat request
    // will be routed to an agent who can then accept the request.
    return this.session.connect();
  }

  disconnect() {
    return this.session.disconnectParticipant();
  }

  sendMessage(content) {
    // Right now we are assuming only text messages,
    // later we will have to add functionality for other types.
    return this.session.sendMessage({
      message: content.data,
      contentType: content.type,
    });
  }
}
```

```js
// src/components/ChatWrapper.js

import initiateChat from "../api/initiateChat";
import filterIncomingMessages from "../utils/filterIncomingMessages";

const chatDetails = await initiateChat();
const chatSession = new ChatJSClient(chatDetails);
await chatSession.openChatSession();

// Add event listeners to chat session
chatSession.onIncoming(async () => {
  const latestTranscript = await chatSession.loadPreviousTranscript();
  setMessages(filterIncomingMessages(latestTranscript));
});
chatSession.onOutgoing(async () => {
  const latestTranscript = await chatSession.loadPreviousTranscript();
  setMessages(filterIncomingMessages(latestTranscript));
});
```

```js
// src/components/ChatWidget.js

import { GiftedChat } from "react-native-gifted-chat"; // ^2.0.0

const ChatWidget = ({ handleSendMessage, messages }) => {
  return (
    <GiftedChat
      messages={messages}
      onSend={(msgs) => {
        Keyboard.dismiss();
        handleSendMessage(msgs[0].text);
      }}
    />
  );
};
```

<!-- ## Bugs

#### crypto.getRandomValues() Issue

In case of `crypto.getRandomValues()` error, the following polyfills can be added to the applications:

```js
import "react-native-url-polyfill/auto"; // https://github.com/supabase/supabase/issues/8464#issuecomment-1221448428
import "react-native-get-random-values"; // https://stackoverflow.com/questions/61169746/crypto-getrandomvalues-not-supported
import { polyfillWebCrypto } from "expo-standard-web-crypto";

import "amazon-connect-chatjs";

polyfillWebCrypto();
``` -->
