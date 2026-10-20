import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        JsBarcode: 'readonly',
        QRCode: 'readonly',
        forge: 'readonly',
        Tesseract: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
      'no-undef': 'error',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'public/dist/**',
      'vendor/**',
      'storage/**',
    ],
  },
];
