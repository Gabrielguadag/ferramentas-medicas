# Revisão clínica: RCV (risco cardiovascular, 5 escalas)

Repositório: `c:\Smedic\ferramentas-diabetes`. Somente leitura; nada foi editado.

## Escopo e fontes

Arquivos revisados (todos em `src/risco/`): `escalas.ts`, `inputs.ts`, `prevent.ts`, `who2019.ts`, `RiscoSection.tsx`, `escalas.test.ts`, `prevent.test.ts`, `who2019.test.ts`. Também `docs/risco-cv.md` e `docs/pesquisa-risco-cv.md` (auditados, não usados como fonte), e os JSON `prevent.coefficients.json` e `who2019.params.json`.

Fontes primárias usadas (`<scratchpad>` = `<pasta-temporária>`):

- SBC 2025, Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose (Arq Bras Cardiol 2025;122(9):e20250640): `<scratchpad>/dl/sbc.txt` e `dl/p41.png` (Fig. 4.1 e Tab. 4.2 renderizadas). Tab. 4.1 a 4.8, Fig. 4.1, Tab. 5.1.
- SBD 2026, Manejo do risco cardiovascular: dislipidemia: `dl/sbd.txt`, `dl/sbd_tables.txt` (Quadros 1 a 6, R1 a R18).
- PCDT DM2 2026 (Portaria SCTIE/MS nº 13, de 21/02/2026), item 5.5: `dl/pcdt.txt`, p. 10 a 12 do anexo.
- OMS 2019 / HEARTS-OPAS: `who-src/paho/main.js` (código e textos do aplicativo oficial da OPAS), `who-out/who2019-model.md`, `who-out/who2019-params.json`, `who-src/paho_tables.json`.
- PREVENT: Khan et al., Circulation 2024 (texto em `dl/khan2.html.txt`); pacote R preventr 0.12.2 (`prevent-src/preventr/NEWS.md`) e `prevent-out/prevent-model.md`.

Não consegui o suplemento do PREVENT (Tab. S12) nem o apêndice do artigo da OMS (ver "Não consegui verificar").

---

## Achados

### Resumo por gravidade

CRÍTICO: 1 (RCV-01). IMPORTANTE: 11 (RCV-02 a RCV-12). MENOR: 8 (RCV-13 a RCV-20; o RCV-13 agrupa vários itens pequenos).

---

### RCV-01 [CRÍTICO] Aba OMS/HEARTS calcula e exibe % mesmo para quem tem DCV, DRC ou diabetes, o que o fluxo oficial da calculadora não faz

- Tipo: erro objetivo (divergência do fluxo oficial) / omissão de alerta de segurança.
- Onde: `RiscoSection.tsx:137-159` (cálculo de `whoLab` e `whoNonLab` sem nenhuma checagem de eventos) e `:611-663` (visão OMS). O bloco de alerta de DCV existe só no PREVENT (`:666-670`). Texto exibido, por exemplo: `Com exames (colesterol)  7%` com `Risco moderado em 10 anos (infarto, AVC ou morte cardiovascular)`.
- O que o app faz: marcando IAM prévio, AVC ou revascularização, a aba OMS continua mostrando um percentual e uma categoria ("Baixo", "Moderado"), sem qualquer aviso. Com diabetes, calcula a tabela laboratorial com diabetes = 1 e mostra "Moderado" ou até "Baixo" se a célula for baixa. DRC não é perguntada. A tabela comparativa (`:766`) repete o percentual.
- O que a fonte diz: o aplicativo oficial HEARTS/OPAS (`main.js`, texto de ajuda, versão pt): "A estimativa de risco cardiovascular começa com a identificação de subpopulações de risco alto e muito alto usando três perguntas dicotômicas consecutivas. Elas perguntam sobre a presença de doença cardiovascular estabelecida (doença coronariana, doença cerebrovascular ou doença vascular periférica), doença renal crônica e diabetes. Uma resposta afirmativa a qualquer uma dessas três perguntas classificará automaticamente o risco cardiovascular do indivíduo". No código, o resultado é "Paciente de Risco Muito Alto" (DCV) ou "Paciente de Alto Risco" (DRC ou diabetes), sem percentual. Só quem responde "não" às três perguntas chega às tabelas de %. O PCDT DM2 2026 (item 5.5, p. 11) reforça: "Pacientes com DM2 já são classificados como alto risco e, caso também apresentem ... doença arterial coronariana, acidente vascular cerebral ou doença arterial periférica, passam a ser classificados como muito alto risco". O modelo da OMS foi derivado em pessoas sem DCV prévia (40 a 80 anos).
- Por que é grave: um paciente com DCV pode ver "Baixo 3%" na aba que o PCDT manda usar. O alerta "Pelo PCDT DM2 ... alto risco" (`:646-651`) só aparece com diabetes marcado, abaixo dos números, e não existe para DCV nem DRC.
- Recomendação: na aba OMS, replicar as 3 perguntas. Se houver DCV estabelecida (qualquer um dos 5 eventos), mostrar apenas "Muito alto risco (DCV estabelecida); a calculadora não se aplica" e não exibir percentual nem na tabela comparativa. Se houver DRC (adicionar o campo, p. ex. TFGe < 60 ou albuminúria persistente) ou diabetes (com o interruptor ligado), mostrar "Alto risco pelo fluxo HEARTS" e, se quiser manter o %, rotulá-lo como "valor da tabela, não usado para classificar". Idem na linha OMS da comparação.
- Confiança: alta.

---

### RCV-02 [IMPORTANTE] SBC: o "risco extremo" é inflado porque os eventos e condições usam a lista mais larga da Tab. 4.8 e a revascularização conta duas vezes

