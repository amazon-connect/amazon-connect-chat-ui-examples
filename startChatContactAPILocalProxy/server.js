const express = require('express')
const cors = require('cors')
const { ConnectClient, StartChatContactCommand } = require('@aws-sdk/client-connect')

const app = express()
const PORT = 3000
const REGION = 'us-west-2' // AWS region of the instance
const CREDENTIALS = {
  // Documentation: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html
  accessKeyId: '<STRING>',
  secretAccessKey: '<STRING>',
  sessionToken: '<STRING>',
}

app.use(express.json())
app.use(cors())

const client = new ConnectClient({ region: REGION, credentials: CREDENTIALS })

const startChatContactHandler = async (req, res) => {
  try {
    // Documentation: https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html
    const StartChatContactRequest = {
      InstanceId: req.body.InstanceId, // required
      ContactFlowId: req.body.ContactFlowId, // required
      ParticipantDetails: req.body.ParticipantDetails || { DisplayName: 'Customer' },
      SupportedMessagingContentTypes: req.body.SupportedMessagingContentTypes || ['text/plain'],
      Attributes: {
        customerName: req.body.ParticipantDetails ? req.body.ParticipantDetails.DisplayName : 'Customer',
      },
      ChatDurationInMinutes: req.body.ChatDurationInMinutes, // optional
      PersistentChat: req.body.PersistentChat, // optional
    }

    // Documentation: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/connect/command/StartChatContactCommand
    const command = new StartChatContactCommand(StartChatContactRequest)
    const response = await client.send(command)

    res.json({ data: { startChatResult: response } })
  } catch (error) {
    console.error('Error starting chat contact:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

app.use('/startChatContact', startChatContactHandler)

app.listen(PORT, () => {
  console.log(`StartChatContact Proxy API listening on port ${PORT}`)
})

module.exports = startChatContactHandler
