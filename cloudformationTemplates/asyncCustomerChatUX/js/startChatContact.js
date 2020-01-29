var AWS = require('aws-sdk');
AWS.config.update({region: process.env.REGION});

var connect = new AWS.Connect();
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    console.log("Received event: " + JSON.stringify(event));
    var body = JSON.parse(event["body"]);
    console.log("body: " + JSON.stringify(body));

    var userId = body.Username.toLowerCase();
    var displayName = body.Attributes.customerName.toLowerCase();

    var contactFlowId = "";
    if(body.hasOwnProperty('ContactFlowId')){
        contactFlowId = body["ContactFlowId"];
    }
    console.log("CF ID: " + contactFlowId);
    
    var instanceId = "";
    if(body.hasOwnProperty('InstanceId')){
        instanceId = body["InstanceId"];
    }
    console.log("Instance ID: " + instanceId);

    var result = {};
    result.username = userId;
    result.instanceId = instanceId;

    // Check ddb for the current chat. if there is no S3 location then the chat is in progress.
    getPreviousContactData(userId, displayName).then((previousConnectionData) => {
        console.log("Prev contact data: " + JSON.stringify(previousConnectionData));
        result.previousContactId = previousConnectionData.currentContactId;
        var s3Key = previousConnectionData.s3Key;
        var hasTokenExpired = false;
        if (previousConnectionData.date) {
            console.log("prev date: " + previousConnectionData.date + " vs. now: " + getCurrentTime());
            hasTokenExpired = (getCurrentTime() - previousConnectionData.date) > 86400;
        }

        if ("NONE" == s3Key && previousConnectionData.currentContactId != "INITIAL_CHAT" && !hasTokenExpired) {
            result.startChatResult = previousConnectionData.startChatResult;
            result.previousContactId = previousConnectionData.previousContactId;
            callback(null, buildSuccessfulResponse(result));
        } else {
            startChatContact(contactFlowId, userId, body, instanceId).then((startChatResult) => {                
                result.startChatResult = startChatResult;
                console.log("start chat result "+ JSON.stringify(startChatResult));

                var contactId = startChatResult.ContactId;

                updatePreviousConnectionData(previousConnectionData.currentContactId, startChatResult.ContactId).then((updateStatus) => {
                    console.log("update was successful? " + updateStatus);

                    putNewConnectionData(previousConnectionData.currentContactId, startChatResult, userId, displayName).then((status) => {
                        console.log("put was successful? " + status);
                        callback(null, buildSuccessfulResponse(result));
                    });
                });
            });
        }

    }).catch((err) => {
        console.log("caught error " + err);
        callback(null, buildResponseFailed(err));
    });

};

function startChatContact(contactFlowId, username, body, instanceId) {
        return new Promise(function (resolve, reject) {
        var startChat = {
            "InstanceId": instanceId == "" ? process.env.INSTANCE_ID : instanceId,
            "ContactFlowId": contactFlowId == "" ? process.env.CONTACT_FLOW_ID : contactFlowId,
            "Attributes": {
                "customerName": body["Attributes"]["customerName"],
                "username": username
            },
            "ParticipantDetails": {
                "DisplayName": body["ParticipantDetails"]["DisplayName"]
            }
        };

        connect.startChatContact(startChat, function(err, data) {
            if (err) {
                console.log("Error starting the chat.");
                console.log(err, err.stack);
                reject(err);
            } else {
                console.log("Start chat succeeded with the response: " + JSON.stringify(data));
                resolve(data);
            }
        });

    });
}

function getPreviousContactData(userId, displayName) {
    // Searches for Chat with the Next Contact ID as CURRENT_CHAT
    return new Promise(function (resolve, reject) {
        var params = {
            TableName: process.env.CHAT_DATA_TABLE,
            IndexName: 'userDisplayHash-nextContactId-index',
            KeyConditionExpression: 'userDisplayHash = :user and nextContactId = :nextContactId',
            ExpressionAttributeValues: {
                ':user': userId + displayName,
                ':nextContactId': 'CURRENT_CHAT'
            }
        };

        docClient.query(params, function(err, results) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                console.log("Query succeeded.");
                if (results.Items.length > 0) {
                    console.log("Got entry: " + JSON.stringify(results.Items[0]));
                }

                var result = {
                    currentContactId: results.Items.length == 0 ? "INITIAL_CHAT" : results.Items[0].contactId,
                    previousContactId: results.Items.length == 0 ? "INITIAL_CHAT" : results.Items[0].previousContactId,
                    s3Key: results.Items.length == 0 ? "NONE" : results.Items[0].s3Key,
                    startChatResult: results.Items.length == 0 ? "NONE" : JSON.parse(results.Items[0].startChatResult),
                    date: results.Items.length == 0 ? 969135913 : results.Items[0].date
                };
                resolve(result);
            }
        });
    });
}

function updatePreviousConnectionData(previousContactId, currentContactId) {
    if (previousContactId == "INITIAL_CHAT") {
        return new Promise( function (resolve, reject) {
            resolve("Initial chat, not updating.");
        });
    }

    return new Promise(function (resolve, reject) {
        console.log("Setting contactId (" + previousContactId + ") to have a next contact id of: " + currentContactId);
        var params = {
            TableName: process.env.CHAT_DATA_TABLE,
            Key: {
                'contactId': previousContactId
            },
            UpdateExpression: 'set nextContactId = :next',
            ExpressionAttributeValues: {
                ':next' : currentContactId
            }
        };

        docClient.update(params, function(err, results) {
            if (err) {
                console.error("Unable to update previous contact data. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                console.log("Update succeeded.");
                resolve("Success!");
            }
        });
    });
}

function putNewConnectionData(previousContactId, startChatResult, userId, displayName) {
    console.log("setting current contact id (" + startChatResult.ContactId + ") to have a prev id: " + previousContactId);
    return new Promise(function (resolve, reject) {
        var params = {
            TableName: process.env.CHAT_DATA_TABLE,
            Item: {
                'contactId' : startChatResult.ContactId,
                'previousContactId': previousContactId,
                'userId': userId,
                'userDisplayHash': userId + displayName,
                'nextContactId': 'CURRENT_CHAT',
                's3Key': 'NONE',
                'startChatResult': JSON.stringify(startChatResult),
                'date': getCurrentTime()
            }
        };

        docClient.put(params, function(err, results) {
            if (err) {
                console.error("Unable to put new connection data. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                console.log("Put succeeded.");
                resolve("Success!");
            }
        });
    });
}

function buildSuccessfulResponse(result) {
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "https://" + process.env.CF_DISTRIBUTION,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials' : true,
            'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
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
        headers: {
            "Access-Control-Allow-Origin": "https://" + process.env.CF_DISTRIBUTION,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials' : true,
            'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
        body: JSON.stringify({
            data: {
                "Error": err
            }
        })
    };
    return response;
}

function getCurrentTime() {
    return Math.floor(Date.now() / 1000);
}