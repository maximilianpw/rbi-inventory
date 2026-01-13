import baseConfig from '../../packages/eslint-config/base.js'

export default [
  ...baseConfig,
  {
    files: ['src-ui/**/*.js'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
      },
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]
