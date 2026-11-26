# Revisão 2 — Área GES (Gestante: idade gestacional e pré-natal)

Repositório: `c:\Smedic\ferramentas-diabetes`. Somente leitura; este é o único arquivo escrito (mais textos temporários em `review2/t/`).

## Arquivos revisados

`src/gestante/ig.ts`, `ig.test.ts`, `IdadeGestacional.tsx`, `prenatal.ts`, `prenatal.test.ts`, `PrenatalView.tsx`, `GestantePage.tsx`, `sources.ts`, `src/shared/datas.ts`, trecho gestante de `src/App.test.tsx`, `docs/gestante-ig.md`, `docs/gestante-prenatal.md`.

## Fontes usadas

- MS. Caderneta Brasileira da Gestante 2026: `gest_src/caderneta.pdf` (texto em `review2/t/cad.txt`; tabela 4.2.1 conferida em imagem, p. impressa 37). A numeração de páginas abaixo é a impressa.
- MS/SAPS. Nota metodológica C3: `gest_src/c3.pdf`.
- MS. Cadernos de Atenção Básica 32 (2012): `gest_src/cab32.txt` (itens 5.3, 5.5, 5.6, 6.3.4, 6.3.5).
- ACOG CO 700: `gest_src/grin.html` (texto) e `gest_src/uw.pdf` (imagem da Tabela 1, conferida visualmente; rodapé "Reaffirmed 2022").
- MS. Página oficial da dTpa: `review/src/ges2/dtpa.html`.
- MS/PNI. Calendário Nacional de Vacinação 2026, Gestante (atualizado em 04/02/2026): `review/src/ges2/calendario-tecnico-nacional-de-vacinacao-gestante.html`. É um PDF com extensão .html (texto em `review2/t/cal.txt`).

## Resumo

Nenhum erro objetivo de número, limiar ou janela. Todas as regras clínicas numéricas batem com as fontes: Tabela 1 da ACOG, FIV +261/+263, dias 5/15/25, 280 dias, Näegele, frequência de consultas, exames por trimestre e vacinas.
Os achados são de redação, de regra do produto (divergência exibida na tela), de omissão de conduta e de documentação.
Contagem: CRÍTICO 0 · IMPORTANTE 5 · MENOR 8.

---

## Achados

### GES2-01 — IMPORTANTE — escolha não sinalizada / opinião clínica

**Rótulo "gestação prolongada" a partir de 40s 0d**

- **Onde:** `ig.ts:97-105`; `IdadeGestacional.tsx:67-71` e `:72-76`.
- **Texto exibido:** "Gestação prolongada é a de 40 a 42 semanas (definição do MS). A avaliação do bem-estar fetal é com 41 semanas."
- **O app faz:** de 40s 0d a 40s 6d mostra um alerta informativo de "gestação prolongada". O rótulo "termo" some a partir de 40s.
- **A fonte diz:** CAB 32, 6.3.5: "Conceitua-se gestação prolongada, também referida como pós-datismo, aquela cuja idade gestacional na mulher encontra-se entre 40 e 42 semanas. Gravidez pós-termo é aquela que ultrapassa 42 semanas." A conduta (5.3) é com 41 semanas: "Quando o parto não ocorre até a 41ª semana, é necessário encaminhar a gestante para avaliação do bem-estar fetal".
- **Problema:**
  - A definição está literal na fonte, mas um médico apressado lê "prolongada" aos 40s 0d (a própria DPP) como condição patológica.
  - A tela cita "definição do MS" e mistura definição com conduta. A regra do produto é não mostrar polêmica e deixar a escolha no `docs/`.
  - A classificação prática (ACOG) é termo até 41s 6d e pós-termo a partir de 42s 0d. Esta parte é conhecimento geral, sem fonte baixada.
- **Recomendação:** nos 40s 0d a 40s 6d mostrar só "DPP atingida (40 semanas). Consultas semanais; com 41 semanas, avaliar o bem-estar fetal." Usar "gestação prolongada" apenas se o produto quiser seguir o CAB 32 à risca, sem a frase "definição do MS" na tela. Manter a definição no docs.
- **Confiança:** média.

### GES2-02 — IMPORTANTE — regra do produto (duas DPP na tela)

