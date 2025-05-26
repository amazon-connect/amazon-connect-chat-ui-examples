import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ChatUI, { formatChatJSMessage } from './ChatUI';
import * as ChatContextModule from './ChatContext';

const CUSTOMER_ID = 1;

jest.mock('./ChatContext', () => ({
  useChatContext: jest.fn(),
  ChatProvider: ({ children }) => children
}));

describe('<ChatUI/>', () => {
  jest.mock('react-native-gifted-chat', () => ({
    GiftedChat: ({ onSend }) => (
      <button testID="send-button" onPress={() => onSend([{ text: 'test message' }])}>
        Send
      </button>
    )
  }));

  jest.mock('react-native-loading-spinner-overlay', () => 'Spinner');

  const mockInitializeChat = jest.fn();
  const mockHandleSendMessage = jest.fn();
  const mockHandleDisconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    ChatContextModule.useChatContext.mockImplementation(() => ({
      initializeChat: mockInitializeChat,
      handleSendMessage: mockHandleSendMessage,
      handleDisconnect: mockHandleDisconnect,
      messages: [],
      isChatActive: false,
      isLoading: false
    }));
  });

  it('should render the launch chat button when chat is not active', () => {
    const { getByText } = render(<ChatUI />);

    const launchButton = getByText('Launch Chat');
    expect(launchButton).toBeTruthy();

    fireEvent.press(launchButton);
    expect(mockInitializeChat).toHaveBeenCalledTimes(1);
  });

  it('should render the end chat button when chat is active', () => {
    ChatContextModule.useChatContext.mockImplementation(() => ({
      initializeChat: mockInitializeChat,
      handleSendMessage: mockHandleSendMessage,
      handleDisconnect: mockHandleDisconnect,
      messages: [],
      isChatActive: true,
      isLoading: false
    }));

    const { getByText } = render(<ChatUI />);

    const endButton = getByText('End Chat');
    expect(endButton).toBeTruthy();

    fireEvent.press(endButton);
    expect(mockHandleDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe('formatChatJSMessage', () => {
  const AVATAR_URL = "https://www.bcbswy.com/wp-content/uploads/2020/05/20.06.26_bcbswy_avatar_@2.0x.png";

  it('should format a customer message correctly', () => {
    const customerMsg = {
      Id: 'customer123',
      Content: 'Hello, I need help',
      ParticipantRole: 'CUSTOMER',
      DisplayName: 'John Doe',
      ParticipantId: 'customer_john',
      AbsoluteTime: '2023-05-21T10:00:00Z'
    };

    const formattedMsg = formatChatJSMessage(customerMsg);

    expect(formattedMsg).toEqual({
      _id: 'customer123',
      displayName: 'John Doe',
      text: 'Hello, I need help',
      createdAt: '2023-05-21T10:00:00.000Z',
      user: {
        _id: CUSTOMER_ID,
        name: 'John Doe',
        avatar: AVATAR_URL
      }
    });
  });

  it('should format an agent message correctly', () => {
    const agentMsg = {
      id: 'agent456',
      content: { data: 'How can I assist you?' },
      participantRole: 'AGENT',
      displayName: 'Support Agent',
      participantId: 'agent_support',
      AbsoluteTime: '2023-05-21T10:00:00Z'
    };

    const formattedMsg = formatChatJSMessage(agentMsg);

    expect(formattedMsg).toEqual({
      _id: 'agent456',
      displayName: 'Support Agent',
      text: 'How can I assist you?',
      createdAt: '2023-05-21T10:00:00.000Z',
      user: {
        _id: 'agent_support',
        name: 'Support Agent',
        avatar: AVATAR_URL
      }
    });
  });

  it('should use current time if no time is provided', () => {
    const msgWithoutTime = {
      Id: 'no_time_msg',
      Content: 'Test message',
      ParticipantRole: 'CUSTOMER',
      DisplayName: 'Test User'
    };

    const formattedMsg = formatChatJSMessage(msgWithoutTime);

    expect(formattedMsg._id).toBe('no_time_msg');
    expect(formattedMsg.createdAt).toBeTruthy();
  });
});
