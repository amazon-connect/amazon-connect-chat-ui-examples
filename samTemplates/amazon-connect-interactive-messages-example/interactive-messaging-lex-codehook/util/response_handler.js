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
    sessionAttributes,
    dialogAction: {
      type: "ElicitSlot",
      intentName,
      slots,
      slotToElicit,
      message: {
        contentType: "CustomPayload",
        content: JSON.stringify(template),
      },
    },
  };
}

/* CREATE A RESPONSE BASED TERMINATION UTTERANCE FROM THE USER */
function formTerminalResponse(sessionAttributes,fulfillmentState, messageText) {
  return {
    sessionAttributes,
    dialogAction: {
      type: "Close",
      fulfillmentState,
      message: {
        contentType: "PlainText",
        content: messageText,
      },
    },
  };
}

/* CLEAR THE RECENT INTENT HISTORY TO LET USER START OVER IN THE CHAT*/
function formElicitIntentResponse(sessionAttributes,intentName, messageText) {
  return {
    sessionAttributes,
    recentIntentSummaryView: [],
    dialogAction: {
      type: "ElicitIntent",
      message: {
        contentType: "PlainText",
        content: messageText,
      },
    },
  };
}

module.exports = {
  formElicitSlotWithTemplateResponse,
  formTerminalResponse,
  formElicitIntentResponse,
};
