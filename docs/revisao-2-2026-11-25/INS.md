# Revisão 2 — área INS (consulta de diabetes: glargina, NPH, titulação, prandial, metas, fluxograma DM2)

**Arquivos revisados** (c:\Smedic\ferramentas-diabetes): `src/glargina/rules/{escopo,insulina,metas,migracao,pcdt,titulacao}.ts`, `rules/rules.test.ts`, `sections.tsx`, `patient.tsx`, `ConsultaPage.tsx`, `sources.ts`, `docs/glargina-regras.md`. Risco CV não revisado.

**Fontes (<S> = scratchpad)**

- PCDT DM2 2026 (Portaria SCTIE/MS nº 13, 21/02/2026): `<S>/dl/pcdt.txt`; Figuras 2 e 3 lidas na imagem (`<S>/pcdt-out/fig-p22.png`, `fig-p30.png`). Itens 6, 8.1, 8.3.1–8.3.4.3, 8.9, Quadros 6–8.
- NT Conjunta 169/2026 (12–15/06/2026): `<S>/review/src/ins/nt169.txt`; Quadros 3, 4, 5 conferidos nas imagens `<S>/nt169/p7.png` e `p9.png`.
- Guia "Insulina glargina disponível em todo o SUS" (MS, 2026): `<S>/review/src/ins2/guia_glargina.pdf` (armazenamento no PDF pág. 9 = pág. impressa 8).
- URLs de gov.br da NT e do guia responderam 403 a requisição automatizada (não consegui confirmar que abrem); a do Conitec respondeu 200.

## Resumo

0 CRÍTICO, 10 IMPORTANTE, 10 MENOR. As contas (conversão 20%, Quadros 7 e 8, 2ª dose NPH, metas do Quadro 5, tubetes) batem com as fontes. Os problemas estão em estados padrão que decidem sozinhos, alertas condicionados a outro campo, omissões de segurança da Figura 3 e incoerências entre telas.

## Achados

### INS2-01 — IMPORTANTE — erro de implementação: alerta de hipoglicemia some se a dose prandial não foi digitada (modo algoritmo)

- Onde: `sections.tsx:390-393` (`r` só existe com `prandial !== null`) e `:478-483` (alerta depende de `r?.hypo`). Texto: "Glicemia abaixo de 70 mg/dL. Tratar a hipoglicemia primeiro…".
- App: no modo "Algoritmo", com glicemia 55 e dose prandial vazia, aparece só "Informe a dose prandial e a glicemia antes da refeição." Sem alerta. No modo "Fator", o alerta aparece sem a dose prandial (`hypoInFactorMode`). Os dois modos se comportam diferente. No modo algoritmo, com glicemia < 70, a tela ainda mostra "Dose a aplicar: N U".
- Fonte: Quadro 8 do PCDT (p. 28) tem "< 50 = −2 U; < 70 = −1 U"; não diz o que fazer com a hipoglicemia (conduta geral, 8.4).
- Recomendação: emitir o alerta de glicemia < 70 sempre que a glicemia estiver preenchida, nos dois modos, independente da dose prandial. Considerar não exibir "Dose a aplicar" com glicemia < 70 (como já é feito no modo fator).
- Confiança: alta.

### INS2-02 — IMPORTANTE — escolha não sinalizada: resposta em branco da dapagliflozina vira "sem critérios → insulina"

- Onde: `pcdt.ts:126-153` (case `metformina-su`), `sections.tsx:640-653`, `:737-756`. Texto: "Meta não atingida e sem critérios para dapagliflozina: iniciar insulinoterapia."
- App: os checkboxes "Doença cardiovascular estabelecida" e "HAS, dislipidemia ou tabagismo" começam desmarcados. Assim que a idade é preenchida, `dapa.eligible` vira `false` e o fluxograma dá "iniciar insulinoterapia", mesmo que o médico nunca tenha olhado o card de baixo. O estado "não avaliado" (`null`) só existe quando falta idade.
- Fonte: PCDT Figura 2 (p. 22): o losango "Apresenta critérios para uso de dapagliflozina?" precisa ser respondido antes de insulinizar.
- Recomendação: tratar "não respondido" como estado próprio (por exemplo, exigir clicar "Avaliei os critérios" ou mostrar na conduta "conforme critérios marcados abaixo: nenhum marcado"). No mínimo, trocar o texto por "Sem critérios marcados para dapagliflozina (confira o card abaixo): iniciar insulinoterapia".
- Confiança: alta.

### INS2-03 — IMPORTANTE — escolha não sinalizada: sexo "Masc." pré-selecionado decide elegibilidade à dapagliflozina

