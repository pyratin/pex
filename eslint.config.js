import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettierFlat from 'eslint-config-prettier/flat';
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';
import eslintReactEslintPlugin from '@eslint-react/eslint-plugin';

export default defineConfig([
  { ignores: ['package-lock.json'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } }
  },
  tseslint.configs.recommended,
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended']
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended']
  },
  eslintConfigPrettierFlat,
  {
    ...eslintPluginJsdoc.configs['flat/recommended'],
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}']
  },
  {
    ...eslintReactEslintPlugin.configs['recommended-typescript'],
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}']
  },
  { settings: { react: { version: 'detect' } } },
  {
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true }
      ],
      '@eslint-react/no-array-index-key': 'off',
      '@eslint-react/use-state': 'off'
    }
  }
]);
