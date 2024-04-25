//
//  HeartbeatManager.swift
//  iOSChatExample
//
//  Created by Liao, Michael on 4/25/24.
//

import Foundation

// MARK: - Heartbeat Manager

class HeartbeatManager {
    var pendingResponse: Bool = false
    var timer: Timer?
    let isDeepHeartbeat: Bool
    var sendHeartbeatCallback: () -> ()
    var missedHeartbeatCallback: () -> ()
    
    init(isDeepHeartbeat: Bool, sendHeartbeatCallback: @escaping () -> (), missedHeartbeatCallback: @escaping () -> ()) {
        self.isDeepHeartbeat = isDeepHeartbeat
        self.sendHeartbeatCallback = sendHeartbeatCallback
        self.missedHeartbeatCallback = missedHeartbeatCallback
    }
    
    func startHeartbeat() {
        self.timer?.invalidate()
        self.pendingResponse = false
        DispatchQueue.main.async {
            self.timer = Timer.scheduledTimer(withTimeInterval: 10.0, repeats: true) { _ in
                if !self.pendingResponse {
                    self.sendHeartbeatCallback()
                    self.pendingResponse = true
                } else {
                    self.timer?.invalidate()
                    self.missedHeartbeatCallback()
                }
            }
        }
    }
    
    func stopHeartbeat() {
        self.timer?.invalidate()
        self.pendingResponse = false
    }
    
    func heartbeatReceived() {
        self.pendingResponse = false
    }
}
