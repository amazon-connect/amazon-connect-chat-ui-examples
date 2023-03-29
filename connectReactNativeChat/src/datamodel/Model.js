// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const PARTICIPANT_MESSAGE = 'MESSAGE'
export const CHAT_EVENT = 'EVENT'
export const ATTACHMENT_MESSAGE = 'ATTACHMENT'

export const PARTICIPANT_TYPES = {
  AGENT: 'AGENT',
  CUSTOMER: 'CUSTOMER',
}

export const ContentType = {
  EVENT_CONTENT_TYPE: {
    TYPING: 'application/vnd.amazonaws.connect.event.typing',
    READ_RECEIPT: 'application/vnd.amazonaws.connect.event.message.read',
    DELIVERED_RECEIPT: 'application/vnd.amazonaws.connect.event.message.delivered',
    PARTICIPANT_JOINED: 'application/vnd.amazonaws.connect.event.participant.joined',
    PARTICIPANT_LEFT: 'application/vnd.amazonaws.connect.event.participant.left',
    TRANSFER_SUCCEEDED: 'application/vnd.amazonaws.connect.event.transfer.succeeded',
    TRANSFER_FAILED: 'application/vnd.amazonaws.connect.event.transfer.failed',
    CONNECTION_ACKNOWLEDGED: 'application/vnd.amazonaws.connect.event.connection.acknowledged',
    CHAT_ENDED: 'application/vnd.amazonaws.connect.event.chat.ended',
  },
  MESSAGE_CONTENT_TYPE: {
    TEXT_PLAIN: 'text/plain',
    TEXT_MARKDOWN: 'text/markdown',
    APPLICATION_PDF: 'application/pdf',
    IMAGE_JPG: 'image/jpeg',
    IMAGE_PNG: 'image/png',
    APPLICATION_DOC: 'application/msword',
    APPLICATION_DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    APPLICATION_XLS: 'application/vnd.ms-excel',
    APPLICATION_XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    TEXT_CSV: 'text/csv',
    APPLICATION_PPT: 'application/vnd.ms-powerpoint',
    APPLICATION_PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    AUDIO_WAV: 'audio/wav',
    AUDIO_X_WAV: 'audio/x-wav', // Firefox
    AUDIO_VND_WAVE: 'audio/vnd.wave', // IE
    INTERACTIVE_MESSAGE: 'application/vnd.amazonaws.connect.message.interactive',
  },
}

ContentType.ATTACHMENT_CONTENT_TYPE = {
  TXT: ContentType.MESSAGE_CONTENT_TYPE.TEXT_PLAIN,
  PDF: ContentType.MESSAGE_CONTENT_TYPE.APPLICATION_PDF,
  JPG: ContentType.MESSAGE_CONTENT_TYPE.IMAGE_JPG,
  PNG: ContentType.MESSAGE_CONTENT_TYPE.IMAGE_PNG,
  DOC: ContentType.MESSAGE_CONTENT_TYPE.APPLICATION_DOC,
  DOCX: ContentType.MESSAGE_CONTENT_TYPE.APPLICATION_DOCX,
  XLS: ContentType.MESSAGE_CONTENT_TYPE.APPLICATION_XLS,
  XLSX: ContentType.MESSAGE_CONTENT_TYPE.APPLICATION_XLSX,
  CSV: ContentType.MESSAGE_CONTENT_TYPE.TEXT_CSV,
  PPT: ContentType.MESSAGE_CONTENT_TYPE.APPLICATION_PPT,
  PPTX: ContentType.MESSAGE_CONTENT_TYPE.APPLICATION_PPTX,
  WAV: ContentType.MESSAGE_CONTENT_TYPE.AUDIO_WAV,
  X_WAV: ContentType.MESSAGE_CONTENT_TYPE.AUDIO_X_WAV,
  VND_WAVE: ContentType.MESSAGE_CONTENT_TYPE.AUDIO_VND_WAVE,
}

// OpenXML content types do not show up in custom files list unless file extension is explicitly provided
export const ATTACHMENT_ACCEPT_CONTENT_TYPES = [
  ...Object.values(ContentType.ATTACHMENT_CONTENT_TYPE),
  '.docx',
  '.xlsx',
  '.pptx',
]

export const InteractiveMessageType = {
  LIST_PICKER: 'ListPicker',
  TIME_PICKER: 'TimePicker',
  PANEL: 'Panel',
}

export const Status = {
  Sending: 'Sending',
  SendSuccess: 'SendSuccess',
  SendFailed: 'SendFailed',
  Read: 'Read',
  // Delivered?
}

export const AttachmentStatus = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

export const Direction = {
  Outgoing: 'Outgoing',
  Incoming: 'Incoming',
}

export const AttachmentErrorType = {
  AccessDeniedException: 'AccessDeniedException',
  InternalServerException: 'InternalServerException',
  ThrottlingException: 'ThrottlingException',
  ValidationException: 'ValidationException',
  ServiceQuotaExceededException: 'ServiceQuotaExceededException',
  ResourceNotFoundException: 'ResourceNotFoundException',
  ConflictException: 'ConflictException',
}
export class TransportDetails {
  constructor(input) {
    const args = input || {}
    this.direction = args.direction
    this.readTime = args.readTime
    this.status = args.status
    this.sentTime = args.sentTime
  }
}

export class ItemDetails {
  constructor(input) {
    const args = input || {}
    this.id = args.id
    this.type = args.type
    this.content = args.content
    this.displayName = args.displayName
    this.participantId = args.participantId
    this.participantRole = args.participantRole
    this.transportDetails = args.transportDetails
  }
}
