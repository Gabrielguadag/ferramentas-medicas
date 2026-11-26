# Pesquisa: canetas de AR GLP-1 e GIP/GLP-1 e a dose por "cliques" (26/11/2026)

Pergunta: para uma aba que ajude a iniciar essas medicações, dá para calcular, por apresentação e
fabricante, a dose em cliques da caneta? Quais medicamentos permitem e quais não?

Notas brutas, com URLs e trechos literais: `research_notes/canetas-glp1/` (`novo-nordisk.md`,
`lilly-e-outros.md`, `clinico-regulatorio.md`).

## Conclusão

**Nenhuma bula ou instrução de uso oficial permite dose por contagem de cliques**, e nenhuma informa
quantos cliques há por dose ou que volume cada clique libera. Isso vale para todos os produtos
encontrados no Brasil: Novo Nordisk, Lilly, Sanofi e os similares de 2026 (EMS, Hypera).

- Nas canetas de seletor (Ozempic, Saxenda, Victoza, Xultophy, Ozivy, Semavy, Olire), a bula
  manda **não contar cliques** e selecionar só as doses marcadas no contador.
- Nas canetas de dose fixa ou única (Wegovy, Mounjaro, Trulicity), o seletor só para na dose da
  caneta; não há dose intermediária para selecionar.
- O fabricante diz que não testou a dose por cliques e por isso não divulga o volume por clique.
- Não há estudo que valide a técnica para semaglutida ou tirzepatida. O único dado de precisão é
  uma carta de 2011 com seis canetas de Victoza.
- As tabelas de cliques que circulam são cálculos de terceiros. Em geral foram feitas para a
  concentração americana, diferente da caneta vendida aqui.

Uma calculadora de cliques seria, portanto, orientação fora da bula e sem fonte oficial. Isso
contraria a regra do produto (só fonte oficial; guia geral, sem polêmica nem exceção) e o
invariante 5 do `CLAUDE.md`. **Recomendação: a aba não calcula cliques.** O que ela pode fazer
dentro da regra está em "Proposta" abaixo.

## Produtos e o que a bula diz

Legenda da coluna "Conferido":

- **Eu:** li o trecho no PDF oficial.
- **Ag:** só o agente de pesquisa leu.
- **Imp:** só há notícia de imprensa.

### Canetas com seletor de dose: a bula manda não contar cliques

| Produto (fabricante)                  | Princípio, concentração                          | Doses que o seletor marca | Trecho da bula                                                                                                                                                     | Conferido         |
| ------------------------------------- | ------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| Ozempic 0,25/0,5 mg (Novo)            | semaglutida 1,34 mg/mL, 1,5 mL (2 mg)            | 0,25 e 0,5 mg             | "Somente doses de 0,25 mg ou 0,5 mg devem ser selecionadas com o seletor de dose"; bula do paciente: "Não conte os cliques do sistema de aplicação."               | Eu                |
| Ozempic 1 mg (Novo)                   | 1,34 mg/mL, 3 mL (4 mg), 4 doses                 | 1 mg                      | "O seletor de dose clica de modo diferente quando é girado para frente, para trás ou quando passa o número de 1 mg. Não conte os cliques do sistema de aplicação." | Eu                |
| Extensior (Novo, 2ª marca do Ozempic) | igual ao Ozempic                                 | igual                     | sem "não conte os cliques", mas só as doses marcadas                                                                                                               | Ag                |
| Victoza (Novo)                        | liraglutida 6 mg/mL, 3 mL                        | 0,6; 1,2; 1,8 mg          | "Não tente selecionar doses diferentes de 0,6 mg, 1,2 mg ou 1,8 mg. [...] Você não deve usar estes cliques para selecionar sua dose."                              | Eu                |
| Saxenda (Novo)                        | liraglutida 6 mg/mL, 3 mL                        | 0,6 a 3,0 mg              | "Não conte os cliques do sistema de aplicação. Não utilize a escala do sistema de aplicação."                                                                      | Eu                |
| Xultophy (Novo)                       | degludeca 100 U/mL + liraglutida 3,6 mg/mL       | 1 a 50 unidades           | "Não conte os cliques do sistema de aplicação."                                                                                                                    | Eu                |
| Semavy (Hypera)                       | semaglutida 1,34 mg/mL, 1,5 e 3 mL               | 0,25/0,5 mg; 1 mg         | "Não conte os cliques do sistema de aplicação."                                                                                                                    | Eu                |
| Ozivy 1 mg (EMS)                      | semaglutida 1,34 mg/mL, 3 mL                     | 1 mg                      | "Não conte os cliques da caneta aplicadora para selecionar sua dose. Somente doses de 1 mg devem ser selecionadas"                                                 | Eu                |
| Olire (EMS)                           | liraglutida 6 mg/mL, 3 mL                        | 0,6 a 3,0 mg              | "Não conte os cliques da caneta aplicadora."                                                                                                                       | Ag                |
| Soliqua (Sanofi)                      | glargina 100 U/mL + lixisenatida (10-40 e 30-60) | unidades, de 1 em 1       | dose em unidades de insulina; proporção fixa com a lixisenatida                                                                                                    | Ag (cópia antiga) |

