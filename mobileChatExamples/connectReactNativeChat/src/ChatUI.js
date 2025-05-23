// ChatUI.js
import React, { useMemo } from 'react';
import { View, Text, Button, Keyboard, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import Spinner from 'react-native-loading-spinner-overlay';
import { useChatContext, ChatProvider } from './ChatContext';

const CUSTOMER_ID = 1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  headerContent: {
    flex: 1,
    marginRight: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  blankScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  launchButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
  }
});

// INPUT: ChatJS message{}
// {
//   "id": "8c300cda-2898-4ec1-9125-0957fa64ce2e",
//   "type": "MESSAGE",
//   "content": {
//     "data": "Please refund my order",
//     "type": "text/plain"
//   },
//   "displayName": "Customer",
//   "participantId": "391ac9d9-acfe-46a5-bac0-7448838e743b",
//   "participantRole": "CUSTOMER",
//   "transportDetails": {
//     "direction": "Outgoing",
//     "status": "SendSuccess",
//     "sentTime": 1747879362.967
//   },
//   "version": 0,
//   "isOldConversation": false,
//   "lastReadReceipt": false,
//   "lastDeliveredReceipt": false
// },
// OUTPUT: GiftedChat message{}
// {
//   "_id": "b97a581e-679a-4e9c-9285-87fd0524ca34",
//   "displayName": "SYSTEM_MESSAGE",
//   "text": "Welcome to Amazon Connect!",
//   "createdAt": "1970-01-21T05:31:13.235Z",
//   "user": {
//     "_id": 2,
//     "name": "Agent",
//     "avatar": "https://www.bcbswy.com/wp-content/uploads/2020/05/20.06.26_bcbswy_avatar_@2.0x.png"
//   }
// },
export const formatChatJSMessage = (msg) => {
  const id = msg.Id || msg.id;
  const content = msg.Content || (msg.content && msg.content.data);
  const participantRole = msg.ParticipantRole || msg.participantRole;
  const displayName = msg.DisplayName || msg.displayName;
  const participantId = msg.ParticipantId || msg.participantId;

  let sentTime;
  if (msg.AbsoluteTime) {
    sentTime = new Date(msg.AbsoluteTime).getTime() / 1000;
  } else if (msg.transportDetails && msg.transportDetails.sentTime) {
    sentTime = msg.transportDetails.sentTime;
  } else {
    sentTime = Date.now() / 1000;
  }

  const isCustomer = participantRole === "CUSTOMER";
  const createdAt = new Date(sentTime * 1000).toISOString();

  return {
    _id: id,
    displayName: displayName,
    text: content,
    createdAt: createdAt,
    user: {
      _id: isCustomer ? CUSTOMER_ID : participantId,
      name: displayName,
      avatar: "https://www.bcbswy.com/wp-content/uploads/2020/05/20.06.26_bcbswy_avatar_@2.0x.png"
    }
  };
}

const ChatUI = () => {
  const {
    initializeChat,
    handleSendMessage,
    handleDisconnect,
    messages,
    isChatActive,
    isLoading
  } = useChatContext();

  const giftedChatMessages = useMemo(() => {
    // Filter out WebSocket events
    const filterChatMessages = messages.filter((transcriptItem) => transcriptItem.ContentType === "text/plain" || transcriptItem.ContentType === "text/markdown");

    // Convert ChatJS messages to GiftedChat format
    return filterChatMessages.map(msg => formatChatJSMessage(msg));
  }, [messages]);

  return (
    <>
      {/* Loading Spinner */}
      <Spinner
        visible={isLoading}
        textContent={'Loading...'}
        textStyle={{ color: '#FFF' }}
      />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Chat UI Demo - Amazon Connect ChatJS</Text>
        </View>
        {isChatActive ? (
          <Button
            title="End Chat"
            onPress={handleDisconnect}
            color="#FF3B30" // iOS red color
          />
        ) : (
          <Button
            title="Launch Chat"
            onPress={initializeChat}
            color="#007AFF"
            style={styles.launchButton}
          />
        )}

      </View>

      {/* Chat UI */}
      <GiftedChat
        messages={giftedChatMessages}
        inverted={false}
        showAvatarForEveryMessage={true}
        renderUsernameOnMessage={true}
        onSend={(msgs) => {
          Keyboard.dismiss()
          handleSendMessage(msgs[0].text)
        }}
        user={{ _id: CUSTOMER_ID }}
        isKeyboardInternallyHandled={false}
        showUserAvatar={false}
        keyboardShouldPersistTaps="never"
      />
    </>
  )
}

const ChatUIWrapper = ({ customerName }) => {
  return (
    <ChatProvider customerName={customerName}>
      <ChatUI />
    </ChatProvider>
  )
}

export default ChatUIWrapper;
