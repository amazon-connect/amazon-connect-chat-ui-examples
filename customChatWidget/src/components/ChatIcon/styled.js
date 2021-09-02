// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import styled from 'styled-components';

const Icon = styled.svg.attrs({ 
  version: '1.1', 
  xmlns: 'http://www.w3.org/2000/svg', 
  xmlnsXlink: 'http://www.w3.org/1999/xlink',
})``

export const Svg = styled(Icon)`
  @media ${props => props.device.laptop}{
    width: 20px; 
    height: 20px;
  }
  width: 20px; 
  height: 18px;
`

export const Button = styled.button`
    position:fixed;
    cursor: pointer;
    bottom: 30px;
    right: 50px;
    border: transparent;
    padding: 15px;
	  border-radius: 50%;
    display: flex;
    justify-content: center;
	  align-items: center;
    background: ${props => props.primaryColor ? props.primaryColor : "#3F5773"};
`;
