var aws = require("aws-sdk");
var S3 = new aws.S3();
var fs = require('fs');

exports.handler = function(event, context) {
    replaceAndUpload(event.ResourceProperties, function(err, result) {
        var status = err ? 'FAILED' : 'SUCCESS';
        return sendResponse(event, context, status, result, err);
    });

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

function replaceAndUpload(properties, callback) {

    fs.readFile('index.html', {encoding: 'utf8'}, function(error, data) {
        console.log("ERROR " + JSON.stringify(error));
        console.log("DATA " + data);

        replaceTextAndUploadToS3(properties, data, callback);
    });
}

function replaceTextAndUploadToS3(properties, data, callback) {
    var result = data.replace('${region}', properties.Region);
    var body = result.replace('${apiId}', properties.ApiGatewayId).replace('${instanceId}', properties.InstanceId).replace('${contactFlowId}', properties.ContactFlowId).replace('${region}', properties.Region);

    S3.putObject({
        Bucket: properties.S3Bucket,
        Key: 'contents/index.html',
        Body: body,
        ContentType: 'text/html'
    }, function(err, data) {
        if (err)
            return callback(err);

        return callback(null, "SUCCESS");
    });
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