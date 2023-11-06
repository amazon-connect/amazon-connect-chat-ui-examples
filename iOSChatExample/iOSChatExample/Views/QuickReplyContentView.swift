//
//  QuickReplyContentView.swift
//  Chat
//
//  Created by Mittal, Rajat on 11/5/23.
//

import SwiftUI

struct QuickReplyContentView: View {
    let message: Message
    @ObservedObject var chatManager: ChatManager
    let messageC: QuickReplyContent
    @State private var showQuickReplies = true
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let participant = message.participant {
                Text(participant).font(.caption)
            }
            
            ZStack(alignment: .bottomTrailing){
                Text(messageC.title)
                    .padding(10)
                    .padding(.bottom, 8)
                    .frame(alignment: .leading)
                Text(message.timeStamp)
                    .padding(4)
                    .font(.caption)
                    .opacity(0.6)
                    .frame(alignment: .bottomTrailing)
            }.background(.green)
                .cornerRadius(10)
                .foregroundColor(.white)
                .frame(maxWidth: .init(UIScreen.main.bounds.size.width * 0.8), alignment: .leading)
            
            if showQuickReplies {
                ForEach(messageC.options, id: \.self) { option in
                    Button(action: {
                        chatManager.sendChatMessage(messageContent: option)
                        self.showQuickReplies = false
                    }) {
                        Text(option)
                            .foregroundColor(.blue)
                            .font(.subheadline)
                            .padding(8)
                    }
                    .background(Color.blue.opacity(0.02))
                    .cornerRadius(10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color.blue, lineWidth: 2)
                    )
                }
            }
        }.padding(.bottom,4)
    }
}
