// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import Foundation

class HttpHeader {}

extension HttpHeader {
    
    enum Key: String {
        case contentEncoding = "Content-Encoding"
        case contentType = "Content-Type"
        case wafToken = "x-aws-waf-token"
        case amzBearer = "X-Amz-Bearer"
    }
}

extension HttpHeader {
    
    enum Value: String {
        case amzEncoding = "amz-1.0"
        case jsonContentType = "Application/json"
    }
}
