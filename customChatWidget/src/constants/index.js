/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

const deviceSize = {
    mobileS: '320px',
    mobileM: '375px',
    mobileL: '425px',
    tablet: '768px',
    laptop: '1024px',
    laptopL: '1440px',
    desktop: '2560px'
}

export const device = {
  mobileS: `(min-width: ${deviceSize.mobileS})`,
  mobileM: `(min-width: ${deviceSize.mobileM})`,
  mobileL: `(min-width: ${deviceSize.mobileL})`,
  tablet: `(min-width: ${deviceSize.tablet})`,
  laptop: `(min-width: ${deviceSize.laptop})`,
  laptopL: `(min-width: ${deviceSize.laptopL})`,
  desktop: `(min-width: ${deviceSize.desktop})`,
  desktopL: `(min-width: ${deviceSize.desktop})`
};

export const inputFieldValidations = {
  REQUIRED: 'required',
  NOT_REQUIRED: 'notrequired'
}

export const loggerNames = {
  components: {
    CHAT_BUTTON: 'ChatButton',
    CHAT_ICON: 'ChatIcon',
    INPUT_FIELD: 'InputField',
    SPINNER: 'Spinner'
  },
  containers: {
    CHAT_FORM: 'ChatForm',
    CHAT_WIDGET: 'ChatWidget'
  },
  views: {
    CHAT_WITH_FORM: 'ChatWithForm',
    CHAT_WITHOUT_FORM: 'ChatWithoutForm'
  },
  INDEX: 'Index',
  APP: 'App'
}


export const chatWithFormStates = {
  FORM: 'form',
  CHAT_WIDGET: 'chat'
}

export const chatWithoutFormStates = {
 FORM: 'form',
CHAT_WIDGET: 'chat'
}

export const chatParties = {
  SYSTEM_MESSAGE: "SYSTEM_MESSAGE",
  BOT: "BOT"
}


export const chatWidgetDefaults = {
  NAME: 'Customer',
  USER_NAME: 'Customer',
  CUSTOMER_NAME: 'Customer',
  ENABLE_ATTACHMENTS: false,
  PRIMARY_COLOR: "#3F5773",
  DESCRIPTION: 'Welcome to Amazon chat',
  REFER_INDICATOR: 'refer'
}

export const chatInitiationIcon = {
    BUTTON: 'button',
    ICON: 'icon',
}


// Vector data points for carot svg
export const closeChatSVGPath = "M11.6,14.9l-4.5-4.5c-0.1-0.1-0.2-0.2-0.2-0.4s0.1-0.3,0.2-0.4l0.5-0.5C7.7,9,7.8,8.9,8,8.9 c0.2,0,0.3,0,0.4,0.2l3.6,3.6L15.6,9c0.1-0.1,0.2-0.2,0.4-0.2c0.2,0,0.3,0.1,0.4,0.2l0.5,0.5c0.1,0.1,0.2,0.2,0.2,0.4 s-0.1,0.3-0.2,0.4l-4.5,4.5c-0.1,0.1-0.2,0.2-0.4,0.2S11.7,15,11.6,14.9z";


// Vector data points for chat svg
export const chatSVGPath = "M20.4,1.5H3.6c-1.2,0-2.1,0.9-2.1,2.1v18.9l4.2-4.2h14.7c1.2,0,2.1-0.9,2.1-2.1V3.6 C22.5,2.4,21.6,1.5,20.4,1.5z";




