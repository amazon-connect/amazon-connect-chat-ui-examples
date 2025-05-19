// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import 'amazon-connect-chatjs' // >= v1.5.0

import { CONTACT_STATUS } from '../constants/global'
import { modelUtils } from '../datamodel/Utils'
import {
  ContentType,
  PARTICIPANT_MESSAGE,
  Direction,
  Status,
  ATTACHMENT_MESSAGE,
  AttachmentErrorType,
  PARTICIPANT_TYPES,
} from '../datamodel/Model'
import { getTimeFromTimeStamp } from '../utils/helper'

/**
 * ChatJSClient - Low-level wrapper for Amazon Connect ChatJS
 * Handles direct interaction with the ChatJS library
 */
class ChatJSClient {
  session = null

  constructor(chatDetails, customNetworkStatus) {
    // Configure global settings for ChatJS
    connect.ChatSession.setGlobalConfig({
      // loggerConfig: {}, // Disable logging
      loggerConfig: { useDefaultLogger: true }, // Enable logging
      webSocketManagerConfig: { isNetworkOnline: customNetworkStatus },
      region: 'us-west-2',
    })

    if (!chatDetails) {
      alert('Unable to init ChatJSSession')
      return
    }

    // Initialize chat session with required details
    this.session = connect.ChatSession.create({
      chatDetails: {
        contactId: chatDetails.ContactId,
        participantId: chatDetails.ParticipantId,
        participantToken: chatDetails.ParticipantToken,
      },
      disableCSM: true, // Client-side Metrics not supported in React Native
      type: 'CUSTOMER',
    })
  }

  // Connection management
  connect() {
    return this.session.connect()
  }

  disconnect() {
    return this.session.disconnectParticipant()
  }

  // Event handlers
  onTyping(handler) {
    return this.session.onTyping(handler)
  }

  onReadReceipt(handler) {
    return this.session.onReadReceipt(handler)
  }

  onDeliveredReceipt(handler) {
    return this.session.onDeliveredReceipt(handler)
  }

  onEnded(handler) {
    return this.session.onEnded(handler)
  }

  onMessage(handler) {
    return this.session.onMessage(handler)
  }

  onConnectionEstablished(handler) {
    return this.session.onConnectionEstablished(handler)
  }

  onConnectionBroken(handler) {
    return this.session.onConnectionBroken(handler)
  }

  // Session information
  getContactId() {
    return this.session.controller.contactId
  }

  getParticipantId() {
    return this.session.getChatDetails().participantId
  }

  getTranscript(args) {
    return this.session.getTranscript(args)
  }

  // Sending messages and events
  sendTypingEvent() {
    return this.session.sendEvent({
      contentType: ContentType.EVENT_CONTENT_TYPE.TYPING,
    })
  }

  sendReadReceipt(messageId, options = {}) {
    return this.session.sendEvent({
      contentType: ContentType.EVENT_CONTENT_TYPE.READ_RECEIPT,
      content: JSON.stringify({ messageId, ...options }),
    })
  }

  sendDeliveredReceipt(messageId, options = {}) {
    return this.session.sendEvent({
      contentType: ContentType.EVENT_CONTENT_TYPE.DELIVERED_RECEIPT,
      content: JSON.stringify({ messageId, ...options }),
    })
  }

  sendMessage(content) {
    return this.session.sendMessage({
      message: content.data,
      contentType: content.type,
    })
  }

  sendAttachment(attachment) {
    return this.session.sendAttachment({ attachment })
  }

  downloadAttachment(attachmentId) {
    return this.session.downloadAttachment({ attachmentId })
  }
}

/**
 * ChatSession - Main class for managing chat interactions
 * Provides higher-level abstractions for chat functionality
 */
class ChatSession {
  transcript = []
  typingParticipants = []
  thisParticipant = null
  client = null
  contactId = null
  contactStatus = CONTACT_STATUS.DISCONNECTED
  nextToken = null
  isOutgoingMessageInFlight = false

