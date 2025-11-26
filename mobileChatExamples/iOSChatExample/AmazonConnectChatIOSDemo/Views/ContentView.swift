// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import SwiftUI

struct ContentView: View {
    @State private var message: String = ""
    @StateObject var chatManager = ChatManager()
    @StateObject var config = Config()
    @State var showModal = false
    @State var isLoading = false
    @State private var showRestoreSessionAlert = false
    @State private var selectedInstanceIndex = 0
    @State private var showConsole = false
    
    var body: some View {
        VStack {       
            Spacer()
            Spacer()
            participantTokenSection
            clearParticipantTokenButton
            Spacer()
            contactIdSection
            clearContactIdButton
            Spacer()
            chatButton
            Spacer()
                            
            Button(action: { showConsole.toggle() }) {
                HStack {
                    Image(systemName: "terminal")
                    Text(showConsole ? "Hide Console" : "Show Console")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .padding()
        }
        .navigationTitle("Debug Logger")
        .sheet(isPresented: $showConsole) {
            NavigationView {
                ConsoleView()
                    .navigationBarItems(trailing: Button("Done") {
                        showConsole = false
                    })
            }
        }
        .preferredColorScheme(.light)
        .onChange(of: chatManager.isChatActive) { isActive in
            if isActive {
                showModal = true
                isLoading = false
            } else {
                showModal = false
            }
        }
        .fullScreenCover(isPresented: $showModal) {
            ChatView(messages: $chatManager.messages, isModalVisible: $showModal, chatManager: chatManager)
                .onAppear {
                    isLoading = false
                }
        }
        .alert(item: $chatManager.error) { error in
            Alert(
                title: Text("Error"),
                message: Text(error.message),
                primaryButton: .default(Text("Try initiating again"), action: {
                    showModal = false
                }),
                secondaryButton: .cancel()
            )
        }
    }
    
    private var participantTokenSection: some View {
        Group {
            if chatManager.participantTokenExists {
                Text("Participant token exists in storage.")
                    .foregroundColor(.green)
                Text(UserDefaults.standard.string(forKey: "participantToken") ?? "").lineLimit(2).truncationMode(.tail).padding()
            } else {
                Text("No participant token found in storage.")
                    .foregroundColor(.red)
            }
        }
    }
    
    private var contactIdSection: some View {
        Group {
            if chatManager.contactIdExists {
                Text("Contact Id exists in storage.")
                    .foregroundColor(.green)
                Text(UserDefaults.standard.string(forKey: "contactId") ?? "").lineLimit(2).truncationMode(.tail).padding()
            } else {
                Text("No Contact Id token found in storage.")
                    .foregroundColor(.red)
            }
        }
    }

    private func detailRow(label: String, value: String) -> some View {
        HStack {
            Text("\(label):")
                .font(.subheadline)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .font(.body)
                .foregroundColor(.primary)
                .multilineTextAlignment(.leading)
                .lineLimit(1)
                .truncationMode(.tail)
        }
        .padding(.vertical, 5)
    }

    
    private var clearParticipantTokenButton: some View {
        Button(action: {
            chatManager.removeParticipantToken()
            print("Participant token cleared.")
        }) {
            Text("Clear Participant Token")
                .foregroundColor(.white)
                .padding()
                .background(Color.blue)
                .cornerRadius(8)
        }
    }

    private var clearContactIdButton: some View {
        Button(action: {
            chatManager.removeContactId()
            print("Contact Id cleared.")
        }) {
            Text("Clear Contact Id")
                .foregroundColor(.white)
                .padding()
                .background(Color.blue)
                .cornerRadius(8)
        }
    }
    
    private var chatButton: some View {
        HStack {
            Spacer()
            FloatingButton(action: {
                isLoading = true
                startChatSession()
            })
            .overlay(
                Group {
                    if isLoading {
                        ProgressView()
                    }
                }
            )
        }
    }
    
    private func startChatSession() {
        chatManager.initiateChat(with: config, completion: handleChatInitiation(success:))
    }
    
    private func handleChatInitiation(success: Bool) {
        DispatchQueue.main.async {
            self.isLoading = false
            if success {
                self.showModal = true
            } // If there's an error, showModal will remain false and the error alert will be triggered by the change in chatManager.error
        }
    }
    
    
}

#Preview {
    ContentView()
}
