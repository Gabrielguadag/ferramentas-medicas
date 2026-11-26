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

| Medicamento e caneta                                                                        | Contagem de cliques                | Observação                                                                                                                       |
| ------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Semaglutida 1,34 mg/mL, 3 mL, marca 1 mg (Ozempic 1 mg, Extensior, Ozivy 1 mg, Semavy 1 mg) | **Possível**                       | É o uso principal: 0,25 e 0,5 mg a partir da caneta de 1 mg.                                                                     |
| Semaglutida 1,34 mg/mL, 1,5 mL, marcas 0,25 e 0,5 mg (Ozempic, Semavy)                      | Possível, mas raramente necessária | As doses usuais já estão marcadas.                                                                                               |
| Wegovy / Poviztra (5 canetas de dose fixa, 4 doses cada)                                    | Possível (relatos)                 | Mesmo mecanismo FlexTouch; dose cheia de 37 cliques (1,5 mL) ou 74-75 (3 mL). A FDA registra que nada impede discar entre doses. |
| Liraglutida 6 mg/mL (Victoza, Saxenda, Olire)                                               | Possível, mas raramente necessária | Marcas de 0,6 mg em 0,6 mg; 10 cliques entre marcas (carta de 2011).                                                             |
| Xultophy, Soliqua                                                                           | **Não precisa**                    | O contador já mostra unidades de 1 em 1. A bula dá o GLP-1 por unidade.                                                          |
| Mounjaro, dose única (Brasil)                                                               | Não                                | Sem seletor. Só aspirando para frasco, o que é complexo e arriscado; fora do escopo.                                             |
| Mounjaro KwikPen (4 doses de 0,6 mL)                                                        | Fora por ora                       | Registrado em 03/2026, mas sem venda confirmada no Brasil. Cliques por dose sem medição (cerca de 60, evidência fraca).          |
| Trulicity                                                                                   | Não                                | Caneta de dose única.                                                                                                            |

## Semaglutida 1,34 mg/mL: quantos cliques

Atualizado em 26/11/2026, depois da contagem física do usuário e do documento da FDA.

### Caneta da Novo Nordisk: documento regulatório da FDA

A revisão de erro de medicação da FDA (DMEPA) no registro do Ozempic traz a contagem de cliques da
caneta da Novo (NDA 209637, "Other Review(s)", 2017, Reference ID 4185013, PDF p. 51; trecho
conferido por mim). A caneta descrita tem 2 mg/1,5 mL e 1,34 mg/mL, a mesma concentração das
canetas brasileiras:

> "Given the length required to dial each dose (19 'clicks' or 12 line markings to reach 0.25
> mg, 37 'clicks' or 11 line markings—23 line markings total from 0—to reach 0.5 mg, and 74
> 'clicks' or 47.5 line markings to reach 1 mg) before the user sees their prescribed dose in the
> 'dose counter' window [...]"

O mesmo documento registra: "there are no design features preventing users from dialing and
injecting between doses".

- Os números batem com 0,01 mL por clique e com os volumes de dose da bula europeia do Ozempic:
  0,19 mL para 0,25 mg, 0,37 mL para 0,5 mg e 0,74 mL para 1 mg.
- Para a caneta brasileira de 1 mg (4 mg/3 mL, 1,34 mg/mL), o volume da dose de 1 mg é o mesmo.
  **Com o mesmo mecanismo, são 74 cliques até 1 mg** [Calc.].
- Whitley 2023 também usa 74 [Artigo].
- O "72" de Komé 2025 e dos materiais canadenses não tem método descrito [Relato].

### Similares (Ozivy, Semavy, Semaclique, genérico EMS)

- **Decisão do usuário (26/11/2026): Ozivy, Semavy e Semaclique usam 74 cliques até 1 mg**, igual
  à caneta da Novo (FDA). Isso substitui a contagem de 72 no Ozivy registrada antes.
- Relatos em vídeo de médicos brasileiros, compilados na calculadora de rodrigonahum.com.br
  (revisão de 22/11/2026). Os vídeos não foram assistidos por mim:
  - Ozivy 1 mg com 19/37/75 (Dr. Mário Toscano Filho, 07/2026);
  - Semavy com 18 para 0,25 e 36 para 0,5 (Dra. Sheyla Alonso, 09/2026);
  - Semavy 1 mg com 74 (Dr. Mateus).
- O passo do clique pode diferir entre fabricantes. No Canadá, a caneta da Dr. Reddy's tem 24
  cliques por mg, contra 72 a 74 da Novo [Relato]. Por isso, cada marca nova precisa de um valor
  próprio, sem herdar o da Novo automaticamente.

Conta proporcional: cliques = dose ÷ dose da marca × cliques até a marca.

