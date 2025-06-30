// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

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
                } else {
                    self?.isConnected = false
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
