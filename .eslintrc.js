module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  },
  overrides: [
    {
      files: [
        'packages/@averjs/vue-app/templates/**/*.js'
      ],
      parserOptions: {
        parser: 'babel-eslint',
        ecmaVersion: 2015
      },
      plugins: [],
      extends: [
        'plugin:lodash-template/recommended-with-script',
        'standard'
      ],
      rules: {
        'generator-star-spacing': 'off',
        
        indent: ['error', 2, { MemberExpression: 'off' }],
            
        'no-tabs': 'off',
      
        'prefer-promise-reject-errors': ['error', {
          allowEmptyReject: true
        }],

        'no-multi-spaces': ['error', {
          exceptions: {
            ImportDeclaration: true
          }
        }],
    
        semi: ['error', 'always'],
    
        'space-before-function-paren': ['error', 'never'],
            
        'no-trailing-spaces': ['error', {
          skipBlankLines: true
        }],
    
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
      }
    }
  ]
};
