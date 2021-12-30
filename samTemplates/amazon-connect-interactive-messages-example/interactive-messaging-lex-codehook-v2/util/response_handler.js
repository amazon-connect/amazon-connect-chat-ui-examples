/* response_handler.js HANDLES CREATION OF RESPONSES TO THE LEX BOT */

/* CREATE A RESPONSE BASED ON INITIAL USER UTTERANCE */
function formElicitSlotWithTemplateResponse(
  intentName,
  slots,
  slotToElicit,
  template,
  sessionAttributes
) {
  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: "ElicitSlot",
        slotToElicit,
      },
      intent: {
        name: intentName,
        slots,
      }
    },
    messages: [
      {
          contentType: "CustomPayload",
          content: JSON.stringify(template),
      }
    ]
  };
}

/* CREATE A RESPONSE BASED TERMINATION UTTERANCE FROM THE USER */
function formTerminalResponse(sessionAttributes,fulfillmentState, intent, messageText) {
  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: "Close",
      },
      intent: {
        name: intent,
        state: fulfillmentState
      },
    },
    messages: [
      {
          contentType: "PlainText",
          content: messageText,
      }
    ]
  };
}

/* CLEAR THE RECENT INTENT HISTORY TO LET USER START OVER IN THE CHAT*/
function formElicitIntentResponse(sessionAttributes,intentName, messageText) {
  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: "ElicitIntent",
      },
    },
    messages: [
      {
          contentType: "PlainText",
          content: messageText,
      }
    ]
  };
}

module.exports = {
  formElicitSlotWithTemplateResponse,
  formTerminalResponse,
  formElicitIntentResponse,
};