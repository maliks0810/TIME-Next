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
      ...Object.keys(reactPlugin.configs.recommended.rules).reduce((acc, rule) => {  
        acc[rule] = 'off';  
        return acc;  
      }, {}),  
      ...Object.keys(tsPlugin.configs.recommended.rules).reduce((acc, rule) => {  
        acc[rule] = 'off';  
        return acc;  
      }, {}),  
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    },  
  },  
];  

export default config;