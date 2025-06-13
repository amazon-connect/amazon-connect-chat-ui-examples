import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatProvider, useChatContext } from './ChatContext';

jest.mock('@react-native-community/netinfo', () => {
  const mockNetInfo = {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn().mockResolvedValue({ isConnected: true })
  };

  return {
    ...mockNetInfo,
    useNetInfo: jest.fn().mockReturnValue({ isConnected: true })
  };
});

const mockConnect = {
  ChatSession: {
    create: jest.fn(),
    setGlobalConfig: jest.fn(),
  }
};

jest.mock('amazon-connect-chatjs', () => { }, { virtual: true });

const mockChatSession = {
  controller: {
    sendMessage: jest.fn(),
    disconnectParticipant: jest.fn(),
  },
  connect: jest.fn(),
  onMessage: jest.fn(),
  onDeepHeartbeatSuccess: jest.fn(),
  onDeepHeartbeatFailure: jest.fn(),
  onConnectionEstablished: jest.fn(),
  onConnectionLost: jest.fn(),
  onConnectionBroken: jest.fn(),
  onEnded: jest.fn(),
  getTranscript: jest.fn(),
};

global.fetch = jest.fn();

describe('ChatContext', () => {
  beforeAll(() => {
    window.connect = mockConnect;
    mockConnect.ChatSession.create.mockReturnValue(mockChatSession);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockChatSession.connect.mockResolvedValue({ connectCalled: true, connectSuccess: true });
    mockChatSession.getTranscript.mockResolvedValue({ data: { Transcript: [] } });

    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        data: {
          startChatResult: {
            ContactId: 'test-contact-id',
            ParticipantId: 'test-participant-id',
            ParticipantToken: 'test-participant-token'
          }
        }
      })
    });
  });

  describe('ChatProvider', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <ChatProvider>
          <Text>Test Child</Text>
        </ChatProvider>
      );

      expect(getByText('Test Child')).toBeTruthy();
    });
  });

  describe('useChatContext', () => {
    it('should provide context values when used within ChatProvider', () => {
      const wrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;
      const { result } = renderHook(() => useChatContext(), { wrapper });

      expect(result.current).toEqual(expect.objectContaining({
        initializeChat: expect.any(Function),
        handleSendMessage: expect.any(Function),
        handleDisconnect: expect.any(Function),
        messages: expect.any(Array),
        isChatActive: expect.any(Boolean),
        isLoading: expect.any(Boolean)
      }));
    });
  });

  describe('initializeChat', () => {
    it('should initialize chat successfully', async () => {
      const wrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;
      const { result, waitForNextUpdate } = renderHook(() => useChatContext(), { wrapper });

      await act(async () => {
        result.current.initializeChat();
        await waitForNextUpdate();
      });

      expect(mockConnect.ChatSession.setGlobalConfig).toHaveBeenCalled();
      expect(mockConnect.ChatSession.create).toHaveBeenCalled();
      expect(mockChatSession.connect).toHaveBeenCalled();
      expect(mockChatSession.onMessage).toHaveBeenCalled();
      expect(mockChatSession.getTranscript).toHaveBeenCalled();
      expect(result.current.isChatActive).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should retry with fresh chat details if first connect fails', async () => {
      mockChatSession.connect
        .mockResolvedValueOnce({ connectCalled: true, connectSuccess: false })
        .mockResolvedValueOnce({ connectCalled: true, connectSuccess: true });

      const wrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;
      const { result, waitForNextUpdate } = renderHook(() => useChatContext(), { wrapper });

      await act(async () => {
        result.current.initializeChat();
        await waitForNextUpdate();
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockConnect.ChatSession.create).toHaveBeenCalledTimes(2);
      expect(mockChatSession.connect).toHaveBeenCalledTimes(2);
      expect(result.current.isChatActive).toBe(true);
    });

    it('should handle initialization failure', async () => {
      mockChatSession.connect.mockResolvedValue({ connectCalled: true, connectSuccess: false });
      global.fetch.mockRejectedValue(new Error('Network error'));

      const wrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;
      const { result, waitForNextUpdate } = renderHook(() => useChatContext(), { wrapper });

      await act(async () => {
        result.current.initializeChat();
        await waitForNextUpdate();
      });

      expect(result.current.isChatActive).toBe(false);
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });

    it('should load transcript after successful connection', async () => {
      const mockTranscript = [
        { Id: 'msg1', Content: 'Hello', ContentType: 'text/plain', Type: 'MESSAGE' },
        { Id: 'msg2', Content: 'Hi there', ContentType: 'text/plain', Type: 'MESSAGE' }
      ];

      mockChatSession.getTranscript.mockResolvedValue({
        data: { Transcript: mockTranscript }
      });

      const wrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;
      const { result, waitForNextUpdate } = renderHook(() => useChatContext(), { wrapper });

      await act(async () => {
        result.current.initializeChat();
        await waitForNextUpdate();
      });

      expect(result.current.messages).toEqual(mockTranscript);
    });
  });

  describe('handleSendMessage', () => {
    it('should send message when chat is active', async () => {
      const wrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;
      const { result, waitForNextUpdate } = renderHook(() => useChatContext(), { wrapper });

      await act(async () => {
        result.current.initializeChat();
        await waitForNextUpdate();
      });

      await act(async () => {
        result.current.handleSendMessage('Hello, world!');
      });

      expect(mockChatSession.controller.sendMessage).toHaveBeenCalledWith({
        contentType: 'text/plain',
        message: 'Hello, world!'
      });
    });

    it('should not send empty messages', async () => {
      const wrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;
      const { result, waitForNextUpdate } = renderHook(() => useChatContext(), { wrapper });

      await act(async () => {
        result.current.initializeChat();
        await waitForNextUpdate();
      });

      await act(async () => {
        result.current.handleSendMessage('  ');
      });

      expect(mockChatSession.controller.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send message when chat is inactive', async () => {
      const wrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;
      const { result } = renderHook(() => useChatContext(), { wrapper });

      await act(async () => {
        result.current.handleSendMessage('Hello, world!');
      });

      expect(mockChatSession.controller.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should disconnect chat session', async () => {
      const wrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;
      const { result, waitForNextUpdate } = renderHook(() => useChatContext(), { wrapper });

      await act(async () => {
        result.current.initializeChat();
        await waitForNextUpdate();
      });

      await act(async () => {
        result.current.handleDisconnect();
      });

      expect(mockChatSession.controller.disconnectParticipant).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
      expect(result.current.isChatActive).toBe(false);
      expect(result.current.messages).toEqual([]);
    });

    it('should not attempt to disconnect when no session exists', async () => {
      const wrapper = ({ children }) => <ChatProvider>{children}</ChatProvider>;
      const { result } = renderHook(() => useChatContext(), { wrapper });

      await act(async () => {
        result.current.handleDisconnect();
      });

      expect(mockChatSession.controller.disconnectParticipant).not.toHaveBeenCalled();
    });
  });
});
