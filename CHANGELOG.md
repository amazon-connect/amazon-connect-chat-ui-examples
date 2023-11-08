# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.4] - 2023-11-08
### Changed
 - [samTemplate interactive-messaging-lex-codehook] - update the lex/lambda code hook to support Lex V2 and Node 18.x. This example lambda function is used for the interacive message feature for Amazon Connect Chat Widget. To learn more, refer to the [Documentation](https://docs.aws.amazon.com/connect/latest/adminguide/interactive-messages.html), a walk-through [blog post](https://aws.amazon.com/blogs/contact-center/easily-set-up-interactive-messages-for-your-amazon-connect-chatbot/), or the [workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/638d00f5-2248-488f-b7ca-903e8b966bf8/en-US).

## [1.4.3] - 2023-11-07
### Added
 - [iOSChatExample](./iOSChatExample/README.md) - iOS example of the AWS Connect chat widget is designed for easy integration with a focus on customization.

## [1.4.2] - 2023-10-10
### Added
 - [Hosted Widget Customization](./hostedwidgetCustomization/README.md) examples for Amazon Connect. Additional ways to integrate the communications widget directly into your website and personalize the branding.

## [1.4.1] - 2023-6-19
### Changed
 - [Custom Chat Widget + cloudformationTemplates] - updated chat interface bundle file for additional interactive messages feature
    - Amazon Connect Chat introduces additional interactive message templates, Carousel and QuickReplies. Create richer customer experiences and resolve issues faster by sending prompts and eliminating the need for a customer to manually type in their reply. [Learn More](https://docs.aws.amazon.com/connect/latest/adminguide/interactive-messages.html)

## [1.4.0] - 2023-3-29
### Changed
- Connect React Native Chat - initial release of cross-platform Amazon Connect Chat solution

## [1.3.3] - 2023-2-21
### Changed
- Custom Chat Widget - Support Custom Chat Duration
- cloudformationTemplates - startChatContactAPI - Support Custom Chat Duration
  - Customize total chat duration of a newly started chat session. [Learn more](https://docs.aws.amazon.com/connect/latest/APIReference/API_StartChatContact.html#connect-StartChatContact-request-ChatDurationInMinutes)

## [1.3.2] - 2023-2-10
### Changed
- Mark `asyncCustomerChatUX` approach as deprecated.

## [1.3.1] - 2023-1-23
### Added
- Custom Chat Widget - Include Rich Messaging suppport
- cloudformationTemplates - Include Rich Messaging suppport
  - Amazon Connect Chat now allows your agents and customers to use rich text formatting when composing a message, enabling them to quickly add emphasis and structure to messages, improving comprehension. The available formatting options include bold, italics, hyperlinks, bulleted lists, and numbered lists. [Learn more](https://docs.aws.amazon.com/connect/latest/adminguide/enable-text-formatting-chat.html)

## [1.3.0] - 2023-1-19
### Added
- cloudformationTemplates - startChatContactAPI - Introduce Persistent Chat
  - Amazon Connect Chat introduces Persistent Chat, making it easier for customers to continue conversations with context and transcripts carried over from previous chats, eliminating the need for customers to repeat themselves and allowing agents to provide personalized service with access to the entire conversation history. [Learn more](https://docs.aws.amazon.com/connect/latest/adminguide/chat-persistence.html)

## [1.2.5] - 2022-12-14
### Changed
- Custom Chat Widget - bump dependencies

## [1.2.4] - 2022-06-21
### Changed
- Custom Chat Widget - bump dependencies

## [1.2.3] - 2021-09-22
### Changed 
 - Updated runtime to `node14.x` in all solutions 

## [1.2.2] - 2021-09-22
### Changed
 - Custom Chat Widget - bump dependencies

## [1.2.1] - 2021-09-09
### Changed
 - Custom Chat Widget - readme updates


## [1.2.0] - 2021-09-02
### Added
 - [Custom Chat Widget](/customChatWidget/README.md) for Amazon Connect, with a Chat Form that can be easily plugged into a webpage


## [1.1.0] - 2021-08-20
### Added
- Added CHANGELOG.md
- Added support for deploying `asyncCustomerChatUX`, `startChatContactAPI`, `urlPreviewForAsyncChat` in Canada `ca-central-1` region

## [1.0.0] - Legacy
### Added
- No CHANGELOG.md existed for the original solution
- All changes until commit `52c4087032cec53163785dd480de17fe0a9a1e56` are clubbed under [1.0.0]