- Tipo: erro objetivo.
- Onde: `inputs.ts:115-117` (`hasAscvdEvent`), `escalas.ts:132-140` (`eventReasons`), `escalas.ts:177-189` (`extremeConditions`, linha `if (i.revascularization) c.push('Revascularização miocárdica ou ICP')`) e `:193-211`.
- O que o app faz: qualquer um entre SCA, "IAM prévio ou angina estável", "AVC isquêmico ou AIT", revascularização ou DAP já é o "evento maior"; depois, a mesma revascularização marcada volta como "condição de alto risco". Resultado: revascularização isolada, em paciente com diabetes (ou HAS, ou idade ≥ 65), dá 2 condições e portanto EXTREMO (LDL < 40), quando deveria ser muito alto (< 50). O teste `escalas.test.ts:62` (`priorMi + hypertension` com diabetes padrão = extremo) está certo por si, mas não cobre esse caso.
- O que a fonte diz: SBC Tab. 4.2 (p. 41): eventos maiores = "Síndrome coronária aguda recente (nos últimos 12 meses); Histórico de infarto do miocárdio; Histórico de AVC isquêmico; Doença arterial periférica sintomática (histórico de claudicação com índice tornozelo-braquial < 0,85 ou revascularização ou amputação prévia)". Condição de alto risco: "Histórico de cirurgia de revascularização do miocárdio anterior ou intervenção coronária percutânea **fora do(s) evento(s)** cardiovascular(es) aterosclerótico(s) maior(es)" (e a Fig. 5.1 repete "em momento diferente do evento"). A lista usada pelo app (angina estável, AIT, revascularização carotídea/renal/periférica) vem da Tab. 4.8, EMAR-2 (p. 50), que serve para o diabetes e para "muito alto", não para o critério de extremo. Angina estável e AIT não estão entre os "eventos maiores" da Tab. 4.2.
- Recomendação: para o critério de extremo, contar como evento maior apenas SCA em 12 meses, IAM prévio, AVC isquêmico e DAP sintomática (claudicação com ITB < 0,85, revascularização ou amputação). Tratar revascularização coronária/ICP como condição de alto risco somente se for em momento distinto do evento (campo próprio: "revascularização fora do evento maior"). Manter angina estável, AIT e revascularização isolada como "muito alto".
- Confiança: alta para a duplicidade; média para angina estável/AIT (a Tab. 4.2 é literal, mas a diretriz não discute o caso).

---

### RCV-03 [IMPORTANTE] Dado não informado é tratado como ausente; a tela afirma "sem estratificadores" e diz que "cada escala mostra o que falta", o que é falso para SBC, SBD e PCDT

- Tipo: escolha não sinalizada / texto ambíguo.
- Onde: `RiscoSection.tsx:228-231` ("Preencha só o que tiver; cada escala mostra o que falta."); `escalas.ts:239-244` e `:348-355` (razões como `Diabetes, homem < 50 anos, sem estratificadores`); `:69` (tempo de DM nulo = EAR omitido); `:76-77` e `inputs.ts:150-159` (`renalGrid` devolve `sem-dado` e o EAR renal some); `:117` (NT-proBNP nulo).
- O que o app faz: com a tela em branco (só idade e sexo) a SBC mostra "Intermediário: Diabetes, homem < 50 anos, sem estratificadores" ou "Alto" e metas de LDL. Só PREVENT e OMS listam o que falta. Por exemplo, PAS, eGFR e RAC vazios, tabagismo desmarcado e tempo de DM vazio resultam em "sem estratificadores".
- O que a fonte diz: a classificação SBC/SBD depende de a pesquisa de EAR/EMAR ter sido feita (Tab. 4.6 e Quadros 2 e 4). Não há fonte para presumir ausência.
- Recomendação: nas escalas SBC/SBD, trocar "sem estratificadores" por "nenhum estratificador marcado" e exibir um aviso listando o que não foi preenchido e poderia mudar a categoria (tempo de DM, TFGe e RAC, CAC, retinopatia, neuropatia, Lp(a)). Corrigir a frase da linha 229 ou implementar a lista.
- Confiança: alta.

---

### RCV-04 [IMPORTANTE] "Hipertensão arterial" (estratificador de alto risco) não é derivada de "Em uso de anti-hipertensivo" nem da PAS

- Tipo: escolha não sinalizada (risco de subclassificação).
- Onde: `RiscoSection.tsx:243-252`; `escalas.ts:72`, `:104`, `:183`; `inputs.ts:21-23`.
- O que o app faz: são três campos independentes (`hypertension`, `onBpMeds`, `sbp`). Um paciente com anti-hipertensivo marcado e "Hipertensão" desmarcado perde 1 EAR (e, com isso, pode ficar em "intermediário" em vez de "alto", ou em "alto" em vez de "muito alto" com 3 EAR). Idem para a condição de alto risco "Hipertensão arterial" no extremo.
- O que a fonte diz: SBC Tab. 4.6: "Hipertensão arterial tratada ou não"; SBD Quadro 2: "Hipertensão arterial tratada ou não".
- Recomendação: considerar `hypertension || onBpMeds` como HAS e tornar o campo "Hipertensão" apenas confirmatório (ou desabilitar o "uso de anti-hipertensivo" se não houver HAS), com aviso se PAS ≥ 140 e HAS desmarcada.
- Confiança: alta.

---

### RCV-05 [IMPORTANTE] DM1: valor padrão "diagnosticado após os 18 anos" faz DM1 com mais de 20 anos de doença virar "muito alto" sem que o médico tenha escolhido

