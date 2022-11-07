/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import styled from 'styled-components';


const Icon = styled.svg.attrs({ 
  version: '1.1', 
  xmlns: 'http://www.w3.org/2000/svg', 
  xmlnsXlink: 'http://www.w3.org/1999/xlink',
})``

export const Svg = styled(Icon)`
  @media ${props => props.device.laptop}{
    width: 25px; 
    height: 22px;
  }
  width: 10px; 
  height: 8px;
`

export const Button = styled.button`
  display:block;
  background-color:${props => props.primaryColor ? props.primaryColor : "#3F5773"};
  color: white;
  padding: ${props => !props.toggleSVG ? '10px 10px' : '5px 5px'};
  border: none;
  cursor: pointer;
  @media ${props => props.device.laptop}{
      bottom: 30px;
      right: 50px;
  }
  opacity: 0.8;
  position: fixed;
    bottom: 20px;
    right: 20px;
  width: 100px;
  z-index: 999;
  border-radius: 4px;
  box-shadow: 1px 1px 8px #0c0c0c;
  transition: .4s;
  text-align: center;
  &:hover{
    background: ${props => props.primaryColor ? props.primaryColor : "#3F5773"};
  }
`

export const NotificationIcon = styled.div`
  width:20px;
  height: 20px;
  background-color: red;
  cursor: pointer;
  border-radius: 25px;
  visibility: ${(props) => (props.showNotification ? "hidden" : "visible")};
  position: fixed;
  bottom:55px;
  right: 50px;
`