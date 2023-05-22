// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import 'amazon-connect-chatjs' // ^1.5.0

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
import { ENABLE_CHATJS_LOGS, loggerConfig } from '../../config'

const SYSTEM_EVENTS = Object.values(ContentType.EVENT_CONTENT_TYPE)

// Low-level abstraction on top of Chat.JS
class ChatJSClient {
  session = null

  constructor(chatDetails, region, customNetworkStatus) {
    connect.ChatSession.setGlobalConfig({
      ...(ENABLE_CHATJS_LOGS ? { loggerConfig: loggerConfig } : {}),
      webSocketManagerConfig: {
        isNetworkOnline: customNetworkStatus,
      },
    })

    if (chatDetails) {
      const startChatDetails = {
        contactId: chatDetails.startChatResult.ContactId,
        participantId: chatDetails.startChatResult.ParticipantId,
        participantToken: chatDetails.startChatResult.ParticipantToken,
      }

      console.log('startChatResult:', JSON.stringify(startChatDetails, null, 2))
      this.session = connect.ChatSession.create({
        chatDetails: startChatDetails,
        disableCSM: true, // please refer to the "Client Side Metrics Support" README section
        type: 'CUSTOMER',
        options: { region },
      })
    } else {
      alert('Unable to init ChatJSSession')
    }
  }

  connect() {
    // Intiate the websocket connection. After the connection is established, the customer's chat request
    // will be routed to an agent who can then accept the request.
    return this.session.connect()
  }

  disconnect() {
    return this.session.disconnectParticipant()
  }

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

  getContactId() {
    return this.session.controller.contactId
  }

  getParticipantId() {
    return this.session.getChatDetails().participantId
  }

  getTranscript(args) {
    return this.session.getTranscript(args)
  }

  sendTypingEvent() {
    return this.session.sendEvent({
      contentType: ContentType.EVENT_CONTENT_TYPE.TYPING,
    })
  }

  sendReadReceipt(messageId, options = {}) {
    return this.session.sendEvent({
      contentType: ContentType.EVENT_CONTENT_TYPE.READ_RECEIPT,
      content: JSON.stringify({
        messageId,
        ...options,
      }),
    })
  }

  sendDeliveredReceipt(messageId, options = {}) {
    return this.session.sendEvent({
      contentType: ContentType.EVENT_CONTENT_TYPE.DELIVERED_RECEIPT,
      content: JSON.stringify({
        messageId,
        ...options,
      }),
    })
  }