  // Event handling system
  _eventHandlers = {
    'transcript-changed': [],
    'typing-participants-changed': [],
    'contact-status-changed': [],
    'incoming-message': [],
    'outgoing-message': [],
    'chat-disconnected': [],
    'chat-closed': [],
  }

  constructor(chatDetails, displayName, region, customNetworkStatus) {
    this.client = new ChatJSClient(chatDetails, customNetworkStatus)
    this.contactId = this.client.getContactId()
    this.thisParticipant = {
      participantId: this.client.getParticipantId(),
      displayName,
    }
  }

  // Public event subscription methods
  on(eventType, handler) {
    if (this._eventHandlers[eventType]?.indexOf(handler) === -1) {
      this._eventHandlers[eventType].push(handler)
    }
  }

  off(eventType, handler) {
    const idx = this._eventHandlers[eventType]?.indexOf(handler)
    if (idx > -1) {
      this._eventHandlers[eventType].splice(idx, 1)
    }
  }

  // Convenience event handlers
  onChatDisconnected(callback) {
    this.on('chat-disconnected', callback)
  }

  onChatClose(callback) {
    this.on('chat-closed', callback)
  }

  onIncoming(callback) {
    this.on('incoming-message', callback)
  }

  onOutgoing(callback) {
    this.on('outgoing-message', callback)
  }

  // Item decorators (can be overridden)
  incomingItemDecorator(item) {
    return item
  }

  outgoingItemDecorator(item) {
    return item
  }

  // Chat lifecycle methods
  openChatSession() {
    this._addEventListeners()
    this._updateContactStatus(CONTACT_STATUS.CONNECTING)

    return this.client
      .connect()
      .then((response) => {
        this._updateContactStatus(CONTACT_STATUS.CONNECTED)
        return response
      })
      .catch((error) => {
        this._updateContactStatus(CONTACT_STATUS.DISCONNECTED)
        return Promise.reject(error)
      })
  }

  async endChat(callback) {
    await this.client.disconnect().catch(callback)
    this._updateContactStatus(CONTACT_STATUS.DISCONNECTED)
    callback()
    this._triggerEvent('chat-disconnected')
    this._triggerEvent('chat-closed')
  }

  closeChat() {
    this._triggerEvent('chat-closed')
  }

  // Message sending methods
  sendTypingEvent() {
    return this.client.sendTypingEvent()
  }

  sendReadReceipt(messageId, options) {
    return this.client.sendReadReceipt(messageId, options)
  }

  sendDeliveredReceipt(messageId, options) {
    return this.client.sendDeliveredReceipt(messageId, options)
  }

  addOutgoingMessage(data) {
    const message = modelUtils.createOutgoingTranscriptItem(
      PARTICIPANT_MESSAGE,
      {
        data: data.text,
        type: data.type || ContentType.MESSAGE_CONTENT_TYPE.TEXT_PLAIN,
      },
      this.thisParticipant
    )

    this._addItemsToTranscript([message])
    this.isOutgoingMessageInFlight = true

    this.client
      .sendMessage(message.content)
      .then((response) => {
        this._replaceItemInTranscript(message, modelUtils.createTranscriptItemFromSuccessResponse(message, response))
        this.isOutgoingMessageInFlight = false
        return response
      })
      .catch(() => {
        this.isOutgoingMessageInFlight = false
        this._failMessage(message)
      })
  }

  addOutgoingAttachment(attachment) {
    const transcriptItem = modelUtils.createOutgoingTranscriptItem(ATTACHMENT_MESSAGE, attachment, this.thisParticipant)
    this._addItemsToTranscript([transcriptItem])
    return this.sendAttachment(transcriptItem)
  }