**A regra de Näegele aparece como segunda DPP**

- **Onde:** `IdadeGestacional.tsx:359-368`.
- **Texto exibido:** "Pela regra de Näegele (gestograma): dd/mm/aaaa. A DPP acima usa os 280 dias do calendário; a diferença é de N dias."
- **O app faz:** mostra uma segunda DPP, diferente da calculada, sempre que as duas divergem (até 3 dias).
- **A fonte diz:** CAB 32, 5.6: DPP = "280 dias ou 40 semanas, a partir da DUM, mediante a utilização de calendário"; Näegele é "outra forma de cálculo". As duas são do mesmo item da fonte.
- **Problema:** dois valores de DPP na mesma tela, para um médico no atendimento, é justamente a ambiguidade que a regra do produto quer evitar ("a escolha fica registrada no docs/").
- **Recomendação:** remover a linha da tela (o cálculo e os testes `ig.test.ts:41-45` podem ficar) ou trocar por nota fixa de uma linha no "Como calculamos". O docs já registra a escolha.
- **Confiança:** alta (quanto ao conflito com a regra do produto).

### GES2-03 — IMPORTANTE — regra do produto (MS × município na tela)

**O "resumo" do protocolo local contrasta a Caderneta com o município, em dois cartões**

- **Onde:** `prenatal.ts:254-255` (`PROTOCOLO_LOCAL.resumo`), exibido em `PrenatalView.tsx:126` e `:194`.
- **Texto exibido:** "...estreptococo do grupo B de 35s 0d a 37s 0d (não está na lista do MS); sem os exames do parto; ultrassonografia obstétrica de 11 a 13 e de 20 a 24 semanas (a Caderneta do MS indica uma, idealmente entre 7 e 12 semanas)."
- **Problema:**
  - O parágrafo longo diz "a Caderneta do MS indica X, o município faz Y", repetido duas vezes.
  - A decisão do usuário foi só a nota "não disponível na rede do município" em HTLV e eletroforese, que já está no item (`semOfertaTexto`).
  - Para quem lê, não fica claro se a USG de 7–12s ainda vale ou se o GBS é recomendação do MS.
  - A frase "ajustado ao protocolo do município" é útil, mas não o contraste.
- **Recomendação:** reduzir a uma linha, por exemplo "Lista ajustada ao protocolo do município." O contraste MS × município fica só no `docs/gestante-prenatal.md` (a tabela de lá já faz isso).
- **Confiança:** média (depende de como o usuário lê a regra "decisão do município pode aparecer").

### GES2-04 — IMPORTANTE — escolha não sinalizada

**DUM "conhecida e certa" sem as condições do MS, e DUM só pelo período sem aviso sobre a USG**

- **Onde:** `IdadeGestacional.tsx:176-184`, `:196-203`, `:339-343`.
- **App:** mostra "Conhecida e certa" ou "Desconhecida, mas sei o período do mês" (dia 5/15/25). Nenhuma das duas opções diz quando a DUM é confiável, nem sugere a USG precoce.
- **A fonte diz:**
  - CAB 32, 5.5 I: a DUM certa "é o método de escolha para se calcular a idade gestacional em mulheres com ciclos menstruais regulares e sem uso de métodos anticoncepcionais hormonais".
  - CAB 32, 5.5 II: para o período do mês, "considere ... os dias 5, 15 e 25".
  - ACOG CO 700: "If the patient is unsure of her LMP, dating should be based on ultrasound examination estimates (ideally obtained before or at 13 6/7 weeks of gestation)". Com DUM certa, USG de 1º trimestre com diferença maior que 5 ou 7 dias redata.
- **Problema:** `docs/gestante-ig.md:94-96` registra a preferência pela USG, mas ela não aparece na tela da aba DUM. A erro possível de até ±10 dias com o "período do mês" passa sem aviso.
- **Recomendação:** nas duas opções do rádio, ou como `hint`: "DUM certa: ciclos regulares, sem anticoncepcional hormonal." e "Só pelo período do mês: a data é aproximada; se houver ultrassonografia precoce (até 13s 6d), use a aba Ultrassonografia." Sem citar a divergência entre fontes.
- **Confiança:** média.

