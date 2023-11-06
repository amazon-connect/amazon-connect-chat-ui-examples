//
//  ListPickerContentView.swift
//  Chat
//
//  Created by Mittal, Rajat on 11/5/23.
//

import SwiftUI

struct ListPickerContentView: View {
    let message: Message
    @ObservedObject var chatManager: ChatManager
    let content: ListPickerContent
    @State private var showListPicker = true
    
    var body: some View {
        
        VStack(alignment: .leading, spacing: 8) {
            
            if let participant = message.participant {
                Text(participant)
                    .font(.caption)
            }
            
            if !showListPicker{
                ZStack(alignment: .bottomTrailing){
                    Text(content.title)
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
            }else {
                VStack(alignment: .leading, spacing: 8) {
                    if let titleImage = content.imageUrl {
                        AsyncImage(url: URL(string: titleImage)) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .frame(maxWidth: .infinity)
                            case .failure(_):
                                ProgressView()
                            case .empty:
                                ProgressView() // Show a loader before image loads
                            @unknown default:
                                EmptyView()
                            }
                        }
                        .clipped()
                        .cornerRadius(10)
                        .shadow(radius: 1)
                    }
                    
                    Text(content.title)
                        .font(.footnote)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    if let subtitle = content.subtitle {
                        Text(subtitle)
                            .font(.footnote)
                            .foregroundColor(.secondary)
                    }
                    
                    ForEach(content.options, id: \.self) { element in
                        HStack(spacing: 10) {
                            if let optionImage = element.imageData{
                                AsyncImage(url:  URL(string: optionImage) ) { image in
                                    image.resizable()
                                } placeholder: {
                                    ProgressView()
                                }
                                .frame(width: 40, height: 40)
                                .background(Color.secondary.opacity(0.1))
                                .cornerRadius(6)
                            }
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text(element.title)
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.primary)
                                if let subtitle = element.subtitle {
                                    
                                    Text(subtitle)
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            Spacer()
                        }
                        .padding(8)
                        .background(Color.white)
                        .cornerRadius(10)
                        .shadow(radius: 2)
                        .onTapGesture {
                            self.chatManager.sendChatMessage(messageContent: element.title)
                            self.showListPicker = false
                        }
                    }
                }
                .padding(12)
                .background(.green.opacity(0.3))
                .cornerRadius(10)
                .frame(maxWidth: .init(UIScreen.main.bounds.size.width * 0.7))
            }
        }
    }
}
