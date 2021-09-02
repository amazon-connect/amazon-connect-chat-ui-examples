/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

export const spacesToCamel = (s) =>
  s
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) =>
      i === 0 ? w.toLowerCase() : w.toUpperCase()
    )
    .replace(/\s+/g, "");

export const valueToOption = (value) => ({ value, label: value });

export const genLogger = (name) => ({
  trace: (...args) => console.trace(name, "-", ...args),
  error: (...args) => console.error(name, "-", ...args),
  warn: (...args) => console.warn(name, "-", ...args),
  log: (...args) => console.log(name, "-", ...args),
  info: (...args) => console.info(name, "-", ...args),
});