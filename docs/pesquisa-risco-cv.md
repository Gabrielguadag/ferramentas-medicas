# Estratificação de risco cardiovascular no DM2: o que usar

Pesquisa de 2026-11-24. O objetivo é decidir o que a seção "Estratificação DM2" deve calcular.

Legenda: **[L]** citação literal, **[C]** confirmado em fonte primária lida, **[P]** inferência,
**[?]** não verificado.

## Resumo

1. **A SBC 2025 adotou o PREVENT, mas não para o DM2.** O texto diz [L] "O escore PREVENT é a
   ferramenta preferencial para estratificação de risco em adultos sem DCVA conhecida". Para quem tem
   DM2, a mesma diretriz manda usar a estratificação **EAR/EMAR** (seção 4.6, Tab. 4.5 a 4.8,
   "adaptado de Izar et al."). É essa a lógica que a tela já usa, com algumas diferenças.
2. **O PCDT DM2 2026**, que vale no SUS, diz que todo DM2 já é alto risco. A conduta não depende de
   calculadora. Para a faixa de 40 a 74 anos, cita a HEARTS/OPAS.
3. **Nenhuma das duas diretrizes recomenda o PREVENT para o DM2.** Ele não tem validação nem
   calibração brasileira (a própria SBC reconhece que não há escore derivado da população
   brasileira). No DM2 pode rebaixar quem a SBC e o PCDT já classificam como alto risco.

## Diretrizes

### SBC 2025: Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose [C]

