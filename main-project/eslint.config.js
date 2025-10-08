// ESLint configuration for Angular TypeScript project (ESLint v9+)
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import angularEslint from '@angular-eslint/eslint-plugin';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angularEslint,
    },
    rules: {
      // Add or override rules here
      ...tseslint.configs.recommended.rules,
      // Angular ESLint recommended rules
      ...angularEslint.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.spec.ts'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        jasmine: 'readonly',
        spyOn: 'readonly',
        fail: 'readonly',
        // Add more Jasmine globals if needed
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angularEslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...angularEslint.configs.recommended.rules,
      // Relax some rules for test files
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];
