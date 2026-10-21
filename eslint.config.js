import { createRequire } from 'node:module'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

// typescript-eslint ainda não suporta o TypeScript 7 (usado em `tsc -b`); no lint, o módulo
// `typescript` é redirecionado para @typescript/typescript6 (API JS), sem alterar o typecheck.
const require = createRequire(import.meta.url)
const Module = require('node:module')
const ts6 = require.resolve('@typescript/typescript6')
const resolve = Module._resolveFilename
Module._resolveFilename = function (request, ...rest) {
  return request === 'typescript' ? ts6 : resolve.call(this, request, ...rest)
}
const { default: tseslint } = await import('typescript-eslint')

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