### GES2-05 — IMPORTANTE — omissão de conduta que a fonte traz

**O alerta de 41 semanas é mais curto que a conduta do CAB 32**

- **Onde:** `IdadeGestacional.tsx:72-76` (41s a 41s 6d) × `:77-81` (≥ 42s).
- **O app diz aos 41s:** "encaminhar para avaliação do bem-estar fetal (índice de líquido amniótico e monitoramento cardíaco fetal)".
- **A fonte diz:**
  - CAB 32, 6.3.5: "Por volta da 41ª semana ... encaminhe a gestante para um centro de referência ... É importante enfatizar que, embora encaminhada ao centro de referência para avaliação de vitalidade, nenhuma gestante deve receber alta do pré-natal da unidade básica antes da internação para o parto."
  - CAB 32, 5.3: "Não existe 'alta' do pré-natal antes do parto."
- **Problema:**
  - A parte "centro de referência" e "não dar alta" só aparece a partir de 42s, embora a fonte a ligue à 41ª semana.
  - O CAB 32 (5.3 e 6.3.5) também diz que a indução com 41 semanas é preferível à avaliação seriada. Isto é conduta e fica fora do escopo, mas a omissão total pode ser lida como "a escolha é só avaliar".
- **Recomendação:** repetir no alerta de 41s a frase de 42s ("e para o centro de referência. Não dar alta do pré-natal antes da internação para o parto"). Opcional: "conduta (avaliar ou induzir) conforme o serviço de referência".
- **Confiança:** média.

---

### GES2-06 — MENOR — documentação divergente do código

**`docs/gestante-prenatal.md` e `docs/gestante-ig.md` descrevem comportamentos que não existem mais**

- **Onde:**
  - `docs/gestante-prenatal.md:95-96`: "Os exames do parto aparecem só no módulo de referência." e "O teste rápido de gravidez também fica só na referência". Pelo código (`prenatal.ts:206-219`) e pelo teste (`prenatal.test.ts:25-39`) esses itens saem da lista inteira. Nenhum aparece no módulo "Consultas e exames".
  - `docs/gestante-prenatal.md:71`: o texto de `PERIODOS` ainda inclui `'parto'` em `PrenatalView.tsx:131`. Está sem efeito, porque o período `parto` fica vazio.
  - `docs/gestante-prenatal.md:132-136` ("exclusão do teste de gravidez") e a tabela de verificação não citam o teste que garante a ausência dos exames do parto. É só texto.
  - `docs/gestante-ig.md:77`: "A 3ª linha da tabela tem um aviso próprio: no 3º trimestre". O aviso é da 6ª linha (28s 0d em diante).
- **Recomendação:** corrigir as duas frases e o número da linha; ou remover `'parto'` de `PERIODOS` e de `PERIODO_ROTULO`.
- **Confiança:** alta.

### GES2-07 — MENOR — rótulo ambíguo

**"Solicitar agora" lista todos os exames do trimestre em todas as consultas do trimestre**

- **Onde:** `PrenatalView.tsx:85-86`, `prenatal.ts:350-354`.
- **Problema:** como o app não guarda histórico, a mesma lista de exames do 1º trimestre aparece em "Solicitar agora" na consulta de 6s, 9s e 13s. A 3ª aba (vacinas) tem "verificar e aplicar", mas os exames não. Um médico apressado pode repetir exames já feitos.
- **Recomendação:** trocar por "Solicitar agora (se ainda não feitos)" ou colocar um `hint-inline` sob o título.
- **Confiança:** média (escolha de interface).

### GES2-08 — MENOR — omissão da fonte

**Vacinas: dTpa no puerpério e VSR "o mais precocemente possível"**

- **Onde:** `prenatal.ts:145-160`.
- **O app diz:** dTpa "a partir da 20ª semana, em toda gestação"; VSR "a partir da 28ª semana, dose única em cada gestação".
- **A fonte diz:**
  - MS, página da dTpa: "Caso a vacina dTpa não tenha sido administrada durante a gestação, a mesma poderá ser realizada no puerpério imediato (pós-parto) até 45 dias."
  - Calendário 2026, nota 2: "agendar para o puerpério imediato, até 45 dias pós-parto".
  - Calendário 2026, nota 3 (VSR): "A vacinação deve ocorrer o mais precocemente possível na AGENDA OPORTUNA".
  - Caderneta, p. 40, nota: "Caso alguma vacina não possa ser aplicada durante a gestação, ela será oferecida após o parto."
