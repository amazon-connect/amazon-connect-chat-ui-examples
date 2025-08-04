// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import SwiftUI
import AmazonConnectChatIOS
import QuickLook

struct ChatMessageView: View {
    @ObservedObject var message: TranscriptItem
    @ObservedObject var chatManager: ChatManager
    @Binding var recentOutgoingMessageID: String?
    
    var body: some View {
        HStack(spacing:0) {
            if let message = message as? AmazonConnectChatIOS.Message {
                if message.messageDirection == .Outgoing {
                    Spacer()
                    VStack {
                        if message.attachmentId != nil {
                            AttachmentMessageView(message: message, chatManager: chatManager, recentOutgoingMessageID: $recentOutgoingMessageID)
                        } else {
                            SenderChatBubble(message: message, chatManager: chatManager, recentOutgoingMessageID: $recentOutgoingMessageID)
                        }
                    }
                } else if message.messageDirection == .Incoming {
                    VStack {
                        if let content = message.content {
                            if let textContent = content as? PlainTextContent {
                                if message.attachmentId != nil {
                                    AttachmentMessageView(message: message, chatManager: chatManager, recentOutgoingMessageID: $recentOutgoingMessageID)
                                } else {
                                    ReceiverChatBubble(message: message, messageContent: textContent, chatManager: chatManager)
                                }
                            } else if let quickReplyContent = content as? QuickReplyContent {
                                QuickReplyContentView(message: message, chatManager: chatManager, messageC: quickReplyContent)
                            } else if let listPickerContent = content as? ListPickerContent {
                                ListPickerContentView(message: message, chatManager: chatManager, content: listPickerContent)
                            } else {
                                Text("Unsupported message type, View is missing")
                            }
                        } else {
                            Text("This message type is not supported yet, Please use serialized content to parse it and build UI")
                        }
                    }
                    Spacer()
                } else {
                    Spacer()
                    VStack {
                        CommonChat(message: message)
                    }
                    Spacer()
                }
            } else if let event = message as? Event {
                if event.contentType == ContentType.typing.rawValue && event.eventDirection == .Incoming {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(((event.displayName?.isEmpty == false ? event.displayName : event.participant) ?? event.participant)!)
                            .font(.subheadline)
                            .opacity(0.8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .lineLimit(1)
                            .truncationMode(.tail)
                        TypingIndicator()
                    }
                    Spacer()
                } else if event.contentType != ContentType.typing.rawValue {
                    Spacer()
                    VStack {
                        EventView(event: event)
                    }
                    Spacer()
                }
            }
        }
        .padding(.top, 4)
    }
}

struct SenderChatBubble: View {
    @ObservedObject var message: AmazonConnectChatIOS.Message
    @ObservedObject var chatManager: ChatManager
    @Binding var recentOutgoingMessageID: String?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text((message.displayName?.isEmpty == false ? message.displayName : message.participant) ?? message.participant)
                    .font(.subheadline)
                    .opacity(0.8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .lineLimit(1)
                    .truncationMode(.tail)
                
                Text(CommonUtils.formatTime(message.timeStamp) ?? Date().description)
                    .font(.caption)
                    .opacity(0.6)
                    .frame(alignment: .trailing)
            }
            .padding(.bottom, 2)
            .frame(maxWidth: UIScreen.main.bounds.size.width * 0.75, alignment: .trailing)
            
            HStack {
                Text(attributedText)
                    .padding(10)
                    .frame(alignment: .trailing)
                    .foregroundColor(Color.black)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .background(Color(hex: "#ABCDEF"))
            .cornerRadius(8)
            .foregroundColor(.white)
            .frame(maxWidth: UIScreen.main.bounds.size.width * 0.75, alignment: .trailing)
            
            if let metadata = message.metadata {
                HStack(spacing: 2) {
                    // Show status for recent outgoing message, failed messages, sending messages, delivered messages, or read messages
                    if message.id == recentOutgoingMessageID || metadata.status == .Failed || metadata.status == .Sending || metadata.status == .Delivered || metadata.status == .Read {
                        Text(CommonUtils.customMessageStatus(for: metadata.status)).font(.caption2).foregroundColor(.gray)
                        
                        // Show retry button for failed messages
                        if metadata.status == .Failed {
                            Button(action: {
                                chatManager.resendFailedMessage(messageId: message.id)
                            }) {
                                Text("Retry")
                                    .font(.caption2)
                                    .foregroundColor(.blue)
                                    .underline()
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                }.frame(maxWidth: UIScreen.main.bounds.size.width * 0.75, alignment: .trailing)
            }
        }
        .frame(maxWidth: .infinity, alignment: .trailing)
    }
    
    var attributedText: AttributedString {
        do {
            return try AttributedString(markdown: message.text)
        } catch {
            print("Error parsing markdown for message text: \(error)")
            return AttributedString(message.text)
        }
    }
}

struct ReceiverChatBubble: View {
    let message: AmazonConnectChatIOS.Message
    let messageContent: PlainTextContent
    @ObservedObject var chatManager: ChatManager
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text((message.displayName?.isEmpty == false ? message.displayName : message.participant) ?? message.participant)
                    .font(.subheadline)
                    .opacity(0.8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .lineLimit(1)
                    .truncationMode(.tail)
                
                Text(CommonUtils.formatTime(message.timeStamp) ?? Date().description)
                    .font(.caption)
                    .opacity(0.6)
                    .frame(alignment: .leading)
            }
            .padding(.bottom, 2)
            .frame(maxWidth: UIScreen.main.bounds.size.width * 0.75, alignment: .leading)
            
            HStack {
                Text(attributedText)
                    .padding(10)
                    .frame(alignment: .trailing)
                    .foregroundColor(Color.black)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .background(Color(hex: "#EDEDED"))
            .cornerRadius(8)
            .foregroundColor(.white)
            .frame(maxWidth: UIScreen.main.bounds.size.width * 0.75, alignment: .leading)
        }
    }
    
    var attributedText: AttributedString {
        do {
            return try AttributedString(markdown: message.text,
                                        options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace))
        } catch {
            print("Error parsing markdown for message text: \(error)")
            return AttributedString(message.text)
        }
    }
}

struct CommonChat: View {
    let message: AmazonConnectChatIOS.Message
    
    var body: some View {
        VStack(alignment: .center, spacing: 4) {
            Text(message.text)
                .padding(10)
                .background(Color.yellow)
                .cornerRadius(8)
                .foregroundColor(.black)
                .frame(maxWidth: .init(UIScreen.main.bounds.size.width * 0.8), alignment: .center)
                .multilineTextAlignment(.center)
        }
    }
}


extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        _ = scanner.scanString("#")
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        let r = Double((rgb >> 16) & 0xFF) / 255.0
        let g = Double((rgb >> 8) & 0xFF) / 255.0
        let b = Double(rgb & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}

struct EventView: View {
    let event: Event
    
    var body: some View {
        VStack(alignment: .center, spacing: 4) {
            Text("\(event.text ?? "")")
                .padding(6)
                .cornerRadius(8)
                .foregroundColor(.black)
                .opacity(0.8)
                .frame(maxWidth: .init(UIScreen.main.bounds.size.width * 0.8), alignment: .center)
                .multilineTextAlignment(.center)
        }
    }
}
