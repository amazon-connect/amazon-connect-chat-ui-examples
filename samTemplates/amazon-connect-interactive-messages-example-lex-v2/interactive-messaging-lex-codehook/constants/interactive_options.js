/*AMAZON CONNECT TEMPLATE TYPES FOR INTERACTIVE MESSAGING*/
// Documentation: https://docs.aws.amazon.com/connect/latest/adminguide/interactive-messages.html#panel
const TEMPLATE_TYPES = {
  LISTPICKER: "ListPicker",
  TIMEPICKER: "TimePicker",
  QUICK_REPLY: "QuickReply",
  CAROUSEL: "Carousel",
  // PANEL: "Panel" same as ListPicker but up to 10 elements
};

/*IMAGES USED FOR INTERACTIVE MESSAGES*/
//Image urls need to be changed after we get a new S3 bucket in prod to host images and other resources
const IMAGE_URLS = {
  BILLING:
    "https://amazon-connect-interactive-message-blog-assets.s3-us-west-2.amazonaws.com/interactive-images/billing.jpg",
  NEW_SERVICE:
    "https://amazon-connect-interactive-message-blog-assets.s3-us-west-2.amazonaws.com/interactive-images/new_service.jpg",
  CANCELLATION:
    "https://amazon-connect-interactive-message-blog-assets.s3-us-west-2.amazonaws.com/interactive-images/cancel.jpg",
  COMPANY:
    "https://amazon-connect-interactive-message-blog-assets.s3-us-west-2.amazonaws.com/interactive-images/company.jpg",
};

/*FULFILLMENT STATES FOR AMAZON LEX BOT INTENTS*/
const FULFILLMENT_STATES = {
  FULFILLED: "Fulfilled",
  FAILED: "FAILED",
};

/*SLOTS SUPPORTED IN AMAZON LEX CHAT BOT*/
const SLOTS = {
  ACTION: "action",
  INTERACTIVE_OPTION: "interactiveOption",
  DEPARTMENT: "department",
  QUICK_REPLY: "quickReply",
  FLIGHT_OPTIONS_CAROUSEL: "flightOptions",
  APPOINTMENT: "appointment"
};


/*VALUES SUPPORTED IN THE DEPARTMENT SLOT*/
const DEPARTMENT_SLOT = {
  BILLING: "Billing",
  CANCELLATION: "Cancellation",
  NEW_SERVICE: "New Service",
};

/*ACTIONS THAT A USER CAN TAKE */
const ACTIONS = {
  TEST_INTERACTIVE: "Check self-service options",
  CONTINUE_TO_AGENT: "Talk to an agent",
  END_CHAT: "End chat",
};

/*SELF-SERVICE OPTIONS WHEN USER SELECTS "CHECK SELF-SERVICE OPTIONS" AS AN ACTION*/
const TEST_INTERACTIVE_OPTIONS = {
  DEPARTMENT_WITH_MULTIPLE_IMAGES: "Choose a department",
  SIMPLE_QUICK_REPLY_PICKER: "Rate my experience",
  FLIGHT_OPTIONS_CAROUSEL_PICKER: "View flight options",
  SIMPLE_TIMEPICKER: "Schedule a meeting with an agent"
};


/*MAPPING SELF-SERVICE OPTIONS TO AMAZON LEX BOT SLOTS*/
const TEST_INTERACTIVE_OPTIONS_SLOTS = {
  DEPARTMENT_WITH_MULTIPLE_IMAGES: SLOTS.DEPARTMENT,
  SIMPLE_QUICK_REPLY_PICKER: SLOTS.QUICK_REPLY,
  FLIGHT_OPTIONS_CAROUSEL_PICKER: SLOTS.FLIGHT_OPTIONS_CAROUSEL,
  SIMPLE_TIMEPICKER: SLOTS.APPOINTMENT,
  INVALID: SLOTS.DEPARTMENT,
  DEPARTMENT_LISTPICKER: SLOTS.DEPARTMENT
};

/*MAPPING SELF-SERVICE OPTIONS TO INTERACTIVE MESSAGE TEMPLATES*/
const TEST_INTERACTIVE_OPTIONS_TEMPLATES = {
  INVALID: {},
  DEPARTMENT_LISTPICKER: {
    templateType: TEMPLATE_TYPES.LISTPICKER,
    version: "1.0",
    data: {
      content: {
        title: "Which department would you like?",
        subtitle: "Tap to select option",
        elements: [
          {
            title: DEPARTMENT_SLOT.BILLING,
            subtitle: "For billing issues",
          },
          {
            title: DEPARTMENT_SLOT.NEW_SERVICE,
            subtitle: "For new service",
          },
          {
            title: DEPARTMENT_SLOT.CANCELLATION,
            subtitle: "For new service requests",
          },
        ],
      },
    },
  },
  SIMPLE_TIMEPICKER: {
    templateType: TEMPLATE_TYPES.TIMEPICKER,
    version: "1.0",
    data: {
      content: {
        title: "Schedule appointment",
        subtitle: "Tap to select option",
        timeslots: [
          {
            date: "2020-10-31T18:00+00:00",
            duration: 60,
          },
          {
            date: "2020-10-15T13:00+00:00",
            duration: 60,
          },
          {
            date: "2020-10-15T16:00+00:00",
            duration: 60,
          },
        ],
      },
    },
  },
  DEPARTMENT_WITH_MULTIPLE_IMAGES: {
    templateType: TEMPLATE_TYPES.LISTPICKER,
    version: "1.0",
    data: {
      content: {
        title: "Which department do you want to select?",
        subtitle: "Tap to select option",
        imageType: "URL",
        imageData: IMAGE_URLS.COMPANY,
        elements: [
          {
            title: DEPARTMENT_SLOT.BILLING,
            subtitle: "Request billing information",
            imageType: "URL",
            imageData: IMAGE_URLS.BILLING,
          },
          {
            title: DEPARTMENT_SLOT.NEW_SERVICE,
            subtitle: "Set up a new service",
            imageType: "URL",
            imageData: IMAGE_URLS.NEW_SERVICE,
          },
          {
            title: DEPARTMENT_SLOT.CANCELLATION,
            subtitle: "Request a cancellation",
            imageType: "URL",
            imageData: IMAGE_URLS.CANCELLATION,
          },
        ],
      },
    },
  },
  SIMPLE_QUICK_REPLY_PICKER: {
    templateType: TEMPLATE_TYPES.QUICK_REPLY,
    version: "1.0",
    data: {
      content: {
        title: "How was your experience?",
        subtitle: "Tap to select option",
        buttons: [
          {
            text: "Good",
          },
          {
            text: "Bad",
          },
          {
            text: "Neutral",
          },
        ],
      },
    },
  },
  FLIGHT_OPTIONS_CAROUSEL_PICKER: {
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
  }
};

module.exports = {
  FULFILLMENT_STATES,
  SLOTS,
  TEMPLATE_TYPES,
  ACTIONS,
  TEST_INTERACTIVE_OPTIONS,
  TEST_INTERACTIVE_OPTIONS_SLOTS,
  TEST_INTERACTIVE_OPTIONS_TEMPLATES,
};
