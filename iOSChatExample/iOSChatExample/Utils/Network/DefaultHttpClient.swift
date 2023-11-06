//  DefaultHttpClient.swift

import Foundation
import os

class DefaultHttpClient: HttpClient {
    
    // Retryable http codes: https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html
    private let retryableHttpCodes: Set<Int> = [400, 403, 408, 429, 500, 502, 503, 504, 509]
    private let maxRetry = 2
    
    func getJson<R: Decodable>(_ urlString: String,
                               _ onSuccess: @escaping (_ data: R) -> Void,
                               _ onFailure: @escaping (_ error: Error) -> Void) {
        guard let request = createGetRequest(urlString) else {
            let error = NSError(domain: "aws.amazon.com", code: 400)
            onFailure(error)
            return
        }

        send(request, 0, onSuccess, onFailure)
    }
    
    func postJson<B: Encodable, R: Decodable>(_ urlString: String,
                                              _ headers: HttpHeaders?,
                                              _ body: B,
                                              _ onSuccess: @escaping (_ data: R) -> Void,
                                              _ onFailure: @escaping (_ error: Error) -> Void) {
        
        guard let request = createPostRequest(urlString, headers, body) else {
            let error = NSError(domain: "aws.amazon.com", code: 400)
            onFailure(error)
            return
        }
        send(request, 0, onSuccess, onFailure)
    }
    
    func postJson(_ urlString: String,
                  _ headers: HttpHeaders?,
                  _ body: [String: String]?,
                  _ onSuccess: @escaping () -> Void,
                  _ onFailure: @escaping (_ error: Error) -> Void) {
        
        guard let request = createPostRequest(urlString, headers, body) else {
            let error = NSError(domain: "aws.amazon.com", code: 400)
            onFailure(error)
            return
        }
        send(request, 0, onSuccess, onFailure)
    }
    
    func postJson<R: Decodable>(_ urlString: String,
                                _ headers: HttpHeaders?,
                                _ body: [String: String]?,
                                _ onSuccess: @escaping (_ data: R) -> Void,
                                _ onFailure: @escaping (_ error: Error) -> Void) {
        guard let request = createPostRequest(urlString, headers, body) else {
            let error = NSError(domain: "aws.amazon.com", code: 400)
            onFailure(error)
            return
        }
        send(request, 0, onSuccess, onFailure)
    }
    
    func send(_ request: URLRequest,
              _ retryCount: Int,
              _ onSuccess: @escaping () -> Void,
              _ onFailure: @escaping (_ error: Error) -> Void) {
        send(request, retryCount) { _ in
            onSuccess()
        } _: { error in
            onFailure(error)
        }
    }
    
    func send<R: Decodable>(_ request: URLRequest,
                            _ retryCount: Int,
                            _ onSuccess: @escaping (_ data: R) -> Void,
                            _ onFailure: @escaping (_ error: Error) -> Void) {
        send(request, retryCount) { data in
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .secondsSince1970
            decoder.dateDecodingStrategy = .formatted(Formatter.iso8601)
            do {
                // TODO: pass logger instead
                if #available(iOS 14.0, *) {
                    let responseString = (String(data: data, encoding: String.Encoding.utf8) ?? "") as String
                    let logger = Logger()
                    logger.debug("HTTP response: \(responseString)")
                } else {
                    // Fallback on earlier versions
                }
                let decodedData = try decoder.decode(R.self, from: data)
                onSuccess(decodedData)
            } catch {
                onFailure(error)
            }
        } _: { error in
            onFailure(error)
        }
    }
    
    func send(_ request: URLRequest,
              _ retryCount: Int,
              _ onSuccess: @escaping (_ data: Data) -> Void,
              _ onFailure: @escaping (_ error: Error) -> Void) {
        let retryFailure: (Int) -> Void = { (httpCode) in
            if retryCount < self.maxRetry && self.retryableHttpCodes.contains(httpCode) {
                self.send(request, retryCount + 1, onSuccess, onFailure)
            } else {
                let error = NSError(domain: "aws.amazon.com",code: httpCode)
                onFailure(error)
            }
        }
        let session = URLSession.shared
        session.dataTask(with: request) { (data, response, error) in
            let code = (response as? HTTPURLResponse)?.statusCode ?? 500
            if code < 200 || code >= 300 {
                retryFailure(code)
                return
            }
            if let error = error {
                onFailure(error)
                return
            }
            guard let data = data else {
                let error = NSError(domain: "aws.amazon.com",code: 500)
                onFailure(error)
                return
            }
            onSuccess(data)
        }.resume()
    }
    
    private func createGetRequest(_ urlString: String) -> URLRequest? {
        guard let serviceUrl = URL(string: urlString) else { return nil }
        
        var request = URLRequest(url: serviceUrl)
        request.httpMethod = HttpMethod.get.rawValue
        request.httpShouldHandleCookies = true
        request.setValue(HttpHeader.Value.jsonContentType.rawValue,
                         forHTTPHeaderField: HttpHeader.Key.contentType.rawValue)
        return request
    }
    
    private func createPostRequest(_ urlString: String,
                                   _ headers: HttpHeaders?,
                                   _ body: Encodable?) -> URLRequest? {
        guard let serviceUrl = URL(string: urlString) else { return nil }
        
        var request = URLRequest(url: serviceUrl)
        request.httpMethod = HttpMethod.post.rawValue
        request.httpShouldHandleCookies = true
        request.setValue(HttpHeader.Value.amzEncoding.rawValue,
                         forHTTPHeaderField: HttpHeader.Key.contentEncoding.rawValue)
        request.setValue(HttpHeader.Value.jsonContentType.rawValue,
                         forHTTPHeaderField: HttpHeader.Key.contentType.rawValue)
        if let headers = headers {
            for (headerKey, headerValue) in headers {
                request.setValue(headerValue, forHTTPHeaderField: headerKey.rawValue)
            }
        }
        
        // Print the entire request for debugging
        if let requestData = try? JSONSerialization.data(withJSONObject: request.allHTTPHeaderFields ?? [:], options: .prettyPrinted),
           let requestBody = String(data: requestData, encoding: .utf8) {
            print("Raw Request:")
            print("URL: \(request.url?.absoluteString ?? "N/A")")
            print("HTTP Method: \(request.httpMethod ?? "N/A")")
            print("Headers:\n\(requestBody)")
        }
        
        let encoder = JSONEncoder()
        if let body = body, let httpBody = try? encoder.encode(body) {
            request.httpBody = httpBody
        }
        
        
        return request
    }
}

private extension Formatter {
    static let iso8601: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .iso8601)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSXXXXX"
        return formatter
    }()
}
