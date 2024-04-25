// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation
import AWSConnectParticipant
import Starscream

enum EventTypes {
    static let subscribe = "{\"topic\": \"aws/subscribe\", \"content\": {\"topics\": [\"aws/chat\"]}})"
    static let heartbeat = "{\"topic\": \"aws/heartbeat\"}"
    static let deepHeartbeat = "{\"topic\": \"aws/ping\"}"
}

class WebsocketManager: NSObject {
    
    private var websocketTask: URLSessionWebSocketTask?
    private var session: URLSession?
    private var messageCallback: (Message)-> Void
    var isConnected = false
    var config = Config()
    private var heartbeatManager: HeartbeatManager?
    private var deepHeartbeatManager: HeartbeatManager?
    private var isReconnecting = false
    private var pendingNetworkReconnection = false
    private var wsUrl: String?
    private var intentionalDisconnect = false
    
    init(wsUrl: String, onRecievedMessage: @escaping (Message)-> Void) {
        self.messageCallback = onRecievedMessage
        self.wsUrl = wsUrl
        super.init()
        self.connect()
        self.initializeHeartbeatManagers()
        self.addNetworkNotificationObserver()
    }
    
    func connect(wsUrl: String? = nil) {
        self.intentionalDisconnect = false
        if let wsTask = self.websocketTask {
            wsTask.cancel(with: .goingAway, reason: nil)
        }
        if let nonEmptyWsUrl = wsUrl {
            self.isReconnecting = false
            self.wsUrl = nonEmptyWsUrl
        }
        if let webSocketUrl = self.wsUrl {
            self.session = URLSession(configuration: .default, delegate: self, delegateQueue: OperationQueue())
            self.websocketTask = self.session?.webSocketTask(with: URL(string: webSocketUrl)!)
            websocketTask?.resume()
            receiveMessage()
        } else {
            print("No WebSocketURL found")
            return
        }
    }
    
    func sendWebSocketMessage(string message: String) {
        let messageToSend = URLSessionWebSocketTask.Message.string(message)
        websocketTask?.send(messageToSend) { error in
            if let error = error {
                print("Failed to send message: \(error)")
            } else {
                print("Message sent: \(message)")
            }
        }
    }
    
    private func receiveMessage() {
        websocketTask?.receive { [weak self] result in
            switch result {
            case .failure(let error):
                print("Failed to receive message: \(error)")
            case .success(let message):
                switch message {
                case .string(let text):
                    print("Received text: \(text)")
                    self?.handleWebsocketTextEvent(text: text)
                case .data(let data):
                    print("Received data: \(data)")
                @unknown default:
                    fatalError()
                }
                self?.receiveMessage()
            }
        }
    }
    
    // MARK: - WebSocketDelegate
    
    func handleError(_ error: Error?) {
        if let e = error as? WSError {
            print("websocket encountered an error: \(e.message)")
        } else if let e = error {
            print("websocket encountered an error: \(e.localizedDescription)")
        } else {
            print("websocket encountered an error")
        }
    }
    
    func disconnect() {
        self.intentionalDisconnect = true
        websocketTask?.cancel(with: .goingAway, reason: nil)
    }
    
    func addNetworkNotificationObserver() {
        NotificationCenter.default.addObserver(forName: .networkConnected, object: nil, queue: .main) { [weak self] _ in
            if (self?.pendingNetworkReconnection == true) {
                self?.pendingNetworkReconnection = false
                self?.retryConnection()
            }
        }
    }
    
