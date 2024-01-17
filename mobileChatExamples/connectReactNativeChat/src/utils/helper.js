// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { ContentType } from '../datamodel/Model'

export function shouldDisplayMessageForType(correntType) {
  let isValid = false
  for (const key in ContentType.MESSAGE_CONTENT_TYPE) {
    if (ContentType.MESSAGE_CONTENT_TYPE[key] === correntType) {
      isValid = true
    }
  }
  return isValid
}

export function getTimeFromTimeStamp(timeStamp) {
  return new Date(timeStamp).getTime()
}
