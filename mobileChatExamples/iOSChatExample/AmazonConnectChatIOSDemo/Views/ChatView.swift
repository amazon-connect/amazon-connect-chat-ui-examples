// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import SwiftUI
import AmazonConnectChatIOS

struct ChatView: View {
    @Environment(\.presentationMode) var presentationMode
    @Binding var messages: [TranscriptItem]
    @Binding var isModalVisible: Bool
    @State private var newMessageText: String = ""
    @State private var isTyping: Bool = false
    @State var isChatEnded: Bool = false
    @ObservedObject var chatManager: ChatManager
    @ObservedObject var networkManager = NetworkConnectionManager.shared
    @State private var recentOutgoingMessageID: String? = nil
    @State private var showAlert = false
    @State var selectedFileURL: URL?
    @State private var isRefreshing: Bool = false
    
    var config = Config()
    
    var body: some View {
        ZStack {
            // Background with curved edges
            RoundedRectangle(cornerRadius: 20)
                .foregroundColor(Color.white)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .edgesIgnoringSafeArea(.all)
            
            VStack {
                HStack {
                    Button(action: {
                        isModalVisible.toggle()
                    }) {
                        Image(systemName: "arrow.left")
                            .font(.title2)
                    }
                    .padding(20)
                    
                    Spacer()
                    
                    Text("Chat")
                        .font(.title2)
                        .foregroundColor(networkManager.isConnected ? Color.black : Color.red)
                        .frame(maxWidth: .infinity,alignment: .center)
                    
                    Spacer()
                    
                    Button(action: {
                        showAlert = true
                    }) {
                        Text("End chat").foregroundStyle(.red)
                    }
                    .padding(20)
                    .alert(isPresented: $showAlert) {
                        Alert(
                            title: Text(""),
                            message: Text("Do you want to end chat?"),
                            primaryButton: .default(
                                Text("Yes, End Chat"),
                                action: {
                                    chatManager.disconnectChat()
                                    isModalVisible.toggle()
                                }
                            ),
                            secondaryButton: .cancel(
                                Text("No, Continue")
                            )
                        )
                    }
                }
                
                Spacer()
                
                // Chat messages list
                ScrollViewReader { scrollView in
                    ScrollView(.vertical) {
                        LazyVStack {
                            ForEach(messages, id: \.id) { message in
                                ChatMessageView(message: message, chatManager: self.chatManager, recentOutgoingMessageID: $recentOutgoingMessageID)
                                    .padding(.vertical,2)
                                    .onAppear {
                                        if message.contentType == ContentType.ended.rawValue {
                                            self.isChatEnded = true
                                        } else {
                                            self.isChatEnded = false
                                        }
                                        if message is Message {
                                            chatManager.sendReadEventOnAppear(message: message as! Message)
                                        }
                                    }
                                    .id(message.id) // Ensure each message has a unique id for the ScrollView to use
                            }
                        }.padding()
                        
                    }
                    .refreshable {
                        chatManager.fetchTranscript()
                        isRefreshing = true
                    }
                    .onChange(of: messages) { _ in
                        if isRefreshing {
                            // Scroll to the top after refresh
                            if let firstMessage = messages.first {
                                DispatchQueue.main.async {
                                    withAnimation {
                                        scrollView.scrollTo(firstMessage.id, anchor: .top)
                                    }
                                    isRefreshing = false
                                }
                            }
                        } else {
                            if let lastMessage = messages.last as? Message,
                               lastMessage.messageDirection == .Outgoing {
                                recentOutgoingMessageID = lastMessage.id
                            }
                            if messages.count > 0 {
                                DispatchQueue.main.async {
                                    withAnimation {
                                        scrollView.scrollTo(messages.last?.id, anchor: .bottom)
                                    }
                                }
                            }
                        }
                    }
                }
                
                HStack(alignment: .bottom) {
                    AttachmentTextView(
                        text: $newMessageText,
                        selectedFileUrl: $selectedFileURL,
                        onTyping: {
                            if !isTyping && !newMessageText.isEmpty {
                                isTyping = true
                                self.chatManager.sendEvent(contentType: .typing)
                            }
                        },
                        onRemoveAttachment: {
                            selectedFileURL = nil
                        }
                    )
                    
                    Button(action: {
                        if let fileURL = selectedFileURL {
                            chatManager.sendAttachment(file: fileURL)
                            selectedFileURL = nil
                        }
                        if newMessageText != ""{
                            chatManager.sendChatMessage(messageContent: newMessageText)
                            newMessageText = ""
                        }
                        isTyping = false
                    }) {
                        Image(systemName: "paperplane")
                            .font(.title2)
                            .foregroundColor(.blue)
                            .clipShape(Circle())
                    }.padding(.bottom,4)
                    
                    AttachmentButton { file in
                        selectedFileURL = file
                    }.padding(.bottom,4)
                }
                .padding()
                .background(Color.white)
                .compositingGroup()
                .disabled(isChatEnded)
                .blur(radius: isChatEnded ? 2 : 0)
            }
        }
    }
}
