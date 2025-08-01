// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import Foundation
import AmazonConnectChatIOS

struct CommonUtils {

    static func formatTime(_ timeStamp: String) -> String? {
        let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
            dateFormatter.timeZone = TimeZone(abbreviation: "UTC")
            dateFormatter.locale = Locale(identifier: "en_US_POSIX") // Use a POSIX locale for fixed format parsing
            
            // Attempt to convert UTC time to Date
            guard let utcDate = dateFormatter.date(from: timeStamp) else {
                return timeStamp // Return the original timestamp as a fallback
            }
            
            // Set the date formatter's timezone to the device's local timezone and format for display
            dateFormatter.timeZone = TimeZone.current
            dateFormatter.dateFormat = "HH:mm"
            
            // Convert to local time or fallback to UTC time string
            let localTime = dateFormatter.string(from: utcDate)
            return localTime.isEmpty ? timeStamp : localTime
    }
    
    
    static func getMessageDirection(from transcriptItem: TranscriptItem) {
        if let message = transcriptItem as? Message {
            let participant = message.participant
            let direction: MessageDirection
            switch participant.lowercased() {
            case "customer":
                direction = .Outgoing
            case "agent":
                direction = .Incoming
            case "system":
                direction = .Incoming
            default:
                direction = .Common
            }
            message.messageDirection = direction
        } else if let event = transcriptItem as? Event {
            guard let participant = event.participant else { return }
            var direction: MessageDirection
            direction = .Common
            if event.contentType == ContentType.typing.rawValue {
                switch participant.lowercased() {
                case "customer":
                    direction = .Outgoing
                default:
                    direction = .Incoming
                }
            }
            event.eventDirection = direction
        }
    }
    
    static func customizeEvent(from event: Event){
        let displayNameOrParticipant = (event.displayName?.isEmpty == false ? event.displayName : event.participant) ?? "SYSTEM"
        switch event.contentType {
        case ContentType.joined.rawValue:
            event.text = "\(displayNameOrParticipant) has joined the chat"
            event.participant = "System"
        case ContentType.left.rawValue:
            event.text = "\(displayNameOrParticipant) has left the chat"
            event.participant = "System"
        case ContentType.ended.rawValue:
            event.text = "The chat has ended"
            event.participant = "System"
        case ContentType.participantIdle.rawValue:
            event.text = "\(displayNameOrParticipant) has gone idle"
            event.participant = "System"
        case ContentType.participantReturned.rawValue:
            event.text = "\(displayNameOrParticipant) has returned"
            event.participant = "System"
        case ContentType.autoDisconnection.rawValue:
            event.text = "\(displayNameOrParticipant) was automatically disconnected"
            event.participant = "System"
        default:
            break
        }
    }
    
    static func customMessageStatus(for status: MessageStatus?) -> String {
        switch status {
        case .Delivered:
            return "Delivered"
        case .Read:
            return "Read"
        case .Sending:
            return "Sending"
        case .Failed:
            return "Failed to send"
        case .Sent:
            return "Sent"
        default :
            return ""  // Leaving it empty for unknown status
        }
    }
}
