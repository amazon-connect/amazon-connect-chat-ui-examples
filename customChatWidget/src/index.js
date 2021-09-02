/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { genLogger } from "./lib/logger";
import { loggerNames } from './constants';

const name = loggerNames.INDEX;
const { log } = genLogger(name);

(function (AmazonCustomChatWidget) {
    AmazonCustomChatWidget.ChatInterface = AmazonCustomChatWidget.ChatInterface || {}
	AmazonCustomChatWidget.ChatInterface.init = ({ containerId, ...props }) => {
		log('>>> Init');
		log(`props ${JSON.stringify(props)}`);
		//Check if preform exists?
		ReactDOM.render(<App {...props} />, document.getElementById(containerId));
	};
    window.AmazonCustomChatWidget = AmazonCustomChatWidget
    
})(window.AmazonCustomChatWidget || {})