  sendMessage(content) {
    // Right now we are assuming only text messages,
    // later we will have to add functionality for other types.
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

class ChatSession {
  transcript = []

  typingParticipants = []

  thisParticipant = null

  client = null

  contactId = null

  contactStatus = CONTACT_STATUS.DISCONNECTED

  nextToken = null

  /**
   * Flag set when an outgoing message from the Customer is in flight.
   * Until the request completes, we will not render a Customer message over the websocket.
   *
   * @type {boolean}
   */
  isOutgoingMessageInFlight = false

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
    this.client = new ChatJSClient(chatDetails, region, customNetworkStatus)
    this.contactId = this.client.getContactId()
    this.thisParticipant = {
      participantId: this.client.getParticipantId(),
      displayName,
    }
  }

  // Callbacks
  onChatDisconnected(callback) {
    this.on('chat-disconnected', (...rest) => {
      callback(...rest)
    })
  }

  onChatClose(callback) {
    this.on('chat-closed', (...rest) => {
      callback(...rest)
    })
  }

  onIncoming(callback) {
    this.on('incoming-message', (...rest) => {
      callback(...rest)
    })
  }

  onOutgoing(callback) {
    this.on('outgoing-message', (...rest) => {
      callback(...rest)
    })
  }

  // Decoratorers
  incomingItemDecorator(item) {
    return item
  }

  outgoingItemDecorator(item) {
    return item
  }

  // CHAT API
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

  sendTypingEvent() {
    this.logger && this.logger.info('Calling SendEvent API for Typing')
    return this.client.sendTypingEvent()
  }

  sendReadReceipt(messageId, options) {
    this.logger && this.logger.info('Calling SendEvent API for ReadReceipt', messageId, options)
    return this.client.sendReadReceipt(messageId, options)
  }

  sendDeliveredReceipt(messageId, options) {
    this.logger && this.logger.info('Calling SendEvent API for DeliveredReceipt', messageId, options)
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
    this.logger && this.logger.info(`Adding outgoing message. ContactId: ${this.contactId}`)

    this._addItemsToTranscript([message])

    this.isOutgoingMessageInFlight = true

    this.client
      .sendMessage(message.content)
      .then((response) => {
        console.log('send success')
        console.log(response)
        this._replaceItemInTranscript(message, modelUtils.createTranscriptItemFromSuccessResponse(message, response))

        this.isOutgoingMessageInFlight = false
        return response
      })
      .catch((error) => {
        this.isOutgoingMessageInFlight = false

        this._failMessage(message)
      })
  }

  addOutgoingAttachment(attachment) {
    const transcriptItem = modelUtils.createOutgoingTranscriptItem(ATTACHMENT_MESSAGE, attachment, this.thisParticipant)
    this._addItemsToTranscript([transcriptItem])
    this.logger && this.logger.info(`Sending File. ContactId: ${this.contactId}.`)
    return this.sendAttachment(transcriptItem)
  }

  sendAttachment(transcriptItem) {
    const { participantId, displayName } = this.thisParticipant
    return this.client
      .sendAttachment(transcriptItem.content)
      .then((response) => {
        console.log('RESPONSE', response)
        console.log('sendAttachment response:', response)
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
    console.log('loadPreviousTranscript in single')
    const args = {}
    args.scanDirection = 'BACKWARD'
    args.sortOrder = 'ASCENDING'
    args.maxResults = 15
    return this._loadTranscript(args)
  }

  // EVENT HANDLING

  on(eventType, handler) {
    this.logger && this.logger.info(`Event [${eventType}] is on!`)
    if (this._eventHandlers[eventType].indexOf(handler) === -1) {
      this._eventHandlers[eventType].push(handler)
    }
  }

  off(eventType, handler) {
    this.logger && this.logger.info(`Event [${eventType}] is off!`)
    const idx = this._eventHandlers[eventType].indexOf(handler)
    if (idx > -1) {
      this._eventHandlers[eventType].splice(idx, 1)
    }
  }

  _triggerEvent(eventType, payload) {
    this.logger && this.logger.info(`Event [${eventType}] is triggered!`)
    this._eventHandlers[eventType].forEach((handler) => {
      handler(payload)
    })
  }

  _updateTranscript(transcript) {
    this.transcript = transcript
    this._triggerEvent('transcript-changed', transcript)
  }

  _updateTypingParticipants(typingParticipants) {
    this.typingParticipants = typingParticipants
    this._triggerEvent('typing-participants-changed', typingParticipants)
  }

  _updateContactStatus(contactStatus) {
    this.contactStatus = contactStatus
    this._triggerEvent('contact-status-changed', contactStatus)
  }

  _addEventListeners() {
    this.client.onMessage((data) => {
      this._handleIncomingData(data)
    })
    this.client.onTyping((data) => {
      this._handleTypingEvent(data)
    })

    this.client.onReadReceipt((data) => {
      this._handleMessageReceipt('read', data)
    })
    this.client.onDeliveredReceipt((data) => {
      this._handleMessageReceipt('delivered', data)
    })

    this.client.onEnded((data) => {
      this._handleEndedEvent(data)
    })
    this.client.onConnectionEstablished(() => {
      this._loadLatestTranscript()
    })
  }

  // TRANSCRIPT
  _loadLatestTranscript() {
    console.log('loadPreviousTranscript in single')
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
        const transcriptItems = incomingDataList.map((data) => {
          const transcriptItem = modelUtils.createItemFromIncoming(data, this.thisParticipant)
          return transcriptItem
        })
        this._addItemsToTranscript(transcriptItems)
        return transcriptItems
      })
      .catch((err) => {
        console.log('CustomerUI', 'ChatSession', 'transcript fetch error: ', err)
      })
  }

  _handleIncomingData(dataInput) {
    const { data } = dataInput
    const item = modelUtils.createItemFromIncoming(data, this.thisParticipant)

    console.log('_handleIncomingData item created')
    console.log(item)

    if (item) {
      if (!this._isRoundtripMessage(data)) {
        this._updateTypingParticipantsUsingIncoming(item)
      }
      console.log('_handleIncomingData item created')

      const { transportDetails, type, participantRole } = item
      if (transportDetails.direction === Direction.Incoming) {
        this._triggerEvent('incoming-message', data)
        if (modelUtils.isTypeMessageOrAttachment(type) && modelUtils.isParticipantAgentOrCustomer(participantRole)) {
          this.sendDeliveredReceipt(
            item.id,
            type === ATTACHMENT_MESSAGE
              ? {
                  disableThrottle: true,
                }
              : {}
          )
        }
      } else {
        this._triggerEvent('outgoing-message', data)
      }

      const shouldBypassAddItemToTranscript =
        this.isOutgoingMessageInFlight === true && item.participantRole === PARTICIPANT_TYPES.CUSTOMER

      if (!shouldBypassAddItemToTranscript) {
        this._addItemsToTranscript([item])
      }
    } else {
      console.log('_handleIncomingData NOT NOT item created')
    }
  }

  _handleMessageReceipt(messageReceiptType, dataInput) {
    const messageReceiptData = dataInput.data
    const messageId = messageReceiptData.MessageMetadata.MessageId
    const oldItemInTranscript = this._findItemInTranscriptUsingMessageId(messageId)

    if (oldItemInTranscript === -1) {
      this.logger && this.logger.debug(`Message with messageId:${messageId} not found in transcript`)
      return
    }
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
        this.logger && this.logger.info(messageReceiptType, timeDifference)
      }
    }
  }

  _findReceipt(receipts, participantId) {
    return receipts.find((receipt) => receipt.RecipientParticipantId !== participantId)
  }

  _failMessage(message) {
    // Failed messages are going to be inserted into the transcript with a fake timestamp
    // that is 1ms higher than the timestamp of the last existing message or 0 if no such
    // message exists.
    const sentTime =
      this.transcript.length > 0 ? this.transcript[this.transcript.length - 1].transportDetails.sentTime + 0.001 : 0
    this._replaceItemInTranscript(message, modelUtils.createFailedItem(message, sentTime))
  }

  _isRoundTripSystemEvent(item) {
    return SYSTEM_EVENTS.indexOf(item.contentType) !== -1 && this.thisParticipant.participantId === item.participantId
  }

  _addItemsToTranscript(items) {
    const self = this

    if (items.length === 0) {
      return
    }

    items = items.filter((item) => !this._isRoundTripSystemEvent(item))

    const newItemMap = items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})

    const newTranscript = this.transcript.filter((item) => newItemMap[item.id] === undefined)

    newTranscript.push(...items)
    newTranscript.sort((a, b) => {
      const isASending = a.transportDetails.status === Status.Sending
      const isBSending = b.transportDetails.status === Status.Sending
      if ((isASending && !isBSending) || (!isASending && isBSending)) {
        return isASending ? 1 : -1
      }
      return a.transportDetails.sentTime - b.transportDetails.sentTime
    })

    newTranscript.forEach((item) => {
      if (item.transportDetails.direction === Direction.Incoming) {
        item = self.incomingItemDecorator(item)
      } else {
        item = self.outgoingItemDecorator(item)
      }
      item.lastReadReceipt = false
      item.lastDeliveredReceipt = false
    })

    // add Read/Delivered only to the last messageId
    const lastReadMessageIdx = this._findLastMessageReceiptInTranscript('read', newTranscript)
    const lastDeliveredMessageIdx = this._findLastMessageReceiptInTranscript('delivered', newTranscript)

    const lastIncomingMessageIdx = this._findLastMessageInTranscript(Direction.Incoming, newTranscript)
    const lastOutgoingMessageIdx = this._findLastMessageInTranscript(Direction.Outgoing, newTranscript)

    // Corner case: lastMessage is not read and Customer typed a new message
    // so we need to explicitly fire readReceipt for the last received/incoming message.
    // Note: ChatJS has a mapper and prevents duplicate event if its already fired!
    if (lastIncomingMessageIdx !== -1 && lastOutgoingMessageIdx > lastIncomingMessageIdx) {
      const { type, id } = newTranscript[lastIncomingMessageIdx]
      this.sendReadReceipt(id, type === ATTACHMENT_MESSAGE ? { disableThrottle: true } : {})
    }

    if (lastReadMessageIdx !== -1) {
      newTranscript[lastReadMessageIdx].lastReadReceipt = true
    }
    // Read has higher priority - only show Read message
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
    if (index !== -1) {
      return this.transcript[index]
    }
    return -1
  }

  _findLastMessageReceiptInTranscript(messageReceiptType, transcript) {
    const size = transcript.length - 1
    let lastReceiptIdx = -1
    for (let index = size; index >= 0; index--) {
      const { transportDetails } = transcript[index]
      if (
        transportDetails &&
        transportDetails.direction === Direction.Outgoing &&
        transportDetails.messageReceiptType === messageReceiptType
      ) {
        lastReceiptIdx = index
        break
      }
    }
    return lastReceiptIdx
  }

  _findLastMessageInTranscript(direction, transcript) {
    const size = transcript.length - 1
    let lastReceiptIdx = -1
    for (let index = size; index >= 0; index--) {
      const { transportDetails } = transcript[index]

      if (transportDetails && transportDetails.direction === direction) {
        lastReceiptIdx = index
        break
      }
    }
    return lastReceiptIdx
  }

  _isRoundtripMessage(item) {
    return this.thisParticipant.participantId === item.ParticipantId
  }

  /** called when transcript has chat ended message */
  _handleEndedEvent() {
    this._updateContactStatus(CONTACT_STATUS.ENDED)
    this._triggerEvent('chat-disconnected')
  }

  // TYPING PARTICIPANTS

  _handleTypingEvent(dataInput) {
    const { data } = dataInput
    if (this._isRoundtripMessage(data)) {
      return
    }
    const incomingTypingParticipant = modelUtils.createTypingParticipant(data, this.thisParticipant.participantId)
    incomingTypingParticipant.callback = setTimeout(() => {
      this._removeTypingParticipant(incomingTypingParticipant.participantId)
    }, 12 * 1000)
    const newTypingParticipants = []
    for (let i = 0; i < this.typingParticipants.length; i++) {
      const existingParticipantTyping = this.typingParticipants[i]
      if (existingParticipantTyping.participantId === incomingTypingParticipant.participantId) {
        clearTimeout(existingParticipantTyping.callback)
      } else {
        newTypingParticipants.push(existingParticipantTyping)
      }
    }
    newTypingParticipants.push(incomingTypingParticipant)
    this._updateTypingParticipants(newTypingParticipants)
    console.log('this.typingParticipants')
    console.log(this.typingParticipants)
  }

  _updateTypingParticipantsUsingIncoming(item) {
    if (item.type === PARTICIPANT_MESSAGE) {
      this._removeTypingParticipant(item.participantId)
    }
  }

  _removeTypingParticipant(participantId) {
    // this.typingParticipants = this.typingParticipants.filter(
    //  tp => tp.participantDetails.participantId !== participantId
    // );
    this._updateTypingParticipants([])
  }
}

export default ChatSession
