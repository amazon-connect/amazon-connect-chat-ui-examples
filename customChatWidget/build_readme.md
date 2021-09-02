# Amazon connect chat library build document

## Description

Document explains the code structure, the external libraries used, and how to build the package(library) that can be imported into a web page.

## Code structure

```bash
.
├── build_readme.md                  <-- Instructions file for building the package
├── client_readme.md                 <-- Instructions file for user on how to use on webpage
├── .babelrc                         <-- Babel configuration
├── webpack.dev.js                   <-- Webpack configuration
├── package.json                     <-- Node.js configuration and dependencies
├── node_modules                     <-- Dependencies node modules
├── public                           <-- Public folder to store the package and simple html for testing
├── src                              <-- Source code folder
│   └── index.js                     <-- Code entry point.
│   └── App.js                       <-- App differentiates the path.
│   └── Components                   <-- Components folder
│       └── ChatButton               <-- Chat button component folder.
│           └── index.js             <-- Index file to expose this component.
│           └── styled.js            <-- CSS Styles.
│       └── ChatIcon                 <-- Chat Icon component Folder.
│                └── index.js        <-- Index file that exposes ChatIcon component.
│                └── styled.js       <-- CSS Styles.
│       └── InputField               <-- Input Field component Folder.
│                └── index.js        <-- Index file that exposes this component.
│                └── styled.js       <-- CSS Styles.
│       └── Spinner                  <-- Spinner component Folder.
│                └── index.js        <-- Index file that exposes this component.
│                └── styled.js       <-- CSS Styles.
│    └── constants                   <-- Constants folder.
│           └── index.js             <-- Index file to expose this component.
│    └── container                   <-- Contains all the containers.
│           └── ChatForm             <-- Chat Form component Folder.
│                └── index.js        <-- Index file that exposes this component.
│                └── styled.js       <-- CSS Styles.
│           └── ChatWidget           <-- Chat Widget component Folder.
│                └── index.js        <-- Index file that exposes this component.
│                └── styled.js       <-- CSS Styles.
│    └── views                       <-- Contains views.
│           └── ChatWithForm         <-- Folder that contains ChatWithForm view.
│                └── index.js        <-- Index file that exposes this component.
│                └── styled.js       <-- CSS Styles.
│           └── ChatWithoutForm      <-- Folder that contains ChatWithoutForm view.
│                └── index.js        <-- Index file that exposes this component.
│                └── styled.js       <-- CSS Styles.
│    └── providers                    <-- Contexts folder
│       └── AppConfigProvider.js     <-- Chat Contexts that contain the config for this App.


```

## 3rd party libraries used

- Styled components for CSS to avoid css property styling conflict on the parent app.

- Anime and react-transition-group for CSS animations and transitions.

- Webpack and Babel for packaging.

- React hooks are used in this project instead of class based components to improve component re-usability.

- Component API to share app config across components and to avoid prop drilling between components.

## Build steps

- Clone the repo `git clone`

- Run `npm i`

- Run `npm run build` which will build the package using babel and webpack and saves the package into the public folder with name ACChat.js.

## Testing

- After a new build, you can used the built file `ACChat.js` in your webpage and test it using the instructions in the [README.md](/chatPluginForWebpage/README.md) file.
- Or you can test it with index.html in `/chatPluginForWebpage/public` using a Live server extension in VS Code [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