Rached et al., Arq Bras Cardiol 2025;122(9):e20250640.
[PDF](https://abccardiol.org/wp-content/uploads/articles_xml/0066-782X-abc-122-09-e20250640/0066-782X-abc-122-09-e20250640.x66747.pdf).

- **Sem DM2:** PREVENT, risco de ASCVD em 10 anos, de 30 a 79 anos. As faixas são baixo (< 5%),
  intermediário (5% a < 20%) e alto (≥ 20%).
- **Com DM2 (Tab. 4.5):**

| Categoria     | Critério                                                                         |
| ------------- | -------------------------------------------------------------------------------- |
| Intermediário | Homem < 50 ou mulher < 56 anos, sem EAR nem EMAR. **Não existe "baixo" no DM2.** |
| Alto          | Homem ≥ 50 ou mulher ≥ 56 anos, ou 1 a 2 EAR, sem EMAR                           |
| Muito alto    | Algum EMAR, ou 3 ou mais EAR                                                     |
| Extremo       | Múltiplos eventos, ou um evento mais 2 ou mais condições de alto risco           |

- **EAR (estratificadores de alto risco):**
  - DM2 há mais de 10 anos, história familiar de DAC precoce, síndrome metabólica (IDF), HAS e
    tabagismo ativo;
  - doença renal de risco alto (Tab. 4.7);
  - CAC de 10 a 300, placa carotídea ou coronária com estenose < 50%, aneurisma de aorta abdominal;
  - neuropatia autonômica incipiente e retinopatia não proliferativa leve.
- **EMAR (estratificadores de muito alto risco):**
  - DCV manifesta;
  - estenose > 50%;
  - EMAR renal;
  - colesterol total > 310 ou LDL > 190 mg/dL;
  - neuropatia autonômica instalada;
  - retinopatia moderada, grave ou proliferativa.
- **Grade renal (Tab. 4.7):** albuminúria moderada ou TFG < 60 dão risco alto. Macroalbuminúria dá
  muito alto.
- **Metas (Tab. 5.1):**

| Categoria     | LDL-c | Não-HDL-c | Redução mínima |
| ------------- | ----- | --------- | -------------- |
| Baixo         | < 115 | < 145     | ≥ 30%          |
| Intermediário | < 100 | < 130     | ≥ 30%          |
| Alto          | < 70  | < 100     | ≥ 50%          |
| Muito alto    | < 50  | < 80      | ≥ 50%          |
| Extremo       | < 40  | < 70      | ≥ 50%          |

### PCDT DM2 2026 [C]

[PDF](https://www.gov.br/conitec/pt-br/midias/protocolos/2026/pcdt-diabete-melito-tipo-2/@@display-file/file).

- [L] "Pacientes com DM2 já são classificados como alto risco e, caso também apresentem algumas
  comorbidades cardiovasculares, como doença arterial coronariana, acidente vascular cerebral ou
  doença arterial periférica, passam a ser classificados como muito alto risco."
- [L] Para 40 a 74 anos, "é recomendada a calculadora HEARTS/OPAS/OMS", que "demonstrou melhor
  calibração para a população brasileira". Abaixo de 40 e acima de 74 anos, a avaliação é
  individualizada. Com 39 anos ou menos, nefropatia ou retinopatia classificam como alto risco.
- [L] "a estratificação de risco cardiovascular não altera a conduta terapêutica".

### SBD

- [?] O capítulo de risco CV da diretriz da SBD não foi lido. A SBC 2025 usa a mesma origem
  ("Izar et al."), então provavelmente a SBD também usa EAR/EMAR [P].

## PREVENT (Khan et al., Circulation 2024;149:430–449) [C]

- **Para quem:** adultos de 30 a 79 anos **sem** DCV, com modelos separados por sexo.
- **Desfechos:** DCV total, ASCVD e insuficiência cardíaca, em 10 e 30 anos.
- **Modelo base:** idade, sexo, PAS, colesterol total, HDL, anti-hipertensivo, estatina, diabetes,
  tabagismo e TFGe (CKD-EPI 2021). O IMC entra só nos modelos de IC.
- **Modelos ampliados (opcionais):** HbA1c, relação albumina/creatinina urinária (RAC) e SDI. O
  SDI é um índice por CEP dos EUA e não se aplica aqui. O ganho de discriminação é pequeno.
- **Coeficientes:** estão no suplemento (Tabela S12), que não foi possível baixar [?].
  - Houve errata do coeficiente de HbA1c em outubro de 2026, que afeta os modelos com HbA1c.
  - O pacote R `preventr` (licença MIT; versão informada 0.12.2, com a errata) tem testes e
    serviria de referência [?: falta confirmar que foi conferido contra a calculadora da AHA].
- **Calculadora oficial:** https://professional.heart.org/en/guidelines-and-statements/prevent-calculator
- **ACC/AHA 2026** usa outras faixas de ASCVD em 10 anos: < 3%, 3% a < 5%, 5% a < 10% e ≥ 10%.
  Elas diferem das faixas da SBC.
- **Validação no Brasil:** nenhuma encontrada. O ELSA-Brasil avaliou outros escores, não o PREVENT.

## HEARTS/OPAS

- [C] Usa as tabelas da OMS de 2019 (regiões do GBD), com ou sem colesterol, e estima infarto, AVC ou
  morte CV em 10 anos. Calculadora em
  https://www.paho.org/pt/hearts-nas-americas/calculadora-risco-cardiovascular.
- [?] As variáveis exatas, os cortes e o tratamento do diabetes não foram verificados. Sem a tabela
  oficial, não dá para recriar a calculadora.

## CKD-EPI 2021, sem raça [C, Inker et al., NEJM 2021]

TFGe = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1,200 × 0,9938^idade × 1,012 (se mulher)

- κ = 0,7 na mulher e 0,9 no homem.
- α = −0,241 na mulher e −0,302 no homem.
- Creatinina em mg/dL.

## Comparação com a tela atual

A tela usa EAR/EMAR, como a SBC 2025 no DM2, mas há divergências:

- usa o rótulo "baixo/intermediário"; no DM2 deveria ser **intermediário**;
- falta a categoria **extremo**;
- as listas não batem com as da SBC:
  - "ITB < 0,9" e "insuficiência cardíaca" não aparecem nas listas da SBC lidas;
  - "LDL > 190" é EMAR na SBC, mas na tela conta como fator de risco;
  - "estenose < 50%" é EAR, e "estenose > 50%" é EMAR;
- a grade renal está simplificada (albuminúria entra sem graduação);
- falta a meta de LDL-c e não-HDL-c da categoria.

## Opções para a tela

| Opção                                                                    | Base                                | Prós                                                                                                             | Contras                                                                                                                             |
| ------------------------------------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **A. EAR/EMAR completo da SBC 2025 + metas de LDL, com o aviso do PCDT** | SBC 2025 (Tab. 4.5–4.8, 5.1) e PCDT | É o método que a diretriz brasileira manda para o DM2. A meta de LDL vem da categoria, o que é útil na consulta. | Depende de exames pouco disponíveis na APS (CAC, carótida). Isso se resolve com "não avaliado".                                     |
| B. A + PREVENT como informação complementar                              | A + Khan 2024                       | Dá um número para conversar com o paciente                                                                       | Não é recomendado para DM2 e não tem calibração brasileira. Os coeficientes ainda precisam ser obtidos e conferidos (com a errata). |
| C. Trocar por PREVENT                                                    | Khan 2024                           | Simples                                                                                                          | Contraria a SBC e o PCDT no DM2 e pode subestimar o risco                                                                           |
