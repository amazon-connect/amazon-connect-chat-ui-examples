// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import convertConnectToGiftedChatMsg from './convertConnectToGiftedChatMsg'

const filterIncomingMessages = (messages) => {
  if (!Array.isArray(messages)) {
    return []
  }

  return messages
    .map(convertConnectToGiftedChatMsg)
    .filter((msg) => msg)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export default filterIncomingMessages
