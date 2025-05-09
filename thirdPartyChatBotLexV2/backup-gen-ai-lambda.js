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

// Import AWS SDK for Bedrock Runtime
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock client in us-west-2 region
const bedrockClient = new BedrockRuntimeClient({ region: "us-west-2" });

/**
 * Parse the Bedrock response to check for interactive options
 * @param {string} text - The response text from Bedrock
 * @returns {Object} - Object with text and options if present
 */
function parseBedrockResponse(text) {
  // Default result with just the text
  const result = {
    text: text,
    hasOptions: false,
    options: [],
    templateType: 'QuickReply' // Default template type
  };

  // Check if the response contains options in the specified format
  const optionsMatch = text.match(/OPTIONS(?:-(\w+))?:\s*\[(.*?)\]/s);
  if (optionsMatch) {
    // Check if a template type was specified (OPTIONS-ListPicker or OPTIONS-QuickReply)
    const templateType = optionsMatch[1] ? optionsMatch[1] : null;
    const optionsText = optionsMatch[2].trim();

    // Set the template type if specified, otherwise default to QuickReply
    if (templateType && ['ListPicker', 'QuickReply'].includes(templateType)) {
      result.templateType = templateType;
    }

    // Extract the options text and split by commas
    const options = optionsText.split(',')
      .map(option => option.trim())
      .filter(option => option.length > 0);

    if (options.length > 0) {
      result.hasOptions = true;

      // Format options based on template type
      if (result.templateType === 'ListPicker') {
        result.options = options.map(option => ({
          title: option,
          value: option
        }));
      } else {
        // QuickReply format
        result.options = options.map(option => ({ title: option }));
      }

      // Remove the OPTIONS section from the text
      result.text = text.replace(/OPTIONS(?:-\w+)?:\s*\[(.*?)\]/s, '').trim();
    }
  }

  return result;
}

async function invokeBedrockModel(prompt) {
  const adminPrompt = "You are a helpful assistant. You will be given a prompt and you will respond with a short and clean answer. The answer should be less than 100 words. Do not include any preamble or explanation. You are a contact center agent you can research flight data and customer purchases. Use fake information to pretend to be a real customer service agent. You will be proactive and send mock customer data that you have looked up in the internal company system. You will provide this data to customer, but it will not have PII. You can also send links, use full dummy links. ONLY for questions where the user is clearly asking to choose between multiple options or where a selection would be genuinely helpful (like booking options, service categories, or troubleshooting paths), include 2-5 options at the end of your response using one of these formats: 'OPTIONS: [Option 1, Option 2, Option 3]' for quick replies or 'OPTIONS-ListPicker: [Option 1, Option 2, Option 3]' for list picker format. For most informational questions, just provide a plain text response without options. For example, if asked about flight options, you might end with 'OPTIONS-ListPicker: [Check flight status, View my booking, Change my seat]', but if asked about weather or a simple fact, just answer directly without options. If the user asks about templates or interactive messages, explain that they can type phrases like 'render time picker template', 'show carousel template', 'display panel', etc. to see examples of different interactive templates. The prompt is: "
  try {
    const request = {
      modelId: "us.amazon.nova-micro-v1:0",
      inferenceProfileArn: "arn:aws:bedrock:us-west-2:112008460156:inference-profile/us.amazon.nova-micro-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        "inferenceConfig": {
          "max_new_tokens": 1000
        },
        messages: [
          {
            "role": "user",
            "content": [
              {
                "text": adminPrompt,
              }
            ]
          },
          {
            "role": "user",
            "content": [
              {
                "text": prompt
              }
            ]
          }
        ]
      })
    };

    const command = new InvokeModelCommand(request);
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const rawText = responseBody?.output?.message?.content?.[0]?.text;
    return parseBedrockResponse(rawText);
    // {
    //   output: {
    //     message: {
    //       role: 'assistant',
    //       content: [
    //         {
    //           text: "Sure, here's a short and clean cloud computing joke for you:\n" +
    //             '\n' +
    //             'Why did the cloud go to school?\n' +
    //             '\n' +
    //             'To get better at "rain"ing knowledge!'
    //         }
    //       ],
    //     }
    //   },
    //   stopReason: 'end_turn',
    //   usage: {
    //     inputTokens: 11,
    //     outputTokens: 32,
    //     totalTokens: 43,
    //     cacheReadInputTokenCount: 0,
    //     cacheWriteInputTokenCount: 0
    //   },
    // }
  } catch (error) {
    console.error("Error invoking Bedrock model:", error);
    throw error;
  }
}

