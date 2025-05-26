import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['./**/*.{js,mjs,cjs,ts}'],
    languageOptions: { globals: { ...globals.node } }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier
];
