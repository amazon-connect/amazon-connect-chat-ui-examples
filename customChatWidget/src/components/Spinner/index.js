/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React from 'react';
import { BeatLoader } from 'react-spinners';
import { Loading } from './styled';


const Spinner = (props) => {
    return (
        <Loading id ="chat-loading">
            <BeatLoader size={30} color={props.primaryColor} loading> Loading...</BeatLoader>
        </Loading>
    );
};

export default Spinner;