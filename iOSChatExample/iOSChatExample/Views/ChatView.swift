// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import SwiftUI

struct ChatView: View {
    @Environment(\.presentationMode) var presentationMode
    @Binding var messages: [Message]
    @Binding var isModalVisible: Bool
    @State private var newMessageText: String = ""
    @State private var isTyping: Bool = false
    @State var isChatEnded: Bool = false
    @ObservedObject var chatManager: ChatManager
    @State private var showAlert = false
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
                    Spacer()
                    
                    Button(action: {
                        showAlert = true
                    }) {
                        Text("End chat")
                    }
                    .padding(20)
                    .alert(isPresented: $showAlert) {
                        Alert(
                            title: Text(""),
                            message: Text("Do you want to end chat?"),
                            primaryButton: .default(
                                Text("Yes, End Chat"),
                                action: {
                                    isModalVisible.toggle()
                                    chatManager.endChat()
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
                                ChatMessageView(message: message, chatManager: self.chatManager)
                                    .onAppear {
                                        if message.text == "The chat has ended." {
                                            self.isChatEnded = true
                                        }
                                        chatManager.sendReadEventOnAppear(message: message)
                                    }
                                    .id(message.id) // Ensure each message has a unique id for the ScrollView to use

                            }
                        }.padding()
                    }
                    .onChange(of: messages) { _ in
                        if messages.count > 0 {
                            DispatchQueue.main.async {
                                withAnimation {
                                    scrollView.scrollTo(messages.last?.id, anchor: .bottom)
                                }
                            }
                        }
                    }
                }

                // Input text field and send button
                HStack {
                    TextField("Type a message", text: $newMessageText, axis: .vertical)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .onChange(of: newMessageText) { new  in
                            if !isTyping && !new.isEmpty {
                                isTyping = true
                                self.chatManager.sendEvent(contentType: .typing)
                            }
                        }.lineLimit(0...5)
                    Button(action: {
                        chatManager.sendChatMessage(messageContent: newMessageText)
                        newMessageText = ""
                        isTyping = false
                    }) {
                        Image(systemName: "paperplane")
                            .font(.title2)
                            .foregroundColor(.blue)
                            .clipShape(Circle())
                    }
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

#Preview{
    ChatView(messages: .constant([ // Provide mock data here
        Message(participant: "CUSTOMER", text: "Hello ", contentType: "text/plain", messageType: .Sender,timeStamp: "06:51",status: "Delivered"),
        Message(participant: "CUSTOMER", text: "Hello, this is a _sender_ message.Hello, this is a sender message.", contentType: "text/plain", messageType: .Sender,timeStamp: "06:51",status: "Read"),
        Message(participant: "AGENT", text: "...", contentType: "text/plain", messageType: .Receiver,timeStamp: "06:51",isRead: true),
        Message(participant: "AGENT", text: "Hello, **this** is a agent \\\n\\\n speaking.Hello, this is a agent speaking.", contentType: "text/plain", messageType: .Receiver,timeStamp: "06:51",isRead: true),
        Message(participant: Optional("SYSTEM"), text: "{\"templateType\":\"QuickReply\",\"version\":\"1.0\",\"data\":{\"content\":{\"title\":\"How was your experience?\",\"elements\":[{\"title\":\"Very unsatisfied\"},{\"title\":\"Unsatisfied\"},{\"title\":\"Neutral\"},{\"title\":\"Satisfied\"},{\"title\":\"Very Satisfied\"}]}}}", contentType: "application/vnd.amazonaws.connect.message.interactive", messageType: iOSChatExample.MessageType.Receiver, timeStamp: "06:20", messageID: Optional("8f76a266-6654-434f-94ea-87ec111ee341"), status: nil, isRead: false),
        Message(participant: Optional("SYSTEM"), text: "{\"templateType\":\"ListPicker\",\"version\":\"1.0\",\"data\":{\"content\":{\"title\":\"Which department would you like?\",\"subtitle\":\"Tap to select option\",\"elements\":[{\"title\":\"Billing\",\"subtitle\":\"For billing issues\"},{\"title\":\"New Service\",\"subtitle\":\"For new service\"},{\"title\":\"Cancellation\",\"subtitle\":\"For new service requests\"}]}}}", contentType: "application/vnd.amazonaws.connect.message.interactive", messageType: iOSChatExample.MessageType.Receiver, timeStamp: "14:18", messageID: Optional("f905d16e-12a0-4854-9079-d5b34476c3ba"), status: nil, isRead: false),
        Message(participant: "SYSTEM", text: "Someone joined the chat.Someone joined the chat.Someone joined the chat.", contentType: "text/plain", messageType: .Common,timeStamp: "06:51",isRead: true)                                 ]), isModalVisible: .constant(true), chatManager: ChatManager())
}
