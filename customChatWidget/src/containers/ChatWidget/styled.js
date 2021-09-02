/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import styled from 'styled-components';

export const ChatWrapper = styled.div`
    .header-wrapper {
        background: ${props => props.primaryColor ? props.primaryColor : "#3F5773"};
        text-align: center;
        padding: 2px;
        color: #fff !important;
    }

    .footer-actions {
            background: rgba(242, 242, 242, 0.49);
            height: 65px;
    }
    .welcome-text{
            color: whitesmoke;
            border-bottom: none;
    }

    .button-wrapper {
            display: flex;
            justify-content: center;
            flex-direction: row;
            height: 100%;
            align-items: center;
            border-radius: 5px;
    }

    .button-wrapper>button {
            min-width: 85px;
            margin: 6px;
            font-weight: bold;
    }

    .connect-customer-interface{
        @media ${props => props.device.laptop}{
        height: 600px;
        width: 420px;
        }
        height: 500px;
        width: 320px;
        background: linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255) 80%, rgb(255, 255, 255));
    }

    .action-button {
            width: 43%;
            line-height: 1.465;
            font-weight: normal;
            white-space: nowrap;
            color: rgb(17, 17, 17);
            cursor: pointer;
            text-align: center;
            vertical-align: middle;
            padding-right: 10px;
            padding-left: 10px;
            font-family: AmazonEmber_Md, Helvetica, sans-serif;
            display: inline-flex;
            -webkit-box-align: center;
            align-items: center;
            -webkit-box-pack: center;
            justify-content: center;
            max-width: 260px;
            padding-top: 0.45rem;
            padding-bottom: 0.45rem;
            font-size: 0.875rem;
            box-shadow: rgba(0, 0, 0, 0.1) 1px 2px 3px 0px;
            border-width: 0px;
            border-style: solid;
            background: linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255) 80%, rgb(255, 255, 255));
            border-color: rgb(255, 255, 255);
    }
`


export const ChatContainer = styled.div`
    @media ${props => props.device.laptop}{
        width: 100%;
        height: 100%;
        max-width: 448px;
        max-height: 630px;
        bottom: 90px;
        right: 75px;
    }
    position: fixed;
    bottom: 65px;
    right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction:column;                                                                                                               
    padding: 3px;
    margin-left: 3px;
    float: left;
    overflow: auto;
    border-radius: 5px 5px 45px 5px;
    z-index:999;
    `;