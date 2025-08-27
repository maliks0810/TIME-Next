module.exports = {
    root: true,
    env: {
      browser: true,
      node: true,
      es6: true,
    },
    extends: [
          'eslint:recommended',
          'plugin:@typescript-eslint/recommended',
          'plugin:react/recommended',
          'plugin:react/jsx-runtime',
          'plugin:react-hooks/recommended',
        ],
    ignorePatterns: ['node_modules/*', 'dist', '.eslintrc.cjs', 'build', 'turbo'],
    parser: '@typescript-eslint/parser',
    parserOptions: { 
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['react-refresh', '@typescript-eslint', 'react'],
    settings: {
        react: {
            version: 'detect',
        }
    },
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true}
        ],
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            },
        ],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'no-console': ['warn', { allow: ['warn', 'error']}],

    }

}