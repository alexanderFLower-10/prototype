// eslint.config.js
import plugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

/** @type {import("eslint").FlatConfig[]} */
export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': plugin,
    },
    rules: {
      '@typescript-eslint/typedef': [
        'error',
        {
          variableDeclaration: true,
          memberVariableDeclaration: true,
          propertyDeclaration: true,
          parameter: true,
          arrowParameter: true,
        },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
];
