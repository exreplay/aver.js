module.exports = {
  clearMocks: true,

  coverageDirectory: './coverage/',
  collectCoverage: true,
  coveragePathIgnorePatterns: ['__fixtures__'],

  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.ts?$': 'ts-jest'
  },
  testMatch: ['**/__tests__/**/*.spec.js', '**/__tests__/**/*.spec.ts']
};
