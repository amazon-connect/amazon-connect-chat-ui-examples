/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useState, useContext, useEffect } from "react";
import anime from 'animejs';
import { useAppConfig } from '../../providers/AppConfigProvider';
import { device, closeChatSVGPath, chatSVGPath, loggerNames } from '../../constants';
import { Button, Svg } from './styled';
import { genLogger } from "../../lib/logger";

const name = loggerNames.components.CHAT_ICON;
const { log } = genLogger(name);

const ChatIcon = (props) => 
  {
    log(">>> Init");
    log('ChatIcon.displayName: ', ChatIcon.displayName);
    log(props);
    const [toogleSVG, setToggleSVG] = useState(false);
    const { primaryColor } = useAppConfig();
    const { showWidget, hideWidget, setShowWidget, setHideWidget, toggleIcon, chatWithoutForm, forceUnmountChatWidget, setForceUnmountChatWidget } = props;
    const handleChatIconClickEvent = (e) => {
      // Request Browser Notifications using Browsers Notifications API, only works on HTTPS
      Notification.requestPermission().then(status => {
        if (status === 'denied'){
          // log("Access for notification denied", status)
        } else if (status === 'granted'){
          // log("Access granted for notifications")
        }
      })

      if (chatWithoutForm && forceUnmountChatWidget) setForceUnmountChatWidget(false)
      const timeline = anime.timeline({
          duration: 750,
          easing: 'easeOutExpo'
          })
          timeline.add({
          targets: ".chat",
          d: [
              {
              value: toogleSVG ? chatSVGPath : closeChatSVGPath
              }
          ],
          strokeWidth: toogleSVG ? 3 : 1,
        });
      toogleSVG ? setToggleSVG(false) : setToggleSVG(true);
      setShowWidget(!showWidget);
      hideWidget ? setHideWidget(!hideWidget) : setHideWidget(hideWidget); 
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
      if (toggleIcon) {
        log('Chat Ended hence toggling back to initial icon(chat)')
        toggleToChatIcon();
        if (chatWithoutForm) setForceUnmountChatWidget(true);
      }  
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
          </Button>
        </div>

    );
  }


export default ChatIcon;
