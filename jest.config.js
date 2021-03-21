const jmnp = require('jest-module-name-mapper')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: jmnp.default(),
  setupFiles: ["dotenv/config"],

};