- Tipo: escolha não sinalizada.
- Onde: `inputs.ts:74` (`dmDiagnosedAfter18: true`); `escalas.ts:85-86` e `:121-122`; `RiscoSection.tsx:267-277` (rádio com "após os 18 anos" já selecionado).
- O que o app faz: DM1 com tempo de doença > 20 anos entra em EMAR automaticamente porque o rádio já vem em "depois". A maioria dos DM1 com mais de 20 anos de doença foi diagnosticada na infância; para eles a regra não se aplica.
- O que a fonte diz: SBC Tab. 4.8 (p. 50) e SBD Quadro 4: "DM1 com duração maior que 20 anos, diagnosticado após os 18 anos de idade".
- Recomendação: iniciar o rádio como "não informado" (e não aplicar a regra enquanto vazio, com aviso), ou exigir resposta. Também: com tempo de DM1 em branco, a mensagem (`:230`, `:340`) afirma "DM1 com menos de 20 anos de doença", o que o médico não informou; trocar por "informe o tempo de doença" quando `dmYears` for nulo.
- Confiança: alta.

---

### RCV-06 [IMPORTANTE] DM1 com ≥ 20 anos de doença e sem EAR: o app aplica a regra de idade do DM2, que a fonte não define para DM1

- Tipo: escolha não sinalizada (fonte omissa).
- Onde: `escalas.ts:225-244` (SBC) e `:335-356` (SBD).
- O que o app faz: DM1 ≥ 20 anos, sem EAR/EMAR, recebe baixo/intermediário/alto por idade e sexo, com metas.
- O que a fonte diz: SBC Tab. 4.5 (p. 48): a faixa etária (Homem < 50 / Mulher < 56) está na coluna DM2; na coluna DM1 consta apenas "Usar a calculadora ST1RE se < 20 anos de duração". SBD Quadro 1: idem ("Homem: < 38 / Mulher: < 46" na coluna DM2; DM1 só "Usar calculadora Steno se DM1 < 20 anos de duração"). Para DM1 ≥ 20 anos sem EAR/EMAR nada é dito.
- Recomendação: para DM1 ≥ 20 anos sem estratificadores, mostrar a categoria de idade apenas como "extrapolação da regra do DM2 (a diretriz não define para DM1)", ou devolver "avaliação individualizada".
- Confiança: média-alta.

---

### RCV-07 [IMPORTANTE] Sem alerta para DRC em diálise (e IC) nas escalas SBC/SBD, apesar de o app recomendar "estatina de alta potência"

- Tipo: omissão de alerta de segurança que a fonte traz.
- Onde: `escalas.ts:299-314` (alvos e texto de estatina), `inputs.ts:150-159` (TFGe < 30 vira "muito alto"), `RiscoSection.tsx` (nenhum campo de diálise ou IC).
- O que o app faz: TFGe < 30 qualquer (inclusive paciente dialítico) vira "muito alto" e mostra "Estatina de alta potência; ezetimiba e/ou iPCSK9...". Não há campo de diálise nem de IC.
- O que a fonte diz: SBD R10: "Em pessoas com DM e INSUFICIÊNCIA RENAL CRÔNICA EM DIÁLISE, sem doença arterial clínica, NÃO ESTÁ RECOMENDADO iniciar estatinas. No entanto, a estatina deverá ser mantida nos indivíduos que já a usavam antes do início da diálise." (Classe III, Nível A); Nota 9: em HD com LDL-c > 145 mg/dL e/ou doença coronariana estabelecida "o início da estatina PODE SER CONSIDERADO". R11: "Em pessoas com DM e insuficiência cardíaca classe NYHA II-IV, com LDL-c < 130 mg/dL, NÃO ESTÁ RECOMENDADO iniciar o uso de estatina...".
- Recomendação: adicionar um aviso fixo nas saídas SBC/SBD quando TFGe < 15 ou diálise ("categoria calculada pelo estratificador renal, mas a SBD não recomenda iniciar estatina em diálise sem doença arterial clínica; ver R10"), e uma nota sobre IC NYHA II-IV (R11). Alternativa: campo "em diálise" que suprime a linha de estatina.
- Confiança: alta.

---

### RCV-08 [IMPORTANTE] Aviso da aba OMS "quem tem DM2 já é de alto risco, qualquer que seja o resultado" aparece para DM1 e para qualquer idade

- Tipo: erro objetivo (generalização indevida).
- Onde: `RiscoSection.tsx:646-651` (condição é só `i.diabetes`).
- O que o app diz: "Pelo PCDT DM2, quem tem DM2 já é de alto risco, qualquer que seja o resultado da calculadora." Aparece também com DM1 selecionado e com 30 ou 80 anos.
- O que a fonte diz: PCDT item 5.5 (p. 11 a 12): "Pacientes com DM2 já são classificados como alto risco" (contexto: "indivíduos com DM2 entre 40 e 74 anos"); "Para indivíduos com idade menor ou igual a 39 anos e maior ou igual a 75 anos, a avaliação ... deve ser individualizada ... Em indivíduos com idade menor ou igual a 39 anos deve-se considerar de alto risco aqueles com nefropatia ou retinopatia. No caso de indivíduos que vivem com DM1, deve-se avaliar o risco cardiovascular de forma individualizada".
- Recomendação: exibir a frase só com `dmType === 'DM2'` e idade 40 a 74; nos demais, "o PCDT pede avaliação individualizada (DM1, ≤ 39 ou ≥ 75 anos)". Note que o mesmo alerta já existe, correto, na visão PCDT (`:603`); falta replicar a condição.
- Confiança: alta.

---

### RCV-09 [IMPORTANTE] PREVENT: a tela não diz que é derivado nos EUA e sem validação/calibração brasileira, e não mostra a divergência entre SBC (PREVENT) e PCDT (HEARTS)

