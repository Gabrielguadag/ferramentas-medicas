# Pesquisa: canetas de AR GLP-1 e GIP/GLP-1 e dose por cliques (26/11/2026)

Pergunta: em quais canetas vendidas no Brasil a dose por contagem de cliques é possível, e quantos
cliques correspondem a cada dose em cada apresentação?

A contagem de cliques é prática consolidada fora de bula. É usada principalmente quando falta a
apresentação menor; em 11/2026, por exemplo, faltavam Semavy e Ozivy 0,25/0,5 mg.

Notas brutas, com URLs e trechos literais: `research_notes/canetas-glp1/`.

- `cliques-semaglutida-liraglutida.md` e `cliques-tirzepatida-combinacoes.md` trazem os cliques.
- `novo-nordisk.md`, `lilly-e-outros.md` e `clinico-regulatorio.md` trazem bulas, posições
  oficiais e esquemas de início.

Legenda:

- **[Bula]:** trecho conferido por mim no PDF oficial.
- **[Artigo]:** artigo revisado por pares.
- **[Calc.]:** conta minha, com a premissa explícita.
- **[Relato]:** material clínico não oficial, sem método descrito.

## Resumo

| Medicamento e caneta                                                                        | Contagem de cliques                | Observação                                                                                                              |
| ------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Semaglutida 1,34 mg/mL, 3 mL, marca 1 mg (Ozempic 1 mg, Extensior, Ozivy 1 mg, Semavy 1 mg) | **Possível**                       | É o uso principal: 0,25 e 0,5 mg a partir da caneta de 1 mg.                                                            |
| Semaglutida 1,34 mg/mL, 1,5 mL, marcas 0,25 e 0,5 mg (Ozempic, Semavy)                      | Possível, mas raramente necessária | As doses usuais já estão marcadas.                                                                                      |
| Wegovy / Poviztra (5 canetas de dose fixa, 4 doses cada)                                    | Não confirmada                     | O seletor gira até parar na dose da caneta. Não há fonte sobre parar antes e injetar com exatidão.                      |
| Liraglutida 6 mg/mL (Victoza, Saxenda, Olire)                                               | Possível, mas raramente necessária | Marcas de 0,6 mg em 0,6 mg; 10 cliques entre marcas (carta de 2011).                                                    |
| Xultophy, Soliqua                                                                           | **Não precisa**                    | O contador já mostra unidades de 1 em 1. A bula dá o GLP-1 por unidade.                                                 |
| Mounjaro, dose única (Brasil)                                                               | Não                                | Sem seletor. Só aspirando para frasco, o que é complexo e arriscado; fora do escopo.                                    |
| Mounjaro KwikPen (4 doses de 0,6 mL)                                                        | Fora por ora                       | Registrado em 03/2026, mas sem venda confirmada no Brasil. Cliques por dose sem medição (cerca de 60, evidência fraca). |
| Trulicity                                                                                   | Não                                | Caneta de dose única.                                                                                                   |

## Semaglutida 1,34 mg/mL: quantos cliques

**Não há medição publicada do volume por clique em nenhuma caneta comercial de semaglutida.** O
fabricante diz que não avaliou a dose por cliques e não informa o volume por clique (informação
médica da Novo Nordisk, 2024 [Bula]). Os números disponíveis vêm de três fontes:

- **72 cliques do 0 até 1 mg.** Komé et al., Diabetes Care 2025;48:e25: "Each semaglutide-MDP
  device delivers approximately 72 unnumbered 'clicks'" [Artigo]. Os materiais clínicos que
  circulam dizem o mesmo [Relato]. Não descrevem método de contagem.
- **74 cliques.** Whitley et al., Clin Diabetes 2023;41:467, Tabela 3. Vale para as três canetas
  americanas, cuja dose cheia tem 0,75 mL em todas. Os autores avisam: "doses not confirmed by the
  manufacturer but rather mathematically calculated by the authors" [Artigo, conferido no texto
  integral].