const dummyQuickReply = {
  "templateType": "QuickReply",
  "version": "1.0",
  "data": {
    "replyMessage": {
      "title": "Thanks for selecting!"
    },
    "content": {
      "title": "Which department would you like?",
      "elements": [{
        "title": "Billing"
      },
      {
        "title": "Cancellation"
      },
      {
        "title": "New Service"
      }
      ]
    }
  }
}

const dummyPanel = {
  "templateType": "Panel",
  "version": "1.0",
  "data": {
    "replyMessage": {
      "title": "Thanks for selecting!",
      "subtitle": "Option selected",
    },
    "content": {
      "title": "How can I help you?",
      "subtitle": "Tap to select option",
      "imageType": "URL",
      "imageData": "https://interactive-msg.s3-us-west-2.amazonaws.com/company.jpg",
      "imageDescription": "Select an option",
      "elements": [
        {
          "title": "Check self-service options",
        },
        {
          "title": "Talk to an agent",
        },
        {
          "title": "End chat",
        }
      ]
    }
  }
};

const dummyTimePicker = {
  "templateType": "TimePicker",
  "version": "1.0",
  "data": {
    "replyMessage": {
      "title": "Thanks for selecting",
      "subtitle": "Appointment selected",
      "imageType": "URL",
      "imageData": "https://interactive-msg.s3-us-west-2.amazonaws.com/booked.jpg",
      "imageDescription": "Appointment booked"
    },
    "content": {
      "title": "Schedule appointment",
      "subtitle": "Tap to select option",
      "imageType": "URL",
      "imageData": "https://interactive-msg.s3-us-west-2.amazonaws.com/calendar.jpg",
      "imageDescription": "Appointment booked",
      "timeZoneOffset": -450,
      "location": {
        "latitude": 47.616299,
        "longitude": -122.4311,
        "title": "Oscar",
        "radius": 1,
      },
      "timeslots": [
        {
          "date": "2020-10-31T17:00+00:00",
          "duration": 60,
        },
        {
          "date": "2020-11-15T13:00+00:00",
          "duration": 60,
        },
        {
          "date": "2020-11-15T16:00+00:00",
          "duration": 60,
        }
      ],
    }
  }
};

