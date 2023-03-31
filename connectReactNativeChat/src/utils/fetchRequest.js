// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

function parseJSON(response) {
  return new Promise((resolve) =>
    response.json().then((json) =>
      resolve({
        status: response.status,
        ok: response.ok,
        json,
      })
    )
  )
}

function request(url, options) {
  return new Promise((resolve, reject) => {
    window
      .fetch(url, options)
      .then(parseJSON)
      .then((response) => (response.ok ? resolve(response) : reject(response)))
      .catch((error) =>
        reject({
          networkError: error.message,
        })
      )
  })
}

export default request
