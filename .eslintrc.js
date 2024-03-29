// @ts-check
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  plugins: ['unicorn', 'import'],
  env: {
    jest: true
  },
  globals: {
    jestPuppeteer: true
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'none'
      }
    ],

    'unicorn/better-regex': 'error',
    'unicorn/catch-error-name': 'error',
    'unicorn/expiring-todo-comments': 'error',
    'unicorn/no-array-instanceof': 'error',
    'unicorn/no-hex-escape': 'error',
    'unicorn/numeric-separators-style': 'error',
    'unicorn/prefer-add-event-listener': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-optional-catch-binding': 'error',
    'unicorn/prefer-text-content': 'error',
    'unicorn/throw-new-error': 'error'
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json']
      },
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts']
        },
        'import/resolver': {
          node: {
            extensions: ['.js', '.json', '.ts', '.d.ts']
          },
          typescript: {
            project: require('path').resolve(
              __dirname,
              './tsconfig.eslint.json'
            )
          }
        }
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:prettier/recommended',
        'prettier'
      ],
      rules: {
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],

        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',

        '@typescript-eslint/no-floating-promises': [
          'error',
          { ignoreIIFE: true }
        ]
      }
    },
    {
      files: ['**/*.js', '**/*.vue'],
      env: {
        jest: true
      },
      extends: ['@averjs', 'prettier'],
      rules: {
        indent: 'off',
        'space-before-function-paren': 'off',
        'vue/script-indent': 'off'
      }
    },
    {
      files: [
        'packages/@averjs/vue-app/templates/**/*.js',
        'packages/@averjs/i18n/entries/*.js'
      ],
      parserOptions: {
        parser: 'babel-eslint',
        ecmaVersion: 2015
      },
      extends: ['plugin:lodash-template/base', '@averjs', 'prettier'],
      processor: 'lodash-template/script',
      rules: {
        'prettier/prettier': 'off'
      }
    }
  ]
};
