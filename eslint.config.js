import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

// Regra do projeto: nada persiste e nada sai do navegador. Storage, cookies e qualquer API
// de rede são proibidos no código-fonte (a CSP do build também bloqueia a rede).
const NO_PERSIST = 'Proibido: a página não guarda nada nem fala com rede (ver CLAUDE.md).'
const banned = [
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'caches',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'BroadcastChannel',
]

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-globals': ['error', ...banned.map((name) => ({ name, message: NO_PERSIST }))],
      'no-restricted-properties': [
        'error',
        ...banned.map((property) => ({ object: 'window', property, message: NO_PERSIST })),
        { object: 'document', property: 'cookie', message: NO_PERSIST },
        { object: 'navigator', property: 'sendBeacon', message: NO_PERSIST },
        { object: 'navigator', property: 'serviceWorker', message: NO_PERSIST },
        { object: 'navigator', property: 'storage', message: NO_PERSIST },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'Proibido dangerouslySetInnerHTML.',
        },
      ],
    },
  },
  {
    files: ['**/*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
)