- Tipo: escolha não sinalizada / divergência entre fontes.
- Onde: `RiscoSection.tsx:664-728` (o texto de ajuda cita só os limites e o SDI); `docs/pesquisa-risco-cv.md:16-18,95` mostram que o autor sabe disso, mas a tela não.
- O que o app diz: apresenta "Aterosclerótica (ASCVD) 10 anos X%" com as faixas da SBC. O alerta existente (`:712-716`) cobre apenas o diabetes.
- O que a fonte diz: a SBC (item 4.2, p. 42) reconhece "ainda não dispomos de um escore de risco derivado de dados da população brasileira" e recomenda PREVENT por "robustez e contemporaneidade"; o OMS e o Globorisk-LAC "têm a vantagem de terem sido calibrados para a população brasileira". O PCDT DM2 (p. 11) recomenda HEARTS/OPAS/OMS (40 a 74 anos) que "demonstrou melhor calibração para a população brasileira". Khan 2024 derivou em dados dos EUA (limitações: dados de prontuário, exclusão de valores extremos).
- Recomendação: acrescentar na aba PREVENT: "Equações derivadas e validadas em populações dos EUA; não há validação específica no Brasil. A SBC 2025 o adota para decidir tratamento hipolipemiante; o PCDT DM2 recomenda a calculadora HEARTS/OMS. Os dois podem divergir." Também na tabela comparativa, uma nota de que os resultados vêm de modelos diferentes.
- Confiança: alta.

---

### RCV-10 [IMPORTANTE] Tabela comparativa mistura "categorias" de significados diferentes sem alerta; metas divergentes entre SBC e SBD não são sinalizadas

- Tipo: texto ambíguo / divergência entre fontes.
- Onde: `RiscoSection.tsx:732-777`.
- O que o app faz: lado a lado, "Alto" (SBC), "Alto" (SBD), "Alto" (PCDT) e "10% (alto)" (OMS, que é 10 a 19%). Metas de LDL mostradas apenas para SBC e SBD. Para risco baixo, SBC = < 115 e SBD = < 100.
- O que a fonte diz: categorias OMS/HEARTS: "Baixo < 5%; Moderado 5% a < 10%; Alto 10% a < 20%; Muito alto 20% a < 30%; Crítico ≥ 30%" (texto do aplicativo OPAS); SBC: "alto" = ≥ 20% (PREVENT ASCVD) ou outros critérios; SBD: categorias por idade e estratificadores. "Alto" OMS ≠ "Alto" SBC. Metas: SBC Tab. 5.1 baixo < 115 / SBD Quadro 5 baixo < 100.
- Recomendação: acrescentar rodapé "As categorias não são equivalentes entre as escalas; use a meta da escala que embasa a conduta" e destacar a divergência de meta no risco baixo. Mostrar OMS e PREVENT como "%" sem categoria homônima (ou prefixar "OMS:").
- Confiança: alta.

---

### RCV-11 [IMPORTANTE] O interruptor "Considerar diabetes" pode produzir, para pessoa que tem diabetes, resultado subestimado sem aviso na saída

- Tipo: escolha intencional do usuário, mas apresentada de forma ambígua.
- Onde: `RiscoSection.tsx:202-213`; `escalas.ts:162-163,183,220`; `:129`, `:145`.
- O que o app faz: com o interruptor desligado, para uma pessoa que tem DM: (a) SBC segue o ramo "sem diabetes" (PREVENT + agravantes), com PREVENT e OMS calculados com diabetes = 0; (b) no ramo de evento prévio, a condição "Diabetes" some do critério de extremo (`escalas.ts:183`); (c) SBD e PCDT viram "não se aplica"; (d) os campos de EAR do diabetes ficam ocultos. Nada na saída diz "calculado como se NÃO tivesse diabetes: subestima o risco".
- Efeito por escala: SBC 4.1 só usa "Ausência de DM2" para baixo risco; PREVENT/OMS com diabetes 0 reduzem o risco estimado; o extremo pode virar muito alto.
- Recomendação: quando o interruptor estiver desligado e o painel indicar DM, mostrar em todas as saídas uma faixa "Cálculo ignorando o diabetes (simulação): não usar para decidir conduta". O texto do rótulo ("Desmarque para calcular como pessoa sem diabetes") pode manter, mas acrescentar "o resultado não representa o risco real do paciente com diabetes".
- Confiança: alta.

---

### RCV-12 [IMPORTANTE] Idade sem validação: criança/adolescente, valores decimais e lacuna 39 a 40 no PCDT

- Tipo: borda / ausência de limite.
- Onde: `patient.tsx:67-72` (campo sem min/max, `step=1`, mas aceita decimais digitados); `escalas.ts:377-405` (`age <= 39` e `age >= 75`); `:236-243` e `:346-356`.
- O que o app faz: idade 39,5 cai no ramo "40 a 74" do PCDT (≤ 39 e ≥ 75 são testados, 39,5 não é nem um nem outro) e vira "alto"; idade 15 ou 120 produz categorias SBC/SBD com metas, sem aviso de que as diretrizes se aplicam a adultos. SBC/SBD para adolescente com DM1 ou DM2 exigem outro enfoque (a SBC tem seção própria 4.10 para infância e adolescência).
- O que a fonte diz: PCDT: "menor ou igual a 39 anos" e "maior ou igual a 75 anos", faixa 40 a 74; SBC item 4.10 (infância e adolescência) e 4.9 (adultos jovens, agravantes < 30 anos).
- Recomendação: restringir o campo a inteiros 18 a 120 com mensagem; para < 18 anos, mostrar "escalas para adultos; não se aplica" nas cinco abas. Usar `Math.floor(age)` nos limiares do PCDT.
- Confiança: alta.

