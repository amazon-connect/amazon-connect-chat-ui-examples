import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import "amazon-connect-chatjs"; // imports the "window.connect" class
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

// Deploy a proxy backend with this CloudFormation template: https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/master/cloudformationTemplates/startChatContactAPI
const PROXY_API_ENDPOINT = 'https://${apiGatewayId}.execute-api.${region}.amazonaws.com/Prod';
// const PROXY_API_ENDPOINT = 'http://localhost:9000/start-chat';
const CHAT_DETAILS_STORAGE_KEY = 'chatjs-session-chat-details';
const AWS_REGION = 'us-west-2';

const MESSAGE_CONTENT_TYPE = "text/plain";
const CONTACT_STATUS = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ENDED: 'ENDED'
};

const ChatContext = createContext({
  initializeChat: () => { },
  handleSendMessage: () => { },
  handleDisconnect: () => { },
  messages: [],
  isChatActive: false,
  isLoading: false
});

export const ChatProvider = ({ children, customerName = "Joe Shmoe" }) => {
  const [messages, setMessages] = useState([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [contactStatus, setContactStatus] = useState(CONTACT_STATUS.DISCONNECTED);
  const { isConnected } = useNetInfo();

  const fetchChatDetails = async () => {
    const requestBody = { customerName };
    let chatDetails;
    try {
      const response = await fetch(
        PROXY_API_ENDPOINT,
        {
          headers: new Headers(),
          method: 'post',
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();
      chatDetails = result.data.startChatResult;
    } catch (error) {
      console.error(error);
    }

    await AsyncStorage.setItem(CHAT_DETAILS_STORAGE_KEY, JSON.stringify(chatDetails));
    return chatDetails;
  };

  const createChatSession = (chatDetails) => {
    const newChatSession = window.connect.ChatSession.create({
      chatDetails: {
        contactId: chatDetails.ContactId,
        participantId: chatDetails.ParticipantId,
        participantToken: chatDetails.ParticipantToken,
      },
      options: { region: AWS_REGION },
      type: "CUSTOMER",
      disableCSM: true // CSM is an internal feature, safe to disable
    });
    return newChatSession;
  };

  const initializeChat = async () => {
    try {
      setIsLoading(true);

      // Configure ChatJS for React Native
      window.connect.ChatSession.setGlobalConfig({
        loggerConfig: { useDefaultLogger: true }, // Disable logs
        // loggerConfig: { useDefaultLogger: false }, // Enable logs
        webSocketManagerConfig: {
          isNetworkOnline: async () => {
            const state = await NetInfo.fetch();
            return state.isConnected;
          }
        }
      });

      const savedChatDetails = await AsyncStorage.getItem(CHAT_DETAILS_STORAGE_KEY);
      let chatDetails = savedChatDetails ? JSON.parse(savedChatDetails) : await fetchChatDetails();

      // First attempt
      let chatSession = createChatSession(chatDetails);
      const { connectCalled, connectSuccess } = await chatSession.connect();

      // If first attempt fails, try once more with fresh chat details
      if (connectCalled && !connectSuccess) {
        console.error('ERROR: chatSession.connect() was unsuccessful. Generating fresh chatDetails with StartChatContact request');

        // Get fresh chat details for second attempt
        chatDetails = await fetchChatDetails();
        chatSession = createChatSession(chatDetails);

        const reconnectResult = await chatSession.connect();
        if (!reconnectResult.connectSuccess) {
          // Break the infinite loop by throwing an error after second attempt
          throw new Error('Failed to connect even with fresh chat details');
        }
      }
      setSession(chatSession.controller);
      setupEventListeners(chatSession);
      setIsChatActive(true);

      setContactStatus(CONTACT_STATUS.CONNECTED);

      await loadTranscript(chatSession);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      window.alert('Failed to initialize chat, please check ChatContext.js')
      setContactStatus(CONTACT_STATUS.DISCONNECTED);
      AsyncStorage.removeItem(CHAT_DETAILS_STORAGE_KEY)
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = (chatSession) => {
    chatSession.onMessage((event) => {
      console.log('Received WebSocket message/event:', event);
      const { data } = event;

      if (data.ContentType === "application/vnd.amazonaws.connect.event.typing") {
        return;
      }

      if (data.Type === "MESSAGE" && data.ContentType === MESSAGE_CONTENT_TYPE) {
        setMessages((prevMessages) => {
          const exists = prevMessages.some(msg => msg.Id === data.Id);
          if (!exists) {
            return [...prevMessages, data];
          }
          return prevMessages;
        });
      }
    });

    // chatSession.onDeepHeartbeatSuccess(() => {
    //   console.log('WebSocket heartbeat success');
    // });

    // chatSession.onDeepHeartbeatFailure(() => {
    //   console.log('WebSocket heartbeat failure');
    // });

    chatSession.onConnectionEstablished(() => {
      console.log('WebSocket connection established');
      setContactStatus(CONTACT_STATUS.CONNECTED);
    });

    chatSession.onConnectionLost(() => {
      console.log('WebSocket connection lost');
    });

    chatSession.onConnectionBroken(() => {
      console.log('WebSocket connection broken');
    });

    chatSession.onEnded(() => {
      console.log('Chat ended');
      setContactStatus(CONTACT_STATUS.ENDED);
      setIsChatActive(false);
    });
  };

  const loadTranscript = async (chatSession) => {
    if (!chatSession) return;

    try {
      const response = await chatSession.getTranscript({
        scanDirection: "BACKWARD",
        sortOrder: "ASCENDING",
        maxResults: 15
      });

      const { Transcript } = response.data;

      if (Transcript && Transcript.length > 0) {
        setMessages(Transcript);
      }
    } catch (error) {
      console.error('Failed to load transcript:', error);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || !isChatActive || !session) return;

    try {
      await session.sendMessage({
        contentType: MESSAGE_CONTENT_TYPE,
        message: messageText
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDisconnect = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      await session.disconnectParticipant();
      setIsChatActive(false);
      setContactStatus(CONTACT_STATUS.ENDED);
      await AsyncStorage.removeItem(CHAT_DETAILS_STORAGE_KEY);
      setSession(null);
      setMessages([]);
    } catch (error) {
      console.error('Failed to disconnect chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-connect if session storage has chat details
  useEffect(() => {
    const checkSavedChatDetails = async () => {
      const savedChatDetails = await AsyncStorage.getItem(CHAT_DETAILS_STORAGE_KEY);
      if (savedChatDetails && contactStatus === CONTACT_STATUS.DISCONNECTED && !isLoading) {
        console.log('Found saved chat details, attempting to auto-connect');
        initializeChat();
      }
    };

    checkSavedChatDetails();
  }, [contactStatus, isLoading]);

  // Auto-disconnect if device goes offline
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        console.log('Network disconnected, initiating reconnection');

        const reconnectWithBackoff = (attempt = 0) => {
          const maxAttempts = 5;
          const baseDelay = 1000; // 1 second

          if (attempt >= maxAttempts) {
            console.log('Max reconnection attempts reached');
            return;
          }

          const delay = Math.min(
            baseDelay * Math.pow(2, attempt),
            30000 // Max delay of 30 seconds
          );

          console.log(`Reconnection attempt ${attempt + 1}, delay: ${delay}ms`);

          setTimeout(async () => {
            try {
              await initializeChat();
            } catch (error) {
              console.error('Reconnection failed:', error);
              reconnectWithBackoff(attempt + 1);
            }
          }, delay);
        };

        reconnectWithBackoff();
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  const contextValue = useMemo(() => ({
    initializeChat,
    handleSendMessage,
    handleDisconnect,
    messages,
    isChatActive,
    isLoading
  }), [messages, isChatActive, isLoading]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }

  return context;
};

/*
// TypeScript type for ChatJS message {}

interface ChatJSMessage {
  id: string;
  type: string;
  content: {
    data: string;
    type: string;
  };
  displayName: string;
  participantId: string;
  participantRole: string;
  transportDetails: {
    direction: string;
    status: string;
    sentTime: number;
  };
  version: number;
  isOldConversation: boolean;
  lastReadReceipt: boolean;
  lastDeliveredReceipt: boolean;
}
*/
const ChatMessagePropTypes = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  content: PropTypes.shape({
    data: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }).isRequired,
  displayName: PropTypes.string.isRequired,
  participantId: PropTypes.string.isRequired,
  participantRole: PropTypes.string.isRequired,
  transportDetails: PropTypes.shape({
    direction: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    sentTime: PropTypes.number.isRequired
  }).isRequired,
  version: PropTypes.number.isRequired,
  isOldConversation: PropTypes.bool,
  lastReadReceipt: PropTypes.bool,
  lastDeliveredReceipt: PropTypes.bool
});

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
  customerName: PropTypes.string
};

const ChatContextPropTypes = PropTypes.shape({
  initializeChat: PropTypes.func.isRequired,
  handleSendMessage: PropTypes.func.isRequired,
  handleDisconnect: PropTypes.func.isRequired,
  messages: PropTypes.arrayOf(ChatMessagePropTypes).isRequired,
  isChatActive: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired
});

useChatContext.propTypes = {
  __contextValue: ChatContextPropTypes
};

export default ChatContext;
