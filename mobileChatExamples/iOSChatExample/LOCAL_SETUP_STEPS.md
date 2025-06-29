### Steps to Reproduce

1. Clone the Amazon Connect Chat **iOS demo app**
```bash
git clone https://github.com/amazon-connect/amazon-connect-chat-ui-examples
cd amazon-connect-chat-ui-examples
```
2. Download the v1.0.9 iOS SDK
  - Head to the release: https://github.com/amazon-connect/amazon-connect-chat-ios/releases/tag/v1.0.9
  - Download the zip folder: `1.0.9-public.zip`
  - Unzip the folder, and you should see a folder: `"AmazonConnectChatIOS.xcframework"`
3. Open demo app in XCode
```bash
cd mobileChatExamples/iOSChatExample
xed .
```
4. Install the v1.0.9 iOS SDK
  - In the macOS top menu bar, click "File" -> "Add files to AmazonConnectiOSDemo
  - Find and select the folder you downloaded `"AmazonConnectChatIOS.xcframework"`
  - In the action dropdown, select: "Copy files to destination"
5. Add you custom chat backend endpoint
  - Open ./AmazonConnectChatIOSDemo/Common/Config.swift file
  - Add your endpoints
6. Launch the app on local emulator
  - In left sidebar, click Play icon to trigger a build
  - Find the emulator running, and try the app!
7. Upload an attachment
  - Launch the emulator, start a chat, send messages back and forth with agent
  - In demo app, Click attachment icon
  - Select a file to upload, send it

### Notes

The attachment feature in the Amazon Connect Chat iOS Demo App is primarily implemented in `ChatManager.swift`, which serves as the bridge between the UI components and the Amazon Connect Chat SDK. When troubleshooting the 500 error, focus on this file's `sendAttachment()` and `handleAttachmentSendResult()` methods which contain our enhanced error logging. The flow begins in `AttachmentButton.swift` (file selection), passes through ChatView.swift (UI state management), and ultimately triggers the SDK call in `ChatManager.swift` where the AWS service interaction occurs and where the 500 error is being generated.

**Attachment flow:**
1. User clicks the paperclip icon in the AttachmentButton component
2. This opens the file picker (via fileImporter)
3. User selects a file
4. The file picker returns the file URL
5. The AttachmentButton component calls handlePickedFile with the file URL
6. In ChatView, this sets the selectedFileURL state variable
7. User clicks the send button
8. ChatView calls chatManager.sendAttachment(file: fileURL)
9. ChatManager calls self.chatSession.sendAttachment(file: file, completion: ...)
10. The SDK processes the attachment upload
11. The SDK returns a result via the completion handler
12. ChatManager handles the result in handleAttachmentSendResult
13. If successful, the attachment is shown in the chat
14. If error occurs, the error is logged and displayed
