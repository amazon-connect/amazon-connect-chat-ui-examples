/**********************************************************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved                                            *
 *                                                                                                                    *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated      *
 *  documentation files (the "Software"), to deal in the Software without restriction, including without limitation   *
 *  the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and  *
 *  to permit persons to whom the Software is furnished to do so.                                                     *
 *                                                                                                                    *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO  *
 *  THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF         *
 *  CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS *
 *  IN THE SOFTWARE.                                                                                                  *
 **********************************************************************************************************************/
'use strict';

console.log('Loading function');

const https = require('https');
const url = require('url');
const MetricsHelper = require('./metricsHelper.js');
const crypto =  require ("crypto");

/**
 * Request handler.
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let responseStatus = 'FAILED';
    let responseData = {};
    
    var date = new Date();
    var dateString = date.getFullYear() + "-" + (("0" + (date.getMonth() + 1)).slice(-2)) + "-" + (("0" + date.getDate()).slice(-2)) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    console.log("Date: " + dateString);
    
    if (event.RequestType === 'Delete') {
        if (event.ResourceProperties.customAction === 'sendMetric') {
            responseStatus = 'SUCCESS';

            let _metricsHelper = new MetricsHelper();

            let _metric = {
                Solution: event.ResourceProperties.solutionId,
                UUID: event.ResourceProperties.UUID,
                TimeStamp: dateString,
                Data: {
                    Version: event.ResourceProperties.version,
                    RequestType: event.RequestType
                }
            };

            _metricsHelper.sendAnonymousMetric(_metric, function(err, data) {
                if (err) {
                    responseData = {
                        Error: 'Sending metrics helper delete failed'
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                }
                sendResponse(event, callback, context.logStreamName, 'SUCCESS');
            });
        } else {
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        }
    }

    if (event.RequestType === 'Create') {
        if (event.ResourceProperties.customAction === 'createUuid') {
            responseStatus = 'SUCCESS';
            responseData = {
                UUID: crypto.randomBytes(16).toString('hex')
            };
            sendResponse(event, callback, context.logStreamName, responseStatus, responseData);

        } else if (event.ResourceProperties.customAction === 'sendMetric') {
            let _metricsHelper = new MetricsHelper();

            let _metric = {
                Solution: event.ResourceProperties.solutionId,
                UUID: event.ResourceProperties.UUID,
                TimeStamp: dateString,
                Data: {
                    Version: event.ResourceProperties.version,
                    SendAnonymousData: event.ResourceProperties.anonymousData,
                    LogLevel: event.ResourceProperties.logLevel,
                    RequestType: event.RequestType
                }
            };

            _metricsHelper.sendAnonymousMetric(_metric, function(err, data) {
                if (err) {
                    responseData = {
                        Error: 'Sending anonymous launch metric failed'
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                } else {
                    responseStatus = 'SUCCESS';
                    responseData = {};
                }
            });
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        }
    }
    if (event.RequestType === 'Update') {
        responseStatus = 'SUCCESS';
        responseData = {};
        if (event.ResourceProperties.customAction === 'createUuid') {
            sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
        } else if (event.ResourceProperties.customAction === 'sendMetric') {
            let _metricsHelper = new MetricsHelper();

            let _metric = {
                Solution: event.ResourceProperties.solutionId,
                UUID: event.ResourceProperties.UUID,
                TimeStamp: dateString,
                Data: {
                    Version: event.ResourceProperties.version,
                    SendAnonymousData: event.ResourceProperties.anonymousData,
                    LogLevel: event.ResourceProperties.logLevel,
                    RequestType: event.RequestType
                }
            };

            _metricsHelper.sendAnonymousMetric(_metric, function(err, data) {
                if (err) {
                    responseStatus = 'FAILED';
                    responseData = {
                        Error: 'Sending anonymous launch metric failed'
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                } else {
                    responseStatus = 'SUCCESS';
                    responseData = {};
                }
            });
            sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
        }
    }
};

/**
 * Sends a response to the pre-signed S3 URL
 */
let sendResponse = function(event, callback, logStreamName, responseStatus, responseData) {
    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: `See the details in CloudWatch Log Stream: ${logStreamName}`,
        PhysicalResourceId: logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData,
    });

    console.log('RESPONSE BODY:\n', responseBody);
    const parsedUrl = url.parse(event.ResponseURL);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
            'Content-Type': '',
            'Content-Length': responseBody.length,
        }
    };

    const req = https.request(options, (res) => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', JSON.stringify(res.headers));
        callback(null, 'Successfully sent stack response!');
    });

    req.on('error', (err) => {
        console.log('sendResponse Error:\n', err);
        callback(err);
    });

    req.write(responseBody);
    req.end();
};
