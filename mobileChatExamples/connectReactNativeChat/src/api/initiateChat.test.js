// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import initiateChat from './initiateChat'
import request from '../utils/fetchRequest'

const START_CHAT_CLIENT_TIMEOUT_MS = 5000

jest.mock('../utils/fetchRequest')

const input = {
  apiGatewayEndpoint: 'https://localhost:3000',
  name: 'Tester',
}

const resolvedRes = {
  json: {
    data: [1, 2, 3],
  },
}

Object.freeze(input)

beforeEach(() => {
  request.mockResolvedValue(resolvedRes)
})

afterEach(() => {
  jest.resetAllMocks()
})

it('should attach headers from the input, if supplied', async () => {
  const inputWithHeaders = {
    ...input,
    headers: {
      testHeader: 'testHeaderValue',
    },
  }
  await initiateChat(inputWithHeaders)

  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith(
    input.apiGatewayEndpoint,
    {
      headers: inputWithHeaders.headers,
      method: 'post',
      body: JSON.stringify({
        ParticipantDetails: {
          DisplayName: inputWithHeaders.name,
        },
      }),
    },
    START_CHAT_CLIENT_TIMEOUT_MS
  )
})

it('should resolve with the response json.data', async () => {
  const result = await initiateChat(input)

  expect(result).toEqual(resolvedRes.json.data)
})

it('should attach headers and the optional field supportedMessagingContentTypes from the input, if supplied', async () => {
  const inputWithHeaders = {
    ...input,
    supportedMessagingContentTypes: 'type1,type2',
    headers: {
      testHeader: 'testHeaderValue',
    },
  }
  await initiateChat(inputWithHeaders)

  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith(
    input.apiGatewayEndpoint,
    {
      headers: inputWithHeaders.headers,
      method: 'post',
      body: JSON.stringify({
        ParticipantDetails: {
          DisplayName: inputWithHeaders.name,
        },
        SupportedMessagingContentTypes: ['type1', 'type2'],
      }),
    },
    START_CHAT_CLIENT_TIMEOUT_MS
  )
})

it('should attach headers if supplied and not the optional field supportedMessagingContentTypes from the input if undefined', async () => {
  const inputWithHeaders = {
    ...input,
    supportedMessagingContentTypes: undefined,
    headers: {
      testHeader: 'testHeaderValue',
    },
  }
  await initiateChat(inputWithHeaders)

  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith(
    input.apiGatewayEndpoint,
    {
      headers: inputWithHeaders.headers,
      method: 'post',
      body: JSON.stringify({
        ParticipantDetails: {
          DisplayName: inputWithHeaders.name,
        },
      }),
    },
    START_CHAT_CLIENT_TIMEOUT_MS
  )
})

it('should attach headers if supplied and the optional field supportedMessagingContentTypes with one value from the input', async () => {
  const inputWithHeaders = {
    ...input,
    supportedMessagingContentTypes: 'type1',
    headers: {
      testHeader: 'testHeaderValue',
    },
  }
  await initiateChat(inputWithHeaders)

  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith(
    input.apiGatewayEndpoint,
    {
      headers: inputWithHeaders.headers,
      method: 'post',
      body: JSON.stringify({
        ParticipantDetails: {
          DisplayName: inputWithHeaders.name,
        },
        SupportedMessagingContentTypes: ['type1'],
      }),
    },
    START_CHAT_CLIENT_TIMEOUT_MS
  )
})

it('should attach headers if supplied and the optional field supportedMessagingContentTypes with two values from the input', async () => {
  const inputWithHeaders = {
    ...input,
    supportedMessagingContentTypes: 'text/plain,text/markdown',
    headers: {
      testHeader: 'testHeaderValue',
    },
  }
  await initiateChat(inputWithHeaders)

  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith(
    input.apiGatewayEndpoint,
    {
      headers: inputWithHeaders.headers,
      method: 'post',
      body: JSON.stringify({
        ParticipantDetails: {
          DisplayName: inputWithHeaders.name,
        },
        SupportedMessagingContentTypes: ['text/plain', 'text/markdown'],
      }),
    },
    START_CHAT_CLIENT_TIMEOUT_MS
  )
})

it('should forward chatDurationInMinutes when optional field is set', async () => {
  const inputWithHeaders = {
    ...input,
    chatDurationInMinutes: 1500,
    headers: {
      testHeader: 'testHeaderValue',
    },
  }
  await initiateChat(inputWithHeaders)

  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith(
    input.apiGatewayEndpoint,
    {
      headers: inputWithHeaders.headers,
      method: 'post',
      body: JSON.stringify({
        ParticipantDetails: {
          DisplayName: inputWithHeaders.name,
        },
        ChatDurationInMinutes: 1500,
      }),
    },
    START_CHAT_CLIENT_TIMEOUT_MS
  )
})

it('should only forward number if chatDurationInMinutes field is set', async () => {
  const inputWithHeaders = {
    ...input,
    chatDurationInMinutes: '1500',
    headers: {
      testHeader: 'testHeaderValue',
    },
  }
  await initiateChat(inputWithHeaders)

  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith(
    input.apiGatewayEndpoint,
    {
      headers: inputWithHeaders.headers,
      method: 'post',
      body: JSON.stringify({
        ParticipantDetails: {
          DisplayName: inputWithHeaders.name,
        },
        ChatDurationInMinutes: 1500,
      }),
    },
    START_CHAT_CLIENT_TIMEOUT_MS
  )
})