---

### RCV-13 [MENOR] Lista de pequenas divergências de limite e de rótulo (fonte x app)

Cada item é pequeno; agrupei para o relatório.

- **Limite de estenose.** Checkbox "Estenose ≥ 50%" (`RiscoSection.tsx:422`) alimenta o EMAR da SBD e da SBC-DM, cujo texto é "Estenose maior do que 50%" (SBC Tab. 4.8, SBD Quadro 4); já a Fig. 4.1/Tab. 4.1 da SBC usa "Obstrução ≥ 50%" (`escalas.ts:213`, correto para o ramo geral). Em exatamente 50% a SBD sairia "muito alto" por EMAR, contra "> 50%" da fonte. Sugestão: rótulo "Estenose ≥ 50% (SBC) / > 50% (SBD)" ou campo percentual.
- **Placa carotídea.** App: "< 50% ou EIMC ≥ 1,5 mm" (`:427`); SBD Quadro 2: "Placa carótida (espessura íntima média > 1,5 mm)"; SBC Tab. 4.6: "Placa carótida < 50%"; SBC item 4.5.2 define placa difusa como EIMC ≥ 1,5 mm. Divergência de > versus ≥ entre as fontes.
- **ITB.** Checkbox "Índice tornozelo-braquial alterado" (`:442`) sem corte; SBD Quadro 2: "Índice tornozelo braquial < 0,9"; SBC Tab. 4.2 usa ITB < 0,85 para DAP sintomática. Mostrar "< 0,9" no rótulo e que é EAR só na SBD.
- **Tabagismo.** Rótulo "Tabagismo atual / ativo" sem definição; SBD Quadro 2, nota §: "tabagismo vigente definido quando o último episódio ocorreu há menos de um ano". Acrescentar a definição.
- **NT-proBNP "idosos".** App usa ≥ 60 anos (`escalas.ts:117`) para o corte de 190 pg/mL; a SBD diz só "≥ 125 pg/ml (adultos); ≥ 190 pg/ml (idosos)", sem idade. Escolha não sinalizada na tela; a SBC não recomenda NT-proBNP para estratificação (item 4.4.4), o que explica a diferença entre as duas listas de EAR. Sinalizar.
- **Tempo de DM.** App: "> 10 anos" (`escalas.ts:69`), igual às tabelas (SBC Tab. 4.6 e SBD Quadro 2: "DM2 há mais de 10 anos"); o texto da SBC (item 4.6) diz "risco substancialmente aumentado quando ≥ 10 anos". Divergência interna da fonte; escolha correta pela tabela, mas pode valer nota.
- **Mulher, 56 anos (SBD).** Quadro 1 grafa intermediário "Mulher: 46-56" e alto "Mulher: 56 ou mais"; o texto diz "superior a 56 anos". O app trata 56 como alto (coerente com SBC "≥ 56"). Divergência interna da SBD, registrada.
- **"> 3 EAR" (SBD Quadro 1) vs "3 ≥ EAR" (SBC Tab. 4.1) vs "Três ou mais EAR" (Quadro 4 e Tab. 4.8).** O app usa ≥ 3 (correto pelas tabelas de EMAR e pelo texto "até dois EAR = alto").
- **LDL = 190 no diabetes (SBC).** EMAR é "LDL-c > 190" (Tab. 4.8); LDL-c ≥ 190 é "alto" na Tab. 4.1 e na Fig. 4.1, mas a Fig. 4.1 desvia o diabetes antes. Com LDL exatamente 190 e sem EAR, o app (`escalas.ts:89`) dá a categoria só por idade (pode ser "intermediário"). Pequeno vazio da fonte.
- **LDL > 190 e HF na SBD.** SBD R9: "adultos com diabetes e LDL-c acima de 190 mg/dL, com hipercolesterolemia familiar (HF) confirmada ... sejam considerados de MUITO ALTO RISCO", enquanto o Quadro 2 lista "LDL > 190" como EAR (alto) e o Quadro 4 lista HF confirmada como EMAR. O app segue os quadros. SBC trata LDL > 190 (ou CT > 310) como EMAR. Divergência entre as fontes (SBC x SBD), a registrar na tela.
- **Meta de não-HDL SBD, risco alto.** Quadro 5: < 100; texto de R4: "colesterol não-HDL abaixo de 80 mg/dL". O app usa < 100 (`escalas.ts:307`), coerente com Quadro 5 e com +30 do LDL, mas a fonte se contradiz.
- **Renal.** SBD Quadro 3 (grade) e Quadro 4 (texto) divergem nos limites 30 e 45 de TFGe: Quadro 4 diz "TFGe ≤ 45 + RAC 30-300" e "TFGe ≤ 30" como EMAR; a grade põe TFGe 45 a 59 em G3a (alto) e G4 em "29-15". `renalGrid` segue a grade (`inputs.ts:152-158`); TFGe = 30 e = 45 exatos ficam como "alto" quando o texto do Quadro 4 daria muito alto. Divergência interna; registrar.
- Confiança: alta nos limites literais; média quanto à gravidade clínica.

### RCV-14 [MENOR] Texto da conduta do risco muito alto da SBD simplificado demais