    func handleWebsocketTextEvent(text: String) {
        if let jsonData = text.data(using: .utf8),
           let json = try? JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
            if let topic = json["topic"] as? String {
                switch topic {
                case "aws/ping":
                    if (json["statusCode"] as? Int == 200 && json["statusContent"] as? String == "OK") {
                        self.deepHeartbeatManager?.heartbeatReceived()
                    } else {
                        print("Deep heartbeat failed. Status: \(json["statusCode"] ?? "nil"), StatusContent: \(json["statusContent"] ?? "nil")")
                    }
                    break
                case "aws/heartbeat":
                    self.heartbeatManager?.heartbeatReceived()
                    break
                case "aws/chat":
                    websocketDidReceiveMessage(json: json)
                default:
                    break
                }
            }
        }
    }
    
    func websocketDidReceiveMessage(json: [String: Any]) {
        let content = json["content"] as? String
        
        if let stringContent = content,
           let innerJson = try? JSONSerialization.jsonObject(with: Data(stringContent.utf8), options: []) as? [String: Any] {
            let type = innerJson["Type"] as! String // MESSAGE, EVENT
            let time = CommonUtils().formatTime(innerJson["AbsoluteTime"] as! String)!
            if type == "MESSAGE" {
                // Handle messages
                handleMessage(innerJson, time)
            } else if innerJson["ContentType"] as! String == ContentType.joined.rawValue {
                // Handle participant joined event
                handleParticipantJoined(innerJson, time)
            } else if innerJson["ContentType"] as! String == ContentType.left.rawValue {
                // Handle participant left event
                handleParticipantLeft(innerJson, time)
            } else if innerJson["ContentType"] as! String == ContentType.typing.rawValue {
                // Handle typing event
                handleTyping(innerJson, time)
            } else if innerJson["ContentType"] as! String == ContentType.ended.rawValue {
                // Handle chat ended event
                handleChatEnded(innerJson, time)
            } else if innerJson["ContentType"] as! String == ContentType.metaData.rawValue {
                // Handle message metadata
                handleMetadata(innerJson, time)
            }
        }
    }
    
    // MARK: - Handle Events
    func handleMessage(_ innerJson: [String: Any], _ time: String) {
        let participantRole = innerJson["ParticipantRole"] as! String
        let messageId = innerJson["Id"] as! String
        var messageText = innerJson["Content"] as! String
        let messageType: MessageType = (participantRole == config.customerName) ? .Sender : .Receiver
        
        // Workaround for Attributed string to enable newline
        messageText = messageText.replacingOccurrences(of: "\n", with: "\\\n")
        
        let message = Message(
            participant: participantRole,
            text: messageText,
            contentType: innerJson["ContentType"] as! String,
            messageType: messageType,
            timeStamp: time,
            messageID: messageId
        )
        messageCallback(message)
        print("Received message: \(message)")
    }
    
    func handleParticipantJoined(_ innerJson: [String: Any], _ time: String) {
        let participantRole = innerJson["ParticipantRole"] as! String
        let messageText = "\(participantRole) has joined"
        let message = Message(
            participant: participantRole,
            text: messageText,
            contentType: innerJson["ContentType"] as! String,
            messageType: .Common,
            timeStamp: time
        )
        messageCallback(message)
    }
    
    func handleParticipantLeft(_ innerJson: [String: Any], _ time: String) {
        let participantRole = innerJson["ParticipantRole"] as! String
        let messageText = "\(participantRole) has left"
        let message = Message(
            participant: participantRole,
            text: messageText,
            contentType: innerJson["ContentType"] as! String,
            messageType: .Common,
            timeStamp: time
        )
        messageCallback(message)
    }
    
    func handleTyping(_ innerJson: [String: Any], _ time: String) {
        let participantRole = innerJson["ParticipantRole"] as! String
        let message = Message(
            participant: participantRole,
            text: "...",
            contentType: innerJson["ContentType"] as! String,
            messageType: (participantRole == config.customerName) ? .Sender : .Receiver,
            timeStamp: time
        )
        messageCallback(message)
    }
    
    func handleChatEnded(_ innerJson: [String: Any], _ time: String) {
        let message = Message(
            participant: "System Message",
            text: "The chat has ended.",
            contentType: innerJson["ContentType"] as! String,
            messageType: .Common,
            timeStamp: time)
        messageCallback(message)
    }
    
    func handleMetadata(_ innerJson: [String: Any], _ time: String) {
        let messageMetadata = innerJson["MessageMetadata"] as! [String: Any]
        let messageId = messageMetadata["MessageId"] as! String
        let receipts = messageMetadata["Receipts"] as? [[String: Any]]
        var status: String = "Delivered" // Default status
        if let receipts = receipts {
            for receipt in receipts {
                if receipt["ReadTimestamp"] is String {
                    status = "Read"
                }
            }
        }
        let message = Message(
            participant: "",
            text: "",
            contentType: innerJson["ContentType"] as! String,
            messageType: .Sender,
            timeStamp: time,
            messageID: messageId,
            status: status
        )
        messageCallback(message)
    }
    
    // MARK: - Reconnection / State Management
    
    func retryConnection() {
        if !self.isReconnecting {
            self.isReconnecting = true
            var numAttempts = 0.0
            var numOfflineChecks = 0.0
            var timer: Timer?

            func retry() {
                if self.wsUrl == nil {
                    return
                }
                timer?.invalidate()
                if numOfflineChecks < 5 {
                    if numAttempts < 5 {
                        DispatchQueue.main.async {
                            timer = Timer.scheduledTimer(withTimeInterval: max(numAttempts, numOfflineChecks) * 5.0, repeats: false) { _ in
                                if NetworkConnectionManager.shared.checkConnectivity() {
                                    numOfflineChecks = 0
                                    if self.isConnected {
                                        print("Websocket connection has been re-established")
                                        print("Connected successfully on attempt \(numAttempts)")
                                        timer?.invalidate()
                                        self.isReconnecting = false
                                        numAttempts = 0.0
                                    } else {
                                        print("Attempt re-connect")
                                        self.connect()
                                        numAttempts += 1
                                        retry()
                                    }
                                } else {
                                    print("Device is not connected to the internet, retrying... attempt \(numOfflineChecks)")
                                    numOfflineChecks += 1
                                    numAttempts = 0
                                    retry()
                                }
                            }
                        }
                    } else {
                        print("Retry connection failed after \(numAttempts) attempts. Please re-start chat session.")
                        self.isReconnecting = false
                    }
                } else {
                    print("Network connection has been lost. Please restore your network connection to try again.")
                    self.pendingNetworkReconnection = true
                    self.isReconnecting = false
                }
            }
            retry()
        }
    }
    
    // MARK: - Heartbeat Logic
    
    func resetHeartbeatManagers() {
        self.heartbeatManager?.stopHeartbeat()
        self.deepHeartbeatManager?.stopHeartbeat()
    }
    
    func initializeHeartbeatManagers() {
        self.heartbeatManager = HeartbeatManager(isDeepHeartbeat: false, sendHeartbeatCallback: sendHeartbeat, missedHeartbeatCallback: onHeartbeatMissed)
        self.deepHeartbeatManager = HeartbeatManager(isDeepHeartbeat: true, sendHeartbeatCallback: sendDeepHeartbeat, missedHeartbeatCallback: onDeepHeartbeatMissed)
    }
    
    func startHeartbeats() {
        self.heartbeatManager?.startHeartbeat()
        self.deepHeartbeatManager?.startHeartbeat()
    }
    
    func sendHeartbeat() {
        self.sendWebSocketMessage(string: EventTypes.heartbeat)
    }
    
    func sendDeepHeartbeat() {
        self.sendWebSocketMessage(string: EventTypes.deepHeartbeat)
    }
    
    func onHeartbeatMissed() {
        if !self.isConnected {
            return
        }
        if NetworkConnectionManager.shared.checkConnectivity() {
            print("Heartbeat missed")
        } else {
            print("Device is not connected to the internet")
        }
        retryConnection()
    }
    
    func onDeepHeartbeatMissed() {
        if !self.isConnected {
            return
        }
        if NetworkConnectionManager.shared.checkConnectivity() {
            print("Deep heartbeat missed")
        } else {
            print("Device is not connected to the internet")
        }
        retryConnection()
    }
}