const dummyCarousel = {
  "templateType": "Carousel",
  "version": "1.0",
  "data": {
    "content": {
      "title": "View our popular destinations",
      "elements": [
        {
          "templateIdentifier": "template0",
          "templateType": "Panel",
          "version": "1.0",
          "data": {
            "content": {
              "title": "California",
              "subtitle": "Tap to select option",
              "elements": [
                {
                  "title": "Book flights"
                },
                {
                  "title": "Book hotels"
                },
                {
                  "title": "Talk to agent"
                }
              ]
            }
          }
        },
        {
          "templateIdentifier": "template1",
          "templateType": "Panel",
          "version": "1.0",
          "data": {
            "content": {
              "title": "New York",
              "subtitle": "Tap to select option",
              "elements": [
                {
                  "title": "Book flights"
                },
                {
                  "title": "Book hotels"
                },
                {
                  "title": "Talk to agent"
                }
              ]
            }
          }
        }
      ]
    }
  }
};

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
  const defaultQuickReplyOptions = [
    { title: 'Send Interactive Messages' },
    { title: 'Render Stargate View' },
    { title: 'Talk to an agent' },
    { title: 'Talk to Gen AI chatbot' },
    { title: 'End chat' },
  ];

  try {
    const inputText = event.inputTranscript;
    // 1. Initial prompt
    if (!event.sessionState?.intent || inputText === 'help') {
      return createLexResponse.withInteractiveMessagePayload({
        templateType: 'QuickReply',
        version: '1.0',
        data: {
          content: {
            title: 'Thank you for contacting WorldsBestContactCenter. How can I assist you?',
            elements: defaultQuickReplyOptions
          },
        },
      });
    }

    // // External API integration
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

    /**
     * Function to detect template type from natural language input
     * @param {string} text - User input text
     * @returns {string|null} - Template type or null if not detected
     */
    function detectTemplateType(text) {
      const lowerText = text.toLowerCase();

      // Check for QuickReply template requests
      if (lowerText.includes('quick reply') ||
        lowerText.includes('quickreply') ||
        lowerText.match(/\bquick\s+response/)) {
        return 'QuickReply';
      }

      // Check for ListPicker template requests
      if (lowerText.includes('list picker') ||
        lowerText.includes('listpicker') ||
        lowerText.match(/\blist\s+template/)) {
        return 'ListPicker';
      }

      // Check for TimePicker template requests
      if (lowerText.includes('time picker') ||
        lowerText.includes('timepicker') ||
        lowerText.match(/\btime\s+template/) ||
        lowerText.includes('appointment') ||
        lowerText.includes('schedule')) {
        return 'TimePicker';
      }

      // Check for Panel template requests
      if (lowerText.includes('panel') ||
        lowerText.match(/\bpanel\s+template/)) {
        return 'Panel';
      }

      // Check for Carousel template requests
      if (lowerText.includes('carousel') ||
        lowerText.match(/\bcarousel\s+template/)) {
        return 'Carousel';
      }

      return null;
    }

    // Check if the user is requesting a specific template type
    const requestedTemplateType = detectTemplateType(inputText);
    if (requestedTemplateType) {
      console.log(`Detected template request: ${requestedTemplateType}`);

      // Return the appropriate dummy template
      switch (requestedTemplateType) {
        case 'QuickReply':
          return createLexResponse.withInteractiveMessagePayload(dummyQuickReply);
        case 'ListPicker':
          return createLexResponse.withInteractiveMessagePayload({
            templateType: 'ListPicker',
            version: '1.0',
            data: {
              content: {
                title: 'Please select an option',
                subtitle: 'Subtitle',
                elements: [
                  {
                    title: 'View my flight status',
                    value: 'View my flight status',
                  },
                  {
                    title: 'View my gate',
                    value: 'View my gate',
                  },
                ],
              },
            },
          });
        case 'TimePicker':
          return createLexResponse.withInteractiveMessagePayload(dummyTimePicker);
        case 'Panel':
          return createLexResponse.withInteractiveMessagePayload(dummyPanel);
        case 'Carousel':
          return createLexResponse.withInteractiveMessagePayload(dummyCarousel);
      }
    }

    // 2. Hard-coded responses
    switch (inputText.toLowerCase()) {
      case 'talk to gen ai chatbot':
        return createLexResponse.withPlainText("Hello, I'm your Gen AI Chatbot (Bedrock). Type any message or ask a question to get started.")
      case 'send interactive messages':
        return createLexResponse.withInteractiveMessagePayload({
          templateType: 'QuickReply',
          version: '1.0',
          data: {
            content: {
              title: 'Thank you for contacting WorldsBestContactCenter. How can I assist you?',
              elements: [
                { title: 'QuickReply' },
                { title: 'ListPicker' },
                { title: 'Carousel' }]
            },
          },
        });
      case 'quickreply':
        return createLexResponse.withInteractiveMessagePayload({
          templateType: 'QuickReply',
          version: '1.0',
          data: {
            content: {
              title: 'Rate your experience',
              elements: [
                { title: '1' },
                { title: '2' },
                { title: '3' },
                { title: '4' },
                { title: '5' },
              ]
            },
          },
        });
      case 'listpicker':
        return createLexResponse.withInteractiveMessagePayload({
          templateType: 'ListPicker',
          version: '1.0',
          data: {
            content: {
              title: 'Please select an option',
              subtitle: 'Subtitle',
              elements: [
                {
                  title: 'View my flight status',
                  value: 'View my flight status',
                },
                {
                  title: 'View my gate',
                  value: 'View my gate',
                },
              ],
            },
          },
        });
      case 'back to main menu':
        return createLexResponse.withInteractiveMessagePayload({
          templateType: 'QuickReply',
          version: '1.0',
          data: {
            content: {
              title: 'How can I assist you today?',
              elements: defaultQuickReplyOptions
            },
          },
        });
      // Fullfillment responses -  terminates Lex bot session
      case 'talk to an agent':
        var contactAttributes = { shouldRouteToAgent: true }; // (optional) pass Contact Attributes to the Contact Flow
        return createLexResponse.withFulfillment('Okay, let me connect you with the next available Agent', contactAttributes);
      case 'end chat':
        var contactAttributes = { shouldTerminateContactFlow: true };
        return createLexResponse.withFulfillment('Thank you for contact WorldsBestContactCenter. Ending chat session.', contactAttributes);
      case 'render stargate view':
        return createLexResponse.withFulfillment('Okay, let me render the Stargate form.\nTo edit, see the **"Show View"** block in the contact flow.', { shouldRenderView: true })
      default:
        break;
    }

    // Fallback response
    // Queries Nova Micro on Bedrock
    const bedrockResponse = await invokeBedrockModel(inputText);

    // Check if the response has interactive options
    if (bedrockResponse.hasOptions && bedrockResponse.options.length > 0) {
      // Only use interactive templates if there are enough options to justify it
      // or if the response seems to be asking for a selection
      const needsInteractiveTemplate = bedrockResponse.options.length >= 2 ||
        bedrockResponse.text.toLowerCase().includes('select') ||
        bedrockResponse.text.toLowerCase().includes('choose') ||
        bedrockResponse.text.toLowerCase().includes('pick') ||
        bedrockResponse.text.toLowerCase().includes('option');

      if (needsInteractiveTemplate) {
        // Return an interactive message with the options using the appropriate template type
        return createLexResponse.withInteractiveMessagePayload({
          templateType: bedrockResponse.templateType,
          version: '1.0',
          data: {
            content: {
              title: bedrockResponse.text,
              subtitle: bedrockResponse.templateType === 'ListPicker' ? 'Please select an option' : undefined,
              elements: bedrockResponse.options
            },
          },
        });
      } else {
        // Format options as text if we don't need an interactive template
        const optionsText = bedrockResponse.options.map(option =>
          `• ${option.title || option.value}`).join('\n');
        return createLexResponse.withPlainText(
          bedrockResponse.text + '\n\n' + optionsText + '\n\nNote, type "help" to reset chat'
        );
      }
    } else {
      // Return a plain text response
      return createLexResponse.withPlainText(bedrockResponse.text + '\n\n Note, type "help" to reset chat');
    }
  } catch (error) {
    // 4. Error, closing lex bot convo
    // Handles any errors during the conversation
    // Returns plain text error message and closes the session
    console.error('Error:', error);
    return createLexResponse.error('Sorry, I encountered an error. Please try again.');
  }
};


