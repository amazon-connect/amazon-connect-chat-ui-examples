// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import filterIncomingMessages from './filterIncomingMessages'
import convertConnectToGiftedChatMsg from './convertConnectToGiftedChatMsg'

const validConnectMessage = {
  content: { data: 'Hello, World!', type: 'text/plain' },
  displayName: 'John',
  id: '1d598200-1874-4968-88d1-474499cfa38a',
  isOldConversation: false,
  participantId: '918e1fbd-b5b6-4b4c-a0e4-36d3eb6ace3b',
  participantRole: 'CUSTOMER',
  transportDetails: {
    direction: 'Outgoing',
    readTime: undefined,
    sentTime: 1679017097.836,
    status: 'SendSuccess',
  },
  type: 'MESSAGE',
  version: 0,
}
const validTranscript = new Array(5).fill(validConnectMessage)

const invalidMessages = [
  null,
  [{}],
  {
    ...validConnectMessage,
    content: {
      data: 'Invalid message!',
      type: 'invalid',
    },
  },
  {
    ...validConnectMessage,
    content: {
      data: null,
      type: 'invalid',
    },
  },
]

describe('filterIncomingMessages util', () => {
  it.each(invalidMessages)('ignores invalid message objects', (invalidTranscript) => {
    expect(filterIncomingMessages(invalidTranscript)).toEqual([])
  })

  it('should transform valid incoming transcript', () => {
    const expectedTranscript = new Array(5).fill(validConnectMessage).map(convertConnectToGiftedChatMsg)
    expect(filterIncomingMessages(validTranscript)).toEqual(expectedTranscript)
  })

  it('should transform valid incoming markdown transcript', () => {
    const expectedTranscript = new Array(5).fill(validConnectMessage).map(convertConnectToGiftedChatMsg)
    const markdownTranscript = validTranscript.slice().map((msg) => ({
      ...msg,
      content: { ...msg.content, type: 'text/markdown' },
    }))
    expect(filterIncomingMessages(markdownTranscript)).toEqual(expectedTranscript)
  })

  it('should sort incoming transcript by date DESC', () => {
    const dateSortedTranscript = []
    Array.from(Array(8).keys()).forEach((i) => {
      dateSortedTranscript.push({
        ...validConnectMessage,
        transportDetails: {
          ...validConnectMessage.transportDetails,
          sentTime: new Date(2016 + i, 10, 10).getTime(),
        },
      })
    })

    const scrambledTranscript = dateSortedTranscript.slice().sort(() => 0.5 - Math.random())

    const filteredTranscript = filterIncomingMessages(scrambledTranscript)
    expect(dateSortedTranscript.length).toBeGreaterThan(0)
    expect(filteredTranscript.length).toBe(dateSortedTranscript.length)

    let lastMessage = null
    filteredTranscript.forEach((msg) => {
      if (lastMessage === null) {
        lastMessage = msg
        return
      }

      expect(Date.parse(msg.createdAt)).toBeGreaterThan(Date.parse(lastMessage.createdAt))
      lastMessage = msg
    })
  })
})
