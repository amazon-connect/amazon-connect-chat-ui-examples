// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import ENDPOINTS from '../../endpoints'

export default function DebuggerWidget() {
  return (
    <View style={styles.container}>
      <Text>InstanceId:</Text>
      <Text style={{ color: 'gray' }}>{ENDPOINTS.instanceId}</Text>
      <Text>ContactFlowId:</Text>
      <Text style={{ color: 'gray' }}>{ENDPOINTS.contactFlowId}</Text>
      <Text>CCP url:</Text>
      <Text style={{ color: 'gray' }}>{ENDPOINTS.ccpUrl}</Text>
      <Text>APIGW:</Text>
      <Text style={{ color: 'gray' }}>{ENDPOINTS.apiGatewayEndpoint}</Text>
      <Text>GitHub</Text>
      <Text style={{ color: 'gray' }}>github.com/amazon-connect/amazon-connect-chat-ui-examples</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    margin: 20,
    marginBottom: 40,
  },
})