O Ozempic 0,25/0,5 mg tem duas versões de bula. A bula profissional atual (v.03, 2025) não traz
mais a frase "não conte os cliques". A do paciente (v.1, 2021) ainda traz. As duas mantêm "somente
doses de 0,25 mg ou 0,5 mg". O mesmo vale para Extensior e Wegovy, segundo o agente. A mudança não
libera dose intermediária: o motivo não foi encontrado.

### Canetas de dose fixa ou única: não há dose intermediária para selecionar

| Produto (fabricante)     | Apresentação no Brasil                                                                                                                                           | Funcionamento                                                                                                                                                                                                    | Conferido         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Wegovy / Poviztra (Novo) | 5 canetas: 0,25 mg (0,68 mg/mL, 1,5 mL), 0,5 mg (1,34 mg/mL, 1,5 mL), 1 mg (1,34 mg/mL, 3 mL), 1,7 mg (2,27 mg/mL, 3 mL), 2,4 mg (3,2 mg/mL, 3 mL); 4 doses cada | "Gire o seletor de dose até o contador de dose parar e mostrar a dose"; "ainda pode restar solução [...] Qualquer solução que sobrar é insuficiente para uma dose". 7,2 mg = três injeções de 2,4 mg (IMC ≥ 30). | Eu                |
| Mounjaro (Lilly)         | caneta de dose única, 2,5 a 15 mg em 0,5 mL                                                                                                                      | sem seletor; o "clique" marca início e fim da injeção                                                                                                                                                            | Ag                |
| Mounjaro KwikPen (Lilly) | registro noticiado em 03/2026 (4 doses fixas de 0,6 mL)                                                                                                          | Europa e Reino Unido: "Do not use these marks as dose indicators" e "Do not attempt to inject the leftover medicine". Bula brasileira não encontrada.                                                            | Imp/Ag            |
| Trulicity (Lilly)        | dose única 0,75 e 1,5 mg                                                                                                                                         | sem seletor                                                                                                                                                                                                      | Ag (bula de 2019) |

A concentração do Wegovy muda conforme a caneta (0,68 a 3,2 mg/mL). Uma regra de cliques de uma
caneta não serve para outra, e trocar a caneta errada multiplica a dose.

## Posições oficiais e literatura

- **Novo Nordisk (informação médica, 2024):** "Novo Nordisk has not evaluated dosing of OZEMPIC by
  number of clicks [...] dosing of OZEMPIC based on number of clicks is not recommended, as the
  dose administered cannot be guaranteed." E: "we cannot provide the exact dosage and volume of
  OZEMPIC provided with each audible click of the pen." Conferido por mim.
- **FDA, instruções de uso do Ozempic:** "Do not set the dose by counting the number of clicks you
  hear." e "Do not count the pen clicks." Conferido por mim.
- **Lilly:**
  - Canadá: "cannot make any recommendations on splitting the Mounjaro KwikPen to make smaller or
    multiple doses".
  - Alemanha (2025): "Der Pen ist nicht dafür ausgelegt, abweichende Dosen zu verabreichen."
  - Os dois trechos foram lidos só pelo agente.
- **ISMP (2025 e 06/2026):** não há estudos que sustentem o método. A orientação é seguir a
  prescrição "rather than attempting to estimate doses by counting clicks or splitting doses".
  Lido só pelo agente.
- **ANVISA, FDA, EMA, MHRA, SBD e ADA:** nenhum comunicado específico sobre cliques foi encontrado.
  - A ANVISA e a FDA têm alertas sobre semaglutida e tirzepatida manipuladas, com erros de dose de
    5 a 20 vezes.
  - Há uma nota conjunta SBEM/SBD/ABESO (02/2025) contra manipulados.
- **Estudos:**
  - King e Wolfe (J Diabetes Sci Technol 2011;5:1623): carta com 6 canetas de Victoza novas.
    Contaram 10 cliques entre as marcas; 5 cliques deram meia dose.
  - Kroon (mesma edição): ressalvas sobre erro de contagem e uso repetido.
  - Whitley et al. (Clin Diabetes 2023;41:467): cliques "mathematically calculated by the authors
    [...] not confirmed by the manufacturer", com "high potential for confusion and dosing
    errors".
  - Revisão em Minerva Endocrinol (11/2026): prática "mostly anecdotal [...] not supported by
    manufacturers, scientific societies, drug regulatory agencies and official clinical
    guidelines".
