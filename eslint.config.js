import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

// `typescript` é um alias para @typescript/typescript6 (API JS que o typescript-eslint suporta);
// o compilador do `tsc -b` é o TypeScript 7, instalado como @typescript/native.

export default tseslint.config(
  { ignores: ['dist', 'playwright-report', 'test-results', 'reports', 'public', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: { ecmaVersion: 2023, globals: { ...globals.browser } },
  },
  {
    files: ['**/*.mjs', 'vite.config.ts', 'playwright.config.ts', 'eslint.config.js'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 2023, globals: { ...globals.node } },
  },
)
