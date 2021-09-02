/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */


import styled from 'styled-components';

export const InputSection = styled.div`
    display: flex;
	flex-direction: column;
	margin-bottom: 20px;
    width: 260px;
`;


export const Label = styled.label`
    display: block;
    letter-spacing: 4px;
    padding-top: 10px;
    text-align: center;
    margin-bottom: 5px;
	font-weight: bold;
	width: 100%;
`;

export const Input = styled.input`
    background-color: transparent;
    @media ${props => props.device.laptop}{
        border: unset;
        outline: unset;
    }
	border-radius: 10px;
	padding: 10px;

	box-shadow: inset 3px 3px 5px rgba(0, 0, 0, 0.1),
		inset -3px -3px 5px rgba(241, 255, 255, 0.5);
`;

export const Error = styled.p`
    margin-top: 10px;
	font-weight: bold;
	font-style: italic;
	color: #b60000;
`;