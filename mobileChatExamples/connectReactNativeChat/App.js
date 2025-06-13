import React from 'react';
import ChatUI from "./src/ChatUI";

export default function App() {
  return <ChatUI />;
}
/*
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from "react";
import { View, Image } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import ChatWrapper from "./src/components/ChatWrapper";
import GiftedChatWidget from "./src/components/ChatWidget";
import DebuggerWidget from "./src/components/DebuggerWidget";
import ChatForm from "./src/components/ChatForm";

import { LogBox } from "react-native";
import { ENABLE_REACTNATIVE_LOGBOX } from "./config";
if (!ENABLE_REACTNATIVE_LOGBOX) {
  LogBox.ignoreAllLogs();
}

const ChatScreen = ({ navigation }) => {
  return (
    <ChatWrapper
      navigation={navigation}
      ChatWidgetComponent={GiftedChatWidget}
    />
  );
};

const HomeScreen = ({ navigation }) => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      padding: 10,
      marginTop: 100,
    }}
  >
    <Image
      source={require("./assets/connect.png")}
      style={{
        height: 90,
        width: 100,
        padding: 10,
      }}
      alt="Connect logo"
    />

    <ChatForm openChatScreen={() => navigation.navigate("Chat")} />

    <DebuggerWidget />
  </View>
);

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
*/