/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React from 'react';
import ChatWithForm from './views/ChatWithForm';
import ChatWithoutForm from './views/ChatWithoutForm';
import { AppConfigProvider } from './providers/AppConfigProvider'
import { genLogger } from "./lib/logger";
import { loggerNames } from './constants';

const name = loggerNames.APP;
const { log } = genLogger(name);

const App = ({preChatForm={}, ... props }) => {
    log("Init")
    log("preChatForm: ", preChatForm);
    const propsWithPreForm = { ...props, preChatForm };
    log(`propsWithPreForm: `, propsWithPreForm);
    return (
        <div>
            <AppConfigProvider config={{ ...propsWithPreForm }}>
                {
                    (Object.keys(preChatForm).length === 0 || preChatForm.visible === false) ? <ChatWithoutForm /> : <ChatWithForm />
                }
            </AppConfigProvider>
        </div>
    );
};

export default App;