- Onde: `patient.tsx:44` (`sex: 'M'`), `pcdt.ts:183-190`.
- App: se o médico não toca no sexo, uma mulher de 55 a 59 anos com HAS é considerada elegível (homem ≥ 55). Já o painel não mostra que o sexo é um padrão.
- Fonte: PCDT item 6 (p. 11/12) e 8.3.3 (p. 25): "homens ≥ 55 anos ou mulheres ≥ 60 anos".
- Recomendação: iniciar sem seleção (`null`) e, na dapagliflozina, mostrar "Informe o sexo no painel" enquanto estiver vazio.
- Confiança: alta.

### INS2-04 — IMPORTANTE — erro objetivo vs decisão do produto: perfil "Criança e adolescente" não bloqueia o Início da NPH nem o fluxograma

- Onde: `sections.tsx:200` e `:655` chamam `outOfScope(patient.age, patient.type)` sem o 3º argumento; Titulação (`:290`) e Prandial (`:394`) passam `patient.profile`. `docs/glargina-regras.md` (Escopo) afirma que o perfil Criança fica fora das quatro seções.
- App: DM2, 30 anos, perfil "Criança/adolescente" mostra NPH inicial e fluxograma completos, mas Titulação e Prandial dizem "Fora do escopo".
- Fonte: Figura 2, título: "indivíduos com idade igual ou maior a 18 anos com diabete melito tipo 2" (p. 22).
- Recomendação: passar `patient.profile` nas duas chamadas; `rules.test.ts` só testa a função, não as telas.
- Confiança: alta.

### INS2-05 — IMPORTANTE — incoerência entre telas (e divergência entre fontes aparecendo na tela): teto da basal

- Onde: `sections.tsx:224-226` (Início da NPH): "< 0,5 U/kg/dia; até X U/dia (0,75 U/kg) só com obesidade e resistência à insulina". `sections.tsx:282, 337-342` (Titulação): com basal > 0,5 UI/kg/dia "Não aumentar: reavaliar o esquema", sem a exceção de 0,75; migração (`migracao.ts:50-63`) também usa > 0,5.
- App: um obeso resistente a 0,6 U/kg recebe "até 0,75 permitido" numa tela e "não aumentar" noutra.
- Fonte: PCDT 8.3.4.1 (p. 26): "a dose máxima de insulina basal de 0,75 U/kg/dia reservada, apenas, para aqueles com maior obesidade e resistência à insulina"; o teto "< 0,5" vale "em pacientes plenamente insulinizados". NT Quadro 4 (p. 9): "Insulina basal > 0,5 UI/kg/dia" como alerta, sem exceção.
- Recomendação: escolher uma regra e registrar no docs. Sugestão: manter o bloqueio da NT (alerta), e no Início da NPH trocar por uma linha só: "Reavaliar o esquema se basal > 0,5 U/kg/dia (NT 169, Quadro 4)", movendo o 0,75 para o docs. Se mantiver o 0,75, a Titulação deve dizer "> 0,5 (obesidade/resistência: até 0,75)".
- Confiança: alta.

### INS2-06 — IMPORTANTE — omissão de segurança da Figura 3: sulfonilureia ao iniciar esquema basal/bolus

- Onde: `pcdt.ts:55-56` (NOTE_KEEP_METFORMIN: "Manter a metformina (e outros orais, a critério médico)"), `sections.tsx:397-416` (Início do bolus), 203-237 (NPH).
- App: a conduta de insulina diz manter "outros orais, a critério médico" e o bolus não menciona oral nenhum.
- Fonte: Figura 3 (p. 30), nota b: "Os hipoglicemiantes orais podem ser mantidos, exceto nos casos de contraindicação ou ausência de indicação clínica (por exemplo, falência pancreática ou uso do esquema basal/bolus, situações em que não se recomenda a continuidade do uso de sulfonilureias)". Também 8.3.4.1 (p. 25).
- Recomendação: acrescentar ao início do bolus: "Com esquema basal/bolus, não se recomenda manter sulfonilureia (Figura 3, nota b)" e, na nota de insulina, tirar "outros orais" ou restringir a "metformina".
- Confiança: alta.

### INS2-07 — IMPORTANTE — texto ambíguo: o gatilho para iniciar bolus está incompleto

