const {
  FULFILLMENT_STATES,
  TEST_INTERACTIVE_OPTIONS,
} = require("./constants/interactive_options");
const { formTerminalResponse } = require("./util/response_handler");
const {
  handleElicitAction,
  handleActionResponse,
  handleInteractiveOptionResponse,
  handleOtherResponse,
} = require("./util/user_input_handler");

/* MAIN HANDLER */
exports.lambdaHandler = async (event, context) => {
  try {
    console.log(`Request received: ${JSON.stringify(event)}`);
    let response = handleRequest(event);
    console.log(`Returning response: ${JSON.stringify(response)}`);
    return response;
  } catch (err) {
    console.error(`Error processing Lex request:`, err);
    return formTerminalResponse(
      FULFILLMENT_STATES.FAILED,
      "Error in Lex Lambda"
    );
  }
};

/* PROCESS INBOUND MESSAGE */
function handleRequest(request) {
  let input = request.inputTranscript;
  let recent_intent = request.recentIntentSummaryView;
  let current_intent = request.currentIntent.name;

  /* HANDLE INTENT 'InteractiveMessageIntent' */
  if (current_intent === 'InteractiveMessageIntent' && recent_intent === null) {
    return handleElicitAction(request);
  } else if (current_intent === 'InteractiveMessageIntent' && !recent_intent[0].slots.action) {
    return handleActionResponse(input, request);
  } else if (current_intent === 'InteractiveMessageIntent' && Object.values(TEST_INTERACTIVE_OPTIONS).includes(input) && recent_intent[0].slots.interactiveOption === null) {
    return handleInteractiveOptionResponse(input, request);
  } 
  /* (optional) HANDLE OTHER INTENTS */

  /* HANDLE FULFILLED INTENT */
  else {
    return handleOtherResponse(input, request);
  }
}