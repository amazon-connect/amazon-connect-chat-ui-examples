# Amazon Connect Chat IOS Demo 📱
 
This is an example app on how to utilise [AmazonConnectChatIOS](https://github.com/amazon-connect/amazon-connect-chat-ios) SDK

> Refer to [#Specifications](#speficications) for details on compatibility, supported versions, and platforms.



https://github.com/user-attachments/assets/90622e9a-dcdd-4e12-a0c6-f989338d850e




**Reference:**

- Documentation: [https://docs.aws.amazon.com/connect/latest/adminguide/enable-chat-in-app.html](https://docs.aws.amazon.com/connect/latest/adminguide/integrate-chat-with-mobile.html#connect-chatsdk-for-ios)

## Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [How is it working?](#how-is-it-working)


## Prerequisites

- Create an Amazon Connect Instance [[guide](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html)]
  - OR: enable chat experience for an existing Connect instance. [[guide](../../README.md#enabling-chat-in-an-existing-amazon-connect-contact-center)]

- Create an Amazon Connect Contact Flow, ready to receive chat contacts. [[guide](https://docs.aws.amazon.com/connect/latest/adminguide/chat.html)]

    - Note the `instanceId` [[guide](https://docs.aws.amazon.com/connect/latest/adminguide/find-instance-arn.html)]
    - Find the `contactFlowId` for the ["Sample Inbound Flow (First Contact)"](https://docs.aws.amazon.com/connect/latest/adminguide/sample-inbound-flow.html) [[guide](https://docs.aws.amazon.com/connect/latest/adminguide/find-contact-flow-id.html)]

- Deploy a custom Amazon Connect Chat backend. [Refer to this backend template](../../cloudformationTemplates/startChatContactAPI/README.md)

    - Deploy a StartChatContact template Lambda [[CloudFormation Template](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI)]
    - Add the `region`, `startChatEndPoint`, `contactFlowId`, and `instanceId` to `Config.swift`.

- (Optional) Setup interactive messages [guide](https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/)
  - If using above, make sure to deploy startChatContact template again with interactive message `contactFlowId` and update down the endpoints.

- (Optional) Setup DescribeView API for ViewResource messages
  - Add `"application/vnd.amazonaws.connect.message.interactive"` to `SupportedMessagingContentTypes` in `CreateStartChatRequest.swift`
  - The demo app automatically parses ViewResource messages and calls `describeView()` to retrieve view metadata
  - View details (ID, Name, ARN) are logged to console for debugging
  - **Note:** UI rendering for view content is not yet implemented and is planned for future releases

## Local Development

> Versions: Xcode 15, Swift 5
<br> Download Xcode: https://developer.apple.com/xcode/

1. Clone this repository: https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/
    ```sh
    $ git clone https://github.com/amazon-connect/amazon-connect-chat-ui-examples.git
    ```
2. This examples uses SPM as dependency manager, once you open the .xcodeproj file make sure that all the required dependencies are added. [More here](https://github.com/amazon-connect/amazon-connect-chat-ios?tab=readme-ov-file#install-via-swift-package-manager)

3. Edit the [Config file](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/mobileChatExamples/iOSChatExample/iOSChatExample/Common/Config.swift) with your instance details as generated in [Prerequisites](#prerequisites)

    > Make sure you have iOS Simulator added [Adding additional simulators](https://developer.apple.com/documentation/safari-developer-tools/adding-additional-simulators)

5. Once everything looks okay, Run the app by clicking on ▶️ button on top left or hit `Cmd + R`.

> Note - If facing build failures related to Notification capability not allowed/enabled, remove:
>  * `NotificationExtension` folder
>  * in `AppDelegate.swift`:
>   * `UserNotifications` import
>   * `UNUserNotificationCenterDelegate` from class definition
>   * `UNUserNotificationCenter` from launch callback method
>   * `userNotificationCenter` methods

## Implementation

The first step to leveraging the Amazon Connect Chat SDK after installation is to import the library into your file. The first step is to call the `StartChatContact` API and pass the response details into the SDK’s `ChatSession` object. Here are some examples of how we would set this up in Swift. For reference, you can visit the `iOSChatExample` demo within the Amazon Connect Chat UI Examples GitHub repository.

### Configuring and Using `ChatSession` in Your Project

The majority of the SDK's functionality will be accessed through the `ChatSession` object. In order to use this object in the file, we have to first import the `AmazonConnectChatIOS` library:

```swift
import AmazonConnectChatIOS
```

Next, we can create a ChatManager class that helps bridge UI and SDK communication. This class should be responsible for managing interactions with the ChatSession object. We can either add it as a class property or reference it directly using `ChatSession.shared`.

```swift
class ChatManager: ObservableObject {
    private var chatSession = ChatSession.shared

    ...
```

Before using the `chatSession` object, we need to set the config for it via the `GlobalConfig` object. Most importantly, the `GlobalConfig` object will be used to set the AWS region that your Connect instance lives in. Here is an example of how to configure the ChatSession object:

```swift
init() {
    let globalConfig = GlobalConfig(region: .USEast1)
    self.chatSession = ChatSession.shared
    chatSession.configure(config: globalConfig)
    ...
}
```

### Creating Participant Connection
After calling `StartChatContact`, we can pass that information to `self.chatSession.connect` to call `createParticipantConnection` and begin the participant’s chat session.

```swift
class ChatManager: ObservableObject {
    private var chatSession = ChatSession.shared

    ...
    private func handleStartChatResponse(_ response: CreateStartChatResponse, completion: @escaping (Bool) -> Void) {
        DispatchQueue.main.async {
            let response = response.data.startChatResult
            self.participantToken = response.participantToken
            let chatDetails = ChatDetails(contactId: response.contactId, participantId: response.participantId, participantToken: response.participantToken)
            self.createParticipantConnection(usingSavedToken: false, chatDetails: chatDetails, completion: completion)
        }
    }
    
    private func createParticipantConnection(usingSavedToken: Bool, chatDetails: ChatDetails, completion: @escaping (Bool) -> Void) {
        self.chatSession.connect(chatDetails: chatDetails) { [weak self] result in
            switch result {
            case .success:
                // Handle success case
            case .failure(let error):
                // Handle error case
            }
        }
    }
    ...
}
```

### Interacting with the Chat Session

After calling `createParticipantConnection`, the SDK will maintain the credentials needed to call any following Amazon Connect Participant Service APIs. Here are some examples of how to call some common Amazon Connect Participant Service APIs. For more in-depth documentation on all APIs, please visit the Amazon Connect Chat SDK for iOS GitHub page.


#### SendMessage
```swift
/// Sends a chat message with plain text content
func sendChatMessage(messageContent: String) {
    self.chatSession.sendMessage(contentType: .plainText, message: messageContent) { [weak self] result in
        self?.handleMessageSendResult(result)
    }
}
```

#### SendEvent
```swift
/// Sends an event to the chat session
func sendEvent(contentType: AmazonConnectChatIOS.ContentType, content: String = "") {
    self.chatSession.sendEvent(event: contentType, content: content) { [weak self] result in
        self?.handleEventSendResult(result)
    }
}
```
#### GetTranscript
```swift
/// Fetches the chat transcript
func fetchTranscript() {
    self.chatSession.getTranscript(scanDirection: .backward, sortOrder: .ascending, maxResults: 15, nextToken: nil, startPosition: nil) { [weak self] result in
        self?.handleFetchTranscriptResult(result)
    }
}
```
#### Disconnect
```swift
/// Disconnects the chat session
func disconnectChat() {
    self.chatSession.disconnect { [weak self] result in
        self?.handleChatDisconnectResult(result)
    }
}
```

### Setting Up Chat Event Handlers
The ChatSession object also exposes handlers for common chat events for users to build on. Here is an example code block that demonstrates how you can register event handlers to chat events.

```swift
private func setupChatSessionHandlers(chatSession: ChatSessionProtocol) {
    self.chatSession.onConnectionEstablished = { [weak self] in
        // Handle established chat connection
    }
    
    self.chatSession.onMessageReceived = { [weak self] transcriptItem in
        // Handle incoming messages
    }
    
    self.chatSession.onTranscriptUpdated = { [weak self] transcript in
        // Handle transcript updates
    }
    
    self.chatSession.onChatEnded = { [weak self] in
        // Handle chat end
    }
    
    self.chatSession.onConnectionBroken = {
        // Handle lost connection
    }
}
```

## Specifications

### Technical Specifications

- Language: Swift 5.x
- Xcode : 15
- iOS: iOS 16 and Higher (⚠️ Required)
- Frameworks:
  - SwiftUI: For UI components and layout.
  - AsyncImage: For loading images asynchronously.
- Networking: Utilizing URLSession for network calls to fetch images and send/receive messages.
- Markdown Parsing: AttributedString for rendering markdown text.

### Code Quality

- MV Architecture: Separation of concerns between the view, model.
- Reusable Components: Modular design with reusable views and components.
- Error Handling: Comprehensive error handling for networking and data persistence.
- Memory Management: Use of @ObservedObject and @State to manage the lifecycle of data objects.
