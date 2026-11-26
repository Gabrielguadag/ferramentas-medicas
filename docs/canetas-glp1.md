# Canetas GLP-1: semaglutida por cliques, rendimento e esquema da bula

Área **Canetas GLP-1** (`src/canetas/`). Escopo definido pelo usuário em 26/11/2026:

- **Entram:**
  - semaglutida para DM2: Ozempic e Extensior (Novo Nordisk), Ozivy (EMS), Semavy (Hypera) e
    Semaclique (Germed);
  - semaglutida para controle de peso: Wegovy e Poviztra (Novo Nordisk).
- **Ficam fora:**
  - liraglutida;
  - tirzepatida (a caneta de dose única só permite fracionar aspirando para frasco);
  - dulaglutida;
  - os demais similares de semaglutida;
  - as canetas de 1,5 mL dos similares;
  - a dose de 7,2 mg do Wegovy, que a bula chama de "opção excepcional".

A pesquisa que embasa estas regras está em [pesquisa-canetas-glp1.md](pesquisa-canetas-glp1.md).

## Cliques de referência

São os cliques do 0 até a dose marcada (ou cheia) de cada caneta.

| Caneta                          | mg/mL e volume   | Referência          | Base                                                  |
| ------------------------------- | ---------------- | ------------------- | ----------------------------------------------------- |
| Ozempic e Extensior 0,25/0,5 mg | 1,34; 1,5 mL     | 0,25 = 19; 0,5 = 37 | FDA, DMEPA 2017 (NDA 209637, PDF p. 51)               |
| Ozempic e Extensior 1 mg        | 1,34; 3 mL       | 1 mg = 74           | FDA, DMEPA 2017                                       |
| Ozivy, Semavy e Semaclique 1 mg | 1,34; 3 mL       | 1 mg = 74           | decisão do usuário: mesmo valor da caneta da Novo     |
| Wegovy e Poviztra 0,25 mg       | 0,68; 1,5 mL     | 0,25 = 37           | dose de 0,37 mL a 0,01 mL por clique; relato em vídeo |
| Wegovy e Poviztra 0,5 mg        | 1,34; 1,5 mL     | 0,5 = 37            | FDA (mesma concentração)                              |
| Wegovy e Poviztra 1 mg          | 1,34; 3 mL       | 1 mg = 74           | FDA (mesma concentração e dose do Ozempic 1 mg)       |
| Wegovy e Poviztra 1,7 e 2,4 mg  | 2,27 e 3,2; 3 mL | dose cheia = 75     | dose de 0,75 mL; decisão do usuário                   |

Trecho da FDA: "19 'clicks' [...] to reach 0.25 mg, 37 'clicks' [...] to reach 0.5 mg, and 74
'clicks' [...] to reach 1 mg". O mesmo documento registra que "there are no design features
preventing users from dialing and injecting between doses".

## Regras de cálculo (`canetas.ts`)

- **Dose marcada:** se a dose é uma marca do contador, vale a marca, e a tela manda girar até o
  contador mostrar a dose.
- **Dose fora da marca:** conta proporcional à maior marca da caneta, com cliques = dose ÷ dose da
  marca × cliques da marca.
  - Se a parte fracionária fica entre 0,4 e 0,6, a tela mostra os dois cliques vizinhos e a dose
    de cada um. Exemplo: 0,25 mg na caneta de 1 mg dá 18,5, e a tela mostra 18 (0,243 mg) ou 19
    (0,257 mg).
  - Fora dessa faixa, mostra o inteiro mais próximo.
- **Doses recusadas:** zero, acima da marca máxima da caneta (o seletor para nela) e menor que 1
  clique.
- **Rendimento:** o menor entre dois limites.
  - Pelo conteúdo nominal: cliques nominais ÷ cliques por aplicação. Os cliques nominais são mg
    totais ÷ dose de referência × cliques de referência, sem o excesso reservado ao teste de fluxo.
  - Pela validade depois de aberta: semanas inteiras.
    - Ozempic, Extensior, Wegovy, Poviztra e Semavy: 6 semanas;
    - Ozivy e Semaclique: 8 semanas (56 dias).
  - Com dois cliques possíveis, conta o maior.
- **Orientações na tela:**
  - teste de fluxo antes, fora da contagem;
  - girar só para frente desde o 0 e, se passar, voltar ao 0;
  - se a caneta tiver menos que a dose, o seletor para antes.

## Aviso fixo e agulhas

- **Aviso fixo no topo da área:**
  - a contagem de cliques é uso fora de bula (off-label), e as bulas orientam selecionar só as
    doses marcadas;
  - o cálculo usa informações obtidas de documento regulatório da FDA e de relatos clínicos;
  - ao fracionar, é preciso comprar agulhas. O aviso mostra o tipo de agulha da marca escolhida.
- **Agulhas na caixa e tipo, pela bula:**

| Marca              | Agulhas na caixa                    | Tipo (bula)                                                    |
| ------------------ | ----------------------------------- | -------------------------------------------------------------- |
| Ozempic, Extensior | 6 na caneta de 1,5 mL; 4 na de 3 mL | NovoFine® ou NovoFine® Plus; até 8 mm                          |
| Wegovy, Poviztra   | 4                                   | NovoFine® Plus (na caixa) ou NovoFine®; até 8 mm               |
| Ozivy, Semaclique  | 4                                   | Ultra-Fine 0,23 mm (32G) × 4 mm 5B UTW; a bula aceita até 8 mm |
| Semavy             | 4                                   | BD Ultra-Fine™; a bula aceita até 8 mm                         |

- **Agulhas a comprar:** aplicações por caneta − agulhas da caixa, com uma agulha nova a cada
  aplicação ("Sempre use uma agulha nova em cada injeção", bula Wegovy). O número aparece no
  resultado, na tabela de cliques e no esquema.

## Esquema da bula (módulo "Início e aumento")

| Linha | Etapas                                                                                                                                | Bula                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| DM2   | 0,25 mg nas semanas 1-4 (não é manutenção); 0,5 mg nas 5-8; 1 mg da 9 em diante se precisar, com doses acima de 1 mg não recomendadas | Ozempic, item 8 (igual em Extensior, Ozivy, Semavy e Semaclique) |
| Peso  | 0,25 / 0,5 / 1 / 1,7 mg a cada 4 semanas; 2,4 mg de manutenção a partir da semana 17; se não tolerar, 1,7 mg                          | Wegovy, Tabela 16                                                |

- **Dose esquecida:** aplicar se até 5 dias depois; passado isso, pular a dose.
- **Só Wegovy:**
  - com várias doses esquecidas, considerar reduzir a dose e reiniciar o escalonamento;
  - com sintomas gastrointestinais significativos, considerar adiar o aumento.

A tabela mostra a data de início de cada etapa e, para a caneta escolhida, os cliques e as
aplicações por caneta. Quando a etapa passa do máximo da caneta, ela avisa.

## Fontes

- FDA, NDA 209637, Other Review(s), DMEPA, 2017, Reference ID 4185013:
  https://www.accessdata.fda.gov/drugsatfda_docs/nda/2017/209637Orig1s000OtherR.pdf
- Bulas profissionais da Novo Nordisk Brasil (Ozempic, Extensior, Wegovy, Poviztra), em
  novonordisk.com.br.
- Bulas de Ozivy (EMS), Semavy (Hypera) e Semaclique (Germed): validade em uso e posologia.

Uso fora de bula: as bulas orientam selecionar só as doses marcadas no contador. A tela diz isso
uma vez, no detalhe da tabela.
