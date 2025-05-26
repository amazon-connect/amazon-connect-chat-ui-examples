import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { ReadableStream, WritableStream, TransformStream } from 'web-streams-polyfill';

// Set up global Buffer
global.Buffer = Buffer;

// Set up stream polyfills
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;
global.TransformStream = TransformStream;

// Patch Response.prototype.arrayBuffer if it doesn't exist
if (typeof Response !== 'undefined' && !Response.prototype.arrayBuffer) {
  Response.prototype.arrayBuffer = async function () {
    const text = await this.text();
    return Buffer.from(text).buffer;
  };
}

// Patch fetch to ensure Response objects have arrayBuffer
const originalFetch = global.fetch;
global.fetch = async (...args) => {
  const response = await originalFetch(...args);

  if (!response.arrayBuffer) {
    response.arrayBuffer = async function () {
      const text = await this.text();
      return Buffer.from(text).buffer;
    };
  }

  return response;
};

// Ensure global ReadableStream is available
if (typeof ReadableStream === 'undefined') {
  global.ReadableStream = class ReadableStream {
    constructor() {
      // Minimal implementation
    }
  };
}

// Ensure Response constructor is available
if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, options = {}) {
      this._body = body;
      this.status = options.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
      this.headers = new Headers(options.headers);
    }

    async text() {
      return this._body.toString();
    }

    async json() {
      return JSON.parse(await this.text());
    }

    async arrayBuffer() {
      return Buffer.from(await this.text()).buffer;
    }
  };
}
