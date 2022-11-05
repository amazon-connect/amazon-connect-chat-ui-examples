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
  const [toogleSVG, setToggleSVG] = useState(false);
  const { showWidget, hideWidget, setShowWidget, setHideWidget, toggleIcon, chatWithoutForm, forceUnmountChatWidget, setForceUnmountChatWidget } = props;
  const { primaryColor } = useAppConfig();
  const handleChatIconClickEvent = (e) => {
    // Request Browser Notifications using 
    Notification.requestPermission().then(status => {
      if (status === 'denied'){
        // log("Access for notification denied", status)
      } else if (status === 'granted'){
        // log("Access granted for notifications")
      }
    })

    if (chatWithoutForm && forceUnmountChatWidget) setForceUnmountChatWidget(false)
    toogleSVG ? setToggleSVG(false) : setToggleSVG(true);
    setShowWidget(!showWidget);
    hideWidget ? setHideWidget(!hideWidget) : setHideWidget(hideWidget); 
  }

  // Toggle to initial Icon after the chat is ended by the chat Widget:
    const toggleToChatIcon = () => {
      setToggleSVG(false)
    }
  
    //This useEffect will run only after a chat is ended
    useEffect(() => {
      log('useEffect');
        if (toggleIcon) {
          log('Chat Ended hence toggling back to initial icon(chat)')
          toggleToChatIcon();
          if (chatWithoutForm) setForceUnmountChatWidget(true);
      }  
    }, [toggleIcon])


  return (
        <Button primaryColor={ primaryColor } onClick={ handleChatIconClickEvent } device={ device } toogleSVG={ toogleSVG }>
        {
          !toogleSVG ? "Chat"
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