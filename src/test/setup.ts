import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'

// Use as funções globais do Vitest (globals: true), sem `import ... from 'vitest'`.
// No Windows, com o drive em minúscula no diretório atual ("c:\\", comum no VS Code),
// importar 'vitest' carrega uma segunda instância do módulo e nenhum teste roda.
// Pelo mesmo motivo os matchers do jest-dom são registrados no `expect` global
// (o '@testing-library/jest-dom/vitest' importa 'vitest' por dentro).
expect.extend(matchers)

afterEach(() => {
  cleanup()
})

window.scrollTo = () => {}
