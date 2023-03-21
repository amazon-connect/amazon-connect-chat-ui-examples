/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import { useAppConfig } from '../../providers/AppConfigProvider';
import { device, chatWithFormStates, chatWidgetDefaults, chatParties, loggerNames } from '../../constants';
import { ChatContainer, ChatWrapper } from './styled';
import { genLogger } from "../../lib/logger";


const name = loggerNames.containers.CHAT_WIDGET;
const { log, error, trace, info } = genLogger(name);


const ChatWidget = ({
    dataFromInputForm = {},
    setCurrentState = () => log('No Function'),
    setToggleIcon, setHideWidget,
    setShowWidget
    }) => {
    log(">>> Init");
    const [loading, setLoading ] = useState(true);
    const { primaryColor, description, region, apiGateway, contactFlowId, instanceId, enableAttachments } = useAppConfig();
    if (Object.keys(dataFromInputForm).length !== 0) log('dataFromInputForm: ', dataFromInputForm);
    // eslint-disable-next-line
    // eslint-disable-next-line
    const initialProperties = useAppConfig();
    const successHandler = (chatSession) => {
        info("successHandler");
        setLoading(false);
        chatSession.incomingItemDecorator = function (item) {
            if ([chatParties.SYSTEM_MESSAGE].indexOf(item.displayName) !== -1) {
                item.displayName = "";
            }

            if ([chatParties.BOT].indexOf(item.displayName) !== -1) {
                item.displayName = "";
            }
            return item;
        }
        chatSession.onIncoming(function (data) {
            trace("incoming message:|| " + JSON.stringify(data));
        });

        chatSession.onOutgoing(function (data) {
            trace("outgoing message:|| " + JSON.stringify(data));
        });

        chatSession.onChatDisconnected(function (data) {
            info("Chat has been disconnected");
            trace(data);
            if (Object.keys(dataFromInputForm).length !== 0) setCurrentState(chatWithFormStates.FORM);
            setHideWidget(true);
            setShowWidget(false);
            setToggleIcon(true);

        });
    };

    const failureHandler = (e) => {
        // chat failed
        error("failed", e);
    };

    const getReferredData = (referralString, sourceData) => {
        log('getReferredData');
        log('referralString', referralString);
        log('sourceData', sourceData);
        let data = ''
        // eslint-disable-next-line
        let [operator, whereToRefer, dataToRefer] = referralString.split("|");
        log('dataToRefer', dataToRefer);
        if (dataToRefer && sourceData.hasOwnProperty(dataToRefer)) {
            data = sourceData[dataToRefer];
        }
        if (dataToRefer && !sourceData.hasOwnProperty(dataToRefer)) {
            error(`Unable to find ${dataToRefer} in source data ${sourceData}`)
        }
        log('return data', data);
        return data
    }

    const getNameAndUserName = (formData={}, initialPropertiesName='', initialPropertiesUsername='') => {
        log('Inside getNameAndUserName');
        let name = chatWidgetDefaults.NAME;
        let username = chatWidgetDefaults.USER_NAME;
        // If form data is available set the name and username from the formdata
        if (Object.keys(formData).length !== 0 ) {
            log(`formData`, formData);
            // Set name 
            if (initialPropertiesName && initialPropertiesName.includes(chatWidgetDefaults.REFER_INDICATOR)) {
                name = getReferredData(initialPropertiesName, formData);
            }
            // Set User name:
            if (initialPropertiesUsername && initialPropertiesUsername.includes(chatWidgetDefaults.REFER_INDICATOR)) {
                username = getReferredData(initialPropertiesUsername, formData);
            }

        }

        // If formData is not available
        if (Object.keys(formData).length === 0) {
            name = initialPropertiesName ? initialPropertiesName : chatWidgetDefaults.NAME;
            username = initialPropertiesUsername ? initialPropertiesUsername : chatWidgetDefaults.USER_NAME;
        }

        // If the name and username still contains refer attribute then its not resolved correct, hence resetting it to the defaults
        if (name.includes(chatWidgetDefaults.REFER_INDICATOR)) {
            error(`name field has value ${initialPropertiesName} which is not referenced correct in your initial invocation of this library`)
            name = chatWidgetDefaults.NAME;
        }
        if (username.includes(chatWidgetDefaults.REFER_INDICATOR)) {
            error(`username field has value ${initialPropertiesUsername} which is not referenced correct in your initial invocation of this library`)
            username = chatWidgetDefaults.USER_NAME;
        }
        

        return {name, username}
    }

    const getContactAttrsForContactFlow = (name = '', username = '', dataFromInputForm = {}, initialPropertiesContAttrs,initialPropertiesName, initialPropertiesUsername) => {
        log('>>> Inside getContactAttrsForContactFlow');
        let attrs = {};
        attrs.customerName = (!initialPropertiesName.includes(chatWidgetDefaults.REFER_INDICATOR)) ? name : chatWidgetDefaults.CUSTOMER_NAME;
        
        if (!initialPropertiesUsername.includes(chatWidgetDefaults.REFER_INDICATOR)) {
            attrs.username = username;
        }
        // If dataFromInputForm add that as well:
        if (dataFromInputForm) {
            log(`Appending ${dataFromInputForm} to contact attributes`);
            attrs = { ...attrs, ...dataFromInputForm }
        }
        //If contactAttr was sent from the initial config add that as well:
        if (initialPropertiesContAttrs) {
            log(`Appending ${initialPropertiesContAttrs} to contact attributes`)
            attrs = { ...attrs, ...initialPropertiesContAttrs }
        }
        return attrs;
    }

    // eslint-disable-next-line
    useEffect(() => {
        log("useEffect");
        try {
            window.connect.ChatInterface.init({
                containerId: 'chat-widget', // This is the id of the container where you want the widget to reside
                headerConfig: {      // Use the optional headerConfig and footerConfig to customize your widget
                    isHTML: true,
                    render: () => {
                    return (`<div class="header-wrapper">
                                <h2 class="welcome-text">${description}</h2>
                            </div>`)
                    }
                },
            });
        }
        catch (e) {
            error('window.connect.ChatInterface.init');
            error(e);
        }

        // Set default name and username:
        const { name, username } = getNameAndUserName(dataFromInputForm, initialProperties.name, initialProperties.username);
        log('Name and username to initiate a chat connection: ', { name, username })

        //Set contact attributes for contact flow:
        let contactAttrs = getContactAttrsForContactFlow(name, username, dataFromInputForm, initialProperties.contactAttr, initialProperties.name, initialProperties.username);
        log('contactAttrs for contact flow: ', contactAttrs);

        let params = {
            name,
            username,
            region,
            apiGatewayEndpoint: apiGateway,
            contactAttributes: JSON.stringify(contactAttrs),
            contactFlowId,
            instanceId,
            featurePermissions: {
                "ATTACHMENTS": !!enableAttachments,  // this is the override flag from user for attachments
                "MESSAGING_MARKDOWN": true // enable rich messaging toolbar and text formatting
            },
            supportedMessagingContentTypes: "text/plain,text/markdown", // include 'text/markdown' for rich messaging support
        }
        log('Params to initiate chat connection: ', params);

        try {
            window.connect.ChatInterface.initiateChat(params, successHandler, failureHandler);
        }
        catch (e) {
            error('window.connect.ChatInterface.initiateChat');
            error(e);
        }
    }, [])

    return (
        <ChatContainer id="chat-container" device={device}>
            <ChatWrapper id="chat-wrapper" primaryColor={primaryColor} device={device}>
                <div id="chat-widget"></div>
            </ChatWrapper>
            {loading && <Spinner primaryColor={primaryColor} />}
        </ChatContainer>
    );
};

export default ChatWidget;