- Tipo: texto ambíguo.
- Onde: `escalas.ts:312` ("Estatina de alta potência; ezetimiba e/ou iPCSK9 se a meta não for atingida").
- O que a fonte diz: SBD Quadro 6: "Estatinas de alta potência inicial e ezetimiba e/ou iPCSK9 (opcional, se meta não atingida)"; R2: ezetimiba "DEVE SER CONSIDERADA" (IIa, B); R3: iPCSK9 "PODE SER CONSIDERADO" apenas se a meta não foi atingida "com estatina de alta potência, na máxima dose tolerada, e em associação com ezetimiba" (IIb, A), com análise de custo-benefício.
- Recomendação: "Estatina de alta potência. Se a meta não for atingida com a dose máxima tolerada: considerar ezetimiba (IIa); depois, se ainda não atingida, pode-se considerar iPCSK9 (IIb)".
- Confiança: alta.

### RCV-15 [MENOR] SBC risco baixo: limiar de tratamento "≥ 145" em vez de "acima de 145"

- Onde: `escalas.ts:164` ("fármaco só com LDL-c persistentemente ≥ 145 mg/dL"). SBC item 5.1 (p. 52): "níveis de LDL-c persistentemente acima de 145 mg/dL". Corrigir para "> 145".
- Confiança: alta.

### RCV-16 [MENOR] PREVENT: faixas e descarte silencioso de HbA1c e RAC fora da faixa; falta pergunta de insuficiência cardíaca

- Tipo: escolha não sinalizada.
- Onde: `prevent.ts:27-36`, `:65-75`, `:95-96`; `RiscoSection.tsx:719-727`; `:666-670`.
- Faixas do app: idade 30 a 79; CT 130 a 320 mg/dL; HDL 20 a 100; PAS 90 a 180; TFGe 15 a 140; IMC 18,5 a 39,9; HbA1c 4,5 a 15; RAC 0,1 a 25.000. Conferido com Khan 2024 (métodos): idade "30 to 79 years without known ASCVD or HF"; exclusão de "SBP < 90 or > 200 mm Hg, TC < 130 or > 320 mg/dL, and HDL-C < 20 or > 100 mg/dL" e de "BMI < 18.5 or ≥ 40.0". A PAS do app (até 180) é mais estrita que o artigo (200); o pacote preventr e a calculadora usam 180 (ver `prevent-out/prevent-model.md`). O limite de HbA1c 4,5 é escolha do pacote (o modelo original permite 3 a 15). TFGe 15 a 140 e RAC 0,1 a 25.000: não achei no artigo; vêm do pacote.
- Problema 1: HbA1c ou RAC fora da faixa são tratados como ausentes sem aviso (`inRange` em `selectModel`). Se HbA1c = 4,2%, a tela diz "Modelo usado: básico" e o médico não sabe que o dado foi descartado. Idem RAC = 0.
- Problema 2: o PREVENT foi derivado em pessoas "without known ASCVD or HF"; a tela pergunta DCV aterosclerótica, mas não insuficiência cardíaca. O bloco de DCV (`:669`) diz apenas "é para quem não tem doença cardiovascular estabelecida".
- Recomendação: avisar "HbA1c/RAC fora da faixa do modelo; ignorado" e adicionar "insuficiência cardíaca conhecida" ao aviso de não aplicação.
- Confiança: alta (comportamento); média (peso clínico).

### RCV-17 [MENOR] CKD-EPI 2021 versus a fórmula citada no PCDT

- O app calcula a TFGe pela CKD-EPI 2021 sem raça (`inputs.ts:132-143`). A fórmula confere com Inker 2021 (142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1,200 × 0,9938^idade × 1,012 se mulher; κ 0,7/0,9; α −0,241/−0,302) e os dois testes do `escalas.test.ts:25-29` conferem à mão (92 e 99). O PCDT (Quadro 5, nota a, p. 10) traz a fórmula de 2009 com fator para raça negra. Divergência de versão; a escolha do app é a atual e adequada ao PREVENT (que usa a 2021). Sugestão: citar "CKD-EPI 2021 (Inker, NEJM 2021)" na dica do campo, já existe em parte (`:297`). Sem unidade alternativa: criatinina em µmol/L digitada como mg/dL produz TFGe absurda sem alerta. Sugestão de validação (creatinina plausível 0,3 a 15 mg/dL).
- Confiança: alta.

### RCV-18 [MENOR] Cobertura dos testes

- `escalas.test.ts` não cobre: EAR/EMAR renais (apenas a grade), CAC 10 a 300 em diabetes, extremo com revascularização isolada (RCV-02), DM1 (≥/< 20 anos, após 18), NT-proBNP, Lp(a), bordas do PCDT (39/40/74/75) e `sbd2026` com EMAR. `escalas.test.ts:62` valida "extremo" com `priorMi + hypertension` e diabetes padrão: correto na leitura literal, mas o teste não distingue o caso de evento menor (angina estável, AIT). `prevent.test.ts` e `who2019.test.ts` reproduzem os vetores do pacote R e as 2.100 células OPAS, o que valida a implementação contra a referência, não contra o suplemento do artigo (ver abaixo).
- Os valores esperados dos testes existentes batem com as fontes (nenhum "verde errado" encontrado).

### RCV-19 [MENOR] `docs/` desatualizados

- `docs/pesquisa-risco-cv.md` contém afirmações já superadas: "[?] O capítulo de risco CV da diretriz da SBD não foi lido", "[?] As variáveis exatas, os cortes e o tratamento do diabetes [HEARTS] não foram verificados", e a seção "Comparação com a tela atual" (diz que falta a categoria extremo e as metas). `docs/risco-cv.md` afirma que "o PCDT de Dislipidemia (2019) não foi lido". Atualizar para evitar que o próximo leitor acredite em lacunas já fechadas. O `docs/risco-cv.md` descreve o fluxo da SBC e as escolhas de interpretação corretamente, mas não menciona o fluxo de três perguntas do HEARTS (RCV-01).
- Confiança: alta.

### RCV-20 [MENOR] Redação das mensagens de tela

