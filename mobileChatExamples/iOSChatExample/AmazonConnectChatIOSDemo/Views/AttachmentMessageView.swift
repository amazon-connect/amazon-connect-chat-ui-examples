import SwiftUI
import AmazonConnectChatIOS
import QuickLook

struct AttachmentMessageView: View {
    let message: AmazonConnectChatIOS.Message
    @ObservedObject var chatManager: ChatManager
    @Binding var recentOutgoingMessageID: String?
    
    @State private var previewItem: URL? = nil
    @State private var isDownloading = false
    @State private var downloadError: String? = nil
    @State private var showPreview = false
    
    var body: some View {
        VStack(alignment: message.messageDirection == .Incoming ? .leading : .trailing, spacing: 2) {
            HStack {
                Text((message.displayName?.isEmpty == false ? message.displayName : message.participant) ?? message.participant)
                    .font(.subheadline)
                    .opacity(0.8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .lineLimit(1)
                    .truncationMode(.tail)
                
                Text(CommonUtils.formatTime(message.timeStamp) ?? Date().description)
                    .font(.caption)
                    .opacity(0.6)
                    .frame(alignment: .trailing)
            }
            .padding(.bottom, 2)
            .frame(maxWidth: UIScreen.main.bounds.size.width * 0.75, alignment: .leading)
            
            VStack(alignment: .leading) {
                Button(action: {
                    isDownloading = true
                    chatManager.downloadAttachment(attachmentId: message.attachmentId!, filename: message.text) { result in
                        isDownloading = false
                        switch result {
                        case .success(let tempUrl):
                            previewItem = tempUrl
                            print("Temp file stored locally: \(tempUrl)")
                            showPreview = true
                        case .failure(let error):
                            downloadError = "Failed to download attachment: \(String(describing: error))"
                            print(downloadError!)
                        }
                    }
                }) {
                    HStack {
                        Text(message.text)
                            .font(.body)
                            .foregroundColor(Color(hex: "#0056b3"))
                            .underline()
                            .lineLimit(2)
                            .truncationMode(.middle)
                        Spacer()
                        if isDownloading {
                            ProgressView()
                        } else {
                            Image(systemName: "doc.text")
                                .foregroundColor(Color(hex: "#0056b3"))
                                .imageScale(.large)
                        }
                    }
                    .padding()
                    .background(message.messageDirection == .Incoming ? Color(hex: "#EDEDED") : Color(hex: "#ABCDEF"))
                    .cornerRadius(8)
                }
                if let error = downloadError {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding(.leading, 8)
                }
            }
            .padding(.bottom, 8)
            .background(Color.white)
            .cornerRadius(8)
            .frame(maxWidth: UIScreen.main.bounds.size.width * 0.75, alignment: .leading)
            
            if message.messageDirection == .Outgoing, let metadata = message.metadata {
                HStack(spacing: 2) {
                    // Show status for recent outgoing message or failed messages
                    if message.id == recentOutgoingMessageID || metadata.status == .Failed {
                        Text(CommonUtils.customMessageStatus(for: metadata.status)).font(.caption2).foregroundColor(.gray)
                        
                        // Show retry button for failed attachments
                        if metadata.status == .Failed {
                            Button(action: {
                                chatManager.resendFailedMessage(messageId: message.id)
                            }) {
                                Text("Retry")
                                    .font(.caption2)
                                    .foregroundColor(.blue)
                                    .underline()
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                }.frame(maxWidth: UIScreen.main.bounds.size.width * 0.75, alignment: .trailing)
            }
            
        }
        .quickLookPreview($previewItem)
        .frame(maxWidth: .infinity, alignment: message.messageDirection == .Incoming ? .leading : .trailing)
    }
}
