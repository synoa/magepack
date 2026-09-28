import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
    { ignores: ['node_modules/', 'coverage/', 'magepack.config.js'] },
    js.configs.recommended,
    prettierRecommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: { ...globals.node, ...globals.browser, ...globals.jest },
        },
        rules: {
            // Upstream `catch (error)` blocks do not use `error`; ESLint 9+ flags that by default.
            'no-unused-vars': ['error', { caughtErrors: 'none' }],
        },
    },
];