  sendAttachment(transcriptItem) {
    const { participantId, displayName } = this.thisParticipant

    return this.client
      .sendAttachment(transcriptItem.content)
      .then((response) => {
        this.transcript.splice(this.transcript.indexOf(transcriptItem), 1)
        return response
      })
      .catch((error) => {
        transcriptItem.transportDetails.error = {
          type: error.type,
          message: error.message,
        }

        if (error.type !== AttachmentErrorType.ValidationException) {
          if (error.type === AttachmentErrorType.ServiceQuotaExceededException) {
            transcriptItem.transportDetails.error.message =
              'Attachment failed to send. The maximum number of attachments allowed, has been reached'
          } else {
            transcriptItem.transportDetails.error.message = 'Attachment failed to send'
            transcriptItem.transportDetails.error.retry = () => {
              const newTranscriptItem = modelUtils.createOutgoingTranscriptItem(
                ATTACHMENT_MESSAGE,
                transcriptItem.content,
                { displayName, participantId }
              )
              newTranscriptItem.id = transcriptItem.id
              this._replaceItemInTranscript(transcriptItem, newTranscriptItem)
              this.sendAttachment(newTranscriptItem)
            }
          }
        }

        this._failMessage(transcriptItem)
      })
  }

  downloadAttachment(attachmentId) {
    return this.client.downloadAttachment(attachmentId)
  }

  loadPreviousTranscript() {
    return this._loadTranscript({
      scanDirection: 'BACKWARD',
      sortOrder: 'ASCENDING',
      maxResults: 15,
    })
  }

  // Private event handling methods
  _triggerEvent(eventType, payload) {
    this._eventHandlers[eventType]?.forEach((handler) => handler(payload))
  }

  _updateContactStatus(contactStatus) {
    this.contactStatus = contactStatus
    this._triggerEvent('contact-status-changed', contactStatus)
  }

  _updateTranscript(transcript) {
    this.transcript = transcript
    this._triggerEvent('transcript-changed', transcript)
  }

  _updateTypingParticipants(typingParticipants) {
    this.typingParticipants = typingParticipants
    this._triggerEvent('typing-participants-changed', typingParticipants)
  }

  // Event listeners setup
  _addEventListeners() {
    this.client.onMessage((data) => this._handleIncomingData(data))
    this.client.onTyping((data) => this._handleTypingEvent(data))
    this.client.onReadReceipt((data) => this._handleMessageReceipt('read', data))
    this.client.onDeliveredReceipt((data) => this._handleMessageReceipt('delivered', data))
    this.client.onEnded(() => this._handleEndedEvent())
    this.client.onConnectionEstablished(() => this._loadLatestTranscript())
  }

  // Transcript management
  _loadLatestTranscript() {
    return this._loadTranscript({
      scanDirection: 'BACKWARD',
      sortOrder: 'ASCENDING',
      maxResults: 15,
    })
  }

  _loadTranscript(args) {
    if (this.nextToken) {
      args.nextToken = this.nextToken
    }

    return this.client
      .getTranscript(args)
      .then((response) => {
        const incomingDataList = response.data.Transcript
        this.nextToken = response.data.NextToken

        const transcriptItems = incomingDataList.map((data) =>
          modelUtils.createItemFromIncoming(data, this.thisParticipant)
        )

        this._addItemsToTranscript(transcriptItems)
        return transcriptItems
      })
      .catch((err) => {
        console.log('Transcript fetch error:', err)
      })
  }

  // Message handling
  _handleIncomingData(dataInput) {
    const { data } = dataInput
    const item = modelUtils.createItemFromIncoming(data, this.thisParticipant)

    if (!item) return

    // Handle typing indicators and receipts
    if (!this._isRoundtripMessage(data)) {
      this._updateTypingParticipantsUsingIncoming(item)
    }

    // Trigger appropriate events
    const { transportDetails, type, participantRole, id } = item
    if (transportDetails.direction === Direction.Incoming) {
      this._triggerEvent('incoming-message', data)

      // Send delivery receipt for messages from agents
      if (modelUtils.isTypeMessageOrAttachment(type) && modelUtils.isParticipantAgentOrCustomer(participantRole)) {
        this.sendDeliveredReceipt(id, type === ATTACHMENT_MESSAGE ? { disableThrottle: true } : {})
      }
    } else {
      this._triggerEvent('outgoing-message', data)
    }

    // Add to transcript unless it's an in-flight customer message
    const shouldBypassAddItemToTranscript =
      this.isOutgoingMessageInFlight === true && item.participantRole === PARTICIPANT_TYPES.CUSTOMER

    if (!shouldBypassAddItemToTranscript) {
      this._addItemsToTranscript([item])
    }
  }