- Onde: `sections.tsx:397-412`. Subtítulo: "HbA1c fora da meta com jejum adequado, em uso de basal…"; passo 1: "achar a maior pós-prandial"; passo 2: "iniciar 3 a 4 U".
- App: não diz que só se inicia bolus se essa maior pós-prandial for > 180. Um médico apressado inicia bolus na refeição de maior glicemia mesmo com 150 mg/dL (pós-prandial já na meta).
- Fonte: PCDT 8.3.4.1 (p. 26): "A percepção de hiperglicemia pós-prandial (> 180 mg/dL), na presença de glicemia pré-prandial adequada, sugere a necessidade de introdução da insulina bolus"; Figura 3: losango "Hiperglicemia pós-prandial (> 180 mg/dL), e glicemia pré-prandial adequada?".
- Recomendação: subtítulo "HbA1c fora da meta, jejum e pré-prandial adequados e pós-prandial > 180 mg/dL em alguma refeição" e, no passo 1, "se a maior estiver ≤ 180, não iniciar bolus".
- Confiança: alta.

### INS2-07b (mesmo achado de INS2-07, 2ª parte): a Figura 3 só chega ao bolus depois da 2ª dose de NPH ou da troca por AIAP; o subtítulo "em uso de basal (NPH 2x/dia ou glargina)" é uma interpretação já registrada no docs. Sem ação além de manter.

### INS2-08 — IMPORTANTE — omissão: troca NPH→AIAP e priorização de AIAP não aparecem no início da NPH nem na titulação

- Onde: `sections.tsx:203-237` e `:345-361`; `pcdt.ts:79` (conduta "NPH à noite").
- App: a titulação só diz "reduzir 2 a 4 U" na hipoglicemia, e o início da insulina sempre manda NPH, inclusive para DM2 ≥ 70 anos.
- Fonte: Figura 3 (p. 30): "reduzir a dose em 2 U a 4 U **ou substituir a insulina humana NPH pelo AIAP**"; 8.3.4.2 (p. 27): AIAP priorizados em idosos, IMC < 30, hipoglicemia noturna/grave, grande variabilidade; "Recomenda-se o uso de glargina para indivíduos com hipoglicemias noturnas e graves". NT 169 item 3.1: elegível "incluindo novos diagnósticos" (≥ 70 anos).
- Recomendação: uma linha em Titulação (hipoglicemia noturna/grave: considerar trocar para glargina, aba "Migração") e uma em Início da NPH ("≥ 70 anos ou hipoglicemia noturna/grave: glargina pode ser a basal inicial, NT 169 e PCDT 8.3.4.2"). Se o produto quer manter NPH como padrão, registrar no docs.
- Confiança: média (é escolha de interface, mas a omissão afeta idosos, o público-alvo da glargina).

### INS2-09 — IMPORTANTE — texto ambíguo: "Fora da elegibilidade da NT 169/2026" para DM1 adulto < 70 anos

- Onde: `sources.ts:36-42`, `sections.tsx:56-69`.
- App: DM1 de 18 a 69 anos recebe alerta "Fora da elegibilidade" e só a ressalva do item 3.3.
- Fonte: Guia do MS, pág. 5 (PDF 6): "A glargina também é ofertada nas farmácias do componente especializado para pacientes com DM1"; NT item 3.5 (CEAF mantém acompanhamento).
- Recomendação: título "Fora da estratégia de dispensação na APS (NT 169/2026)" e acrescentar "DM1 pode obter glargina pelo Componente Especializado (CEAF)".
- Confiança: média.

### INS2-10 — IMPORTANTE — escolha não sinalizada: fator de risco "Obesidade (IMC ≥ 30)" exclui sobrepeso

- Onde: `pcdt.ts:18`.
- Fonte: Figura 2, nota a (p. 22): "sobrepeso ou obesidade (IMC ≥ 30 kg/m²)" (internamente inconsistente); 8.3 (p. 21): "pacientes do Reino Unido com sobrepeso e obesidade".
- App: paciente recém-diagnosticado com IMC 27 e nenhum outro fator fica no ramo "só MEV por até 3 meses"; pela leitura do texto iria para metformina.
- Recomendação: rótulo "Sobrepeso ou obesidade (IMC ≥ 30 kg/m² na nota a da Figura 2)" ou "IMC ≥ 25". Decidir e registrar no docs. O docs.md hoje diz as duas coisas (tabela de escolhas fala "sobrepeso ou obesidade (IMC ≥ 30)" copiado; Ajustes 2ª rodada diz "obesidade").
- Confiança: média.

### INS2-11 — MENOR — alerta de basal DM1 aplicado além do que a NT define

