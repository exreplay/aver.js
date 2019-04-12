module.exports = {
  clearMocks: true,

  coverageDirectory: './coverage/',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '__fixtures__'
  ],

  testEnvironment: 'node',
  moduleFileExtensions: [
    'js'
  ],
  transform: {
    '^.+\\.js?$': 'babel-jest'
  },
  testMatch: [
    '**/__tests__/**/*.spec.js'
  ]
};
