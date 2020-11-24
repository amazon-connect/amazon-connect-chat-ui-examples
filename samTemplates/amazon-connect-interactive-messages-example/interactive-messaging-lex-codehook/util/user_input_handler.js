/* user_input_hander.js HANDLES INPUTS PROVIDED BY THE USER TO THE CHAT */

const {
  formElicitSlotWithTemplateResponse,
  formTerminalResponse,
  formElicitIntentResponse,
} = require("./response_handler");

const {
  FULFILLMENT_STATES,
  SLOTS,
  TEMPLATE_TYPES,
  ACTIONS,
  TEST_INTERACTIVE_OPTIONS,
  TEST_INTERACTIVE_OPTIONS_SLOTS,
  TEST_INTERACTIVE_OPTIONS_TEMPLATES,
} = require("../constants/interactive_options");

/* HANDLE INITIAL UTTERANCE INPUT */
function handleElicitAction(request) {
  let template = createSimpleListPickerFromOptions(
    "How can I help you?",
    Object.values(ACTIONS)
  );
  return formElicitSlotWithTemplateResponse(
    request.currentIntent.name,
    request.currentIntent.slots,
    SLOTS.ACTION,
    template,
    request.sessionAttributes
  );
}

/* HANDLE ACTION INPUT */
function handleActionResponse(input, request) {
  if (ACTIONS.CONTINUE_TO_AGENT === input  || ACTIONS.END_CHAT === input  ) {
    return formTerminalResponse(
      request.sessionAttributes,
      FULFILLMENT_STATES.FULFILLED,
      `Received '${input}'`
    );
  } else if (ACTIONS.TEST_INTERACTIVE === input) {
    let template = createSimpleListPickerFromOptions(
      "What would you like to do?",
      Object.values(TEST_INTERACTIVE_OPTIONS)
    );
    var outputSessionAttributes = request.sessionAttributes || {};
    return formElicitSlotWithTemplateResponse(
      request.currentIntent.name,
      request.currentIntent.slots,
      SLOTS.INTERACTIVE_OPTION,
      template,
      outputSessionAttributes
    );
  } else {
    throw new Error(`Invalid action recieved: ${input}`);
  }
}

/* HANDLE INTERACTIVE OPTION INPUT */
function handleInteractiveOptionResponse(input, request) {
  let interactionOptionKey = Object.entries(TEST_INTERACTIVE_OPTIONS).filter(
    (entry) => entry[1] == input
  )[0][0];
  console.log(interactionOptionKey);
  let template = TEST_INTERACTIVE_OPTIONS_TEMPLATES[interactionOptionKey];
  let elicitSlot = TEST_INTERACTIVE_OPTIONS_SLOTS[interactionOptionKey];
  
  return formElicitSlotWithTemplateResponse(
    request.currentIntent.name,
    request.currentIntent.slots,
    elicitSlot,
    template,
    request.sessionAttributes
  );
}

/* HANDLE OTHER RESPONSES */
function handleOtherResponse(input, request) {
  let message = `Received '${input}'\n\nPlease send 'help' to start again`;
  return formElicitIntentResponse(
    request.sessionAttributes,
    request.currentIntent.name,
    message
  );
}

/* CREATE A LIST PICKER */
function createSimpleListPickerFromOptions(title, options) {
  let elements = options.map((option) => {
    return { title: option };
  });

  return {
    templateType: TEMPLATE_TYPES.LISTPICKER,
    version: "1.0",
    data: {
      content: {
        title: title,
        subtitle: "Tap to select option",
        elements: elements,
      },
    },
  };
}

module.exports = {
  handleElicitAction,
  handleActionResponse,
  handleInteractiveOptionResponse,
  handleOtherResponse,
};
