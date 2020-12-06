const fs = require('fs');
const path = require('path');

const corePackages = fs
  .readdirSync(path.resolve(__dirname, './packages/@averjs'), {
    withFileTypes: true
  })
  .filter(p => p.isDirectory())
  .map(p => p.name);

module.exports = {
  preset: 'jest-puppeteer',

  clearMocks: true,

  expand: true,
  forceExit: true,

  coverageDirectory: './coverage/',
  collectCoverage: true,

  collectCoverageFrom: [
    '**/packages/@averjs/*/lib/**/*.ts',
    '!**/packages/@averjs/**/*.d.ts'
  ],

  coveragePathIgnorePatterns: ['__fixtures__', 'dist'],

  setupFilesAfterEnv: ['./__tests__/utils/setup'],

  watchPathIgnorePatterns: ['dist', 'node_modules'],

  moduleFileExtensions: ['js', 'json', 'ts', 'node', 'vue'],
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.ts?$': 'ts-jest'
  },
  testMatch: ['**/__tests__/**/*.spec.js', '**/__tests__/**/*.spec.ts'],

  transformIgnorePatterns: ['node_modules/(?!(@averjs|averjs))'],

  moduleNameMapper: {
    [`@averjs/(${corePackages.join(
      '|'
    )})$`]: '<rootDir>/packages/@averjs/$1/lib/index'
  }
};
