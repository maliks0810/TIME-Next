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
    },  
  },  
];  

export default config;  

// import { ESLint } from 'eslint';  
// import reactPlugin from 'eslint-plugin-react';  
// import tsPlugin from '@typescript-eslint/eslint-plugin';  
// import tsParser from '@typescript-eslint/parser';  
// import reactHooksPlugin from 'eslint-plugin-react-hooks';  
// import reactRefreshPlugin from 'eslint-plugin-react-refresh';  
  
// /** @type {ESLint.FlatConfig[]} */  
// const config = [  
//   {  
//     ignores: ['node_modules/*', 'dist', '.eslintrc.cjs', 'build', 'turbo'],  
//   },  
//   {  
//     languageOptions: {  
//       parser: tsParser,  
//       parserOptions: {  
//         ecmaVersion: 'latest',  
//         sourceType: 'module',  
//         ecmaFeatures: {  
//           jsx: true,  
//         },  
//       },  
//       globals: {  
//         browser: true,  
//         node: true,  
//         es6: true,  
//       },  
//     },  
//     settings: {  
//       react: {  
//         version: 'detect',  
//       },  
//     },  
//     plugins: {  
//       react: reactPlugin,  
//       '@typescript-eslint': tsPlugin,  
//       'react-hooks': reactHooksPlugin,  
//       'react-refresh': reactRefreshPlugin,  
//     },  
//     rules: {  
//       ...reactPlugin.configs.recommended.rules,  
//       ...tsPlugin.configs.recommended.rules,  
//       ...reactHooksPlugin.configs.recommended.rules,  
//       'react-refresh/only-export-components': [  
//         'warn',  
//         { allowConstantExport: true },  
//       ],  
//       '@typescript-eslint/no-unused-vars': [  
//         'error',  
//         {  
//           argsIgnorePattern: '^_',  
//           varsIgnorePattern: '^_',  
//         },  
//       ],  
//       '@typescript-eslint/no-explicit-any': 'warn',  
//       '@typescript-eslint/explicit-module-boundary-types': 'off',  
//       '@typescript-eslint/no-non-null-assertion': 'warn',  
//       'react/prop-types': 'off',  
//       'react/display-name': 'off',  
//       'no-console': ['warn', { allow: ['warn', 'error'] }],  
//     },  
//   },  
// ];  
  
// export default config;  