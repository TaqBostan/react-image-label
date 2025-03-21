/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "@happy-dom/jest-environment",
  testEnvironmentOptions: {
    url: "http://localhost",
    width: 1920,
    height: 1080,
    settings: {
      navigator: {
         "userAgent": "Chrome/133.0.6943.143"
      }
    }
  },
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
};