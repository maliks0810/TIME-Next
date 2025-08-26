import { ESLint } from 'eslint';  
import reactPlugin from 'eslint-plugin-react';  
import tsPlugin from '@typescript-eslint/eslint-plugin';  
import tsParser from '@typescript-eslint/parser';  

/** @type {ESLint.FlatConfig[]} */  
const config = [  
  {  
    languageOptions: {  
      parser: tsParser,  
      parserOptions: {  
        ecmaVersion: 2020,  
        sourceType: 'module',  
        ecmaFeatures: {  
          jsx: true,  
        },  
      },  
    },  
    settings: {  
      react: {  
        version: 'detect',  
      },  
    },  
    plugins: {  
      react: reactPlugin,  
      '@typescript-eslint': tsPlugin,  
    },  
    rules: {  
      ...reactPlugin.configs.recommended.rules,  
      ...tsPlugin.configs.recommended.rules,  
      'react/react-in-jsx-scope': 'off',  
    },  
  },  
];  

export default config;  