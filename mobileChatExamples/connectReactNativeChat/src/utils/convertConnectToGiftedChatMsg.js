// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  CUSTOMER_USER,
  AGENT_USER,
  // supportMessageContentTypes
} from '../../config'

const isValidConnectChatMessage = (msg) => {
  return (
    msg.id &&
    typeof msg.id === 'string' &&
    msg.content &&
    typeof msg.content === 'object' &&
    !Array.isArray(msg.content) &&
    msg.content.data &&
    typeof msg.content.data === 'string' &&
    // supportMessageContentTypes.some((messageType) => msg.content.type === messageType) &&
    msg.transportDetails &&
    typeof msg.transportDetails === 'object' &&
    !Array.isArray(msg.transportDetails) &&
    msg.transportDetails.sentTime &&
    typeof msg.transportDetails.sentTime === 'number' &&
    msg.transportDetails.direction &&
    typeof msg.transportDetails.direction === 'string' &&
    (msg.transportDetails.direction === 'Outgoing' || msg.transportDetails.direction === 'Incoming')
  )
}

// https://github.com/FaridSafi/react-native-gifted-chat ^2.0.0
const isValidGiftedChatMessage = (msg) => {
  return (
    msg._id &&
    typeof msg._id === 'string' &&
    msg.text &&
    typeof msg.text === 'string' &&
    msg.createdAt &&
    msg.createdAt instanceof Date &&
    msg.user &&
    msg.user instanceof Object
  )
}

/*
 * Parse ChatJS message sent over websocket, converting to GiftedChat model
 */
const convertConnectToGiftedChatMsg = (msg) => {
  if (isValidGiftedChatMessage(msg)) {
    return msg
  } else if (isValidConnectChatMessage(msg)) {
    return {
      _id: msg.id,
      text: msg.content.data,
      createdAt: new Date(msg.transportDetails.sentTime),
      user: msg.transportDetails.direction === 'Outgoing' ? CUSTOMER_USER : AGENT_USER,
    }
  }
}

export default convertConnectToGiftedChatMsg
