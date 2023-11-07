// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import SwiftUI

struct ContentView: View {
    @State private var message: String = ""
    @State var websocketManager: WebsocketManager!
    @StateObject var chatManager = ChatManager()
    @State var showModal = false
    @State var isLoading = false

    var body: some View {
        VStack {
            Spacer()
            HStack{
                Spacer()
                FloatingButton(action: {
                    isLoading = true
                    print("Starting Chat")
                    showModal.toggle()
                })
                .overlay(
                        Group {
                            if isLoading {
                                ProgressView()
                            }
                        }
                )
                //                        .fullScreenCover(isPresented: $showModal) {
                //                    ModalView( isModalVisible: $showModal)
                //                }
                .sheet(isPresented: $showModal, content: {
                    ChatView(messages: chatManager.messagesBinding, isModalVisible: $showModal, chatManager: chatManager)
                        .onAppear {
                            self.chatManager.initiateChat()
                            isLoading = false
                        }
                })
            }
        }
    }
    
}

#Preview {
    ContentView()
}