| Dose desejada (caneta de 1 mg, 74 cliques até 1 mg: Ozempic, Extensior, Ozivy, Semavy, Semaclique) |                         Cliques |
| -------------------------------------------------------------------------------------------------: | ------------------------------: |
|                                                                                            0,25 mg | 18,5 (FDA: 19 na marca de 0,25) |
|                                                                                             0,5 mg |                              37 |
|                                                                                            0,75 mg |                    55,5 (55-56) |

Na caneta de 1,5 mL da Novo, as marcas de 0,25 e 0,5 ficam em 19 e 37 cliques (FDA).

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

A bula diz "Gire o seletor de dose até o contador de dose parar e mostrar a dose" [Bula]. As
canetas brasileiras têm as mesmas concentrações e volumes da Wegovy FlexTouch europeia (EPAR). A
0,01 mL por clique, que é o passo da caneta da Novo segundo a FDA, a dose cheia fica assim
[Calc.]:

| Caneta               | Volume da dose | Cliques até a dose cheia | Relatos                                                       |
| -------------------- | -------------- | -----------------------: | ------------------------------------------------------------- |
| 0,25 mg (0,68 mg/mL) | 0,37 mL        |                       37 | 37 (Dr. Mário Toscano, vídeo)                                 |
| 0,5 mg (1,34 mg/mL)  | 0,37 mL        |                       37 | 37 (ByWard, Canadá: total de 148 por caneta)                  |
| 1 mg (1,34 mg/mL)    | 0,74 mL        |                       74 | igual ao Ozempic 1 mg (FDA: 74)                               |
| 1,7 mg (2,27 mg/mL)  | 0,75 mL        |                       75 | 75 (BC Diabetes e ByWard, Canadá)                             |
| 2,4 mg (3,2 mg/mL)   | 0,75 mL        |                       75 | 75 (Dr. Mário Toscano para Poviztra 2,4; BC Diabetes; ByWard) |

- Doses parciais na caneta de 2,4 mg, a 0,032 mg por clique: 0,25 = 8; 0,5 = 16; 1 = 31; 1,7 = 53
  [Calc.]. Coincidem com BC Diabetes e com o relato de 32 cliques para 1 mg.
- A FDA registra, para a caneta da Novo, que nada impede discar e injetar entre as doses. Os
  relatos brasileiros e canadenses fazem a contagem nas canetas de Wegovy.
- O documento de Rodrigo Nahum usa 74 para as canetas de 1,7 e 2,4 mg. O volume da dose (0,75 mL)
  e os relatos dão 75. Decisão do usuário (26/11/2026): 75.

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
2. **Valor de referência por caneta** (cliques do 0 até a dose marcada ou cheia), por decisão do
   usuário em 26/11/2026:
   - 3 mL a 1,34 mg/mL (Ozempic, Extensior, Ozivy, Semavy, Semaclique; Wegovy 1 mg): 74 até 1 mg;
   - 1,5 mL a 1,34 mg/mL: 19 até 0,25 e 37 até 0,5 (FDA);
   - Wegovy 0,25 mg (0,68 mg/mL): 37 até 0,25;
   - Wegovy 1,7 e 2,4 mg: 75 até a dose cheia.
3. **Combinações com insulina:** conversão de unidades em GLP-1 (Xultophy e Soliqua), sem cliques.
4. **Plano de início e escalonamento** pela bula (tabela em `research_notes/canetas-glp1/
clinico-regulatorio.md`), com a caneta e o número de cliques de cada etapa.
5. **Fora:** Mounjaro (as duas canetas) e Trulicity.

## Decisões pendentes

Decididas em 26/11/2026: 74 cliques até 1 mg para Ozivy, Semavy e Semaclique; 75 até a dose cheia
para Wegovy 1,7 e 2,4 mg.

1. **Genérico de semaglutida EMS e demais similares** (Owozy, Seemasun, Zempneo, Orsema,
   Loryvia): usar 74 também?
2. **Escopo:** só DM2 ou também obesidade? Ozempic, Ozivy e Semavy são para DM2; Wegovy e Saxenda
   são para obesidade.
3. **Nome da aba.** Sugestão: "AR GLP-1 e GIP/GLP-1".

## Limites

- Nenhum estudo gravimétrico de cliques em semaglutida ou tirzepatida foi encontrado. A precisão
  por clique é desconhecida.
- Os textos integrais de King e Wolfe, Kroon, Komé 2025 (a figura com a tabela de cliques) e
  Lodrigues 2026 (Obesity, sobre o KwikPen) não foram lidos; só resumos e citações.
- O dispositivo dos similares de 2026 (Ozivy, Semavy, Owozy, Seemasun, Zempneo, Orsema, Loryvia,
  genéricos) não foi identificado.
- Não foi encontrada nota pública de 2026 sobre a falta de Ozivy e Semavy 0,25/0,5 mg.
