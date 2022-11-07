/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useState, useContext, useEffect } from 'react';
import { useAppConfig } from '../../providers/AppConfigProvider';
import { device, closeChatSVGPath, loggerNames} from '../../constants';
import { Button, Svg, NotificationIcon } from './styled';
import { genLogger } from "../../lib/logger";

const name = loggerNames.components.CHAT_BUTTON;
const { log } = genLogger(name);


const ChatButton = (props) => {
  log(">>> Init");
  log(props);
  const { showWidget, setShowWidget, toggleIcon, toggleSVG, setToggleSVG, notificationCount, setNotificationCount, chatWithoutForm, forceUnmountChatWidget, setForceUnmountChatWidget } = props;
  const { primaryColor } = useAppConfig();
  const handleChatIconClickEvent = (e) => {
    if (chatWithoutForm && forceUnmountChatWidget) setForceUnmountChatWidget(false)
    
    // On click resets Notification count back to 0
    setNotificationCount(0) 

    // chat state problem fixed by syncing show widget and toggleSVG
    if(showWidget && toggleSVG){
      setToggleSVG(false)
      setShowWidget(false)
    } else {
      setToggleSVG(true)
      setShowWidget(true)
    }
  }

  // Toggle to initial Icon after the chat is ended by the chat Widget:
    const toggleToChatIcon = () => {
      setToggleSVG(false)
    }
  
    //This useEffect will run only after a chat is ended
    useEffect(() => {
      log('useEffect');
      log('Chat Ended hence toggling back to initial icon(chat)')
      setShowWidget(false)
      setToggleSVG(false)
      toggleToChatIcon();
      if (chatWithoutForm) setForceUnmountChatWidget(true);
    }, [toggleIcon])


  return (
        <Button primaryColor={ primaryColor } onClick={ handleChatIconClickEvent } device={ device } toggleSVG={ toggleSVG }>
        {
          !toggleSVG ? (
            <div> 
              Chat
              {!toggleSVG && notificationCount > 0 && (
                <NotificationIcon showNotification={showWidget}>
                  {notificationCount}
                </NotificationIcon>
              )}
            </div>
          )
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