module.exports = {
    root: true,
    parserOptions: {
        parser: 'babel-eslint',
        ecmaFeatures: {
            legacyDecorators: true
        }
    },
    env: {
        "browser": true
    },
    extends: [
        'plugin:vue/essential',
        'standard'
    ],
    plugins: [
        "vue"
    ],
    rules: {
        'generator-star-spacing': 'off',
    
        "indent": ["error", 4],
        
        "no-tabs": "off",
	
		"prefer-promise-reject-errors": ["error", {
        	"allowEmptyReject": true
        }],
		
        // "vue/script-indent": ["error", 4, {
        //     "baseIndent": 1
        // }],

        "no-multi-spaces": ["error", {
            exceptions: {
                "ImportDeclaration": true
            }
        }],

        "semi": ["error", "always"],

        "space-before-function-paren": ["error", "never"],
        
        "no-trailing-spaces": ["error", {
            "skipBlankLines": true
        }],

        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    },
    "overrides": [
        {
            "files": ["*.vue"],
            "rules": {
                "indent": "off",
                "vue/script-indent": ["error", 4, { "baseIndent": 1 }]
            }
        }
    ]
};