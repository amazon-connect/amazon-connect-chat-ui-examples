//
//  NetworkConnectionManager.swift
//  iOSChatExample
//
//  Created by Liao, Michael on 4/16/24.
//

import Foundation
import Network

class NetworkConnectionManager: ObservableObject {
    static let shared = NetworkConnectionManager()
    private let queue = DispatchQueue.global()
    private let monitor: NWPathMonitor
    @Published var isConnected: Bool = false
    @Published var flag: Bool = false

    private init() {
        monitor = NWPathMonitor()
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                if (path.status == .satisfied) {
                    self?.isConnected = true
                    NotificationCenter.default.post(name: .networkConnected, object: nil)
                } else {
                    self?.isConnected = false
                    NotificationCenter.default.post(name: .networkDisconnected, object: nil)
                }
            }
        }
        monitor.start(queue: queue)
    }


    deinit {
        monitor.cancel()
    }
    
    func networkRestored() {
        
    }

    // Function to check connectivity
    func checkConnectivity() -> Bool {
        return isConnected
    }
}
