# Custom Chat Widget Build

## Description

This document explains the code structure, the external libraries used, and how to build the package (library) that can be imported into a web page.

## Code structure

```bash
.
├── build_readme.md                  <-- Instructions file for building the package
├── .babelrc                         <-- Babel configuration
├── webpack.dev.js                   <-- Webpack configuration
├── package.json                     <-- Node.js configuration and dependencies
├── node_modules                     <-- Dependencies node modules
├── public                           <-- Public folder to store the package and simple html for testing
├── src                              <-- Source code folder
│   └── index.js                     <-- Code entry point.
│   └── App.js                       <-- App differentiates the path.
│   └── Components                   <-- Contains all the components
│       └── ChatButton               <-- Chat Button component folder.
│           └── index.js             <-- ChatButton component source.
│           └── styled.js            <-- ChatButton component CSS styles.
│       └── ChatIcon                 <-- Chat Icon component folder.
│                └── index.js        <-- Chat Icon component source.
│                └── styled.js       <-- Chat Icon component CSS styles.
│       └── InputField               <-- Input Field component folder.
│                └── index.js        <-- Input Field component source.
│                └── styled.js       <-- Input Field component CSS styles.
│       └── Spinner                  <-- Spinner component folder.
│                └── index.js        <-- Spinner component source.
│                └── styled.js       <-- Spinner component CSS styles.
│    └── constants                   <-- Constants folder.
│           └── index.js             <-- Contains all constants definitions.
│    └── container                   <-- Contains all the containers.
│           └── ChatForm             <-- Chat Form container folder.
│                └── index.js        <-- Chat Form container source.
│                └── styled.js       <-- Chat Form container CSS styles.
│           └── ChatWidget           <-- Chat Widget container folder.
│                └── index.js        <-- Chat Widget container source.
│                └── styled.js       <-- Chat Widget container CSS styles.
│    └── views                       <-- Contains all the views.
│           └── ChatWithForm         <-- ChatWithForm view folder.
│                └── index.js        <-- ChatWithForm view source.
│                └── styled.js       <-- ChatWithForm view CSS styles.
│           └── ChatWithoutForm      <-- ChatWithoutForm view folder.
│                └── index.js        <-- ChatWithoutForm view source.
│                └── styled.js       <-- ChatWithoutForm view CSS Styles.
│    └── providers                   <-- Contains all the providers
│       └── AppConfigProvider.js     <-- AppConfigProvider (context) provider source.


```

## 3rd party libraries used

- `Styled components` for CSS, to avoid css property styling conflict on the parent app.

- `Anime` and `react-transition-group`, for CSS animations and transitions.

- `Webpack` and `Babel` for packaging.

- `React Hooks` are used in this project instead of class based components to improve component re-usability.

- `Component API` to share app config across components and to avoid prop drilling between components.

## Build steps

- Clone the repo `git clone https://github.com/amazon-connect/amazon-connect-chat-ui-examples.git`

- Go to `/customChatWidget`

- Run `npm install`

- Run `npm run build` to build the package using Babel and Webpack, and save the output into `public` folder with name `ACChat.js`.

## Testing

- After a new build, you can used the output file `ACChat.js` in your web page and test it using the instructions in the [README.md](README.md) file.
- Or you can test it with `index.html` in `/customChatWidget/public` using *Live server* extension in VS Code [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
