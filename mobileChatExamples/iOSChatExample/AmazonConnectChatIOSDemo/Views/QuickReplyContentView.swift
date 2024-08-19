// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import SwiftUI
import AmazonConnectChatIOS

struct QuickReplyContentView: View {
    let message: AmazonConnectChatIOS.Message
    @ObservedObject var chatManager: ChatManager
    let messageC: QuickReplyContent
    @State private var showQuickReplies = true
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text((message.displayName?.isEmpty == false ? message.displayName : message.participant) ?? message.participant).font(.caption)
            
            ZStack(alignment: .bottomTrailing){
                Text((messageC.title.isEmpty == false ? messageC.title : messageC.subtitle) ?? messageC.title)
                    .padding(10)
                    .padding(.bottom, 8)
                    .frame(alignment: .leading)
                Text(CommonUtils.formatTime(message.timeStamp) ?? Date().description)
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
