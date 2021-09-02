/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import styled from 'styled-components';


export const Main = styled.div`
  /* This fires as soon as the element enters the dorm */
  .widget-transition-enter,
  .widget-transition-appear {
    /*We give the list the initial dimension of the list button*/
    @media ${props => props.device.laptop}{
      bottom: 95px;
    }
    bottom: 70px;
    max-height: 0px;
    width: 0px;
    color: transparent;
    background-color: linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255) 80%, rgb(255, 255, 255));
    opacity:0
  }
  /* This is where we can add the transition*/
  .widget-transition-enter-active,
  .widget-transition-appear-active {
    @media ${props => props.device.laptop}{
      bottom: 95px;
      width: 420px;
    }
    bottom: 70px;
    width: 320px;
    max-height: 555px;
    background-color: linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255) 80%, rgb(255, 255, 255));
    transition: all 400ms;
    opacity:1;
  }

  /* This fires as soon as the this.state.showList is false */
  .widget-transition-exit {
    @media ${props => props.device.laptop}{
      bottom: 95px;
    }
    bottom: 70px;
    width: 200px;
    max-height: 200px;
    background-color: linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255) 80%, rgb(255, 255, 255))
  }
  /* fires as element leaves the DOM*/
  .widget-transition-exit-active {
    @media ${props => props.device.laptop}{
      bottom: 95px;
    }
    bottom: 70px;
    width: 0px;
    max-height: 0px;
    color: transparent;
    background-color: linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255) 80%, rgb(255, 255, 255));
    transition: all 400ms;
  }
`;