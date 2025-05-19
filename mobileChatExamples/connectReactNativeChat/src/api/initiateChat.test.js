// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import initiateChat from './initiateChat'
import request from '../utils/fetchRequest'

jest.mock('../utils/fetchRequest')

const input = {
  apiGatewayEndpoint: 'http://localhost:9000/start-chat',
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

it('should resolve with the response json.data', async () => {
  const result = await initiateChat(input)

  expect(result).toEqual(resolvedRes.json.data)
})