  _handleMessageReceipt(messageReceiptType, dataInput) {
    const messageReceiptData = dataInput.data
    const messageId = messageReceiptData.MessageMetadata.MessageId
    const oldItemInTranscript = this._findItemInTranscriptUsingMessageId(messageId)

    if (oldItemInTranscript === -1) return

    // Create and update receipt item
    const { sentTime } = oldItemInTranscript.transportDetails
    this._handleMessageReceiptLatencyMetric(messageReceiptType, dataInput, sentTime)

    const newItem = modelUtils.createIncomingTranscriptReceiptItem(
      this.thisParticipant,
      oldItemInTranscript,
      messageReceiptData,
      messageReceiptType
    )

    this._replaceItemInTranscript(oldItemInTranscript, newItem, messageReceiptType)
  }

  _handleMessageReceiptLatencyMetric(messageReceiptType, dataInput, sentTime) {
    const {
      chatDetails: { participantId },
      data: {
        MessageMetadata: { Receipts },
      },
    } = dataInput

    if (Receipts.length > 0) {
      const receipt = this._findReceipt(Receipts, participantId)
      if (receipt) {
        const { DeliveredTimestamp, ReadTimestamp } = receipt
        const timeDifference =
          messageReceiptType === 'read'
            ? getTimeFromTimeStamp(ReadTimestamp) - sentTime * 1000
            : getTimeFromTimeStamp(DeliveredTimestamp) - sentTime * 1000
      }
    }
  }

  _findReceipt(receipts, participantId) {
    return receipts.find((receipt) => receipt.RecipientParticipantId !== participantId)
  }

  _failMessage(message) {
    // Calculate timestamp for failed message
    const sentTime =
      this.transcript.length > 0 ? this.transcript[this.transcript.length - 1].transportDetails.sentTime + 0.001 : 0

    this._replaceItemInTranscript(message, modelUtils.createFailedItem(message, sentTime))
  }

  _isRoundtripMessage(item) {
    return this.thisParticipant.participantId === item.ParticipantId
  }

  _isRoundTripSystemEvent(item) {
    const SYSTEM_EVENTS = Object.values(ContentType.EVENT_CONTENT_TYPE)
    return SYSTEM_EVENTS.indexOf(item.contentType) !== -1 && this.thisParticipant.participantId === item.participantId
  }