- **Problema:** a frase sobre o pós-parto existe só no módulo "Consultas e exames" (`PrenatalView.tsx:246-248`), não no cartão da IG. O VSR sem "o quanto antes" pode ser entendido como livre até o parto.
- **Recomendação:** no VSR: "a partir da 28ª semana, o mais cedo possível; dose única em cada gestação". Na dTpa: acrescentar "se não tomar na gestação, até 45 dias após o parto" (como já está na influenza).
- **Confiança:** alta.

### GES2-09 — MENOR — entrada silenciosa

**IG do laudo com "dias" em branco vale 0**

- **Onde:** `IdadeGestacional.tsx:45-50`, `:125`, `:146`.
- **Problema:** `usgD` nulo vira 0 sem aviso. Com laudo "9s 4d" e o campo "dias" esquecido, a gestação é datada 4 dias a menos e a comparação com a DUM muda de lado do limite. Vale para o campo "Quando ela terá…" também.
- **Recomendação:** exigir o campo "dias" (mostrar "preencha os dias") ou escrever no hint "em branco = 0".
- **Confiança:** média.

### GES2-10 — MENOR — texto

**Aviso de precisão da USG lista as três faixas**

- **Onde:** `IdadeGestacional.tsx:352-358`.
- **Texto:** "erro de 7 a 10 dias (14s a 21s 6d), 10 a 14 dias (22s a 27s 6d) e 21 a 30 dias (28s ou mais), segundo a ACOG (CO 700)."
- **Fonte:** CO 700 confirma os três valores (14 0/7–21 6/7: ±7–10 d; 22 0/7–27 6/7: ±10–14 d; ≥28 0/7: ±21–30 d). Está correto.
- **Problema:** em vez de mostrar só a faixa do exame, mostra as três, e o médico tem de escolher a correta. É fácil errar a linha.
- **Recomendação:** mostrar só a faixa que corresponde ao `usgS`.
- **Confiança:** alta.

### GES2-11 — MENOR — escolha não sinalizada na tela

**"Próxima consulta por volta de" é regra da interface**

- **Onde:** `PrenatalView.tsx:75`, `prenatal.ts:312-319`.
- **Problema:**
  - A fonte (Caderneta 4.1.4) só dá a frequência mínima ("mensal", "quinzenal", "semanal").
  - O app calcula uma data com a regra "limite de 28s e 36s, no mínimo 7 dias". Exemplo: aos 27s 5d, sugere 28s 5d.
  - O docs informa que é interpretação; a tela só diz "por volta de".
- **Recomendação:** na tela, "sugestão (frequência mínima: mensal / quinzenal / semanal)". Sem mudança de regra.
- **Confiança:** média.

### GES2-12 — MENOR — redundância

**Na 1ª consulta tardia o Coombs aparece três vezes**

- **Onde:** `prenatal.ts:356-374`.
- **Problema:** com "1ª consulta" marcada e 30s, `t1-coombs` entra em "agora" (regra da 1ª consulta), `t2-coombs` em "já deveria ter sido feito" e `t3-coombs` em "agora". O mesmo vale para toxoplasmose (T1 e T3), hemograma, GJ (GJ é trocada pelo TOTG), sífilis e HIV. Está de acordo com a Caderneta, mas confunde.
- **Recomendação:** nada a corrigir na regra; opcionalmente agrupar por nome do exame.
- **Confiança:** baixa.

### GES2-13 — MENOR — citação

**Item 5.4.2 do CAB 32 cita definições de pré-termo e pós-termo fora de contexto**

