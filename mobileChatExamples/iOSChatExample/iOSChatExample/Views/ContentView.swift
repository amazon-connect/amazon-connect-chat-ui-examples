// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import SwiftUI

struct ContentView: View {
    @State private var message: String = ""
    @StateObject var chatManager = ChatManager()
    @State var showModal = false
    @State var isLoading = false
    @State private var showRestoreSessionAlert = false
    
    var body: some View {
        VStack {
            Spacer()
            participantTokenSection
            clearParticipantTokenButton
            contactIdSection
            clearContactIdButton
            chatButton
        }
        .preferredColorScheme(.light)
        .onChange(of: chatManager.error) { _ in
            // When an error occurs, dismiss the modal before showing the alert
            self.showModal = false
            self.isLoading = false // Stop loading when there is an error
            // Delay the presentation of the alert if necessary
               DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                   // This space intentionally left blank; you could perform other actions here if needed
               }
        }
        .sheet(isPresented: $showModal) {
            ChatView(messages: chatManager.messagesBinding, isModalVisible: $showModal, chatManager: chatManager)
                .onAppear {
                    isLoading = false
                }
        }
        .alert(item: $chatManager.error) { error in
            Alert(
                title: Text("Error"),
                message: Text(error.message),
                primaryButton: .default(Text("Start new session"), action: {
                    showModal = false
                }),
                secondaryButton: .cancel()
            )
        }.alert(isPresented: $showRestoreSessionAlert) {
            Alert(
                title: Text("Restore Previous Session?"),
                message: Text("Do you want to continue your last chat session?"),
                primaryButton: .default(Text("Restore"), action: {
                    startChatSession()
                }),
                secondaryButton: .destructive(Text("Start New"), action: {
                    // User chose to start a new session, clear old data
                    chatManager.removeContactId()
                    chatManager.removeParticipantToken()
                    startChatSession()
                })
            )
        }
    }

    private var participantTokenSection: some View {
        Group {
            if chatManager.participantTokenExists {
                Text("Participant token exists in storage.")
                    .foregroundColor(.green)
//                Text(UserDefaults.standard.string(forKey: "participantToken") ?? "")
            } else {
                Text("No participant token found in storage.")
                    .foregroundColor(.red)
            }
        }
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

    private var contactIdSection: some View {
        Group {
            if chatManager.contactIdExists {
                Text("Contact ID exists in storage.")
                    .foregroundColor(.green)
//                Text(UserDefaults.standard.string(forKey: "contactID") ?? "")
            } else {
                Text("No contactID found in storage.")
                    .foregroundColor(.red)
            }
        }
    }

    private var clearContactIdButton: some View {
        Button(action: {
            chatManager.removeContactId()
            print("ContactID cleared.")
        }) {
            Text("Clear ContactID")
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
                // Check if there is a previous session to potentially restore
                if chatManager.contactIdExists && !chatManager.participantTokenExists {
                    // Conditions met, ask user if they want to restore the session
                    showRestoreSessionAlert = true
                } else {
                    // No previous session or full credentials available, proceed normally
                    startChatSession()
                }
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
        chatManager.initiateChat(completion: handleChatInitiation(success:))
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