- `escalas.ts:236`, `:346`: "Informe a idade." com `applicable: true` mostra a mensagem sem a categoria; funcional.
- `RiscoSection.tsx:643` "A calculadora vale de 40 a 74 anos; fora disso o valor é só ilustrativo." Correto (PCDT, p. 11; artigo OMS derivado em 40 a 80). Para idade < 40 o app consulta a célula "< 45" com valor representativo de 42,5 anos (`who2019.ts:92,97-101`): numericamente é "ilustrativo", como diz a tela.
- `RiscoSection.tsx:615-617`: "Risco moderado em 10 anos (infarto, AVC ou morte cardiovascular)." Descrição do desfecho confere com o texto OPAS ("infarto, acidente vascular cerebral ou morte de origem cardiovascular em 10 anos").
- Sem achado adicional além do item acima.

---

## Conferido e correto

SBC 2025 (`dl/sbc.txt`, `dl/p41.png`):

- Estrutura do fluxo da Fig. 4.1 (p. 41): evento prévio, depois obstrução ≥ 50%/CAC > 300, depois DM2, depois aterosclerose subclínica/LDL ≥ 190/Lp(a), depois PREVENT. Ordem de `sbc2025` bate.
- Tab. 4.1 (p. 40): baixo < 5% sem agravante e sem DM2; intermediário 5 a < 20% sem agravante; alto ≥ 20%, 5 a < 20% com agravante, < 5% com agravante vira intermediário (Fig. 4.1: "< 5% > LDL 160-189 / fator agravante > intermediário"), LDL ≥ 190 alto, Lp(a) > 180 mg/dL (> 390 nmol/L) alto, aterosclerose subclínica alto (placa carotídea < 50%, CAC > 100 UA ou percentil > 75, placa em angio-TC < 50%, AAA), CAC > 300 e obstrução ≥ 50% muito alto. Todos conferem com `escalas.ts:213-294`.
- CAC > 100 em hipercolesterolemia familiar = muito alto (Tab. 4.4, p. 46): `escalas.ts:216-217`.
- Tab. 4.3 (agravantes, p. 43): lista de `AGGRAVATORS` e corte de Lp(a) ≥ 50 mg/dL ou ≥ 125 nmol/L conferem; PCR-us ≥ 2,0 mg/L, menarca ≤ 12 ou ≥ 17, ≥ 3 perdas, menopausa precoce < 40.
- Tab. 4.5 (p. 48): DM2 homem < 50 / mulher < 56 = intermediário; ≥ 50 / ≥ 56 = alto; qualquer idade com 1 ou 2 EAR = alto (a SBC grafa "Alto" para o conjunto, Fig. 4.1 "qualquer idade com 1 ou 2 EAR e sem EMAR"); EMAR ou ≥ 3 EAR = muito alto. DM1 < 20 anos sem estratificador: calculadora ST1RE.
- Tab. 4.6 (p. 49): EAR tradicionais, renal, DASC (CAC 10 a 300; placa carotídea < 50%; angio-TC < 50%; AAA).
- Tab. 4.7 (p. 49): grade TFG × albuminúria bate com `renalGrid` (testes `escalas.test.ts:31-39` conferidos linha a linha).
- Tab. 4.8 (p. 50): EMAR-1 (≥ 3 EAR; DM1 > 20 anos e diagnóstico após 18; estenose > 50%; EMAR renal; CT > 310 ou LDL > 190; neuropatia autonômica instalada; retinopatia moderada-grave/proliferativa/em progressão).
- Tab. 5.1 (p. 52) e Fig. 5.1: LDL < 115/100/70/50/40; não-HDL < 145/130/100/80/70 (= LDL + 30, texto do item 5.1); ApoB < 100/90/70/55/45; redução ≥ 30% (baixo, intermediário) e ≥ 50% (alto, muito alto, extremo). `SBC_TARGETS` confere.
- PREVENT como escore de 10 anos de ASCVD, 30 a 79 anos (item 4.2): `PREVENT_LIMITS.age` e texto.
- Tab. 4.2 "condições de alto risco": idade ≥ 65, HF, revascularização fora do evento, DM, HAS, DRC (TFGe 15 a 59), tabagismo atual, LDL ≥ 100 apesar de estatina máxima + ezetimiba, evento < 2 anos: `extremeConditions` confere (exceto a duplicidade da revascularização, RCV-02).

SBD 2026 (`dl/sbd_tables.txt`, `dl/sbd.txt`):

- Quadro 1: baixo (homem < 38, mulher < 46), intermediário (homem 38 a 49, mulher 46 a 56), alto (homem ≥ 50, mulher ≥ 56, ou 1 a 2 EAR), muito alto (EMAR ou ≥ 3 EAR). `sbd2026` confere, com a ressalva do limite 56.
- Quadro 2 (EAR): DM2 > 10 anos, HF de DAC prematura, SM IDF, HAS tratada ou não, tabagismo, neuropatia incipiente (1 TAC alterado), retinopatia NP leve, LDL > 190, renais (TFGe 30 a 59 ou TFGe > 45 com RAC 30 a 300), placa carotídea, angio-TC, ITB < 0,9, AAA, CAC > 10, Lp(a) ≥ 50 mg/dL ou ≥ 125 nmol/L, NT-proBNP ≥ 125/190. `sbdDiabetesStrat` confere.
- Critérios IDF da síndrome metabólica na legenda do checkbox (circunferência ≥ 94/≥ 80; TG ≥ 150; HDL < 40/< 50; PA ≥ 130/85 ou tratamento; glicemia ≥ 100) conferem com a nota ‡ do Quadro 2.
- História familiar: "pai, mãe ou irmãos antes dos 55 (H) ou 65 (M)" confere com a nota †.
- Quadro 4 (EMAR-1/EMAR-2), incluindo HF confirmada e neuropatia grave (2 testes).
- Quadro 5 e Quadro 6: LDL < 100/100/70/50 e não-HDL < 130/130/100/80; redução inicial 30% (intermediário) e 50% (alto e muito alto) conforme nota do Quadro 5; potência das estatinas por categoria. `SBD_TARGETS` confere.

