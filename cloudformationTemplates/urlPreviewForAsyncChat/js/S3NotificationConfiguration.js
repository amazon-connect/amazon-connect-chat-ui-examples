var AWS = require('aws-sdk');
var s3 = new AWS.S3();

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    updateS3Notification(event.ResourceProperties, event.RequestType, function(err, data) {
        var status = err ? 'FAILED' : 'SUCCESS';
        return sendResponse(event, context, status, data, err);
    });

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

function updateS3Notification(properties, requestType, callback) {
    var params = {
        Bucket: properties.Bucket,
        NotificationConfiguration: {
            LambdaFunctionConfigurations: [
            {
                Events: [
                    "s3:ObjectCreated:*"
                ], 
                LambdaFunctionArn: properties.LambdaFunctionArn,
                Filter: {
                    Key: {
                      FilterRules: [
                        {
                          Name: "prefix",
                          Value: properties.Prefix
                        }
                      ]
                    }
                },
            }
            ]
        }
    };

    if (requestType === 'Delete') {
        params.NotificationConfiguration = {};
        s3.putBucketNotificationConfiguration(params, function(err, data) {
            if (err)
                return callback(err);

            return callback(null, "SUCCESS");
        });
    } else {
        s3.putBucketNotificationConfiguration(params, function(err, data) {
            if (err)
                return callback(err);

            return callback(null, "SUCCESS");
        });
    }
}

function sendResponse(event, context, status, data, err) {
    var responseBody = {
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        PhysicalResourceId: context.logStreamName,
        Status: status,
        Reason: getReason(err) + " See details in CloudWatch Log: " + context.logStreamName,

    };

    console.log("RESPONSE:\n", responseBody);
    var json = JSON.stringify(responseBody);

    var https = require("https");
    var url = require("url");

    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": json.length
        }
    };

    var request = https.request(options, function(response) {
        console.log("STATUS: " + response.statusCode);
        console.log("HEADERS: " + JSON.stringify(response.headers));
        context.done(null, data);
    });

    request.on("error", function(error) {
        console.log("sendResponse Error:\n", error);
        context.done(error);
    });

    request.on("end", function() {
        console.log("end");
    });
    request.write(json);
    request.end();
}

function getReason(err) {
    if (err)
        return err.message;
    else
        return '';
}