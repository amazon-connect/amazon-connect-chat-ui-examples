# Android Native Chat Demo 📱

This is an example app on how to utilize [ Amazon Connect Chat SDK ](https://github.com/amazon-connect/amazon-connect-chat-android)


> Refer to [#Specifications](#speficications) for details on compatibility, supported versions, and platforms.

**Reference:**

- Admin guide: [https://docs.aws.amazon.com/connect/latest/adminguide/enable-chat-in-app.html](https://docs.aws.amazon.com/connect/latest/adminguide/integrate-chat-with-mobile.html)
- SDK Documentation: https://github.com/amazon-connect/amazon-connect-chat-android/blob/main/README.md


### Demo:

https://github.com/user-attachments/assets/216d9df8-63ad-473f-a14f-9bc7c5ed3ec3



## Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Implementation](#implementation)


## Prerequisites

- Create an Amazon Connect Instance [[guide](https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-instances.html)]
    - OR: enable chat experience for an existing Connect instance. [[guide](../../README.md#enabling-chat-in-an-existing-amazon-connect-contact-center)]

- Create an Amazon Connect Contact Flow, ready to receive chat contacts. [[guide](https://docs.aws.amazon.com/connect/latest/adminguide/chat.html)]

    - Note the `instanceId` [[guide](https://docs.aws.amazon.com/connect/latest/adminguide/find-instance-arn.html)]
    - Find the `contactFlowId` for the ["Sample Inbound Flow (First Contact)"](https://docs.aws.amazon.com/connect/latest/adminguide/sample-inbound-flow.html) [[guide](https://docs.aws.amazon.com/connect/latest/adminguide/find-contact-flow-id.html)]

- Deploy a custom Amazon Connect Chat backend. [Refer to this backend template](../../cloudformationTemplates/startChatContactAPI/README.md)

    - Deploy a StartChatContact template Lambda [[CloudFormation Template](https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI)]
    - Add the `region`, `API_GATEWAY_ID`, `contactFlowId`, and `instanceId` to `endpoints.js`.


## Local Development

> #️⃣ Versions: Android Studio Giraffe, Kotlin 1.9.20
<br>⬇️ Download Android Studio : https://developer.android.com/studio

1. Clone this repository: https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/
    ```sh
    $ git clone https://github.com/amazon-connect/amazon-connect-chat-ui-examples.git
    ```
2. Launch Android Studio and in the project directory open `AndroidChatExample` and let the indexing be finished.
3. Make sure there are no errors after initial gradle build.
4. Edit the Config file with your instance details as generated in [Prerequisites](#prerequisites)
    > While setting up Config's startChatEndpoint Please, remove `Prod/` from your url, as it is appended later in `ApiInterface.kt`

   > Make sure you have Androis Simulator added [Guide: [Adding Android Emulator]](https://developer.android.com/studio/run/managing-avds)

5. Once everything looks okay, Run the app by clicking on ▶️ button `Control + R`or`^ + R`.

## Implementation

The first step is to call the `StartChatContact` API and pass the response details into the SDK’s `ChatSession` object. 

```kotlin
// Start a new chat session by sending a StartChatRequest to the repository
private fun startChat() {
    viewModelScope.launch {
        val participantDetails = ParticipantDetails(displayName = chatConfiguration.customerName)
        val request = StartChatRequest(
            connectInstanceId = chatConfiguration.connectInstanceId,
            contactFlowId = chatConfiguration.contactFlowId,
            participantDetails = participantDetails
        )
        when (val response = chatRepository.startChat(endpoint = chatConfiguration.startChatEndpoint,startChatRequest = request)) {
            is Resource.Success -> {
                response.data?.data?.startChatResult?.let { result ->
                    // handleStartChatResponse(result)
                }
            }
            is Resource.Error -> {
                // Log error
            }

            is Resource.Loading -> // Still loading action
        }
    }
}
```

### Configuring and Using `ChatSession` in Your Project

The majority of the SDKs functionality will be accessed through the `ChatSession` object. In order to use this object in the file, you can inject it using `@HiltViewModel`:

```
class ChatViewModel @Inject constructor(
    private val chatSession: ChatSession, // Injected ChatSession
    private val chatRepository: ChatRepository,
    private val sharedPreferences: SharedPreferences,
) : ViewModel() {
```

If you are not using Hilt, then you can initialize `ChatSession` like this:

```
private val chatSession = ChatSessionProvider.getChatSession(context)
```

In this example, we are using a `ChatViewModel` class that helps bridge UI and SDK communication.  This class is responsible for managing interactions with the SDK's ChatSession object. From here, we can access the SDK's suite of APIs from the `chatSession` property. 

Before using the chatSession object, we need to set the config for it via the GlobalConfig object.  Most importantly, the GlobalConfig object will be used to set the AWS region that your Connect instance lives in.  Here is an example of how to configure the ChatSession object:

```
private suspend fun configureChatSession() {
      val globalConfig = GlobalConfig(region = chatConfiguration.region)
      chatSession.configure(globalConfig)
      ...
  }
```

Once configured, we can pass the response of `StartChatAPI` into `chatSession` object and initiate connection.
```kotlin
// Handle the response after starting a chat session
private fun handleStartChatResponse(result: StartChatResponse.Data.StartChatResult) {
    viewModelScope.launch {
        val chatDetails = ChatDetails(
            contactId = result.contactId,
            participantId = result.participantId,
            participantToken = result.participantToken
        )
        createParticipantConnection(chatDetails)
    }
}
```

## Interacting with Amazon Connect Chat SDK 

From here, you are now ready to interact with the chat via the `ChatSession` object. For more information, please refer to [ Amazon Connect Chat SDK ](https://github.com/amazon-connect/amazon-connect-chat-android).

#### Create Conenection
```kotlin

// Create a connection to the participant chat session
private fun createParticipantConnection(chatDetails: ChatDetails) {
    viewModelScope.launch {
        val result = chatSession.connect(chatDetails) // Attempt connection

        if (result.isSuccess) {
            Log.d("ChatViewModel", "Connection successful $result")
        } else if (result.isFailure) {
            Log.e("ChatViewModel", "Connection failed: ${result.exceptionOrNull()}")
        }
    }
}
```


#### SendMessage
```kotlin
fun sendMessage(text: String) {
    viewModelScope.launch {
        if (text.isNotEmpty()) {
            val result = chatSession.sendMessage(ContentType.RICH_TEXT, text)
            result.onSuccess {
                // Handle success - update UI or state as needed
            }.onFailure { exception ->
                // Handle failure - update UI or state, log error, etc.
                Log.e("ChatViewModel", "Error sending message: ${exception.message}")
            }
        }
    }
}
```


#### How to receive messages
```
chatSession.onMessageReceived = { transcriptItem ->
    // Handle received websocket message if needed
}

chatSession.onTranscriptUpdated = { transcriptList ->
    Log.d("ChatViewModel", "Transcript onTranscriptUpdated last 3 items: ${transcriptList.takeLast(3)}")
    viewModelScope.launch {
        onUpdateTranscript(transcriptList)
    }
}
```

#### SendEvent
```kotlin
fun sendEvent(content: String = "", contentType: ContentType) {
    viewModelScope.launch {
        val result = chatSession.sendEvent(contentType, content)
        result.onSuccess {
            // Handle success - update UI or state as needed
        }.onFailure { exception ->
            // Handle failure - update UI or state, log error, etc.
            Log.e("ChatViewModel", "Error sending event: ${exception.message}")
        }
    }
}
```
#### GetTranscript
```kotlin
fun fetchTranscript(onCompletion: (Boolean) -> Unit) {
    viewModelScope.launch {
        chatSession.getTranscript(ScanDirection.BACKWARD, SortKey.DESCENDING, 30, null, messages?.get(0)?.id).onSuccess {
            Log.d("ChatViewModel", "Transcript fetched successfully")
            onCompletion(true)
        }.onFailure {
            Log.e("ChatViewModel", "Error fetching transcript: ${it.message}")
            onCompletion(false)
        }
    }
}
```
#### Disconnect
```kotlin
fun endChat() {
    clearParticipantToken()
    viewModelScope.launch {
        chatSession.disconnect() // Disconnect from chat session
    }
}
```

#### Setting Up Chat Event Handlers
The ChatSession object also exposes handlers for common chat events for users to build on. Here is an example code block that demonstrates how you can register event handlers to chat events.

```kotlin
private suspend fun setupChatHandlers(chatSession: ChatSession) {
    chatSession.onConnectionEstablished = {
        Log.d("ChatViewModel", "Connection established.")
        _isChatActive.value = true
    }

    chatSession.onMessageReceived = { transcriptItem ->
        // Handle received websocket message if needed
    }

    chatSession.onTranscriptUpdated = { transcriptList ->
        Log.d("ChatViewModel", "Transcript onTranscriptUpdated last 3 items: ${transcriptList.takeLast(3)}")
        viewModelScope.launch {
            onUpdateTranscript(transcriptList)
        }
    }

    chatSession.onChatEnded = {
       Log.d("ChatViewModel", "Chat ended.")
        _isChatActive.value = false
    }

    chatSession.onConnectionBroken = {
        Log.d("ChatViewModel", "Connection broken.")
    }

    chatSession.onConnectionReEstablished = {
        Log.d("ChatViewModel", "Connection re-established.")
        _isChatActive.value = true
    }

    chatSession.onChatSessionStateChanged = {
        Log.d("ChatViewModel", "Chat session state changed: $it")
        _isChatActive.value = it
    }

    chatSession.onDeepHeartBeatFailure = {
        Log.d("ChatViewModel", "Deep heartbeat failure")
    }
}
```

## Specifications

### Technical Specifications

- Language: Kotlin 1.9.20
- Gradle: 8.1.2
- Android Studio Giraffe
- Android: SDK 24 and Higher (⚠️ Required)
- Frameworks:
    - Jetpack Compose: For UI components and layout.
    - AWS Connect Participant SDK to send events and messages.
- Networking: Utilizing OkHTTP retrofit client for network calls.

### Code Quality

- MVVM Architecture: Separation of concerns between the view, model and repository.
- Reusable Components: Modular design with reusable views and components.
- Error Handling: Comprehensive error handling for networking and data persistence.
- State Management and Dependency Injection: Use of Lifecycle Livedata and hilt to manage the state and increase re-usability of data objects.
