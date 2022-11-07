/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useState, useContext, useEffect } from "react";
import anime from 'animejs';
import { useAppConfig } from '../../providers/AppConfigProvider';
import { device, closeChatSVGPath, chatSVGPath, loggerNames } from '../../constants';
import { Button, Svg, NotificationIcon } from './styled';
import { genLogger } from "../../lib/logger";

const name = loggerNames.components.CHAT_ICON;
const { log } = genLogger(name);

const ChatIcon = (props) => 
  {
    log(">>> Init");
    log('ChatIcon.displayName: ', ChatIcon.displayName);
    log(props);
    const { primaryColor } = useAppConfig();
    const { showWidget, setShowWidget, toggleIcon, toggleSVG, setToggleSVG, notificationCount, setNotificationCount, chatWithoutForm, forceUnmountChatWidget, setForceUnmountChatWidget } = props;
    const handleChatIconClickEvent = (e) => {
      if (chatWithoutForm && forceUnmountChatWidget) setForceUnmountChatWidget(false)
      const timeline = anime.timeline({
          duration: 750,
          easing: 'easeOutExpo'
          })
          timeline.add({
          targets: ".chat",
          d: [
              {
              value: toggleSVG ? chatSVGPath : closeChatSVGPath
              }
          ],
          strokeWidth: toggleSVG ? 3 : 1,
        });

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
      const timeline = anime.timeline({
        duration: 750,
        easing: 'easeOutExpo'
      })
      timeline.add({
        targets: ".chat",
          d: [
              {
                  value: chatSVGPath 
              }
          ],
          strokeWidth:3,

      })
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
  
  /*! Both chat and carrot SVG's are from Material Design Icons https://github.com/google/material-design-icons
  SPDX-License-Identifier: Apache-2.0 */
  return (
      <div>
          <Button onClick={handleChatIconClickEvent} primaryColor={primaryColor}>
            <Svg
              id="inner"
              viewBox="0 0 24 24"
              fill="white"
              device={device}
            >
              <path
                className="chat"
                d={chatSVGPath}
                stroke="white"
                strokeWidth="1" 
              >
              </path>
            </Svg>
            {!toggleSVG && notificationCount > 0 && (
              <NotificationIcon showNotification={showWidget}>
                {notificationCount}
              </NotificationIcon>
            )}
          </Button>
        </div>

    );
  }


export default ChatIcon;
