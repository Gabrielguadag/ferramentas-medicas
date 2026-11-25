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
     - após o parto, ao menos 2 consultas: a 1ª até 7 dias e a 2ª até 30 dias.
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
| Estreptococo do grupo B (cultura, swab vaginal e retal) | não está na lista (o Caderno 32 não recomendava rastreio de rotina) | 3º trimestre, de 35 a 37 semanas (35s 0d a 37s 6d)                                                          |
| Exames no parto ou pós-parto imediato                   | HIV, sífilis e hepatites B e C (se não feitas)                      | saem: não são usados pela equipe                                                                            |
| Teste rápido de gravidez                                | 1º trimestre                                                        | sai (no pré-natal, já foi feito)                                                                            |
| Ultrassonografia obstétrica                             | uma, idealmente entre 7 e 12 semanas                                | duas: 1º trimestre de 11 a 13 semanas (11s 0d a 13s 6d) e 2º trimestre de 20 a 24 semanas (20s 0d a 24s 6d) |

A tela mostra esse resumo nos dois cartões. No módulo "Consultas e exames", cada trimestre
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
- Os exames do parto aparecem só no módulo de referência.
- O teste rápido de gravidez também fica só na referência: é o diagnóstico, não uma pendência.

### 1ª consulta

Há uma caixa "Esta é a 1ª consulta de pré-natal". Quando marcada:

- Todos os exames do "1º trimestre ou 1ª consulta" entram em "solicitar agora", em qualquer IG.
  A Caderneta os lista para "1º trimestre ou 1ª consulta".
- Exceção: a ultrassonografia de 1º trimestre segue a sua janela (11s 0d a 13s 6d).
- Com mais de 24 semanas, a glicemia de jejum sai e o TOTG 75 g entra em "solicitar agora". A
  Caderneta diz: "Glicemia em jejum (ou TOTG 75 g, se IG > 24 semanas)".
- Com mais de 12s 6d, a tela avisa que o pré-natal deveria ter começado até a 12ª semana.

### Próxima consulta (escolha da interface)

A data sugerida soma à IG o intervalo da frequência atual: 28 dias (mensal), 14 (quinzenal) ou
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
- a exclusão do teste de gravidez.

`App.test.tsx` cobre o cartão com 24s 2d:

- TOTG em "solicitar agora";
- hepatite C em "já deveria ter sido feito";
- 3º trimestre a partir de 16/07/2026;
- frequência mensal.
