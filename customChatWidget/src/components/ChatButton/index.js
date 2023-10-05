/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useState, useContext, useEffect } from 'react';
import { useAppConfig } from '../../providers/AppConfigProvider';
import { device, chatWithFormStates, closeChatSVGPath, loggerNames, END_ACTIONS } from '../../constants';
import { Button, Svg } from './styled';
import { genLogger } from "../../lib/logger";

const name = loggerNames.components.CHAT_BUTTON;
const { log } = genLogger(name);


const ChatButton = (props) => {
  log(">>> Init");
  log(props);
  const { chatWithoutForm, forceUnmountChatWidget, setForceUnmountChatWidget, setWidgetIsOpen, widgetIsOpen, currentState } = props;
  const { primaryColor } = useAppConfig();
  const handleChatIconClickEvent = (e) => {
    if (chatWithoutForm && forceUnmountChatWidget) setForceUnmountChatWidget(false)

    setWidgetIsOpen(prev => !prev);
  }

    //This useEffect will run only after currentState is changed to widget.
    useEffect(() => {
      if (currentState === chatWithFormStates.CHAT_WIDGET) {
        window.connect.ChatEvents &&
          window.connect.ChatEvents.onAgentEndChat(() => {
            log("Chat Ended hence toggling back to initial icon(chat)");

            if (actions.onDisconnect === END_ACTIONS.CLOSE_CHAT) {
              if (chatWithoutForm) {
                setForceUnmountChatWidget(true);
              }
              return
            }
            toggleToChatIcon(); 
          });

        window.connect.ChatEvents &&
          window.connect.ChatEvents.onChatEnded(() => {
            log("Chat Disconnected hence toggling back to initial icon(chat)");
            
            if (actions.onEnded === END_ACTIONS.CLOSE_CHAT) {
              if (chatWithoutForm) {
                setForceUnmountChatWidget(true);
              }
              return
            }
            toggleToChatIcon();
          });
      }
    }, [currentState]);

  return (
        <Button primaryColor={ primaryColor } onClick={ handleChatIconClickEvent } device={ device } widgetIsOpen={ widgetIsOpen }>
        {
          !widgetIsOpen ? "Chat"
            :
              <Svg
                id="inner"
                viewBox="0 0 24 24"
                fill="white"
                device={device}
                >
                <path
                  className="chat"
                  d={closeChatSVGPath}
                  stroke="white"
                  strokeWidth="1" 
                >
                </path>
              </Svg>
        }
      </Button>

  );
};

export default ChatButton;