- **SBD:** a diretriz lista as doses, mas não fala em doses intermediárias, titulação mais lenta
  que a bula nem cliques.

## Esquemas de início pela bula

Fontes:

- Ozempic, Wegovy, Victoza, Saxenda e Xultophy: lidos pelo agente no PDF oficial do fabricante.
- Mounjaro e Trulicity: cópias web e EMA. Reconferir na bula ANVISA antes de levar para a tela.

| Medicamento         | Início                                           | Escalonamento                            | Máximo                                        | Dose esquecida       |
| ------------------- | ------------------------------------------------ | ---------------------------------------- | --------------------------------------------- | -------------------- |
| Ozempic (DM2)       | 0,25 mg/sem                                      | 0,5 mg após 4 sem; 1 mg após ≥ 4 sem     | 1 mg                                          | até 5 dias           |
| Wegovy (obesidade)  | 0,25 mg/sem                                      | a cada 4 sem: 0,5 → 1 → 1,7 → 2,4 mg     | 2,4 mg (7,2 mg se IMC ≥ 30)                   | até 5 dias           |
| Victoza (DM2)       | 0,6 mg/dia                                       | 1,2 mg após ≥ 1 sem; 1,8 mg após ≥ 1 sem | 1,8 mg                                        | até 12 h             |
| Saxenda (obesidade) | 0,6 mg/dia                                       | +0,6 mg por semana                       | 3,0 mg                                        | até 12 h             |
| Xultophy (DM2)      | 10 U (16 U se vem de AR GLP-1 ou insulina basal) | ±2 U a cada 3 dias                       | 50 U                                          | intervalo mínimo 8 h |
| Mounjaro            | 2,5 mg/sem                                       | 5 mg após 4 sem; +2,5 mg a cada ≥ 4 sem  | 15 mg                                         | até 4 dias           |
| Trulicity           | 0,75 mg/sem                                      | 1,5 mg                                   | 1,5 mg no Brasil (3 e 4,5 mg não encontradas) | até 3 dias           |

O Wegovy prevê adiar o aumento de dose em caso de sintomas gastrointestinais importantes, e
reduzir a dose para reiniciar o escalonamento quando várias doses foram esquecidas. Já é uma via
oficial para "titular mais devagar" sem recorrer a cliques.

## Nome da aba

- **ANVISA:** usa "agonistas do receptor de GLP-1".
- **SBD:** usa "agonistas do receptor do GLP-1 (AR GLP-1)" e separa a tirzepatida como
  "coagonista/agonista duplo GIP/GLP-1".
- "Análogos de GLP-1" e "incretinas" não aparecem como nome formal da classe.

Sugestão: **"AR GLP-1 e GIP/GLP-1"**, com o subtítulo "agonistas do receptor de GLP-1 e agonista
duplo GIP/GLP-1".

## Proposta: o que a aba pode fazer dentro da regra

1. **Plano de início e escalonamento pela bula:** escolher o medicamento e a data de início.
   - A aba mostra cada etapa com data, dose e caneta.
   - Mostra quantas doses cada caneta rende e quantas canetas comprar em cada etapa.
   - Avisa quando a etapa exige trocar de caneta (Wegovy) ou mudar a dose no seletor (Ozempic,
     Saxenda, Victoza).
2. **Como selecionar a dose em cada caneta:** só as marcas do contador. Inclui "não conte os
   cliques" quando a bula diz isso, e o aviso de que a concentração muda entre canetas.
3. **Dose esquecida e quando adiar o aumento**, como está na bula.
4. **Similares e genéricos:** só os que têm bula lida, com a mesma regra da caneta.

## Decisões pendentes

1. Confirma que a aba **não** calcula cliques? É o que as fontes oficiais sustentam. Calcular
   cliques exigiria aceitar fonte não oficial, contra a regra do produto.
2. Escopo: só DM2 (como o resto da área Diabetes) ou também obesidade (Wegovy, Saxenda, Mounjaro)?
3. Incluir as combinações com insulina (Xultophy e Soliqua)? Elas se iniciam em unidades e
   conversam com a seção de insulina.
4. Nome da aba (sugestão acima).

## Limites

- O bulário da ANVISA não foi acessado diretamente. As bulas vieram do site do fabricante ou de
  PDFs de farmácias.
- Faltam bulas vigentes do Mounjaro (inclusive KwikPen), Trulicity e Soliqua, e dos genéricos de
  2026 (Lirux, genérico EMS, Semaclique e outros).
- Não foi encontrada posição da ANVISA, EMA, MHRA, SBD ou ADA específica sobre cliques. A ausência
  não muda a conclusão: as bulas já proíbem.
- O motivo de a frase "não conte os cliques" ter saído da bula profissional atual do Ozempic não
  foi encontrado.
