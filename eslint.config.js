// eslint.config.js (Flat Config for ESLint v9)
import globals from 'globals'
import pluginReact from 'eslint-plugin-react'

export default [
  // Ignore build and dependency folders
  { ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**'] },

  // Rules for app source code
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react: pluginReact },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off', // React 17+ (Vite) does not require importing React
    },
    settings: { react: { version: 'detect' } },
  },

  // Rules/scope for tests (Vitest + jsdom)
  {
    files: ['tests/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser, ...globals.vitest },
    },
  },
]
