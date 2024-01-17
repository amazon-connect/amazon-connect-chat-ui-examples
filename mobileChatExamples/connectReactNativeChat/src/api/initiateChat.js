// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import request from '../utils/fetchRequest'

const START_CHAT_CLIENT_TIMEOUT_MS = 5000

/**
 * Initiate a chat session within Amazon Connect, proxying initial StartChatContact request
 * through your API Gateway.
 *
 * https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html
 *
 * @param {Object} input - data to initate chat
 * @param {string} input.instanceId
 * @param {string} input.contactFlowId
 * @param {string} input.apiGatewayEndpoint
 * @param {string} input.name
 * @param {string} input.initialMessage - optional initial message to start chat
 * @param {string} input.region
 * @param {string} input.contactAttributes
 * @param {object} input.headers
 * @param {string} input.supportedMessagingContentTypes
 * @param {number} input.chatDurationInMinutes
 * @returns {Promise} Promise object that resolves to chatDetails objects
 */
const initiateChat = (input, errorCallback) => {
  const initiateChatRequest = {
    InstanceId: input.instanceId,
    ContactFlowId: input.contactFlowId,
    ParticipantDetails: {
      DisplayName: input.name,
    },
    Username: input.username,
    ...(input.supportedMessagingContentTypes
      ? {
          SupportedMessagingContentTypes: input.supportedMessagingContentTypes.split(','),
        }
      : {}),
    ...(input.chatDurationInMinutes ? { ChatDurationInMinutes: Number(input.chatDurationInMinutes) } : {}),
  }

  return request(
    input.apiGatewayEndpoint,
    {
      headers: input.headers ? input.headers : new Headers(),
      method: 'post',
      body: JSON.stringify(initiateChatRequest),
    },
    START_CHAT_CLIENT_TIMEOUT_MS
  )
    .then((res) => res.json.data)
    .catch(errorCallback)
}

export default initiateChat