- **75 cliques.** É a conta de 0,746 mL a 0,01 mL por clique [Calc.]. A premissa de 0,01 mL por
  clique vem dos protocolos de ensaio da Novo Nordisk (STEP 3, NCT03611582: "3.2 mg/mL | 2.4 mg |
  0.75 mL | 75"). Esses protocolos usam uma caneta de ensaio com contador em valores, não a caneta
  comercial.

Conta proporcional: cliques = dose ÷ dose da marca × cliques até a marca.

| Dose desejada (caneta de 1 mg) | Se 72 cliques até 1 mg | Se 75 cliques até 1 mg |
| -----------------------------: | ---------------------: | ---------------------: |
|                        0,25 mg |                     18 |             18,75 (19) |
|                         0,5 mg |                     36 |        37,5 (37 ou 38) |
|                        0,75 mg |                     54 |             56,25 (56) |

A diferença entre as hipóteses é de cerca de 4%, ou 1 clique nas doses de 0,25 e 0,5 mg.

**A contagem não se transfere entre marcas.** Um material canadense mostra 72 cliques por mg na
caneta da Novo e 24 na da Dr. Reddy's, com a mesma concentração [Relato]. Para Ozivy e Semavy, não
há fonte sobre o dispositivo nem sobre o passo do clique. A única base segura é contar os cliques
até a marca de dose na própria caneta e aplicar a conta proporcional.

### Quantas doses a caneta rende

O limite costuma ser a validade depois de aberta, não o conteúdo:

| Caneta de 4 mg / 3 mL | Validade em uso [Bula] |        Doses de 0,25 mg |        Doses de 0,5 mg |
| --------------------- | ---------------------- | ----------------------: | ---------------------: |
| Ozempic 1 mg (Novo)   | 6 semanas              | 6 (o conteúdo daria 16) | 6 (o conteúdo daria 8) |
| Semavy 1 mg (Hypera)  | 6 semanas              |                       6 |                      6 |
| Ozivy 1 mg (EMS)      | 8 semanas (56 dias)    |                       8 |                      8 |

As doses semanais contam a partir da primeira aplicação; a caneta é descartada ao fim da validade,
mesmo com sobra.

Outras validades depois de aberta:

- Wegovy: 6 semanas;
- Victoza e Saxenda: 1 mês;
- Xultophy: 21 dias.

### Cuidados descritos nas fontes

- O seletor "clica de modo diferente quando é girado para frente, para trás ou quando passa o
  número de 1 mg" (bula Ozempic 1 mg [Bula]). Conte só girando para frente. Se passar, volte ao 0
  e conte de novo; isto é inferência minha, para não somar cliques de ida e volta.
- Quando resta menos do que a dose selecionada, o contador para antes. Com a contagem, o paciente
  pode não perceber isso. Por isso, a conta de doses por caneta deve ficar abaixo do conteúdo
  nominal.
- O teste de fluxo da caneta nova é feito uma vez, antes da primeira dose, e não entra na contagem.
- Whitley 2023 aponta "high potential for confusion and dosing errors" [Artigo]. Os erros mais
  citados são trocar a caneta (concentrações diferentes) e contar errado.

## Liraglutida 6 mg/mL

- King e Wolfe (J Diabetes Sci Technol 2011;5:1623) testaram 6 canetas Victoza novas.
  - Contaram 10 cliques entre as marcas, que vão de 0,6 em 0,6 mg, ou seja, 0,06 mg por clique.
  - 5 cliques entregaram meia dose (0,3 mg) com precisão.
  - É uma carta, e só li o resumo; o texto integral não abriu.
- Na prática, raramente há necessidade: Saxenda e Olire marcam de 0,6 a 3,0 mg, e Victoza marca
  0,6, 1,2 e 1,8 mg.

## Combinações com insulina: já são em unidades

- **Xultophy:** "One dose step contains 1 unit of insulin degludec and 0.036 mg of liraglutide"
  (SmPC EMA). A dose máxima de 50 U equivale a 1,8 mg de liraglutida.
- **Soliqua:** "one dose step always contains one unit of insulin". Cada passo tem 0,5 mcg de
  lixisenatida na caneta 10-40 e 0,33 mcg na 30-60 (SmPC EMA).
- Nos dois, o contador mostra cada unidade e não é preciso contar cliques. A aba pode converter
  unidades em GLP-1.

## Wegovy / Poviztra

As cinco canetas têm concentrações diferentes:

- 0,25 mg: 0,68 mg/mL;
- 0,5 mg e 1 mg: 1,34 mg/mL;
- 1,7 mg: 2,27 mg/mL;
- 2,4 mg: 3,2 mg/mL.

A bula diz "Gire o seletor de dose até o contador de dose parar e mostrar a dose" [Bula]. Pela
premissa de 0,01 mL por clique, a dose cheia de cada caneta teria 37 cliques (as de 1,5 mL) ou 75
(as de 3 mL) [Calc.]. Não achei fonte que confirme ser possível parar antes do batente e injetar
uma dose parcial com exatidão. **Recomendo deixar o Wegovy fora da contagem** até conferir numa
caneta física.

## Contexto oficial (uma vez, para registro)

- Bulas:
  - Ozempic, Saxenda, Xultophy, Semavy e Ozivy dizem "Não conte os cliques" [Bula].
  - Victoza diz "Você não deve usar estes cliques para selecionar sua dose" [Bula].
  - A bula profissional atual do Ozempic (v.03) tirou a frase, mas manteve "Somente doses de 0,25 mg
    ou 0,5 mg devem ser selecionadas".
- Nenhuma sociedade brasileira (SBD, SBEM, ABESO, CFF) se posicionou sobre cliques. O
  posicionamento conjunto de 06/2026 trata de manipulados.
- ADEA (Austrália, 2024) e ISMP (2025) não recomendam a técnica.
- Revisão em Minerva Endocrinol (2026): "mostly anecdotal".
- Pesquisa da indústria (EMS): 69% de 237 médicos dizem prescrever "com ajuste por cliques".

## Proposta para a aba

1. **Calculadora de cliques**, só para as canetas de semaglutida com seletor:
   - o médico escolhe a caneta e a dose desejada;
   - a tela mostra os cliques (conta proporcional), quantas doses a caneta rende pela validade e
     quantas canetas serão necessárias até o próximo aumento.
2. **Valor de referência por marca:** cliques do 0 até a marca da caneta. Para Ozivy e Semavy, a
   tela pede para conferir contando na caneta, porque o dispositivo pode ser outro.
3. **Combinações com insulina:** conversão de unidades em GLP-1 (Xultophy e Soliqua), sem cliques.
4. **Plano de início e escalonamento** pela bula (tabela em `research_notes/canetas-glp1/
clinico-regulatorio.md`), com a caneta e o número de cliques de cada etapa.
5. **Fora:** Mounjaro (as duas canetas), Trulicity e Wegovy para dose parcial.

## Decisões pendentes

1. **Cliques até 1 mg na caneta de 1 mg (Ozempic/Extensior):** 72, que é o que se conta na
   prática segundo Komé 2025, ou 74/75, que é o calculado? Se você conta na sua prática, o seu
   número vale mais que qualquer fonte encontrada.
2. **Ozivy e Semavy:** se tiver as canetas, conte do 0 até a marca. Elas podem não usar o mesmo
   mecanismo da Novo.
3. **Escopo:** só DM2 ou também obesidade? Ozempic, Ozivy e Semavy são para DM2; Wegovy e Saxenda
   são para obesidade.
4. **Nome da aba.** Sugestão: "AR GLP-1 e GIP/GLP-1".

## Limites

- Nenhum estudo gravimétrico de cliques em semaglutida ou tirzepatida foi encontrado. A precisão
  por clique é desconhecida.
- Os textos integrais de King e Wolfe, Kroon, Komé 2025 (a figura com a tabela de cliques) e
  Lodrigues 2026 (Obesity, sobre o KwikPen) não foram lidos; só resumos e citações.
- O dispositivo dos similares de 2026 (Ozivy, Semavy, Owozy, Seemasun, Zempneo, Orsema, Loryvia,
  genéricos) não foi identificado.
- Não foi encontrada nota pública de 2026 sobre a falta de Ozivy e Semavy 0,25/0,5 mg.