- **Onde:** `ig.ts:6-8`, `sources.ts:5`, `docs/gestante-ig.md:26`.
- **O app diz:** 5.4.2 define "pré-termo < 37 semanas; pós-termo ≥ 42 semanas".
- **A fonte diz:** 5.4.2 é "História clínica" (anamnese); a frase é "Número de recém-nascidos: pré-termo (antes da 37ª semana de gestação), pós-termo (igual ou mais de 42 semanas de gestação)". É campo de história obstétrica, não definição. A definição de pré-termo aparece em 6.3.4 ("entre 22 semanas (ou 154 dias) e 37 semanas (ou 259 dias)"). Em 6.3.5 o pós-termo "ultrapassa 42 semanas" (divergência interna: ≥ 42s 0d × > 42s). O app escolhe 42s 0d, e o docs registra isso.
- **Recomendação:** citar "5.4.2 (histórico obstétrico)" e acrescentar 6.3.4. Nenhuma mudança na regra.
- **Confiança:** alta.

---

## Conferido e correto

- **Tabela 1 da ACOG** (imagem de `uw.pdf`, "*Based on LMP"): ≤ 8 6/7 > 5 d; 9 0/7–13 6/7 > 7 d; 14 0/7–15 6/7 > 7 d; 16 0/7–21 6/7 > 10 d; 22 0/7–27 6/7 > 14 d; ≥ 28 0/7 > 21 d. Bate com `ig.ts:119-150`. A faixa escolhida pela IG da DUM está correta ("Based on LMP"). Corte "maior que" correto. O teste `ig.test.ts:97-126` confere os valores e as bordas.
- **Reafirmação em 2022** (rodapé do `uw.pdf`).
- **FIV:** "for a day-5 embryo, the EDD would be 261 days from the embryo replacement date. Likewise, the EDD for a day-3 embryo would be 263 days" — `ig.ts:65-67` (transferência − (14 + idade)) dá exatamente 261 e 263; teste `ig.test.ts:67-70`.
- **Trimestres da ACOG:** 1º até 13 6/7; 2º 14 0/7–27 6/7; 3º ≥ 28 0/7 (`ig.ts:88-91`).
- **Acurácia da USG:** 14–21 6/7 ± 7–10 d; 22–27 6/7 ± 10–14 d; 3º trimestre ± 21–30 d (texto de `IdadeGestacional.tsx:352-358`).
- **3º trimestre:** aviso do risco de redatar feto pequeno que pode ser restrito (`IdadeGestacional.tsx:516-521`; ACOG, nota da Tabela 1).
- **ACOG sobre USG de 1º trimestre prevalecer** ("With rare exception, if a first-trimester ultrasound... gestational age should not be adjusted based on a second-trimester ultrasound") — texto em Details e dica "use a primeira ultrassonografia".
- **CAB 32, 5.5 e 5.6:** dias 5, 15 e 25 para início, meio e fim; DPP por 280 dias; Näegele com os 3 exemplos do caderno (`ig.test.ts:41-45`, conferi 13/09/04 → 20/06/05, 10/02/04 → 17/11/04, 27/01/04 → 03/11/04). A diferença máxima de 3 dias em relação aos 280 dias bate com a contagem de meses (273 a 275 dias para 9 meses).
- **CAB 32, 5.3:** encaminhar com 41 semanas para avaliação do bem-estar fetal, "incluindo avaliação do índice do líquido amniótico e monitoramento cardíaco fetal"; "Não existe 'alta' do pré-natal antes do parto".
- **Caderneta 4.1.2 e 4.1.4 (p. 33–34):** início "de preferência até a 12ª semana"; "no mínimo, sete consultas", intercaladas entre médico e enfermeiro, "no mínimo, uma consulta odontológica"; mensal até 28 semanas, quinzenal da 28ª à 36ª, semanal a partir da 36ª; "no mínimo duas consultas puerperais", uma na primeira semana após a saída da maternidade e outra "em torno de 30 dias após o parto"; "Não existe alta do pré-natal". Bate com `prenatal.ts:299-328` e `PrenatalView.tsx:151-191`. Leitura "28ª/36ª semana" = 28s 0d/36s 0d está registrada no docs.
- **C3:** 1ª consulta até a 12ª semana; ≥ 7 consultas; dTpa a partir da 20ª semana; sífilis, HIV e hepatites B e C no 1º trimestre; sífilis e HIV no 3º.
- **Caderneta 4.2.1 (p. 37):** lista do 1º trimestre (conferida item a item), TOTG do 2º ("preferencialmente entre 24 e 28 semanas"), Coombs/malária/toxoplasmose no 2º e no 3º trimestre, lista do 3º, lista do parto. A tabela em imagem mostra Coombs, malária e toxoplasmose no 2º trimestre (e de novo no 3º), como no código. Condições "Rh negativo e resultado negativo no primeiro trimestre" e "IgG não reagente" corretas. "Glicemia em jejum (ou TOTG 75 g, se IG > 24 semanas)" ↔ `prenatal.ts:363` (> 24s 0d, igual ao texto "maior que 24 semanas").
- **Exames com indicação clínica** (7 itens, p. 38) e **alto risco** (p. 39): iguais a `COM_INDICACAO` e `PrenatalView.tsx:225-231`.
- **Vacinas (Caderneta p. 39–40 e Calendário 2026):**
  - hepatite B: iniciar ou completar as 3 doses, até 45 dias pós-parto; o Calendário diz que não se revacina quem tem esquema completo ↔ condição "se esquema incompleto";
  - dTpa a partir da 20ª semana, a cada gestação;
  - influenza: 1 dose por temporada, em qualquer fase, até 45 dias após o parto se não tomou;
  - covid-19: 1 dose a cada gestação, 6 meses ou mais após a última;
  - VSR: a partir da 28ª semana, dose única por gestação;
  - febre amarela e raiva: situações específicas, avaliação individual.
