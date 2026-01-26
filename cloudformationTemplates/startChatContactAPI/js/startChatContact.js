var AWS = require('aws-sdk');
AWS.config.update({region: process.env.REGION});
var connect = new AWS.Connect();

exports.handler = (event, context, callback) => {
    console.log("Received event: " + JSON.stringify(event));
    var body = JSON.parse(event["body"]);

    startChatContact(body).then((startChatResult) => {
        const featurePermissions = buildFeaturePermissions(body);
        callback(null, buildSuccessfulResponse(startChatResult, featurePermissions));
    }).catch((err) => {
        console.log("caught error " + err);
        callback(null, buildResponseFailed(err));
    });
};

function startChatContact(body) {
    var contactFlowId = "";
    if(body.hasOwnProperty('ContactFlowId')){
        contactFlowId = body["ContactFlowId"];
    }
    console.log("CF ID: " + contactFlowId);
    
    var instanceId = "";
    if(body.hasOwnProperty('InstanceId')){
        instanceId = body["InstanceId"];
    }
    console.log("chat contact body: ", JSON.stringify(body))
    return new Promise(function (resolve, reject) {
        var startChat = {
            "InstanceId": instanceId == "" ? process.env.INSTANCE_ID : instanceId,
            "ContactFlowId": contactFlowId == "" ? process.env.CONTACT_FLOW_ID : contactFlowId,
            "Attributes": {
                "customerName": body["ParticipantDetails"]["DisplayName"]
            },
            "ParticipantDetails": {
                "DisplayName": body["ParticipantDetails"]["DisplayName"]
            },
            // Enable rich messaging: https://docs.aws.amazon.com/connect/latest/adminguide/enable-text-formatting-chat.html
            ...(!!body["SupportedMessagingContentTypes"] && { "SupportedMessagingContentTypes": body["SupportedMessagingContentTypes"] }),
            // Set optional chat duration: https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html#connect-StartChatContact-request-ChatDurationInMinutes
            ...(!!body["ChatDurationInMinutes"] && { "ChatDurationInMinutes": body["ChatDurationInMinutes"] })
        };
        const persistentChatEnabled = body.PersistentChat && body.PersistentChat.RehydrationType && body.PersistentChat.SourceContactId;
        if(persistentChatEnabled) {
            startChat['PersistentChat'] = {
                "RehydrationType": body["PersistentChat"]["RehydrationType"],
                "SourceContactId": body["PersistentChat"]["SourceContactId"]
            }
        }

        connect.startChatContact(startChat, function(err, data) {
            if (err) {
                console.log("Error starting the chat.", err);
                reject(err);
            } else {
                console.log("Start chat succeeded with the response: " + JSON.stringify(data));
                resolve(data);
            }
        });

    });
}

function buildFeaturePermissions(body) {
    const featurePermissions = {};
    const supportedMessagingContentTypes = body["SupportedMessagingContentTypes"];
    
    if (supportedMessagingContentTypes && Array.isArray(supportedMessagingContentTypes)) {
        featurePermissions["MESSAGING_MARKDOWN"] = supportedMessagingContentTypes.includes("text/markdown");
    }
    
    // Note: ATTACHMENTS feature is controlled by Connect instance storage configuration
    // Uncomment and set to true if attachments are enabled on your instance:
    // featurePermissions["ATTACHMENTS"] = true;
    
    return featurePermissions;
}

function buildSuccessfulResponse(result, featurePermissions) {
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials' : true,
            'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
        body: JSON.stringify({
            data: { 
                startChatResult: result,
                featurePermissions: featurePermissions
            }
        })
    };
    console.log("RESPONSE" + JSON.stringify(response));
    return response;
}

function buildResponseFailed(err) {
    const response = {
        statusCode: err.statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
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