- Onde: `migracao.ts:50-63`, `sections.tsx:50`. A NT Quadro 4 (p. 9) lista "> 50% da DTDI" para "Crianças e adolescentes com DM1", mas a tela também usa para DM1 ≥ 70 anos. Além disso, nada valida DTDI ≥ NPH: DTDI 20 com NPH 30 gera DTDI nova 14 e alerta sem sentido.
- Recomendação: restringir ao DM1 < 18 (ou rotular "critério da NT para crianças/adolescentes") e avisar se DTDI < NPH.
- Confiança: média.

### INS2-12 — MENOR — omissão: educação e hipoglicemia ao iniciar insulina

- Onde: card "Dose inicial de NPH" (`sections.tsx:203-237`). PCDT 8.3.4 (p. 25): "Neste momento terapêutico é necessário reforço na educação em diabetes, com foco na técnica de administração, automonitorização, … e identificação e tratamento de hipoglicemias… Os eventos hipoglicêmicos são mais frequentes quando se inicia e intensifica-se a insulinoterapia". Sugestão: linha curta com isso. Também 8.3.4.1: "Quando a glicemia de jejum estiver próxima do limite superior da meta… avaliar o perfil glicêmico no período do sono" (ausente da Titulação).
- Confiança: alta (omissão); peso baixo.

### INS2-13 — MENOR — arredondamentos e limites de borda

- `insulina.ts:32-43` (`secondNphDose`): arredonda manhã e noite separadamente; com dose de deitar 33 U, total 26,4 mostra 18 + 9 = 27 U. A tela diz "2/3 de 80%" sem avisar. Sugerir arredondar a manhã e fazer noite = total − manhã.
- `insulina.ts:23-26` e `sections.tsx:221`: teto exibido "< N" usa `Math.round`; para 71 kg mostra "< 36" (limite real 35,5); 0,75 U/kg mostra "até 46" para 61 kg (45,75). O ceiling "< 0,5" e o alerta "> 0,5" deixam exatamente 0,5 U/kg sem classificação (os dois vêm da fonte).
- Confiança: alta; peso baixo.

### INS2-14 — MENOR — tabela do Quadro 8 na tela

- `sections.tsx:515-516`: linhas "< 50 → −2 U" e "< 70 → −1 U" ficam ambíguas (um olhar rápido lê 45 como −1 e −2). O código está certo (45 → −2). Sugerir "< 50" e "50 a 69". Fonte literal do PCDT (p. 28) é igual, então é só clareza.

### INS2-15 — MENOR — docs/glargina-regras.md desatualizado ou impreciso

- Linha das fontes: guia "(sem URL; só o trecho extraído foi lido)", mas `sources.ts` já tem URL e o PDF foi lido. Armazenamento "pág. 9" é página do PDF; a impressa é 8.
- "Meta de jejum do idoso comprometido: o PCDT aceita 'até 180'; a NT dá 90–150": o Quadro 6 do PCDT (p. 14) também traz 90–150; só o texto do 8.3.4.1 (p. 26) fala em "até 180" para a titulação. Registrar que a escolha vale só para a titulação.
- Item do fator de risco duplicado e contraditório (ver INS2-10).
- Elegibilidade na tela x docs: docs não menciona o CEAF do guia.

### INS2-16 — MENOR — redação da titulação mais forte que a fonte

- `sections.tsx:350`: "Vale para NPH e para glargina ('iniciar e titular os AIAP da mesma forma')". Fonte 8.3.4.2 (p. 27): "**Sugere-se** iniciar e titular os AIAP da mesma forma da insulina humana NPH"; a aspa está truncada. `sections.tsx:339-341`: a citação do Quadro 4 começa com "Recomenda-se" maiúsculo, a fonte é "Nessas situações, recomenda-se…". Ajustar.

### INS2-17 — MENOR — validação de entradas

- Glicemias, doses e DTDI não têm faixa plausível (glicemia 0 → "reduzir 2 a 4 U"). `PatientBar` aceita peso até 400 (`patient.tsx:207`) mas `LIMITS.weight.max` é 300 e a mensagem diz 300. Sugerir faixas (glicemia 20–600, doses > 0) e alinhar 300/400.

### INS2-18 — MENOR — escorva padrão de 2 UI sem fonte

- `sections.tsx:45,151-157`. NT só manda testar o fluxo; docs já registra. Sinalizado na tela ("confira no manual da caneta"). Aceitável; só manter o aviso.

### INS2-19 — MENOR — contraindicações da metformina/sulfonilureia reduzidas a TFG

- `pcdt.ts:57-60`: as notas só citam TFG. PCDT 8.9 (p. 39–40) inclui também IC, insuficiência hepática, infecção grave (metformina); hepática e infecção grave (sulfonilureia). Pelo escopo "guia geral", aceitável; sugerir "ver contraindicações no item 8.9".

