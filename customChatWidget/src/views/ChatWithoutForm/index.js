/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useState, useContext } from 'react';
import ChatIcon from '../../components/ChatIcon';
import ChatButton from '../../components/ChatButton';
import { useAppConfig } from '../../providers/AppConfigProvider';
import { Main } from './styled';
import { device, loggerNames, chatInitiationIcon } from '../../constants';
import ChatWidget from '../../containers/ChatWidget';
import { CSSTransition } from "react-transition-group";
import { genLogger } from "../../lib/logger";

const name = loggerNames.views.CHAT_WITH_FORM;
const { log, trace } = genLogger(name);

const ChatWithoutForm = () => {
    log(">> Init");
    const [showWidget, setShowWidget] = useState(false);
    const [toggleIcon, setToggleIcon] = useState(false);
    const [toggleSVG, setToggleSVG] = useState(false)
    const [notificationCount, setNotificationCount] = useState(0)
    const [forceUnmountChatWidget, setForceUnmountChatWidget] = useState(false);
    const { initiationIcon } = useAppConfig();
    trace(`showWidget`, showWidget);
    trace(`hideWidget`, hideWidget);
    trace(`toggleIcon`, toggleIcon);
    trace(`forceUnmountChatWidget`, forceUnmountChatWidget);
    return (
        <Main device={device}>
            {
                initiationIcon.toLowerCase() === chatInitiationIcon.BUTTON ?
                    <ChatButton
                        showWidget={showWidget}
                        setShowWidget={setShowWidget}
                        toggleIcon={toggleIcon}
                        toggleSVG={toggleSVG}
                        setToggleSVG={setToggleSVG}
                        notificationCount={notificationCount}
                        setNotificationCount={setNotificationCount}
                        forceUnmountChatWidget={forceUnmountChatWidget}
                        chatWithoutForm={true}
                        setForceUnmountChatWidget={setForceUnmountChatWidget}
                    />
                    : <ChatIcon
                        showWidget={showWidget}
                        setShowWidget={setShowWidget}
                        toggleIcon={toggleIcon}
                        toggleSVG={toggleSVG}
                        setToggleSVG={setToggleSVG}
                        notificationCount={notificationCount}
                        setNotificationCount={setNotificationCount}
                        forceUnmountChatWidget={forceUnmountChatWidget}
                        chatWithoutForm={true}
                        setForceUnmountChatWidget={setForceUnmountChatWidget}
                    />
            }
            <div style={{ display: !showWidget ? "none" : null }}>
            <CSSTransition
                in={showWidget}
                timeout={400}
                classNames="widget-transition"
                mountOnEnter
                appear
                onExited={()=> setShowWidget(false)}
                >
                    {
                        forceUnmountChatWidget ? <div></div> : (
                            <ChatWidget 
                                showWidget={showWidget} 
                                setNotificationCount={setNotificationCount} 
                                setToggleIcon={setToggleIcon} 
                            />
                        )
                    }
                    
                
            </CSSTransition>
            </div>
        </Main>
    );
};

export default ChatWithoutForm;