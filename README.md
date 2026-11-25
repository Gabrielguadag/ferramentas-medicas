# Ferramentas para a consulta

Página estática, sem cadastro, sem servidor e sem armazenamento. Tudo fica na memória da aba.

- **Consulta de diabetes:** migração para glargina (elegibilidade, dose, alerta de basal e
  tubetes), início da NPH, titulação, insulina prandial, metas, fluxograma do PCDT e risco
  cardiovascular (SBC 2025, SBD 2026, PCDT 2026, OMS/HEARTS e PREVENT).
- **Glicosímetro (USB)**: leitura dos Accu-Chek Guide, Instant e família pelo cabo micro-USB
  (Chrome ou Edge), com resumo, gráfico, tabela, exportação em CSV e impressão ou PDF.
- **Gestante → Idade gestacional:** IG e DPP pela DUM, por ultrassonografia (com regra de
  redatação), pela DPP ou por FIV; IG em qualquer data e quando completa uma IG. Em cada IG,
  mostra a frequência de consultas, os exames e vacinas a pedir agora, o que já deveria ter
  sido feito e o que vem a seguir.
- **Gestante → Consultas e exames:** calendário de consultas, exames por trimestre e vacinas
  (Caderneta Brasileira da Gestante 2026).

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
- `docs/accu-chek.md`: o protocolo, os modelos e o que falta testar com um aparelho real.
