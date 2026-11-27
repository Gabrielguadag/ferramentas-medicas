# Ferramentas para a consulta

Página estática, sem cadastro, sem servidor e sem armazenamento. Tudo fica na memória da aba.

- **Consulta de diabetes:** migração para glargina (elegibilidade, dose, alerta de basal e
  tubetes), início da NPH, início da glargina (sem insulina prévia), titulação, insulina prandial, metas, fluxograma do PCDT e risco
  cardiovascular (SBC 2025, SBD 2026, PCDT 2026, OMS/HEARTS e PREVENT).
- **Glicosímetro (USB)**: leitura dos Accu-Chek em mg/dL com micro-USB (modelos previstos: Guide,
  Guide Me, Instant, Instant S, Performa Connect, Aviva Connect e ReliOn Platinum; ainda não validada com aparelho físico), pelo Chrome ou Edge, com resumo, gráfico, tabela, exportação em CSV e impressão ou PDF.
- **Canetas GLP-1:** semaglutida (Ozempic, Extensior, Ozivy, Semavy, Semaclique, Wegovy e
  Poviztra): cliques para doses fora da marca da caneta, aplicações por caneta pela validade e o
  esquema de início da bula com datas.
- **Gestante → Idade gestacional:** IG e DPP pela DUM, por ultrassonografia (com regra de
  redatação), pela DPP ou por FIV; IG em qualquer data e quando completa uma IG. Em cada IG,
  mostra a frequência de consultas, os exames e vacinas a pedir agora, o que já deveria ter
  sido feito e o que vem a seguir.
- **Gestante → Consultas e exames:** calendário de consultas, exames por trimestre e vacinas
  (Caderneta Brasileira da Gestante 2026).
- **Gestante → Pré-eclâmpsia:** fatores de risco e indicação de AAS e cálcio, classificação da
  PA e anti-hipertensivos (RBEHG 2023).
- **Gestante → Eclâmpsia e sulfato:** sulfato de magnésio (Zuspan ou Pritchard, ajuste renal),
  monitorização e antídoto (RBEHG 2023).
- **Criança → Introdução alimentar:** pela idade e pelo leite (materno, fórmula ou leite de
  vaca), o plano do dia, como oferecer, sinais de fome e saciedade e o que não oferecer (Guia
  alimentar para crianças menores de 2 anos, MS).
- **Criança → Marcos do desenvolvimento:** marcos da faixa (com idade corrigida para
  prematuros), fatores de risco e a classificação com conduta da Caderneta da Criança (MS).

## Rodar

```sh
npm install
npm run dev        # http://localhost:5180
npm test
npm run build      # gera dist/ (arquivos estáticos)
npm run preview    # serve o build em localhost (contexto seguro para a WebUSB)
```

## Publicar

O `dist/` pode ser servido por qualquer hospedagem estática com HTTPS. A WebUSB exige contexto
seguro. A CSP já vai no `index.html` e bloqueia qualquer conexão de rede (`connect-src 'none'`).
Os caminhos do build são relativos (`base: './'`), então ele funciona em subpasta.

**GitHub Pages:** o workflow `.github/workflows/pages.yml` roda lint, testes e build a cada push
na `main` e publica o `dist/`. Ele também confere que o bundle não tem `fetch(`. Para ativar, vá
em Settings → Pages → Source e escolha "GitHub Actions" (uma vez só).

## Licenças de terceiros

Ver `THIRD_PARTY_NOTICES.md` (dados de risco CV vindos dos pacotes `preventr` e
`WHORiskCalculator`, ambos MIT).

## Documentação

- `docs/glargina-regras.md`: regras da consulta e suas fontes.
- `docs/risco-cv.md`: escalas de risco cardiovascular, implementação e verificação.
- `docs/gestante-ig.md`: idade gestacional, regras e fontes.
- `docs/gestante-prenatal.md`: consultas, exames e vacinas do pré-natal.
- `docs/gestante-preeclampsia.md`: pré-eclâmpsia, eclâmpsia e sulfato de magnésio.
- `docs/crianca.md`: introdução alimentar e marcos do desenvolvimento.
- `docs/canetas-glp1.md`: cliques, rendimento e esquema das canetas de semaglutida.
- `docs/accu-chek.md`: o protocolo, os modelos e o que falta testar com um aparelho real.
