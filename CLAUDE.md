# ferramentas-diabetes

Projeto paralelo ao Smedic, que será absorvido por ele no futuro (`smedic/apps/web`). É uma
página **100% frontend**, sem cadastro, sem backend e sem armazenamento, com quatro áreas
separadas (sem estado compartilhado): **Diabetes**, **Canetas GLP-1**, **Gestante** e **Criança**.

Área Diabetes:

1. **Consulta de diabetes**: ferramentas para o médico usar na consulta, com regras da NT
   Conjunta 169/2026 (glargina) e do PCDT DM2 2026. São 8 seções: migração para glargina, início da
   NPH, início da glargina, titulação, insulina prandial, metas, tratamento do DM2 e risco cardiovascular. O risco CV
   tem cinco escalas selecionáveis: SBC 2025, SBD 2026, PCDT 2026, OMS/HEARTS e PREVENT. Os
   detalhes estão em `docs/glargina-regras.md` e `docs/risco-cv.md`.
2. **Glicosímetro**: leitura da memória dos Accu-Chek com micro-USB (Guide, Guide Me, Instant, Instant S, Performa Connect,
   Aviva Connect e ReliOn Platinum)
   via WebUSB e protocolo IEEE 11073-20601 próprio. A tela exibe as medições, exporta CSV e
   imprime ou gera PDF. O detalhe está em `docs/accu-chek.md`.

Área Canetas GLP-1 (caneta escolhida em comum; um módulo por item da barra lateral): semaglutida
(Ozempic, Extensior, Ozivy, Semavy, Semaclique, Wegovy, Poviztra). **Cliques por dose** (conta
proporcional à marca da caneta; referências da FDA e decisões do usuário) e **Início e aumento**
(esquema da bula com datas). Detalhes em `docs/canetas-glp1.md`.

Área Gestante (um módulo por item da barra lateral):

1. **Idade gestacional**: IG e DPP pela DUM (certa ou só o período do mês), por
   ultrassonografia (com a regra de redatação da ACOG), pela DPP ou por FIV; IG em qualquer
   data e data em que completa uma IG. Regras do Caderno de Atenção Básica 32 (MS) e da ACOG
   CO 700, em `docs/gestante-ig.md`. Ao datar, mostra o pré-natal naquela IG: frequência de
   consultas, o que solicitar agora, o que já deveria ter sido feito e os próximos itens.
2. **Consultas e exames**: referência do calendário de consultas, dos exames por trimestre e
   das vacinas (Caderneta Brasileira da Gestante 2026 e nota C3 do MS), em
   `docs/gestante-prenatal.md`.
3. **Pré-eclâmpsia**: fatores de risco com indicação de AAS e cálcio, classificação da PA,
   anti-hipertensivos de manutenção e da crise (RBEHG 2023).
4. **Eclâmpsia e sulfato**: indicação do sulfato de magnésio, esquemas de Zuspan e Pritchard
   (com ajuste renal), monitorização, recorrência e antídoto (RBEHG 2023). Detalhes em
   `docs/gestante-preeclampsia.md`.

Área Criança (dados da criança em comum; um módulo por item da barra lateral):

1. **Introdução alimentar**: plano do dia por idade e leite (materno, fórmula, leite de vaca),
   como oferecer, sinais e o que não oferecer (Guia alimentar para menores de 2 anos, MS).
2. **Marcos do desenvolvimento**: marcos por faixa, idade corrigida, fatores de risco e
   classificação com conduta (Caderneta da Criança, 6ª ed.). Detalhes em `docs/crianca.md`.

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
- `src/gestante/`: `ig.ts`
  e `prenatal.ts` (regras puras + testes), `GestantePage.tsx` (barra de módulos),
  `IdadeGestacional.tsx` e `PrenatalView.tsx` (não chamar de `Prenatal.tsx`: no Windows colide
  com `prenatal.ts`).
- `src/crianca/`: `idade.ts`, `alimentacao.ts` e `marcos.ts` (regras puras + testes),
  `CriancaPage.tsx` (dados da criança + barra de módulos), `AlimentacaoView.tsx` e
  `MarcosView.tsx`.
- `src/canetas/`: `canetas.ts` (dados das canetas e regras puras + testes), `CanetasPage.tsx`
  e `sources.ts`.
- `src/shared/`: campos de formulário (número, data), componentes de resultado (`ui.tsx`),
  `datas.ts` (datas de calendário como número de dias, sem fuso) e download.

## Pegadinhas

- Testes: não importar de `'vitest'`; usar as globais (mesmo motivo do `smedic/apps/web`).

## Comandos

`npm run dev` (porta 5180) · `npm run build` · `npm run preview` · `npm test` · `npm run lint` ·
`npm run typecheck`.
