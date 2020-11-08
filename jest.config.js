const fs = require('fs');
const path = require('path');

const corePackages = fs.readdirSync(path.resolve(__dirname, './packages/@averjs'), { withFileTypes: true })
  .filter(p => p.isDirectory())
  .map(p => p.name);

module.exports = {
  clearMocks: true,

  expand: true,
  forceExit: true,

  coverageDirectory: './coverage/',
  collectCoverage: true,

  collectCoverageFrom: [
    '**/packages/@averjs/*/lib/**/*.ts',
    '!**/packages/@averjs/**/*.d.ts'
  ],

  coveragePathIgnorePatterns: [
    '__fixtures__',
    'dist'
  ],

  setupFilesAfterEnv: ['./__tests__/utils/setup'],

  watchPathIgnorePatterns: [
    'fixtures'
  ],

  testEnvironment: 'node',
  moduleFileExtensions: [
    'js', 'json', 'ts', 'node'
  ],
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.ts?$': 'ts-jest'
  },
  testMatch: [
    '**/__tests__/**/*.spec.js',
    '**/__tests__/**/*.spec.ts'
  ],

  transformIgnorePatterns: [
    'node_modules/(?!(@averjs|averjs))'
  ],

  moduleNameMapper: {
    [`@averjs/(${corePackages.join('|')})$`]: '<rootDir>/packages/@averjs/$1/lib/index'
  }
};
