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
    const [widgetIsOpen, setWidgetIsOpen] = useState(false);
    const [currentState, setCurrentState] = useState(chatWithFormStates.FORM);
    const [data, setData] = useState({});
    const { initiationIcon } = useAppConfig();

    return (
        <Main device={device}>
            {
                initiationIcon.toLowerCase() === chatInitiationIcon.BUTTON ?
                    <ChatButton
                        widgetIsOpen={widgetIsOpen}
                        setWidgetIsOpen={setWidgetIsOpen}
                        currentState={currentState}
                    />
                    : <ChatIcon
                        widgetIsOpen={widgetIsOpen}
                        setWidgetIsOpen={setWidgetIsOpen}
                        currentState={currentState}
                    />
            }
            <div style={{ display: widgetIsOpen ? null : "none" }}>
                <CSSTransition
                    in={widgetIsOpen}
                    timeout={400}
                    classNames="widget-transition"
                    mountOnEnter
                    //unmountOnExit
                    appear
                    onExited={()=> setWidgetIsOpen(false)}
                >
                {
                    currentState === chatWithFormStates.FORM ? (
                    <ChatForm  setData={setData} setCurrentState={setCurrentState} />
                    ) : (
                        <ChatWidget dataFromInputForm={data} setCurrentState={setCurrentState} setWidgetIsOpen={setWidgetIsOpen} />
                    )
                }
                </CSSTransition>
            </div>
        </Main>
    );
};

export default ChatWithForm;