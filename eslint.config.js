import globals from 'globals'
import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    ignores: ['templates/'],
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },
]
