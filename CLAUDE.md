# ferramentas-diabetes

Projeto paralelo ao Smedic, que será absorvido por ele no futuro (`smedic/apps/web`). É uma
página **100% frontend**, sem cadastro, sem backend e sem armazenamento, com duas áreas
separadas (sem estado compartilhado): **Diabetes** e **Gestante**.

Área Diabetes:

1. **Consulta de diabetes**: ferramentas para o médico usar na consulta, com regras da NT
   Conjunta 169/2026 (glargina) e do PCDT DM2 2026. São 7 seções: migração para glargina, início da
   NPH, titulação, insulina prandial, metas, tratamento do DM2 e risco cardiovascular. O risco CV
   tem cinco escalas selecionáveis: SBC 2025, SBD 2026, PCDT 2026, OMS/HEARTS e PREVENT. Os
   detalhes estão em `docs/glargina-regras.md` e `docs/risco-cv.md`.
2. **Glicosímetro**: leitura da memória dos Accu-Chek com micro-USB (Guide, Instant e família)
   via WebUSB e protocolo IEEE 11073-20601 próprio. A tela exibe as medições, exporta CSV e
   imprime ou gera PDF. O detalhe está em `docs/accu-chek.md`.

Área Gestante (um módulo por item da barra lateral):

1. **Idade gestacional**: IG e DPP pela DUM (certa ou só o período do mês), por
   ultrassonografia (com a regra de redatação da ACOG), pela DPP ou por FIV; IG em qualquer
   data e data em que completa uma IG. Regras do Caderno de Atenção Básica 32 (MS) e da ACOG
   CO 700, em `docs/gestante-ig.md`.

Stack igual à do `smedic/apps/web` (React 19 + TS strict + Vite + Vitest, mesmas versões), para
a absorção ser só mover módulos. Em runtime, as únicas dependências são `react` e `react-dom`.
Gráfico, CSV, PDF (impressão do navegador) e protocolo USB são código próprio.

## Invariantes (não negociáveis)

1. **Nada persiste.** Proibido `localStorage`, `sessionStorage`, `indexedDB`, Cache API, cookies,
   service worker e `navigator.storage`. O estado vive em memória React e some ao
   recarregar. O ESLint proíbe essas APIs (`eslint.config.js`).
2. **Nada sai do navegador.** Proibido `fetch`, XHR, WebSocket, EventSource, `sendBeacon`,
   analytics, CDN e fonte externa. A CSP do build tem `connect-src 'none'`.
3. **Exportar é sempre ação explícita do usuário** (CSV, impressão, diagnóstico), feita com um
   Blob em memória e a URL revogada logo depois.
4. **Permissão USB não fica guardada:** ao fim da leitura o aparelho é fechado e `forget()`.
5. **Regra clínica só com fonte oficial** (NT, PCDT, MS, diretrizes SBC/SBD/ACOG, artigos das escalas),
   citada na tela. Não citar nem copiar calculadoras de terceiros. Mudar uma regra exige
   atualizar o documento em `docs/` e os testes.
6. **Status bruto não é interpretado** (ver `docs/accu-chek.md`): não inventar significado
   clínico para bits não documentados.
7. Só dados sintéticos em testes e na demonstração.

## Estrutura

- `src/glargina/`: `rules/` (funções puras + testes), `patient.tsx` (painel do paciente
  compartilhado), `sections.tsx` e `sources.ts`.
- `src/risco/`: escalas de risco CV (`escalas.ts`, `prevent.ts`, `who2019.ts`), coeficientes em
  JSON e testes que reproduzem os casos de referência (PREVENT) e as 2.100 células da OPAS (OMS).
- `src/glicosimetro/`: `phdc/` (protocolo: bytes MDER, APDUs, segmentos, MDS, sessão, simulador),
  `usbTransport.ts` (WebUSB), `analysis.ts` (estatística e CSV), telas e gráfico SVG.
- `src/gestante/`: `datas.ts` (datas de calendário como número de dias, sem fuso), `ig.ts`
  (regras puras + testes), `GestantePage.tsx` (barra de módulos) e `IdadeGestacional.tsx`.
- `src/shared/`: campos de formulário (número, data), componentes de resultado (`ui.tsx`) e
  download.

## Pegadinhas

- Testes: não importar de `'vitest'`; usar as globais (mesmo motivo do `smedic/apps/web`).

## Comandos

`npm run dev` (porta 5180) · `npm run build` · `npm run preview` · `npm test` · `npm run lint` ·
`npm run typecheck`.
