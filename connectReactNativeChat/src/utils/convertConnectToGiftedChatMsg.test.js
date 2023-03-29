// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { AGENT_USER, CUSTOMER_USER } from '../../config'
import convertConnectToGiftedChatMsg from './convertConnectToGiftedChatMsg'

describe('convertConnectToGiftedChatMsg util', () => {
  it('should convert customer ChatJS message to GiftedChat message model', () => {
    const mockChatJSMessage = {
      Attachments: undefined,
      content: {
        data: 'Hello, World!',
        type: 'text/plain',
      },
      displayName: 'John',
      id: '03e92885-e625-4b65-a6a7-85ec6ef428f7',
      isOldConversation: false,
      participantId: '39b1bc0c-c6f7-448e-892c-f20dbc3ef1a2',
      participantRole: 'CUSTOMER',
      transportDetails: {
        direction: 'Outgoing',
        readTime: undefined,
        sentTime: 1679008078.732,
        status: 'SendSuccess',
      },
      type: 'EVENT',
      version: 0,
    }

    const expectedGiftedChatMessage = {
      _id: '03e92885-e625-4b65-a6a7-85ec6ef428f7',
      text: 'Hello, World!',
      user: CUSTOMER_USER,
      createdAt: new Date(1679008078.732),
    }
    const conversionResult = convertConnectToGiftedChatMsg(mockChatJSMessage)
    expect(conversionResult).toEqual(expectedGiftedChatMessage)
  })

  it('should convert agent ChatJS message to GiftedChat message model', () => {
    const mockChatJSMessage = {
      Attachments: undefined,
      content: {
        data: 'Hello, Customer!',
        type: 'text/plain',
      },
      displayName: 'Agent',
      id: '03e92885-e625-4b65-a6a7-85ec6ef428f7',
      isOldConversation: false,
      participantId: '39b1bc0c-c6f7-448e-892c-f20dbc3ef1a2',
      participantRole: 'CUSTOMER',
      transportDetails: {
        direction: 'Incoming',
        readTime: undefined,
        sentTime: 1679008078.732,
        status: 'SendSuccess',
      },
      type: 'EVENT',
      version: 0,
    }

    const expectedGiftedChatMessage = {
      _id: '03e92885-e625-4b65-a6a7-85ec6ef428f7',
      text: 'Hello, Customer!',
      user: AGENT_USER,
      createdAt: new Date(1679008078.732),
    }
    const conversionResult = convertConnectToGiftedChatMsg(mockChatJSMessage)
    expect(conversionResult).toEqual(expectedGiftedChatMessage)
  })

  it('should convert incoming agent message', () => {
    const agentMessageValid = {
      Attachments: undefined,
      content: { data: 'Test', type: 'text/markdown' },
      displayName: 'Spenlep-ap-southeast-2',
      id: '976f1b30-2376-4f10-9fd0-8cbcad0c8239',
      isOldConversation: false,
      participantId: '2eda54bf-fdc0-42f5-8071-3116948e5ab0',
      participantRole: 'AGENT',
      transportDetails: {
        direction: 'Incoming',
        readTime: undefined,
        sentTime: 1679069236.589,
        status: 'SendSuccess',
      },
      type: 'MESSAGE',
      version: 0,
    }

    const expectedGiftedChatMessage = {
      _id: '976f1b30-2376-4f10-9fd0-8cbcad0c8239',
      text: 'Test',
      user: AGENT_USER,
      createdAt: new Date(1679069236.589),
    }
    const conversionResult = convertConnectToGiftedChatMsg(agentMessageValid)
    expect(conversionResult).toEqual(expectedGiftedChatMessage)
  })

  it('should not transform existing GiftedChat message', () => {
    const mockGiftedChatMessage = {
      _id: '03e92885-e625-4b65-a6a7-85ec6ef428f7',
      text: 'Hello, Customer!',
      user: AGENT_USER,
      createdAt: new Date(1679008078.732),
    }

    const conversionResult = convertConnectToGiftedChatMsg(mockGiftedChatMessage)
    expect(conversionResult).toEqual(mockGiftedChatMessage)
  })
})
