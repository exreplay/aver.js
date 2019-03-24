module.exports = {
  'env': {
    'browser': true,
    'node': true
  },
  'extends': [
    'standard',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:vue/recommended'
  ],
  'plugins': [
    'vue'
  ],
  'rules': {
    'generator-star-spacing': 'off',
    
    "indent": ["error", 4],
    
    "no-tabs": "off",

    "prefer-promise-reject-errors": ["error", {
        "allowEmptyReject": true
    }],

    "no-multi-spaces": ["error", {
        exceptions: {
            "ImportDeclaration": true
        }
    }],

    "semi": ["error", "always"],

    "space-before-function-paren": ["error", "never"],
    
    "no-trailing-spaces": ["error", {
        "skipBlankLines": true
    }]
  }
}
