// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'coverage/*'],
  },
  {
    rules: {
      'no-restricted-imports': ['error', { patterns: ['../*'] }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react/jsx-no-useless-fragment': 'error',
    },
  },
]);
