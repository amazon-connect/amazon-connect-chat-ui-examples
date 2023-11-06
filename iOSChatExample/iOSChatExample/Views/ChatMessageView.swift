//
//  ChatMessageView.swift
//  Chat
//
//  Created by Mittal, Rajat on 11/1/23.
//

import SwiftUI

struct ChatMessageView: View {
    let message: Message
    @ObservedObject var chatManager: ChatManager
    
    var backgroundColor: Color {
        switch message.messageType {
        case .Sender:
            return Color.blue
        case .Receiver:
            return Color.green
        case .Common:
            return Color.gray
        }
    }
    var body: some View {
        HStack(spacing:0) {
            if message.messageType == .Sender {
                Spacer()
                SenderChatBubble(message: message)
            } else if message.messageType == .Receiver {
                if message.text == "..."{
                    VStack(alignment : .leading, spacing: 4){
                        if let participant = message.participant {
                            Text(participant).font(.caption)
                        }
                        TypingIndicator()
                    }
                }else{
                    if let content = message.content {
                        switch content {
                        case let textContent as PlainTextContent:
                            PlainTextView(message: message, messageContent:textContent, chatManager: chatManager)
                        case let quickReplyContent as QuickReplyContent:
                            QuickReplyContentView(message: message,chatManager: chatManager, messageC:quickReplyContent)
                        case let listPickerContent as ListPickerContent:
                            ListPickerContentView(message: message,chatManager: chatManager, content:listPickerContent)
                        default:
                            Text("Unsupported message type")
                        }
                    } else {
                        Text("Unable to decode message content")
                    }
                }
                Spacer()
            } else if message.messageType == .Common {
                Spacer()
                CommonChat(message: message)
                Spacer()
            }
        }.padding(.top,4)
        
        
    }
}

struct SenderChatBubble: View {
    let message: Message
    var body: some View {
        VStack(alignment: .trailing,spacing: 4){
            if let participant = message.participant {
                Text(participant).font(.caption)
            }
            ZStack(alignment: .bottomTrailing){
                Text(attributedText)
                    .padding(10)
                    .padding(.bottom, 8)
                    .frame(alignment: .trailing)
                Text(message.timeStamp)
                    .frame(alignment: .bottom)
                    .padding(4)
                    .font(.caption)
                    .opacity(0.6)
            }.background(.blue)
                .cornerRadius(10)
                .foregroundColor(.white).frame(maxWidth: .init(UIScreen.main.bounds.size.width * 0.8), alignment: .trailing)
            if let status = message.status {
                HStack(spacing:2){
                    Text(status).font(.caption2).foregroundColor(.gray)
                }
            }
        }
    }
    // Computed property to generate attributed string from message.text
    var attributedText: AttributedString {
        do {
            return try AttributedString(markdown: message.text)
        } catch {
            print("Error parsing markdown for message text: \(error)")
            return AttributedString(message.text)
        }
    }
}

struct PlainTextView: View {
    let message: Message
    let messageContent: PlainTextContent
    @ObservedObject var chatManager: ChatManager
    
    var body: some View {
        VStack(alignment : .leading, spacing: 4){
            if let participant = message.participant {
                Text(participant).font(.caption)
            }
            ZStack(alignment: .bottomTrailing){
                Text(attributedText)
                    .padding(10)
                    .padding(.bottom, 8)
                    .frame(alignment: .leading)
                Text(message.timeStamp)
                    .frame(alignment: .bottom)
                    .padding(4)
                    .font(.caption)
                    .opacity(0.6)
            }.background(.green)
                .cornerRadius(10)
                .foregroundColor(.white)
                .frame(maxWidth: .init(UIScreen.main.bounds.size.width * 0.8), alignment: .leading)
        }
    }
    // Computed property to generate attributed string from message.text
    var attributedText: AttributedString {
        do {
            return try AttributedString(markdown: message.text)
        } catch {
            print("Error parsing markdown for message text: \(error)")
            return AttributedString(message.text)
        }
    }
}

struct CommonChat: View {
    let message: Message
    
    var body: some View {
        VStack(alignment : .center, spacing: 4){
            Text(message.text)
                .padding(10)
                .foregroundColor(.gray)
                .cornerRadius(10)
                .frame(maxWidth: .init(UIScreen.main.bounds.size.width * 0.8), alignment: .center)
                .multilineTextAlignment(.center)
        }
    }
}
