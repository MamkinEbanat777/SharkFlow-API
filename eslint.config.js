import js from '@eslint/js';

export default [
  {
    ignores: [
      'node_modules/',
      'docs-site/',
      'docs/',
      'logs/',
      '*.zip'
    ]
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        
        // Timer functions
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        
        // Web APIs (for browser-like environments)
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        
        // URL and fetch APIs
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        
        // Crypto and encoding
        crypto: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        
        // JSON and Math
        JSON: 'readonly',
        Math: 'readonly',
        
        // Error constructors
        Error: 'readonly',
        TypeError: 'readonly',
        ReferenceError: 'readonly',
        SyntaxError: 'readonly',
        
        // Promise and async
        Promise: 'readonly',
        Symbol: 'readonly',
        
        // Object methods
        Object: 'readonly',
        Array: 'readonly',
        String: 'readonly',
        Number: 'readonly',
        Boolean: 'readonly',
        Date: 'readonly',
        RegExp: 'readonly',
        Function: 'readonly',
        
        // Global functions
        parseInt: 'readonly',
        parseFloat: 'readonly',
        isNaN: 'readonly',
        isFinite: 'readonly',
        encodeURI: 'readonly',
        encodeURIComponent: 'readonly',
        decodeURI: 'readonly',
        decodeURIComponent: 'readonly',
        escape: 'readonly',
        unescape: 'readonly',
        
        // Infinity and NaN
        Infinity: 'readonly',
        NaN: 'readonly',
        undefined: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false
      }]
    }
  }
];