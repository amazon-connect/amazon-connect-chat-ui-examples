//
//  HttpClient.swift

import Foundation

typealias HttpHeaders = [HttpHeader.Key: String]

protocol HttpClient {
    
    func getJson<R: Decodable>(_ urlString: String,
                               _ onSuccess: @escaping (_ data: R) -> Void,
                               _ onFailure: @escaping (_ error: Error) -> Void)
    
    func postJson(_ urlString: String,
                  _ headers: HttpHeaders?,
                  _ body: [String: String]?,
                  _ onSuccess: @escaping () -> Void,
                  _ onFailure: @escaping (_ error: Error) -> Void)
    
    func postJson<R: Decodable>(_ urlString: String,
                                _ headers: HttpHeaders?,
                                _ body: [String: String]?,
                                _ onSuccess: @escaping (_ data: R) -> Void,
                                _ onFailure: @escaping (_ error: Error) -> Void)
    
    func postJson<B: Encodable, R: Decodable>(_ urlString: String,
                                              _ headers: HttpHeaders?,
                                              _ body: B,
                                              _ onSuccess: @escaping (_ data: R) -> Void,
                                              _ onFailure: @escaping (_ error: Error) -> Void)
}
