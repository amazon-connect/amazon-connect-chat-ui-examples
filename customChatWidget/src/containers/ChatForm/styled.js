/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */


import styled from 'styled-components';


export const FormSection = styled.div`
  position: fixed;
  bottom: 75px;
  right: 30px;
  @media ${props => props.device.laptop}{
    width: 420px;
    bottom: 100px;
    right: 80px;
    height: 420px;
  }
  width: 320px;
  height: 450px;
  overflow-y: auto;
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: 1fr;
  box-shadow: rgb(221, 221, 221) 0px 2px 3px;
  background: linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255) 80%, rgb(255, 255, 255));
  z-index:999;
`;

export const Form = styled.form`
    border-radius: 20px;
	@media ${props => props.device.laptop}{
		height: 460px;
  	}
    height: 360px;
    grid-row: 2/3;
	display: flex;
	flex-direction: column;
	/* box-shadow: 7px 7px 20px rgba(0, 0, 0, 0.1),
		-7px -7px 20px rgba(241, 255, 255, 1); */
	align-items: center;
	box-sizing: border-box;
	text-align: center;
	margin: 0;
	transition: right .6s ease-in-out;
`;

export const FormHeader = styled.div`
        background: ${props => props.primaryColor ? props.primaryColor : "#3F5773"};
        text-align: center;
        @media ${props => props.device.laptop}{
            padding: 20px;
        }
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        grid-row: 1/2;
        height: 40px;
        .preChatForm-welcome-text{
            color: whitesmoke;

            display: inline;
        }
`;


export const SubmitButton = styled.button`
    margin-top: 20px;
	width: 130px;
	background-color: transparent;
	outline: none;
	color: #292929;
	font-weight: bold;
	border-radius: 10px;
	padding: 10px;
	transition: ease all 250ms;
	box-shadow: 7px 7px 20px rgba(0, 0, 0, 0.1), -7px -7px 20px rgb(241, 255, 255);
	border: unset;
    &&:hover {
	cursor: pointer;
	color: #292929;
	box-shadow: inset 3px 3px 5px rgba(0, 0, 0, 0.1),
		inset -3px -3px 5px rgba(241, 255, 255, 0.5);
}
`;