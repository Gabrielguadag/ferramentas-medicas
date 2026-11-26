# Gestante: consultas, exames e vacinas do pré-natal

Este documento cobre duas partes da área Gestante:

1. **Na idade gestacional:** depois de datada a gestação, o cartão "Pré-natal com Xs Yd" mostra,
   para a data escolhida:
   - a frequência de consultas e a data sugerida da próxima;
   - o que solicitar agora;
   - o que já deveria ter sido feito;
   - o que vem a seguir, com a data em que cada janela abre.
2. **Módulo "Consultas e exames":** referência fixa com o calendário de consultas, os exames por
   trimestre, no parto e com indicação clínica, e as vacinas.

Código:

- `src/gestante/prenatal.ts`: dados e regras, testados em `prenatal.test.ts`.
- `src/gestante/PrenatalView.tsx`: tela.

## Fontes

1. **Ministério da Saúde. Caderneta Brasileira da Gestante (2026, Rede Alyne).** É a fonte
   principal, a lista oficial mais recente.
   - 4.1.2: começar o pré-natal até a 12ª semana.
   - 4.1.4: no mínimo 7 consultas, intercaladas entre médico e enfermeiro, e ao menos 1 consulta
     odontológica. Programação mínima:
     - mensal até 28 semanas;
     - quinzenal da 28ª à 36ª semana;
     - semanal a partir da 36ª semana;
     - após o parto, ao menos 2 consultas: a 1ª na primeira semana após a saída da maternidade e a 2ª em torno de 30 dias após o parto.
   - 4.2.1: exames de rotina para o 1º trimestre ou a 1ª consulta, o 2º trimestre, o 3º
     trimestre e o parto ou pós-parto imediato, mais os exames com indicação clínica.
   - 4.2.2: exames do alto risco.
   - 4.3: vacinas e quando aplicar cada uma.
   - Link: <https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-mulher/publicacoes/caderneta-brasileira-da-gestante.pdf>
2. **Ministério da Saúde/SAPS. Nota metodológica C3: Cuidado na gestação e puerpério.**
   Confirma o que a Caderneta diz sobre:
   - 1ª consulta até a 12ª semana;
   - pelo menos 7 consultas;
   - dTpa a partir da 20ª semana;
   - testes para sífilis, HIV e hepatites B e C no 1º trimestre;
   - testes para sífilis e HIV no 3º trimestre.

O Caderno de Atenção Básica 32 (2012) ficou desatualizado nestes pontos. Ele pedia o mínimo de
6 consultas, pedia o TOTG só com glicemia > 85 mg/dL ou fator de risco, não incluía hepatite C
nem HTLV e não tinha as vacinas de VSR e covid-19. Por isso o módulo segue a Caderneta 2026.

## Protocolo do município

A Caderneta diz que a solicitação "pode seguir protocolos locais". Em 2026-11-25 o usuário
informou como o município dele faz, e isso virou o ajuste `PROTOCOLO_LOCAL` em `prenatal.ts`.
A lista nacional continua no código como `ITENS_MS`.

| Item                                                    | MS (Caderneta 2026)                                                 | No município                                                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| HTLV                                                    | rotina, 1º trimestre, para todas                                    | fica no fim da lista, com a nota "não disponível na rede do município"                                      |
| Eletroforese de hemoglobina                             | rotina, 1º trimestre, para todas                                    | fica no fim da lista, com a mesma nota                                                                      |
| Chagas                                                  | só em casos suspeitos                                               | sai                                                                                                         |
| Malária                                                 | só em região endêmica                                               | sai                                                                                                         |
| Toxoplasmose                                            | 1º trimestre para todas; 2º e 3º se IgG não reagente                | só 1º e 3º trimestre (sai a do 2º)                                                                          |
| Estreptococo do grupo B (cultura, swab vaginal e retal) | não está na lista (o Caderno 32 não recomendava rastreio de rotina) | 3º trimestre, de 35s 0d a 37s 0d (inclusive)                                                                |
| Exames no parto ou pós-parto imediato                   | HIV, sífilis e hepatites B e C (se não feitas)                      | saem: não são usados pela equipe                                                                            |
| Teste rápido de gravidez                                | 1º trimestre                                                        | sai (no pré-natal, já foi feito)                                                                            |
| Ultrassonografia obstétrica                             | uma, idealmente entre 7 e 12 semanas                                | duas: 1º trimestre de 11 a 13 semanas (11s 0d a 13s 6d) e 2º trimestre de 20 a 24 semanas (20s 0d a 24s 6d) |

A tela mostra só a linha "Lista ajustada ao protocolo do município" nos dois cartões; o contraste com o MS fica nesta tabela. No módulo "Consultas e exames", cada trimestre
vem em bloco próprio, um abaixo do outro, com duas colunas: na 1ª os exames para todas e
feitos no município; na 2ª os condicionais (Rh negativo, IgG não reagente) e os sem oferta
local. Na 1ª consulta, a ultrassonografia de 1º
trimestre segue a sua janela e não entra em "agora" fora dela.

## Regras implementadas

### Janelas, em dias de IG e inclusivas

| Período ou item                      | Janela                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| 1º trimestre ou 1ª consulta          | 0 a 13s 6d                                                                              |
| 2º trimestre                         | 14s 0d a 27s 6d                                                                         |
| 3º trimestre                         | 28s 0d até o parto                                                                      |
| Ultrassonografia obstétrica          | no município, 11s 0d a 13s 6d e 20s 0d a 24s 6d (MS: "idealmente entre 7 e 12 semanas") |
| TOTG 75 g                            | 24s 0d a 28s 6d ("preferencialmente entre 24 e 28 semanas")                             |
| dTpa                                 | a partir de 20s 0d                                                                      |
| VSR                                  | a partir de 28s 0d                                                                      |
| Influenza, hepatite B, dT e covid-19 | qualquer fase, com a condição de cada uma                                               |

