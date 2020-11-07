const averConfig = require('@averjs/eslint-config');

module.exports = {
  overrides: [
    {
      files: [
        '**/*.ts'
      ],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint',
        'unicorn'
      ],
      env: {
        jest: true
      },
      extends: [
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        ...averConfig.rules,
        ...{ 'unicorn/no-process-exit': 'off' }
      }
    },
    {
      files: [
        '**/*.js',
        '**/*.vue'
      ],
      extends: [
        '@averjs'
      ]
    },
    {
      files: [
        'packages/@averjs/vue-app/templates/**/*.js'
      ],
      parserOptions: {
        parser: 'babel-eslint',
        ecmaVersion: 2015
      },
      extends: [
        'plugin:lodash-template/recommended-with-script',
      ]
    }
  ]
};
