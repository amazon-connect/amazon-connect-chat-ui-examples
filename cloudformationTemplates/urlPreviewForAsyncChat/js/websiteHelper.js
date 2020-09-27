/*********************************************************************************************************************
 *  Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

/**
 * @author Solution Builders
 */

'use strict';

let AWS = require('aws-sdk');
let s3 = new AWS.S3();

/**
 * Helper function to interact with s3 hosted website for cfn custom resource.
 *
 * @class websiteHelper
 */
let websiteHelper = (function() {

    /**
     * @class websiteHelper
     * @constructor
     */
    let websiteHelper = function() {};

    /**
     * Provisions the web site UI at deployment.
     * @param {string} sourceS3Bucket - Bucket containing the web site files to be copied.
     * @param {string} sourceS3prefix - S3 prefix to prepend to the web site manifest file names to be copied.
     * @param {string} destS3Bucket - S3 destination bucket to copy website content into
     * @param {string} destS3KeyPrefix - S3 file prefix (website folder) for the website content
     * @param {string} region - Region of destination S3 bucket
     * @param {string} uuid - UUID for this instance of the solution
     * @param {string} dashboard_usage - Enable or disable dashaboard use tracking
     * @param {copyWebSiteAssets~requestCallback} cb - The callback that handles the response.
     */
    websiteHelper.prototype.copyWebSiteAssets = function(resourceProperties, cb) {
        var sourceS3Bucket = resourceProperties.sourceS3Bucket;
        var sourceS3prefix = resourceProperties.sourceS3key ;
        var destS3Bucket = resourceProperties.destS3Bucket;
        var destS3KeyPrefix = resourceProperties.destS3KeyPrefix;
        var region = resourceProperties.Region;
        var solutionId = resourceProperties.solutionId;
        var uuid = resourceProperties.UUID;
        var dashboardUsage = resourceProperties.data;
        console.log("Copying UI web site");
        console.log(['source bucket:', sourceS3Bucket].join(' '));
        console.log(['source prefix:', sourceS3prefix].join(' '));
        console.log(['destination bucket:', destS3Bucket].join(' '));
        console.log(['destination s3 key prefix:', destS3KeyPrefix].join(' '));
        console.log(['region:', region].join(' '));
        console.log(['solutionId:', solutionId].join(' '));
        console.log(['UUID :', uuid ].join(' '));
        console.log(['dashboardUsage :', dashboardUsage ].join(' '));

        var files = ["js/amazon-connect-chat-interface.js", "css/style.css", "favicon.ico"];
        // Copy a list of files from source to destination bucket: index.html, css/*, 2 chunk files, other .js files?
        if (!destS3KeyPrefix.endsWith("/")) {
            destS3KeyPrefix = destS3KeyPrefix + "/";
        }

        if (!sourceS3prefix.endsWith("/")) {
            sourceS3prefix = sourceS3prefix + "/";
        }
        
        uploadFile(files, 0, destS3Bucket, destS3KeyPrefix, [sourceS3Bucket, sourceS3prefix].join('/'),
            function(err, result) {
                if (err) {
                    console.log("ERROR: " + err);
                    return cb(err, null);
                }

                console.log("SUCCESS: " + result);
                return cb(null, result);
            }
        );
    };

    let uploadFile = function(fileList, index, destS3Bucket, destS3KeyPrefix, sourceS3prefix, cb) {
        if (fileList.length > index) {
            let params = {
                Bucket: destS3Bucket,
                Key: destS3KeyPrefix + fileList[index],
                CopySource: [sourceS3prefix, fileList[index]].join('')
            };

            console.log("CopySource: " + [sourceS3prefix, fileList[index]].join(''));

            if (fileList[index].endsWith('.htm') || fileList[index].endsWith('.html')) {
                params.ContentType = "text/html";
                params.MetadataDirective = "REPLACE";
            } else if (fileList[index].endsWith('.css')) {
                params.ContentType = "text/css";
                params.MetadataDirective = "REPLACE";
            } else if (fileList[index].endsWith('.js')) {
                params.ContentType = "application/javascript";
                params.MetadataDirective = "REPLACE";
            }

            s3.copyObject(params, function(err, data) {
                if (err) {
                    return cb(['error copying ', [sourceS3prefix, fileList[index]].join(''), '\n', err].join(''), null);
                }

                console.log([
                    [sourceS3prefix, fileList[index]].join(''),
                    'uploaded successfully'
                ].join(' '));

                let _next = index + 1;
                uploadFile(fileList, _next, destS3Bucket, destS3KeyPrefix, sourceS3prefix, function(err, resp) {
                    if (err) {
                        return cb(err, null);
                    }

                    cb(null, resp);
                });
            });
        } else {
            cb(null, [index, 'files copied'].join(' '));
        }

    };

    return websiteHelper;

})();

module.exports = websiteHelper;
