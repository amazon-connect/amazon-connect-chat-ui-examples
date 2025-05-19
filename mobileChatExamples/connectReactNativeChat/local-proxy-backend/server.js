const express = require('express')
const cors = require('cors')
const { ConnectClient, StartChatContactCommand } = require('@aws-sdk/client-connect')

const app = express();
const PORT = 9000;

const CONFIG = {
  instanceId: process.env.AMAZON_CONNECT_INSTANCE_ID,
  contactFlowId: process.env.AMAZON_CONNECT_CONTACT_FLOW_ID,
  region: process.env.AMAZON_CONNECT_REGION || 'us-west-2',
};
const CREDENTIALS = {
  // generate these with the following cli command:
  // $ aws configure
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
};

app.use(express.json());
app.use(cors());

const client = new ConnectClient({ region: CONFIG.region, credentials: CREDENTIALS })

/**
 * Initiates a chat contact in Amazon Connect.
 * POST http://localhost:9000/start-chat
 *
 * @param {Object} req.body - Request body
 * @returns {Promise<void>} - Responds with chat contact details or error
 *
 * @example
 * // Request body
 * {
 *   "customerName": "John Doe"
 * }
 *
 * // Success response
 * {
 *   "data": {
 *     "ContactId": "string",
 *     "ParticipantId": "string",
 *     "ParticipantToken": "string",
 *     "ContinuedFromContactId": "string"
 *   }
 * }
 */
const startChatContactHandler = async (req, res) => {
  try {
    const customerName = req.body?.customerName || 'Customer';

    // Documentation: https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html
    const StartChatContactRequest = {
      InstanceId: CONFIG.instanceId, // required
      ContactFlowId: CONFIG.contactFlowId, // required
      ParticipantDetails: { DisplayName: customerName },
      SupportedMessagingContentTypes: ['text/plain'],
      Attributes: {
        // Pass contact attributes to the contact flow
        // Accessible under the **User defined** namespace or `$.Attributes['foo']`
        customerName: customerName,
      },
    }

    // Documentation: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/connect/command/StartChatContactCommand
    const command = new StartChatContactCommand(StartChatContactRequest)
    const response = await client.send(command)

    res.json({ data: response });
    // { // StartChatContactResponse
    //   ContactId: "STRING_VALUE",
    //   ParticipantId: "STRING_VALUE",
    //   ParticipantToken: "STRING_VALUE",
    //   ContinuedFromContactId: "STRING_VALUE",
    // };
  } catch (error) {
    console.error('Error starting chat contact:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

app.use('/start-chat', startChatContactHandler);

app.listen(PORT, () => {
  console.log(`Local Proxy API listening: POST http://localhost:${PORT}/start-chat`)
})

module.exports = startChatContactHandler;
