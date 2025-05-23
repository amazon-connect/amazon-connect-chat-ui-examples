// ChatUI.test.js

import { formatChatJSMessage } from './ChatUI';

const CUSTOMER_ID = 1;

describe('<ChatUI/>', () => {
  it.todo('TODO');
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
