/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useState, useContext, useEffect } from "react";
import anime from 'animejs';
import { useAppConfig } from '../../providers/AppConfigProvider';
import { device, closeChatSVGPath, chatSVGPath, loggerNames, END_ACTIONS, chatWithFormStates } from '../../constants';
import { Button, Svg } from './styled';
import { genLogger } from "../../lib/logger";

const name = loggerNames.components.CHAT_ICON;
const { log } = genLogger(name);

const ChatIcon = (props) => 
  {
    log(">>> Init");
    log('ChatIcon.displayName: ', ChatIcon.displayName);
    log(props);
    const { primaryColor, actions } = useAppConfig();
    const { chatWithoutForm, forceUnmountChatWidget, setForceUnmountChatWidget, setWidgetIsOpen, widgetIsOpen, currentState } = props;
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
              value: widgetIsOpen ? chatSVGPath : closeChatSVGPath
              }
          ],
          strokeWidth: widgetIsOpen ? 3 : 1,
        });
      setWidgetIsOpen(!widgetIsOpen);
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

    //This useEffect will run only after currentState is changed to widget.
    useEffect(() => {
      if (currentState === chatWithFormStates.CHAT_WIDGET) {
        window.connect.ChatEvents &&
          window.connect.ChatEvents.onAgentEndChat(() => {
            log("Chat Ended hence toggling back to initial icon(chat)");

            if (actions.onDisconnect === END_ACTIONS.CLOSE_CHAT) {
              if (chatWithoutForm) {
                setForceUnmountChatWidget(true);
                return
              }
            }
            toggleToChatIcon(); 
          });

        window.connect.ChatEvents &&
          window.connect.ChatEvents.onChatEnded(() => {
            log("Chat Disconnected hence toggling back to initial icon(chat)");
            
            if (actions.onEnded === END_ACTIONS.CLOSE_CHAT) {
              if (chatWithoutForm) {
                setForceUnmountChatWidget(true);
                return
              }
            }
            toggleToChatIcon();
          });
      }
    }, [currentState]);
  
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
