/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useState } from 'react';
import ChatIcon from '../../components/ChatIcon';
import ChatButton from '../../components/ChatButton';
import { useAppConfig } from '../../providers/AppConfigProvider';
import ChatForm from '../../containers/ChatForm';
import ChatWidget from '../../containers/ChatWidget';
import { device, chatWithFormStates, chatInitiationIcon, loggerNames } from '../../constants';
import { CSSTransition } from "react-transition-group";
import { Main } from './styled';
import { genLogger } from "../../lib/logger";

const name = loggerNames.views.CHAT_WITH_FORM;
const { log } = genLogger(name);

const ChatWithForm = () => {
    log(">> Init");
    const [showWidget, setShowWidget] = useState(false);
    const [currentState, setCurrentState] = useState(chatWithFormStates.FORM);
    const [toggleIcon, setToggleIcon] = useState(false);
    const [toggleSVG, setToggleSVG] = useState(false)
    const [notificationCount, setNotificationCount] = useState(0)
    const [data, setData] = useState({});
    const { initiationIcon } = useAppConfig();
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
                    />
                    : <ChatIcon
                        showWidget={showWidget}
                        setShowWidget={setShowWidget}
                        toggleIcon={toggleIcon}
                        toggleSVG={toggleSVG}
                        setToggleSVG={setToggleSVG}
                        notificationCount={notificationCount}
                        setNotificationCount={setNotificationCount}
                    />
            }
            <div style={{ display: !showWidget ? "none" : null }}>
                <CSSTransition
                    in={showWidget}
                    timeout={400}
                    classNames="widget-transition"
                    mountOnEnter
                    //unmountOnExit
                    appear
                    onExited={()=> setShowWidget(false)} 
                >
                {
                    currentState === chatWithFormStates.FORM ? (
                    <ChatForm  setData={setData} setCurrentState={setCurrentState} />
                    ) : (
                            <ChatWidget 
                                dataFromInputForm={data} 
                                showWidget={showWidget} 
                                setCurrentState={setCurrentState} 
                                setToggleIcon={ setToggleIcon} 
                                setNotificationCount={setNotificationCount}
                            />
                    )
                }
                </CSSTransition>
            </div>
        </Main>
    );
};

export default ChatWithForm;