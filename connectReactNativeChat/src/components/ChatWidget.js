// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useLayoutEffect } from 'react'
import { View, Button, Keyboard, Platform } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'
import { Avatar } from 'react-native-elements'
import { CUSTOMER_USER } from '../../config'

const ChatWidget = ({ navigation, handleDisconnect, handleSendMessage, messages }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={{ marginLeft: 20 }}>
          <Avatar
            rounded
            source={{
              uri: CUSTOMER_USER.avatar,
            }}
          />
        </View>
      ),
      headerRight: () => (
        <View style={{ marginRight: 10 }}>
          <Button title="End Chat" onPress={handleDisconnect} />
        </View>
      ),
    })
  }, [navigation])

  return (
    <GiftedChat
      messages={messages}
      inverted={false}
      showAvatarForEveryMessage={true}
      renderUsernameOnMessage={true}
      onSend={(msgs) => {
        Keyboard.dismiss()
        handleSendMessage(msgs[0].text)
      }}
      user={CUSTOMER_USER}
      isKeyboardInternallyHandled={false}
      showUserAvatar={false}
      keyboardShouldPersistTaps="never"
    />
  )
}

export default ChatWidget
