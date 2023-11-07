// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation
import Starscream

class WebsocketManager : WebSocketDelegate {
    
    private let socket: WebSocket
    private let messageCallback: (Message)-> Void
    var isConnected = false
    var config = Config()
    
    init(wsUrl: String, onRecievedMessage: @escaping (Message)-> Void) {
        self.messageCallback = onRecievedMessage
        self.socket = WebSocket(request: URLRequest(url: URL(string: wsUrl)!))
        socket.delegate = self
        socket.connect()
    }
    
    // MARK: - WebSocketDelegate
    func didReceive(event: Starscream.WebSocketEvent, client: Starscream.WebSocketClient) {
        switch event {
        case .connected(let headers):
            isConnected = true
            print("websocket is connected: \(headers)")
            websocketDidConnect(socket: client)
        case .disconnected(let reason, let code):
            isConnected = false
            print("websocket is disconnected: \(reason) with code: \(code)")
        case .text(let text):
            print(text)
            websocketDidReceiveMessage(socket: client, text: text)
        case .binary(let data):
            print("Received data: \(data.count)")
        case .ping(_):
            break
        case .pong(_):
            break
        case .viabilityChanged(_):
            break
        case .reconnectSuggested(_):
            break
        case .cancelled:
            isConnected = false
        case .error(let error):
            isConnected = false
            handleError(error)
        case .peerClosed:
            break
        }
    }
    
    func handleError(_ error: Error?) {
        if let e = error as? WSError {
            print("websocket encountered an error: \(e.message)")
        } else if let e = error {
            print("websocket encountered an error: \(e.localizedDescription)")
        } else {
            print("websocket encountered an error")
        }
    }
    
    
    func websocketDidConnect(socket: WebSocketClient) {
        print("websocket is connected.")
        socket.write(string: "{\"topic\": \"aws/subscribe\", \"content\": {\"topics\": [\"aws/chat\"]}})")
    }
    

    func websocketDidReceiveMessage(socket: WebSocketClient, text: String) {
        if let jsonData = text.data(using: .utf8),
           let json = try? JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
            
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
}
