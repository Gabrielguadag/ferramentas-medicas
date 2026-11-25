import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// O build mantém a CSP estrita do index.html (connect-src 'none': a página não fala com rede
// nenhuma). Só o dev server relaxa: o React Refresh injeta script inline e o HMR usa WebSocket.
function devCspRelax(): Plugin {
  return {
    name: 'dev-csp-relax',
    apply: 'serve',
    transformIndexHtml(html) {
      return html
        .replaceAll("script-src 'self';", "script-src 'self' 'unsafe-inline';")
        .replaceAll("connect-src 'none';", "connect-src 'self' ws://localhost:* ws://127.0.0.1:*;")
    },
  }
}

export default defineConfig({
  plugins: [react(), devCspRelax()],
  // Sem o polyfill de modulepreload: o bundle não deve conter nenhuma chamada fetch.
  // Caminhos relativos: o build funciona em qualquer subpasta (ex.: GitHub Pages em /<repo>/).
  base: './',
  build: { sourcemap: false, modulePreload: { polyfill: false } },
  server: { port: 5180, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
