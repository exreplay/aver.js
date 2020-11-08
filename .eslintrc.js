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
      globals: {
        jestPuppeteer: true
      },
      extends: [
        'standard',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        'no-use-before-define': 'off',

        ...averConfig.rules,
        ...{ 'unicorn/no-process-exit': 'off' }
      }
    },
    {
      files: [
        '**/*.js',
        '**/*.vue'
      ],
      env: {
        jest: true
      },
      globals: {
        jestPuppeteer: true
      },
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