// MARK: - Delegate and Connect/Disconnect handlers

extension WebsocketManager: URLSessionWebSocketDelegate {
    func formatAndProcessTranscriptItems(_ transcriptItems: [AWSConnectParticipantItem]) {
        transcriptItems.forEach { item in
            
            let participantRole = CommonUtils().convertParticipantRoleToString(item.participantRole.rawValue)
            
            // First, create the message dictionary for the inner content
            let messageContentDict: [String: Any] = [
                "Id": item.identifier ?? "",
                "ParticipantRole": "\(participantRole)", // Make sure this maps correctly
                "AbsoluteTime": item.absoluteTime ?? "",
                "ContentType": item.contentType ?? "",
                "Content": item.content ?? "",
                "Type": CommonUtils().convertParticipantTypeToString(item.types.rawValue),
                "DisplayName": item.displayName ?? ""
            ]
            
            // Serialize the inner content dictionary to a JSON string
            guard let messageContentData = try? JSONSerialization.data(withJSONObject: messageContentDict, options: []),
                  let messageContentString = String(data: messageContentData, encoding: .utf8) else {
                print("Failed to serialize message content to JSON string")
                return
            }
            
            // wrapping string in the outer structure expected by websocketDidReceiveMessage
            let wrappedMessageString = "{\"content\":\"\(messageContentString.replacingOccurrences(of: "\"", with: "\\\""))\"}"
            
            if let jsonData = wrappedMessageString.data(using: .utf8),
               let json = try? JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
                self.websocketDidReceiveMessage(json: json)
            }

        }
    }
    
    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol protocol: String?) {
        print("Websocket connection successfully established")
        self.isConnected = true
        self.sendWebSocketMessage(string: EventTypes.subscribe)
        self.startHeartbeats()
    }
    
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        print("WebSocket connection closed.")
        self.isConnected = false
        if error != nil {
            handleError(error)
        }
        guard let response = task.response as? HTTPURLResponse else {
            print("Failed to parse HTTPURLResponse")
            return
        }
        switch response.statusCode {
            case 403:
                print("REAUTHENTICATE")
                NotificationCenter.default.post(name: .requestNewWsUrl, object: nil)
                self.wsUrl = nil
                break
            default:
                retryConnection()
        }
        self.intentionalDisconnect = false
    }
}
