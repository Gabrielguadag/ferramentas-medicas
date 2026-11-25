# Changelog

## Não lançado

- Gestante, pré-natal na idade gestacional: ao datar a gestação, um cartão mostra para a data
  escolhida a frequência de consultas e a próxima consulta sugerida, o que solicitar agora, o que
  já deveria ter sido feito (para conferir) e os próximos exames e vacinas, com a data em que
  cada janela abre. A caixa "1ª consulta" põe os exames iniciais em "agora", troca a glicemia
  pelo TOTG depois de 24 semanas e avisa da captação depois da 12ª semana.
- Gestante, novo módulo "Consultas e exames": calendário de consultas, exames de rotina por
  trimestre, no parto, com indicação clínica e de alto risco, e vacinas.
- Fontes: Caderneta Brasileira da Gestante 2026 e nota metodológica C3 (MS).

- Nova área **Gestante**, separada da de diabetes (o cabeçalho passa a ter as áreas Diabetes e
  Gestante). Primeiro módulo, **Idade gestacional**:
  - datação pela DUM (certa ou só o período do mês: dias 5, 15 e 25), por ultrassonografia,
    pela DPP ou por FIV (embrião de 3 ou 5 dias);
  - IG em qualquer data, passada ou futura, DPP (DUM + 280 dias) e conferência pela regra de
    Näegele;
  - comparação DUM × ultrassonografia pela Tabela 1 da ACOG CO 700, com a datação sugerida e
    a escolha manual;
  - data em que completa uma IG e tabela de marcos (trimestres, termo, DPP, 41 e 42 semanas);
  - fontes: Caderno de Atenção Básica 32 (MS) e ACOG CO 700.
- Publicação no GitHub Pages: build com caminhos relativos e workflow que testa e publica.
- `ui.tsx` foi para `src/shared/`, para as duas áreas usarem os mesmos componentes.
- Foco no uso durante a consulta:
  - saem a projeção municipal e a dispensação;
  - as regras passam a usar só fontes oficiais (NT 169/2026 e PCDT DM2 2026, conferidos nas
    figuras e quadros), e a tela deixa de citar calculadoras de terceiros.
- Titulação pelo PCDT:
  - +2 U a cada 3 dias até a meta;
  - −2 a −4 U com jejum < 70 mg/dL ou hipoglicemia noturna;
  - −2 U com glicemia < 80 mg/dL.
- Tubetes: 300 UI por tubete e validade de 28 dias depois de aberto.
- Bolus de correção pela glicemia antes da refeição (Quadros 7 e 8 do PCDT).
- Fluxograma de tratamento do DM2 (Figura 2) e critérios de dapagliflozina, com aviso do
  conflito 55 × 65 anos.
- Risco cardiovascular com cinco escalas selecionáveis e tabela de comparação:
  - SBC 2025 (completa, com e sem DM, com metas de LDL, não-HDL e ApoB);
  - SBD 2026;
  - PCDT 2026;
  - OMS 2019/HEARTS (reproduz as 2.100 células oficiais);
  - PREVENT (com a errata de HbA1c; reproduz os casos do pacote de referência).
- Caixa "considerar diabetes" nas escalas que usam DM como fator. TFGe pelo CKD-EPI 2021.
- Interface:
  - painel do paciente compartilhado (idade, sexo, peso, altura, tipo de DM, perfil);
  - resultados em destaque, com a conduta;
  - detalhes e fontes recolhidos.

## 0.1.0 (2026-11-24)

Primeira versão. A página é 100% frontend: não tem cadastro, servidor nem armazenamento.

### Insulina glargina

- Migração NPH → glargina, titulação, metas, início da NPH e prandial (versão inicial).

### Glicosímetro (USB)

- Protocolo IEEE 11073-20601 próprio sobre WebUSB para Accu-Chek Guide, Instant e família.
  Inclui remontagem de APDU, mapa de entradas, SFLOAT e HI/LO.
- Glicosímetro simulado, usado nos testes e no modo de demonstração.
- Na tela:
  - resumo com média, desvio padrão, CV, percentual no alvo e abaixo de 54 / acima de 250;
  - gráfico SVG próprio ao longo do período e por hora do dia;
  - tabelas por período do dia e por medição.
- Exportação em CSV (padrão do Excel PT-BR), impressão e PDF pelo navegador, e arquivo de
  diagnóstico do tráfego.
- **Ainda não foi testado com um aparelho real.** O roteiro está em `docs/accu-chek.md`.

### Privacidade

- O ESLint proíbe storage, cookies e qualquer API de rede.
- A CSP do build tem `connect-src 'none'`, e o bundle não contém nenhum `fetch`.
- A permissão USB é revogada ao fim de cada leitura.
- Um teste de interface confirma que nada é gravado em storage nem em cookie.