// -- LOCAL TESTING CODE (IGNORE) --

// const mockPrompt = "tell me a joke";
// const mockEvent = {
//   "sessionId": "asdf-asdf-asdf-ae78-0feb82411207",
//   "requestAttributes": {
//     "x-amz-lex:accept-content-types": "PlainText",
//     "x-amz-lex:channels:platform": "Connect Chat"
//   },
//   "inputTranscript": mockPrompt,
//   "interpretations": [
//     {
//       "intent": {
//         "name": "FallbackIntent",
//         "state": "InProgress",
//         "slots": {},
//         "confirmationState": "None"
//       },
//       "interpretationSource": "Lex"
//     },
//     {
//       "intent": {
//         "name": "ThirdPartyBotIntentUnused",
//         "state": "InProgress",
//         "slots": {},
//         "confirmationState": "None"
//       },
//       "interpretationSource": "Lex",
//       "nluConfidence": 0.5
//     }
//   ],
//   "bot": {
//     "name": "ThirdPartyBotBoilerplateLexV2",
//     "version": "1",
//     "localeId": "en_US",
//     "id": "92748AAADDD",
//     "aliasId": "JAHDHD092934",
//     "aliasName": "ProductionAlias"
//   },
//   "responseContentType": "text/plain; charset=utf-8",
//   "messageVersion": "1.0",
//   "invocationSource": "DialogCodeHook",
//   "sessionState": {
//     "sessionAttributes": {
//       "x-amz-lex:connect-originating-request-id": "asdf-356c-asdf-asdf-1f45c0eaf3b1"
//     },
//     "intent": {
//       "name": "FallbackIntent",
//       "state": "InProgress",
//       "slots": {},
//       "confirmationState": "None"
//     },
//     "originatingRequestId": "asdf-356c-asdf-asdf-1f45c0eaf3b1"
//   },
//   "transcriptions": [
//     {
//       "resolvedContext": {
//         "intent": "FallbackIntent"
//       },
//       "transcription": mockPrompt,
//       "resolvedSlots": {},
//       "transcriptionConfidence": 1
//     }
//   ],
//   "inputMode": "Text"
// };

// (async () => {

//   await handler(mockEvent)
//     .then(result => {
//       console.log(result)
//     })
//     .catch(err => {
//       console.error(err)
//     });

// })();
