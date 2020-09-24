var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    console.log("Received event: " + JSON.stringify(event));

    // Parse event to get contact id
    // Query ddb to get item with contact id
    // Update ddb to include S3 key
    var s3Key = event.Records[0].s3.object.key;
    var contactId = getContactIdFromS3Key(s3Key);

    updateConnectionIdWithS3Key(contactId, s3Key).then((result) => {
        callback(null, buildSuccessfulResponse(result));
    }).catch((err) => {
        console.log("caught error " + err);
        callback(null, buildResponseFailed(err));
    });

    return buildSuccessfulResponse("Success");
};

function getContactIdFromS3Key(s3Key) {
    console.log("Key: " + s3Key);
    var splitString = s3Key.split("/");
    var contactId = splitString[splitString.length-1].split('_')[0];
    console.log("contact id" + contactId);
    return contactId;
}

function updateConnectionIdWithS3Key(contactId, s3Key) {
    return new Promise((resolve, reject) => {
        var params = {
            TableName: process.env.CHAT_DATA_TABLE,
            Key: {
                'contactId': contactId
            },
            UpdateExpression: 'set s3Key = :k',
            ExpressionAttributeValues: {
                ':k' : s3Key
            }
        };

        docClient.update(params, function(err, results) {
            if (err) {
                console.error("Unable to update table with S3 key. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                console.log("Update succeeded.");
                resolve("Success!");
            }
        });
    });
}

function buildSuccessfulResponse(result) {
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            data: result
        })
    };
    console.log("RESPONSE" + JSON.stringify(response));
    return response;
}

function buildResponseFailed(err) {
    const response = {
        statusCode: 500,
        body: JSON.stringify({
            data: {
                "Error": err
            }
        })
    };
    return response;
}
