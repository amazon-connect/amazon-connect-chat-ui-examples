/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useState, useContext, useEffect } from 'react';
import { useAppConfig } from '../../providers/AppConfigProvider';
import { device, closeChatSVGPath, loggerNames} from '../../constants';
import { Button, Svg } from './styled';
import { genLogger } from "../../lib/logger";

const name = loggerNames.components.CHAT_BUTTON;
const { log } = genLogger(name);


const ChatButton = (props) => {
  log(">>> Init");
  log(props);
  const { chatWithoutForm, forceUnmountChatWidget, setForceUnmountChatWidget, setWidgetIsOpen, widgetIsOpen } = props;
  const { primaryColor } = useAppConfig();
  const handleChatIconClickEvent = (e) => {
    if (chatWithoutForm && forceUnmountChatWidget) setForceUnmountChatWidget(false)

    setWidgetIsOpen(prev => !prev);
  }

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