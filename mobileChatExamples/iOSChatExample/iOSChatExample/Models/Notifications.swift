//
//  Notifications.swift
//  iOSChatExample
//
//  Created by Liao, Michael on 4/19/24.
//

import Foundation

extension Notification.Name {
    // Network related notifications
    static let networkConnected = Notification.Name("networkConnected")
    static let networkDisconnected = Notification.Name("networkDisconnected")
    
    // Reconnect notification
    static let requestNewWsUrl = Notification.Name("requestNewWsUrl")
}
