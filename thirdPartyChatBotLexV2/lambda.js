/**
 * AWS Lambda Function for Amazon Lex V2 Chatbot with External Bot Integration
 * ---------------------------------------------
 * This code serves as a connector between Amazon Connect and third-party chatbots,
 * allowing external bot platforms to be used within Connect conversations.
 *
 * Compatible with:
 * - Voice call sessions
 * - Chat sessions
 *
 * This Lambda can return:
 * - Plain text messages (voice and chat)
 * - Markdown messages (chat only) - Documentation: https://docs.aws.amazon.com/connect/latest/adminguide/enable-text-formatting-chat.html * - Interactive messages (chat only) - Documentation: https://docs.aws.amazon.com/connect/latest/adminguide/interactive-messages.html
 * - Third-party external bot responses (via API call)
 * - Pass Contact attributes to the Contact Flow - Documentation: https://docs.aws.amazon.com/connect/latest/adminguide/what-is-a-contact-attribute.html
 *
 * Created by: Amazon Connect Chat team
 * Source code: https://github.com/amazon-connect/amazon-connect-chat-ui-examples/tree/spenlep/third-party-bot-setup/thirdPartyChatBotLexV2
 *
 */

const createLexResponse = {
  // For interactive templates (ListPicker, QuickReply, etc.)
  // Documentation: https://docs.aws.amazon.com/connect/latest/adminguide/interactive-messages.html
  withInteractiveMessagePayload: (payload) => ({
    sessionState: {
      dialogAction: {
        type: 'ElicitIntent',
      },
      intent: {
        name: 'FallbackIntent',
      },
      sessionAttributes: {},
    },
    messages: [
      {
        contentType: 'CustomPayload',
        content: JSON.stringify(payload),
      },
    ],
    // requestAttributes: {}
  }),

  // For simple text responses
  withPlainText: (message) => ({
    sessionState: {
      dialogAction: {
        type: 'ElicitIntent',
      },
      intent: {
        name: 'FallbackIntent',
      },
      sessionAttributes: {},
    },
    messages: [
      {
        contentType: 'PlainText',
        content: message,
      },
    ],
  }),

  // For closing the conversation
  withFulfillment: (message, contactAttributes = {}) => ({
    sessionState: {
      dialogAction: {
        type: 'Close',
      },
      intent: {
        name: 'FallbackIntent',
        state: 'Fulfilled',
      },
      sessionAttributes: contactAttributes, // Pass contact attributes to the contact flow. Accessible with `$.Lex.SessionAttributes.['keyName']`
    },
    messages: [
      {
        contentType: 'PlainText',
        content: message,
      },
      // Optional: send multiple messages
      // { contentType: 'PlainText', content: message },
      // { contentType: 'CustomPayload', content: content: JSON.stringify(payload) },
    ],
  }),

  error: (message) => ({
    sessionState: {
      dialogAction: {
        type: 'Close',
      },
      intent: {
        name: 'FallbackIntent',
        state: 'Failed',
      },
      sessionAttributes: {},
    },
    messages: [
      {
        contentType: 'PlainText',
        content: message,
      },
    ],
  }),
};

export const handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const inputText = event.inputTranscript;

    // 1. Initial prompt
    // Handles the first interaction
    if (!event.sessionState?.intent || inputText === 'help') {
      return createLexResponse.withInteractiveMessagePayload({
        templateType: 'QuickReply',
        version: '1.0',
        data: {
          content: {
            title: 'Thank you for contacting Delta Airlines. How can I assist you?',
            elements: [{ title: 'View my flight status' }, { title: 'Talk to an agent' }, { title: 'End chat' }],
          },
        },
      });
    }

    // 2a. Ongoing chat with dynamic responses and external API integration
    // Call external API with user input
    // const response = await fetch(process.env.API_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.API_TOKEN}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     input: inputText
    //   }),
    // });
    // const data = await response.json();
    // const apiResponse = data?.response || data?.text || data;
    // // Return API response
    // return createLexResponse.withPlainText(
    //   typeof apiResponse === 'string' ? apiResponse : JSON.stringify(apiResponse)
    // );

    // 2b. (alternative) Ongoing chat with a hard-coded conversation flow
    switch (inputText) {
      case 'View my flight status':
        return createLexResponse.withInteractiveMessagePayload({
          templateType: 'QuickReply',
          version: '1.0',
          data: {
            content: {
              title: 'Your flight is scheduled for 13:45 PT departure from SEA',
              elements: [{ title: 'Cancel my flight' }, { title: 'Talk to an agent' }, { title: 'End chat' }],
            },
          },
        });
      case 'View my gate':
        // Optional: apply markdown formatting in bot messages
        // Documentation: https://docs.aws.amazon.com/connect/latest/adminguide/enable-text-formatting-chat.html
        return createLexResponse.withPlainText('Your flight is departing at [Gate D14](https://delta.com]');
      default:
        break;
    }

    // 3. Fulfillment response, closing lex bot convo
    // Handles the final stage of conversation, terminates Lex bot session
    if (inputText === 'Talk to an agent') {
      const contactAttributes = { shouldRouteToAgent: true }; // (optional) pass Contact Attributes to the Contact Flow
      return createLexResponse.withFulfillment('Okay, let me connect you with the next available Agent', contactAttributes);
    } else if (inputText === 'End chat') {
      const contactAttributes = { shouldTerminateContactFlow: true };
      return createLexResponse.withFulfillment('Thank you for contact Delta Air Lines. Closing chat session.', contactAttributes);
    }

    // Fallback response
    // Alternatively, you could terminate the session here: `createLexResponse.withFulfillment()`
    return createLexResponse.withInteractiveMessagePayload({
      templateType: 'QuickReply',
      version: '1.0',
      data: {
        content: {
          title: 'Sorry I did not understand your message. Would you like to talk to an agent?',
          elements: [{ title: 'Talk to an agent' }, { title: 'End chat' }],
        },
      },
    });
  } catch (error) {
    // 4. Error, closing lex bot convo
    // Handles any errors during the conversation
    // Returns plain text error message and closes the session
    console.error('Error:', error);
    return createLexResponse.error('Sorry, I encountered an error. Please try again.');
  }
};
