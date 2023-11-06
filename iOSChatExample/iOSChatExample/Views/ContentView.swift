//
//  ContentView.swift
//  Chat
//
//  Created by Mittal, Rajat on 10/20/23.
//

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
