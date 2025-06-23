import 'react-native-get-random-values'; // polyfill for Crypto getRandomValues() method
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
import { ReadableStream } from "web-streams-polyfill";

//polyfill for readable stream
if (typeof global.ReadableStream !== 'function') {
  global.ReadableStream = ReadableStream;
}


//polyfill for arrayBuffer
if (!global.Response || !global.Response.prototype.arrayBuffer) {
  if (global.Response) {
    global.Response.prototype.arrayBuffer = function() {
      return Promise.resolve(this._bodyInit);
    };
  }
}

// Also ensure Blob has arrayBuffer method
if (global.Blob && !global.Blob.prototype.arrayBuffer) {
  global.Blob.prototype.arrayBuffer = function() {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsArrayBuffer(this);
    });
  };
}

//polyfill for text encoding
polyfillEncoding();