Os trimestres seguem os mesmos limites do módulo de idade gestacional (ACOG CO 700).

### Situação de cada item numa IG

- **Solicitar agora:** a janela está aberta.
- **Já deveria ter sido feito:** a janela fechou. A tela pede para conferir o resultado e, se o
  exame não foi feito, pedir agora.
- **Próximos:** a janela ainda vai abrir. Os itens são agrupados pela data de abertura,
  calculada a partir da DUM equivalente.
- Os exames do parto e o teste rápido de gravidez saem da lista inteira (protocolo do município), inclusive do módulo "Consultas e exames".
- Como a tela não guarda histórico, "Solicitar agora" traz uma nota: pedir só o que ainda não foi feito.

### 1ª consulta

Há uma caixa "Esta é a 1ª consulta de pré-natal". Quando marcada:

- Todos os exames do "1º trimestre ou 1ª consulta" entram em "solicitar agora", em qualquer IG.
  A Caderneta os lista para "1º trimestre ou 1ª consulta".
- Exceção: a ultrassonografia de 1º trimestre segue a sua janela (11s 0d a 13s 6d).
- Com mais de 24 semanas, a glicemia de jejum sai e o TOTG 75 g entra em "solicitar agora". A
  Caderneta diz: "Glicemia em jejum (ou TOTG 75 g, se IG > 24 semanas)".
- Com mais de 12s 6d, a tela avisa que o pré-natal deveria ter começado até a 12ª semana.

### Próxima consulta (escolha da interface)

A tela diz "sugestão para a próxima" e "frequência mínima". A data sugerida soma à IG o intervalo da frequência atual: 28 dias (mensal), 14 (quinzenal) ou
7 (semanal). Há dois ajustes:

- a soma não passa das mudanças de frequência, em 28 e 36 semanas;
- o intervalo é de no mínimo 7 dias.

Exemplo: com 27 semanas, a próxima consulta fica em 28 semanas, e não em 31. Este ajuste é
interpretação da interface e não está escrito na fonte.

## Fora do escopo

- Pré-natal de alto risco: a tela lista os exames, mas não calcula quando pedi-los.
- Interpretação de resultados (critérios de DMG, conduta na sífilis etc.).
- Repetição do Coombs a cada 4 semanas, que constava no Caderno 32. A Caderneta 2026 pede o
  Coombs por trimestre, e é o que a tela segue.

## Verificação

`prenatal.test.ts` cobre:

- as frequências nos limites de 28 e 36 semanas;
- as janelas da ultrassonografia e do TOTG nos dois limites;
- a classificação dos itens com 10, 25 e 30 semanas;
- a 1ª consulta tardia, com 20 e com 30 semanas;
- a próxima consulta;
- a exclusão do teste de gravidez e dos exames do parto.

`App.test.tsx` cobre o cartão com 24s 2d:

- TOTG em "solicitar agora";
- hepatite C em "já deveria ter sido feito";
- 3º trimestre a partir de 16/07/2026;
- frequência mensal.

## Escolhas registradas (revisão de 2026-11-25)

- **Vacinas:** dTpa e influenza, se não aplicadas na gestação, até 45 dias após o parto (MS, página da
  dTpa; Calendário Nacional 2026, nota 2); VSR "o mais precocemente possível" a partir da 28ª semana
  (Calendário 2026, nota 3).
- **Coombs indireto:** a tela segue a Caderneta 2026 (por trimestre, para Rh negativo com Coombs
  negativo no 1º trimestre). Sem mudança de regra.
- **Estreptococo do grupo B:** janela de 35s 0d a 37s 0d, com o fim inclusivo (com 37s 1d já
  aparece em "já deveria ter sido feito"). É protocolo do município.
- **dT:** a Caderneta 2026 (4.3, p.40) só traz o caso de "apenas 1 dose anterior". O esquema
  completo vem da página oficial da dTpa do Ministério da Saúde
  (<https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dtpa>), que diz:
  - gestante "NÃO vacinada previamente": "três doses [...] com intervalo de 60 dias entre as
    doses, mínimo de 30 dias, sendo duas doses de dT em qualquer momento da gestação e uma dose
    de dTpa, a partir da 20ª semana". Se ela chega com 20 semanas ou mais, a dTpa é a 1ª dose;
  - com 1 dose de dT: 1 dT e 1 dTpa;
  - com 2 ou 3 doses: só a dTpa;
  - em toda gestação, 1 dose de dTpa.

  A tela mostra isso no item dT ("se menos de 2 doses anteriores de vacina com tétano").

- **VSR:** segue o MS (a partir da 28ª semana, sem limite superior).
- **Frequência de consultas:** a Caderneta 2026 diz semanal a partir da 36ª semana (o Caderno 32
  dizia semanal no termo). "28ª" e "36ª semana" são lidas como 28s 0d e 36s 0d.
- **Início do pré-natal:** a Caderneta diz "de preferência até a 12ª semana". O alerta da tela
  usa o limite de 12s 6d, escolha da interface.
- **Consultas puerperais:** texto igual ao da Caderneta (4.1.4): "uma na primeira semana após a
  saída da maternidade e outra em torno de 30 dias após o parto".