### INS2-20 — MENOR — cobertura dos testes

- `rules.test.ts`: Quadro 8 não testa as bordas 50, 69, 70, 230/231, 280/281, 330/331; não há teste das telas (INS2-04); `secondNphDose` só testa 30. Os valores esperados que existem batem com as fontes (30→24; 190/130/50/7→8; 1:1; 0,5 U/kg).

## Conferido e correto

- Elegibilidade NT 169 item 3.1 (DM1 ≥ 2 e < 18 anos; ≥ 70 anos DM1/DM2) e literal `ELIGIBILITY_LITERAL` idêntico ao texto da NT (p. 2); itens 3.3, 3.4, 3.5.
- Conversão NPH→glargina: 1x/dia 1:1, ≥ 2x/dia −~20%, horário da maior dose (NT Quadro 3, p. 7; PCDT 8.3.4.2, p. 27); exemplo 30→24.
- Alerta de excesso de basal DM2 > 0,5 UI/kg/dia e demais critérios (NT Quadro 4, p. 9); observação literal "reavaliar o esquema… evitando o aumento adicional".
- Princípios gerais: glargina 1x/dia, sem 2ª dose, troca da basal não troca a prandial, titulação em até 3 dias, monitorar mais nas semanas iniciais (NT Anexo, p. 6).
- Tubetes 3 mL × 100 UI/mL = 300 UI; 28 dias aberto; 3 anos/5.000 aplicações; agulha 4 mm 1/dia por tipo; geladeira 2–8 °C fechado (NT seção 4, p. 10–11; Guia p. 9). A fórmula `max(⌈UI/300⌉, ⌈dias/28⌉)` é exata para tubete único em uso.
- Armazenamento: < 30 °C local arejado; > 30 °C geladeira e tirar 30 min antes; máx. 28 dias (Guia p. 9).
- NPH inicial: 10 U ou 0,1–0,2 U/kg, à noite (≈ 22 h ou 8 h antes do desjejum); +2 U a cada 3 dias; jejum < 70 ou hipoglicemia noturna: −2 a −4 U (PCDT 8.3.4.1 p. 25–26; Fig. 3). < 80 madrugada/jejum diurno: −2 U (Fig. 3).
- 2ª dose NPH: 80% da dose de deitar, 2/3 manhã e 1/3 deitar; +1 a 3 U a cada 3 dias pelo pré-jantar 80–130 (8.3.4.1 p. 26).
- Bolus: 3 a 4 U, 30 min antes (regular), +1 U 2x/semana até 90–180, 2ª e 3ª doses se > 180, reduzir NPH de deitar (8.3.4.3 p. 27–28; Fig. 3). Quadro 7 (FC 50 ou 1800/DTDI; 190/130/50/7 → 8,2 → 8) e Quadro 8 (limites e valores) conferem.
- Metas Quadro 5 NT (p. 9): todas as 5 linhas × 4 colunas idênticas a `GOALS`; HbA1c estrita; jejum inclusivo; pós < 180.
- Figura 2 (p. 22): ramos por tempo/fator de risco, MEV → metformina → sulfonilureia → (dapagliflozina) → insulina; metas "< 7,0% ou, em idosos, 7,5% a 8,0%"; nota b (HbA1c > 9%, jejum ≥ 300…); nota e (850 mg, 2.550 mg/dia); nota f (gliclazida em idosos); nota h; reavaliar em 2 a 6 meses (nota d). Dapagliflozina: ≥ 40 + DCV, homem ≥ 55/mulher ≥ 60 (decisão do usuário), 10 mg, TFGe < 25 (8.3.3 p. 25). "MEV até 3 meses" vem do texto 8.3 (p. 21).
- Metformina 1 g/dia com TFG 30–45, suspender < 30 (8.3.1 p. 23); sulfonilureia contraindicada TFG < 30, glibenclamida ≥ 60 anos (8.9 p. 39–40).
- Faixas de idade, escopo DM1/< 18 e "Não se aplica a gestantes" coerentes nas telas que usam `outOfScope` (exceto INS2-04).
- Testes: valores esperados coerentes com as fontes.

## Não consegui verificar

- URLs gov.br da NT 169 e do guia (403 para requisição automatizada); só confirmei os PDFs locais.
- Se existe NT/versão posterior à NT 169 de 12/06/2026 (sem busca de versões mais novas além dos arquivos disponíveis).
- Valor oficial da escorva da caneta (Biopem) e bula da glargina do SUS: não obtidos.
- O comportamento visual das telas (revisão por código; não executei o app).
