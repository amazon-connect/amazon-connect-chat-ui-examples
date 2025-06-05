module.exports = {
  testEnvironment: "jsdom",
  preset: "react-native",
  transformIgnorePatterns: ["node_modules/(?!react-native-url-polyfill)/"],
  setupFiles: ['./jest.setup.js']
};
