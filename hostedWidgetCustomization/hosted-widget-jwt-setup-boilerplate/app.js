const express = require('express');
const jwt = require('jsonwebtoken');
const { DateTime, Duration } = require('luxon'); // Install luxon package if not already installed

const app = express();
const port = 3000;

const MY_SECRET = '<jwtSecret_REPLACE_ME>'; // Replace with your actual secret key
const JWT_ALGORITHM = 'HS256';
const JWT_EXP_DELTA_SECONDS = 600; // 1 hour expiration time  

app.use(express.static('public')); // Serve static html files from 'public' folder

app.get('/token', (req, res) => {
  const widgetId = req.query.widgetId;

  // Create a duration in seconds
  const durationInSeconds = Duration.fromObject({ seconds: JWT_EXP_DELTA_SECONDS });

  // Build the payload
  const payload = {
    sub: widgetId,
    iat: DateTime.utc().toSeconds(),
    exp: DateTime.utc().plus(durationInSeconds).toSeconds(),
    attributes: { verificationCode: 'foobar' } // OPTIONAL - docs: https://docs.aws.amazon.com/connect/latest/adminguide/pass-contact-attributes-chat.html
  };

  const header = {
    typ: 'JWT',
    alg: JWT_ALGORITHM,
  };

  const encoded_token = jwt.sign(payload, MY_SECRET, { algorithm: JWT_ALGORITHM, header });

  res.json({ data: encoded_token });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});