// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import { Input, Button } from 'react-native-elements'

const ChatForm = ({ openChatScreen }) => {
  const [name, setName] = useState('TestUser')

  return (
    <>
      <Input
        placeholder="Enter your name"
        label="Name"
        leftIcon={{ type: 'material', name: 'person' }}
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <Button title="Launch Chat" style={styles.button} onPress={openChatScreen} />
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 370,
    marginTop: 10,
  },
})

export default ChatForm