PCDT DM2 2026 (item 5.5, p. 10 a 12):

- 40 a 74 anos: alto; com DAC, AVC ou DAP: muito alto. ≤ 39 e ≥ 75: individualizado; ≤ 39 com nefropatia ou retinopatia: alto; DM1: individualizado; "a estratificação de risco cardiovascular não altera a conduta terapêutica para DM2"; estratificação anual. Todas implementadas em `pcdt2026` e `RiscoSection.tsx:603-607`. Portaria SCTIE/MS nº 13, 21/02/2026 confere.

OMS/HEARTS (`who-src/paho/main.js`, `who-out`):

- Categorias OPAS: Baixo < 5%; Moderado 5 a < 10%; Alto 10 a < 20%; Muito alto 20 a < 30%; Crítico ≥ 30%. Conferido no código (`f>=30 Critical; f>=20 Very high; f>=10 High; f>=5 Moderate`) e no texto de ajuda. `whoCategory` confere.
- Faixas e valores representativos (idade < 45, 45 a 49, ... ≥ 70; PAS < 120/140/160/180; CT 4/5/6/7 mmol/L; IMC 20/25/30/35) e conversão 38,67 mg/dL por mmol/L: conforme `who2019-model.md`, com 2.100 células reproduzidas sem divergência (teste de células).
- Parâmetros do `who2019.params.json` idênticos aos de `who-out/who2019-params.json` (coeficientes e recalibração América Latina Tropical 2017). O S0 do artigo (0,954/0,985/0,989/0,989) confere; a validação independente dos coeficientes contra o apêndice do artigo não foi possível.
- Aplicável a 40 a 74 anos (PCDT; alerta `outsideAge`).
- Modelo "sem exames" não usa diabetes e a tela diz isso (`:638`).

PREVENT:

- Equações de termos (`prevent.ts:77-132`): idade (idade−55)/10; não-HDL em mmol/L menos 3,5 (fator 0,02586 = 1/38,67); HDL (mmol/L × − 1,3)/0,3; PAS < 110 e ≥ 110 com (·−110)/20 e (·−130)/20; IMC < 30 e ≥ 30 com (·−25)/5 e (·−30)/5; TFGe < 60 e ≥ 60 com (·−60)/−15 e (·−90)/−15; HbA1c − 5,3; ln(RAC); indicadores de dado ausente; SDI ausente no modelo completo. Confere com `prevent-out/prevent-model.md` e reproduz 40 casos do pacote.
- Errata de HbA1c (14/10/2026, doi 10.1161/CIR.0000000000001491, preventr 0.12.1): afeta apenas os modelos `hba1c` e `full`; o coeficiente "HbA1c no DM" passa a valer só para quem tem diabetes e o "sem DM" para os demais. No JSON, `hba1c_dm` e `hba1c_no_dm` estão como no `prevent-out/prevent-coefficients.json` (comparei todos os valores numéricos, sem diferença), e `terms()` aplica `hba1c_dm` se `dm` e `hba1c_no_dm` caso contrário (`prevent.ts:124-125`). Aplicação correta.
- Seleção do modelo (base, hba1c, uacr, full com SDI ausente) conforme o pacote; horizonte de 30 anos apenas até 59 anos conforme o pacote e Khan 2024.
- Unidades: colesterol mg/dL, HbA1c % (NGSP), RAC mg/g, TFGe mL/min/1,73 m². Conferem.
- IMC fora de 18,5 a 39,9: DCV total e IC não calculados, ASCVD continua (coeficiente de IMC nulo no ASCVD). Conforme exclusão do artigo (< 18,5 ou ≥ 40).
- Faixas de decisão SBC aplicadas ao ASCVD 10 anos (< 5%, 5 a < 20%, ≥ 20%): conferem com a Tab. 4.1.

---

## Não consegui verificar

- **Coeficientes do PREVENT (Tab. S12 do suplemento) e a errata original.** O suplemento (`dl/supp.zip`) e a calculadora da AHA não foram baixáveis (arquivo de 297 bytes, não é zip). Verifiquei apenas: igualdade com `prevent-out/prevent-coefficients.json` (derivado do preventr 0.12.2), a plausibilidade dos pares `hba1c_dm`/`hba1c_no_dm` e a NEWS do preventr descrevendo a errata. Os 40 vetores de teste vêm do mesmo pacote, então não são independentes.
- **Coeficientes da OMS 2019 contra o apêndice do artigo (mmc1/mmc2).** Os PDFs em `who-src/pmc` são páginas de verificação (não são PDF). A conferência é indireta: S0 da Tabela 2 do artigo e reprodução das 2.100 células da calculadora OPAS.
- **PCDT de Dislipidemia (2019)**, citado pelo PCDT DM2 e mencionado em `docs/risco-cv.md`: não li, e o app só o cita.
- **Globorisk-LAC e Steno T1 Risk Engine:** não implementados (declarado em `docs/risco-cv.md`); a SBC indica o Steno para DM1 < 20 anos sem estratificadores e o app apenas avisa.
- **Conteúdo de interface não renderizado:** li o código de `RiscoSection.tsx`; não executei a aplicação para ver o layout ou as regras CSS dos rótulos.