- **dT (página da dTpa do MS e Calendário 2026):** "Em gestantes NÃO vacinadas previamente ... três doses ... intervalo de 60 dias entre as doses, mínimo de 30 dias, sendo duas doses de dT em qualquer momento da gestação e uma dose de dTpa, a partir da 20ª semana"; "Caso a gestante chegue ... a partir da 20ª ... administrar dTpa como a primeira dose"; 1 dose de dT → 1 dT + 1 dTpa; 2 ou 3 doses → só dTpa. O código (`prenatal.ts:169-177`) e o teste (`prenatal.test.ts:8-12`) coincidem. A Caderneta p. 40 só traz o caso de 1 dose.
- **Situação na data:** termo ≥ 37s; 41s encaminhar; pós-termo ≥ 42s (escolha registrada no docs). Teste `ig.test.ts:77-89`.
- **Decisões do usuário** (não apontadas como erro): Coombs por trimestre; GBS 35s 0d a 37s 0d (inclusive); HTLV e eletroforese no fim com "não disponível na rede do município"; sem Chagas, malária, teste rápido de gravidez, toxoplasmose do 2º trimestre e exames do parto; USG de 11–13 e 20–24 semanas. O código e `prenatal.test.ts` as implementam.
- **`prenatal.test.ts`:**
  - os valores esperados são coerentes com as fontes e com as decisões (janelas, bordas do TOTG e da USG, 1ª consulta tardia, próxima consulta);
  - na checagem manual de `proximaConsulta`, 27s 0d → 28s 0d, 27s 5d → 28s 5d, 35s 0d → 36s 0d e 37s 0d → 38s 0d conferem;
  - `App.test.tsx`: DUM 01/01/2026 → 24s 2d em 20/06/2026, DPP 08/10/2026, 3º trimestre em 16/07/2026, USG de 26/02 com laudo 9s 0d → 25s 2d. Recalculado à mão, bate.
- **`datas.ts`:** `parseIso` rejeita datas inexistentes e anos < 100 (a conversão de `Date.UTC` não vaza); somas em dias de calendário sem fuso; `addMonths` com dia excedente passa para o mês seguinte (coerente com Näegele).

## Não consegui verificar

- Não há texto da Tabela 1 no HTML da ACOG (veio como imagem); conferi a imagem de `uw.pdf` visualmente.
- Se existe edição oficial posterior à Caderneta 2026, ao Calendário 2026 (04/02/2026) ou ao CAB 32: as URLs de `sources.ts` não foram abertas ao vivo, só os arquivos já baixados.
- Os links gov.br (`CADERNETA`, `C3`, `MS_DTPA`) não foram testados.
- Classificação ACOG de gestação a termo (early/full/late-term/post-term, CO 579) usada em GES2-01 é conhecimento geral, sem fonte baixada nesta revisão.
- As regras de indução de parto (CAB 32) não estão no escopo da tela; não avaliei se há protocolo mais novo do MS.
