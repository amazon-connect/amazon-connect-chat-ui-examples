// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import request from './fetchRequest'

const mockBadResponse = {
  json: jest.fn().mockResolvedValue({
    message: 'bad request',
  }),
  status: 400,
  ok: false,
}

const mockGoodResponse = {
  json: jest.fn().mockResolvedValue({
    data: [1, 2, 3],
  }),
  status: 200,
  ok: true,
}

beforeAll(() => {
  global.fetch = jest.fn()
})

it('should reject with the full response with the json if response.ok is false', async () => {
  global.fetch.mockResolvedValue(mockBadResponse)
  expect.assertions(2)

  try {
    await request('localhost', {})
  } catch (err) {
    expect(err).toEqual({
      json: {
        message: 'bad request',
      },
      status: 400,
      ok: false,
    })
    expect(mockBadResponse.json).toHaveBeenCalledTimes(1)
  }
})

it('should resolve with the full response with the json if response.ok is true', async () => {
  global.fetch.mockResolvedValue(mockGoodResponse)
  const result = await request('localhost', {})
  expect(result).toEqual({
    json: {
      data: [1, 2, 3],
    },
    status: 200,
    ok: true,
  })
  expect(mockGoodResponse.json).toHaveBeenCalledTimes(1)
})

it('should reject with networkError info if fetch throws', async () => {
  const networkMessage = 'Failed to fetch'
  global.fetch.mockRejectedValue({
    message: networkMessage,
  })

  expect.assertions(1)

  try {
    await request('localhost', {})
  } catch (err) {
    expect(err).toEqual({
      networkError: networkMessage,
    })
  }
})
