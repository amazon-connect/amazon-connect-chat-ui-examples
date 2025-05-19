// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import request from '../utils/fetchRequest'

const proxyApiEndpoint = 'http://localhost:9000/start-chat';

/**
 * Initiate a chat session within Amazon Connect
 * Call your personal chat backend, which will make a StartChatContact API request
 *
 * @param {string} customerName
 * @returns {Promise} Promise object that resolves to chatDetails objects
 */
const initiateChat = (customerName, errorCallback) => {
  const requestBody = {
    customerName: customerName,
  }
  return request(
    proxyApiEndpoint,
    {
      headers: new Headers(),
      method: 'post',
      body: JSON.stringify(requestBody),
    },
    5000 // timeout in MS
  )
    .then((res) => res.json.data)
    .catch(errorCallback)
}

export default initiateChat
