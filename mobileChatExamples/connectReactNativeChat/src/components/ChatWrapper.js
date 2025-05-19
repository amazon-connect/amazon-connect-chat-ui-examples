// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState } from 'react'
import Spinner from 'react-native-loading-spinner-overlay'

import ChatSession from '../components/ChatSession'
import initiateChat from '../api/initiateChat'
import filterIncomingMessages from '../utils/filterIncomingMessages'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'

const storeData = async (key, value) => {
  try {
    // Convert objects/arrays to JSON strings before storing
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value)
    await AsyncStorage.setItem(key, jsonValue)
    return true
  } catch (error) {
    console.error('Error storing data:', error)
    return false
  }
}

// Retrieve data function
const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key)
    if (value === null) return null

    try {
      // Try to parse as JSON, return original string if not valid JSON
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  } catch (error) {
    console.error('Error retrieving data:', error)
    return null
  }
}

/**
 * `amazon-connect-websocket-manager.js` depencency will use `navigator.onLine`
 * Unsupported or mobile runtime will return `null/undefined` - preventing websocket connections
 * Legacy browsers will always return `true` [ref: caniuse.com/netinfo]
 */
let isOnline = true
const customIsNetworkOnline = () => isOnline

/*
 * Wrapper to manage ChatJS Session and pass messages down to GiftedChat component
 * Handles state changes when loading/connecting
 * Handles event listeners to update transcript
 */
const ChatWrapper = ({ navigation, ChatWidgetComponent }) => {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])

  const openHomeScreen = () => navigation.navigate('Home')

  /**
   * Network event listener native to device
   * Will update `isOnline` value asynchronously whenever network calls are made
   */
  const unsubscribeNetworkEventListener = NetInfo.addEventListener((state) => {
    isOnline = state.isConnected
  })

  useEffect(() => {
    return unsubscribeNetworkEventListener()
  }, [])

  useEffect(() => {
    if (!loading && !connected) {
      submitChatInitiation()
    }
  }, [])

  const handleStartChatFailure = (e) => {
    console.error(e)
    setConnected(false)
    setLoading(false)
    alert('StartChat request failed :(')
    openHomeScreen()
  }

  const handleStartChatSuccess = () => {
    setLoading(false)
    setConnected(true)
  }

  const submitChatInitiation = async () => {
    // Create chat session connection
    setLoading(true)
    const customerName = 'Joe Shmoe'

    let chatDetails
    const ongoingChatDetails = getData('chatjs-ongoing-chat-session-details')
    if (ongoingChatDetails && ongoingChatDetails.ContactId) {
      chatDetails = ongoingChatDetails
    } else {
      const newChatDetails = await initiateChat(customerName, handleStartChatFailure)
      chatDetails = newChatDetails
      storeData('chatjs-ongoing-chat-session-details', newChatDetails)
    }

    const chatSession = new ChatSession(
      chatDetails,
      customIsNetworkOnline // pass down the custom "isNetworkOnline" function
    )
    await chatSession.openChatSession().then(handleStartChatSuccess).catch(handleStartChatFailure)
    setSession(chatSession)

    // Add event listeners to chat session
    chatSession.onIncoming(async () => {
      const latestTranscript = await chatSession.loadPreviousTranscript()
      setMessages(filterIncomingMessages(latestTranscript))
    })
    chatSession.onOutgoing(async () => {
      const latestTranscript = await chatSession.loadPreviousTranscript()
      setMessages(filterIncomingMessages(latestTranscript))
    })
  }

  const handleDisconnect = () => {
    if (!loading && connected) {
      setLoading(true)
      session.endChat(() => {
        setConnected(false)
        setLoading(false)
        openHomeScreen()
      })
    } else {
      openHomeScreen()
    }
  }

  const handleSendMessage = (msg) => {
    const content = {
      data: msg,
      type: 'text/plain',
    }
    session.client.sendMessage(content)
  }

  return (
    <>
      <Spinner
        visible={loading}
        textContent={'Loading...'}
        textStyle={{
          color: '#FFF',
        }}
      />
      <ChatWidgetComponent
        messages={messages}
        navigation={navigation}
        handleSendMessage={handleSendMessage}
        handleDisconnect={handleDisconnect}
      />
    </>
  )
}

export default ChatWrapper
