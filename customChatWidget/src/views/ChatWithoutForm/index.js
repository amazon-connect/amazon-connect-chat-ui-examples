/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useState, useContext } from 'react';
import ChatIcon from '../../components/ChatIcon';
import ChatButton from '../../components/ChatButton';
import { useAppConfig } from '../../providers/AppConfigProvider';
import { Main } from './styled';
import { device, loggerNames, chatInitiationIcon, chatWithoutFormStates } from '../../constants';
import ChatWidget from '../../containers/ChatWidget';
import { CSSTransition } from "react-transition-group";
import { genLogger } from "../../lib/logger";

const name = loggerNames.views.CHAT_WITH_FORM;
const { log, trace } = genLogger(name);

const ChatWithoutForm = () => {
    log(">> Init");
    const [widgetIsOpen, setWidgetIsOpen] = useState(false);
    const [forceUnmountChatWidget, setForceUnmountChatWidget] = useState(false);
    const [currentState, setCurrentState] = useState(chatWithoutFormStates.CHAT_WIDGET);
    const { initiationIcon } = useAppConfig();
    trace(`forceUnmountChatWidget`, forceUnmountChatWidget);
    return (
        <Main device={device}>
            {
                initiationIcon.toLowerCase() === chatInitiationIcon.BUTTON ?
                    <ChatButton
                        widgetIsOpen={widgetIsOpen}
                        setWidgetIsOpen={setWidgetIsOpen}
                        currentState={currentState}
                        forceUnmountChatWidget={forceUnmountChatWidget}
                        chatWithoutForm={true}
                        setForceUnmountChatWidget={setForceUnmountChatWidget}
                    />
                    : <ChatIcon
                        widgetIsOpen={widgetIsOpen}
                        setWidgetIsOpen={setWidgetIsOpen}
                        currentState={currentState}
                        forceUnmountChatWidget={forceUnmountChatWidget}
                        chatWithoutForm={true}
                        setForceUnmountChatWidget={setForceUnmountChatWidget}
                    />
            }
            <div style={{ display: widgetIsOpen ? null : "none" }}>
            <CSSTransition
                in={widgetIsOpen}
                timeout={400}
                classNames="widget-transition"
                mountOnEnter
                appear
                onExited={()=> setWidgetIsOpen(false)}
                >
                    {
                        forceUnmountChatWidget ? <div></div> : (
                            <ChatWidget
                                setWidgetIsOpen={setWidgetIsOpen}
                            />
                        )
                    }
                    
                
            </CSSTransition>
            </div>
        </Main>
    );
};

export default ChatWithoutForm;