  // Transcript manipulation
  _addItemsToTranscript(items) {
    if (items.length === 0) return

    // Filter out system events from this participant
    items = items.filter((item) => !this._isRoundTripSystemEvent(item))

    // Create map of new items by ID
    const newItemMap = items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})

    // Merge with existing transcript
    const newTranscript = [...this.transcript.filter((item) => newItemMap[item.id] === undefined), ...items]

    // Sort by timestamp, with sending messages at the end
    newTranscript.sort((a, b) => {
      const isASending = a.transportDetails.status === Status.Sending
      const isBSending = b.transportDetails.status === Status.Sending

      if ((isASending && !isBSending) || (!isASending && isBSending)) {
        return isASending ? 1 : -1
      }

      return a.transportDetails.sentTime - b.transportDetails.sentTime
    })

    // Apply decorators and reset receipt flags
    newTranscript.forEach((item) => {
      if (item.transportDetails.direction === Direction.Incoming) {
        item = this.incomingItemDecorator(item)
      } else {
        item = this.outgoingItemDecorator(item)
      }
      item.lastReadReceipt = false
      item.lastDeliveredReceipt = false
    })

    // Handle read/delivered receipts
    const lastReadMessageIdx = this._findLastMessageReceiptInTranscript('read', newTranscript)
    const lastDeliveredMessageIdx = this._findLastMessageReceiptInTranscript('delivered', newTranscript)
    const lastIncomingMessageIdx = this._findLastMessageInTranscript(Direction.Incoming, newTranscript)
    const lastOutgoingMessageIdx = this._findLastMessageInTranscript(Direction.Outgoing, newTranscript)

    // Send read receipt if needed
    if (lastIncomingMessageIdx !== -1 && lastOutgoingMessageIdx > lastIncomingMessageIdx) {
      const { type, id } = newTranscript[lastIncomingMessageIdx]
      this.sendReadReceipt(id, type === ATTACHMENT_MESSAGE ? { disableThrottle: true } : {})
    }

    // Mark last read message
    if (lastReadMessageIdx !== -1) {
      newTranscript[lastReadMessageIdx].lastReadReceipt = true
    }

    // Mark last delivered message (only if not already read)
    if (lastDeliveredMessageIdx !== -1 && lastReadMessageIdx < lastDeliveredMessageIdx) {
      newTranscript[lastDeliveredMessageIdx].lastDeliveredReceipt = true
    }

    this._updateTranscript(newTranscript)
  }

  _replaceItemInTranscript(oldItem, newItem) {
    const idx = this.transcript.indexOf(oldItem)
    if (idx > -1) {
      this.transcript.splice(idx, 1)
    }
    this._addItemsToTranscript([newItem])
  }

  _findItemInTranscriptUsingMessageId(messageId) {
    const index = this.transcript.findIndex((transcript) => transcript.id === messageId)
    return index !== -1 ? this.transcript[index] : -1
  }

  _findLastMessageReceiptInTranscript(messageReceiptType, transcript) {
    for (let i = transcript.length - 1; i >= 0; i--) {
      const { transportDetails } = transcript[i]
      if (
        transportDetails &&
        transportDetails.direction === Direction.Outgoing &&
        transportDetails.messageReceiptType === messageReceiptType
      ) {
        return i
      }
    }
    return -1
  }

  _findLastMessageInTranscript(direction, transcript) {
    for (let i = transcript.length - 1; i >= 0; i--) {
      const { transportDetails } = transcript[i]
      if (transportDetails && transportDetails.direction === direction) {
        return i
      }
    }
    return -1
  }

  // Event handlers
  _handleEndedEvent() {
    this._updateContactStatus(CONTACT_STATUS.ENDED)
    this._triggerEvent('chat-disconnected')
  }

  _handleTypingEvent(dataInput) {
    const { data } = dataInput
    if (this._isRoundtripMessage(data)) return

    // Create typing participant with timeout
    const incomingTypingParticipant = modelUtils.createTypingParticipant(data, this.thisParticipant.participantId)

    incomingTypingParticipant.callback = setTimeout(() => {
      this._removeTypingParticipant(incomingTypingParticipant.participantId)
    }, 12000)

    // Update typing participants list
    const newTypingParticipants = []
    for (const existingParticipant of this.typingParticipants) {
      if (existingParticipant.participantId === incomingTypingParticipant.participantId) {
        clearTimeout(existingParticipant.callback)
      } else {
        newTypingParticipants.push(existingParticipant)
      }
    }

    newTypingParticipants.push(incomingTypingParticipant)
    this._updateTypingParticipants(newTypingParticipants)
  }

  _updateTypingParticipantsUsingIncoming(item) {
    if (item.type === PARTICIPANT_MESSAGE) {
      this._removeTypingParticipant(item.participantId)
    }
  }

  _removeTypingParticipant() {
    this._updateTypingParticipants([])
  }
}

export default ChatSession
