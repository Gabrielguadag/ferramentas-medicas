# Revisão 2 — área RCV (risco cardiovascular)

Arquivos revisados (repo `c:\Smedic\ferramentas-diabetes`): `src/risco/escalas.ts`, `inputs.ts`, `prevent.ts`, `who2019.ts`, `RiscoSection.tsx`, `escalas.test.ts`, `prevent.test.ts`, `who2019.test.ts`, `prevent.coefficients.json`, `prevent.vectors.json`, `who2019.params.json`, `docs/risco-cv.md`, `docs/pesquisa-risco-cv.md`, `src/glargina/patient.tsx` (IMC e idade que entram nas escalas).

Fontes (`<S>` = scratchpad):

- SBC 2025, Rached et al., Arq Bras Cardiol 2025;122(9):e20250640: `<S>/dl/sbc.txt` (Tab. 4.1 p.40; Fig. 4.1 e Tab. 4.2 p.41; Tab. 4.3 p.43; texto do CAC p.46; Tab. 4.5 p.48; Tab. 4.6 e 4.7 p.49; Tab. 4.8 p.50; Tab. 5.1 p.52; Fig. 5.1 p.53; recomendações de gestação na seção de dislipidemia na gestação).
- SBD 2026, "Manejo do risco cardiovascular: dislipidemia" (Quadros 1–8, R1–R18, notas 1–8): `<S>/dl/sbd.txt`, `sbd_tables.txt`, `sbd.html`.
- PCDT DM2 2026 (Portaria SCTIE/MS nº 13, 21/02/2026), item 5.5, p.10–12 e item 8 (avaliação anual): `<S>/dl/pcdt.txt`.
- OMS/OPAS: código do app HEARTS/OPAS `<S>/who-src/paho/main.js` (funções de faixa/categoria, fluxo das 3 perguntas, validação de entradas), `<S>/who-src/paho_tables.json`, `<S>/who-out/who2019-model.md`.
- PREVENT: Khan et al., Circulation 2024;149:430–449 (`<S>/dl/khan2.html.txt`), `<S>/prevent-out/*` e fonte do pacote `preventr` 0.12.2 (`<S>/prevent-src/preventr`), FAQ da AHA de 14/10/2026 (`<S>/dl/faq.txt`).

Resumo: 0 CRÍTICO, 7 IMPORTANTE, 9 MENOR. O núcleo das regras (SBC, SBD, PCDT, equações PREVENT e OMS) está fiel às fontes; os achados são de borda, validação de entrada, apresentação e cobertura de teste.

---

## Achados

### RCV2-01 — IMPORTANTE — Aba OMS mostra "Baixo/Moderado" (verde) para diabético fora de DM2 40–74 anos; o fluxo oficial HEARTS classifica qualquer diabetes como Alto

- Tipo: escolha não sinalizada (a divergência com o fluxo oficial é só explicada no docs/).
- Onde: `escalas.ts:475-482` (`omsPreclass` só pré-classifica DM2 de 40 a 74); `RiscoSection.tsx:699-722` (resultado com % e categoria; aviso azul "Com diabetes tipo 1, ou fora de 40 a 74 anos, o PCDT pede avaliação individualizada."); `RiscoSection.tsx:854-863` (tabela comparativa mostra "N% (baixo)"). Para DM1 de 50 anos, ou DM2 de 35 ou 80 anos, a tela mostra p.ex. "Risco baixo em 10 anos" em tom verde. O modelo "Sem exames (IMC)" ainda diz "Não considera diabetes."
- Fonte: app OPAS (`main.js`, tela de resultado): `L||O ? ...high_risk (highCVDRisk = "Paciente de Alto Risco") : T ? ...very_high_risk`; `L` é a resposta "Tem diabetes mellitus?", sem restrição de idade nem de tipo. PCDT 5.5 (p.11-12): DM2 de 40–74 já é alto risco; "≤ 39 anos e ≥ 75 anos: avaliação individualizada"; "DM1: avaliar de forma individualizada".
- Problema: o PCDT manda individualizar, a calculadora oficial diz "Alto risco", e o app mostra um percentual baixo e um selo verde. Um médico apressado lê o selo e ignora o aviso.
- Recomendação: quando `i.diabetes` for verdadeiro e a pré-classificação não valer (DM1, < 40, > 74), não mostrar categoria colorida de risco baixo/moderado. Mostrar "Pessoa com diabetes: avaliação individualizada (PCDT)" e o percentual, se mantido, só como "valor de referência, subestima o risco no diabetes" em tom neutro. Na tabela comparativa, trocar por "Individualizada".
- Confiança: alta.

### RCV2-02 — IMPORTANTE — Nota de diálise (SBD R10) disparada por TFGe < 15, que não é o mesmo que diálise

- Tipo: erro objetivo.
- Onde: `escalas.ts:217-227`. Texto exibido: "TFGe < 15 (diálise): a SBD não recomenda iniciar estatina em diálise sem doença arterial clínica; se já usava, manter. Avaliação individualizada."
- Fonte: SBD R10: "Em pessoas com DM e INSUFICIÊNCIA RENAL CRÔNICA EM DIÁLISE, sem doença arterial clínica, NÃO ESTÁ RECOMENDADO iniciar estatinas. No entanto, a estatina deverá ser mantida nos indivíduos que já a usavam antes do início da diálise." (Classe III, A). O Quadro 3 separa G5 (< 15, "falência renal") de diálise.
- Problema: paciente com TFGe 12 que ainda não está em diálise recebe a mensagem de que não se recomenda iniciar estatina. Isso pode retirar uma estatina indicada (a SBD, no mesmo quadro, classifica TFGe < 30 como muito alto risco). Também aparece sem o filtro "sem doença arterial clínica" quando há evento marcado.
- Recomendação: não inferir diálise pela TFGe. Ou criar a caixa "Em diálise" e disparar a nota só com ela e sem evento cardiovascular marcado, ou reescrever: "Se a pessoa está em diálise e não tem doença arterial clínica: não iniciar estatina (SBD R10); se já usava, manter."
- Confiança: alta.

### RCV2-03 — IMPORTANTE — Cortes de colesterol da OMS/HEARTS em mg/dL divergem do app oficial em 193, 232 e 270 mg/dL

- Tipo: erro objetivo (pequeno, mas o doc afirma equivalência com a calculadora).
- Onde: `who2019.ts:43-44` (`MG_DL_PER_MMOL = 38.67`), `who2019.ts:103-104` (`cholBand` em mmol/L), `who2019.ts:145-146`. O comentário diz "cortes 155/193/232/270 mg/dL = 4/5/6/7 mmol/L".
- Fonte: app OPAS, função `Or`: `s<155?1:s<193?2:s<232?3:s<270?4:5` (aplicada ao valor em mg/dL).
- Problema: com a conversão por 38,67, 193 mg/dL vira 4,991 mmol/L (faixa 2 em vez de 3), 232 vira 5,999 (faixa 3 em vez de 4) e 270 até 270,6 vira 6,98 (faixa 4 em vez de 5). Simulei 100–330 mg/dL em passos de 0,5: só 193, 232, 270 e 270,5 divergem. O teste das 2.100 células não pega isso porque só testa as células, e o teste "consulta por faixas" usa 5,5×38,67 (meio da faixa). O IMC do painel também é arredondado a 1 casa (`patient.tsx:61-64`), enquanto o app OPAS usa peso/altura sem arredondar; efeito de borda só em IMC próximo de 20/25/30/35.
- Recomendação: comparar direto em mg/dL (`<155`, `<193`, `<232`, `<270`) como a calculadora, com teste nos valores 154, 155, 192, 193, 231, 232, 269, 270.
- Confiança: alta.

### RCV2-04 — IMPORTANTE — Aba OMS (e a geral) não valida faixas de entrada; a calculadora oficial valida

- Tipo: escolha não sinalizada / segurança de entrada.
- Onde: `RiscoSection.tsx:144-166` (`whoLab`/`whoNonLab` aceitam qualquer PAS e colesterol; os `NumberField` de PAS, colesterol, HDL e LDL não recebem `min`/`max`); só o PREVENT valida (`prevent.ts:27-63`).
- Fonte: app OPAS: `Ir(F,40,75)` (idade), `Ir(y,90,200)` (PAS), colesterol `[140,300] mg/dL` (`J=[140,300,"mg/dl"]`), IMC com limites próprios; fora da faixa o app não calcula.
- Problema: erro de unidade (colesterol 5,2 em mmol/L) cai na faixa 1 e a tela mostra "Baixo" sem alerta. PAS 60 ou 300 e CT 900 também calculam. As escalas SBC/SBD/PCDT também usam LDL e CT sem faixa plausível (CT > 310 é EMAR no DM).
- Recomendação: validar PAS (90–200), CT (140–300 na OMS), HDL, LDL e TFGe com mensagem "confira a unidade" e não calcular fora da faixa, como o PREVENT já faz.
- Confiança: alta.

### RCV2-05 — IMPORTANTE — Omissão do alerta de segurança de estatina na gestação

- Tipo: omissão de alerta que a fonte traz.
- Onde: `escalas.ts:392-408` (metas SBD com "Estatina de alta potência"), `RiscoSection.tsx:584-598` (bloco de metas); nenhuma menção a gestação na área.
- Fonte: SBD "Nota importante 7: Gestantes": "Estatinas estão contra indicadas em gestantes. O uso de estatinas em mulheres na menacme, quando indicado, deve ser feito com cautela e com medidas contraceptivas adequadas." SBC (dislipidemia na gestação): "Para mulheres em planejamento de engravidar, em uso prévio de estatina, recomenda-se a favor de interromper a estatina 60 dias antes da concepção" e "Para gestantes em uso de estatina, recomenda-se a favor de suspensão imediata do medicamento".
- Problema: a tela recomenda estatina de alta potência para mulheres de qualquer idade, sem a linha de segurança. Como a ferramenta tem a área Gestante no mesmo produto, a omissão fica mais visível.
- Recomendação: uma linha fixa no bloco de metas quando `sex === 'F'` e idade < 50: "Estatina é contraindicada na gestação; em mulher em idade fértil, orientar contracepção e suspender se planejar engravidar (SBD, nota 7; SBC)."
- Confiança: alta.

### RCV2-06 — IMPORTANTE — "Nefropatia" do PCDT é uma caixa manual, sem definição e desligada da TFGe/albuminúria já informadas

- Tipo: escolha não sinalizada.
- Onde: `RiscoSection.tsx:515-519` (rótulo "Nefropatia (PCDT, ≤ 39 anos)"), `escalas.ts:504-513`. Aparece em todas as idades e dentro do grupo de estratificadores do diabetes.
- Fonte: PCDT 5.5 (p.12): "Em indivíduos com idade menor ou igual a 39 anos deve-se considerar de alto risco aqueles com nefropatia ou retinopatia." Não define nefropatia.
- Problema: paciente ≤ 39 anos com TFGe 45 e RAC 200 digitados, sem marcar a caixa, sai como "Avaliação individualizada" em tom neutro. Subtriagem silenciosa. Para os demais idades a caixa não tem efeito, e isso não está dito.
- Recomendação: derivar automaticamente de `renalGrid(egfr, uacr)` ser "alto" ou "muito-alto" (ou TFGe < 60 ou RAC ≥ 30), mantendo a caixa para quem não tem exame. Rótulo: "Nefropatia diabética (TFGe < 60 ou albuminúria ≥ 30 mg/g)". Texto "usado só até 39 anos".
- Confiança: média (a definição é escolha de interface).

### RCV2-07 — IMPORTANTE — Verificação do PREVENT é circular e não cobre o ramo sem diabetes nem o termo corrigido pela errata

- Tipo: lacuna de teste / verificação.
- Onde: `prevent.test.ts`, `prevent.vectors.json`, `prevent.ts:124-126`; `docs/risco-cv.md` ("40 casos... reproduzidos").
- Achado: os 40 vetores vêm dos testes do próprio pacote `preventr`, de onde vêm também os coeficientes (conferi: o JSON do app é idêntico ao extraído do pacote). Em todos os 40, `dm = 1` (contagem: partial 12/12 e snapshots 28/28). Nenhum caso com diabetes = 0, logo nenhum exercita `hba1c_no_dm`, justamente o termo cuja atribuição a errata de 14/10/2026 trocou, e o ramo sem diabetes é o que a SBC usa para classificar (`RiscoSection.tsx:169`). Também não há caso com o modelo `full` e sem diabetes. O suplemento oficial (Tabelas S12) e a calculadora da AHA não foram conferidos (docs/risco-cv.md admite).
- Fonte: FAQ da AHA (14/10/2026): a correção vale só para os modelos com HbA1c ("HbA1c add-on" e "full"); base e UACR não mudam; "Treatment should not be started, stopped, or changed based solely on this correction."
- Recomendação: antes de usar o PREVENT como base da SBC no sem-diabetes com HbA1c, conferir pelo menos 2 casos com `dm=0` e HbA1c contra a calculadora oficial/planilha corrigida; até lá, marcar "valores com HbA1c ainda não conferidos" no docs/. Os modelos base e UACR (sem HbA1c) não são afetados.
- Confiança: média.

### RCV2-08 — MENOR — PREVENT: o limiar usa o valor não arredondado e a tela mostra uma casa decimal

- Tipo: erro objetivo (borda).
- Onde: `escalas.ts:370-381` (`pct >= 5`, `pct >= 20`) e `RiscoSection.tsx:79` (`fmt(v*100, 1)`); texto de motivo "PREVENT ASCVD 10 anos 5,0% (< 5%), sem agravantes".
- Problema: 4,96% aparece como "5,0%" e é classificado como "< 5%" (risco baixo). A calculadora AHA e o pacote arredondam a 0,1% (ou 0,001 na fração). Valores 19,95–19,99% ficam como "20,0%" e "5 a < 20%".
- Recomendação: arredondar a 1 casa (`roundHalfUp3`) antes de comparar com 5 e 20, assim o número exibido e a categoria coincidem.
- Confiança: alta (efeito raro).

### RCV2-09 — MENOR — Aba PREVENT mostra as faixas da SBC de forma simplificada, com semáforo verde para < 5%

- Tipo: escolha não sinalizada.
- Onde: `RiscoSection.tsx:756-762`: "Faixas da SBC 2025: < 5% baixo; 5 a < 20% intermediário; ≥ 20% alto." e tom `ok` para < 5%.
- Fonte: SBC Fig. 4.1 / Tab. 4.1: < 5% é baixo só "sem agravante" e com LDL < 160 (senão intermediário); 5 a < 20% com agravante é alto; diabetes não usa o PREVENT.
- Recomendação: trocar por "Categoria final (com agravantes e LDL): veja a aba SBC" ou omitir o semáforo.
- Confiança: alta.

### RCV2-10 — MENOR — PCDT: ≥ 75 anos e DM1 sem as medidas que o PCDT lista; ≤ 39/≥ 75 com doença cardiovascular aparece só como "individualizada"

- Tipo: omissão / opinião clínica.
- Onde: `escalas.ts:493-499` (DM1), `524-531` (≥ 75), `514-522` (≤ 39 traz a frase de autocuidado).
- Fonte: PCDT p.12: "Para indivíduos com idade menor ou igual a 39 anos e maior ou igual a 75 anos, a avaliação do risco cardiovascular deve ser individualizada com recomendação da adoção do autocuidado apoiado, da alimentação adequada e saudável, da prática regular de atividade física, da cessação do tabagismo e da redução do consumo de álcool."
- Problema: a frase só aparece em ≤ 39. Quem tem infarto prévio aos 38 ou 78 anos vê "Avaliação individualizada", sem a linha de que DCV estabelecida já é muito alto risco nas outras escalas (o PCDT é omisso; opinião).
- Recomendação: repetir a frase no ≥ 75; quando houver evento marcado, mostrar "DCV estabelecida marcada: ver SBC/SBD (muito alto)".
- Confiança: média.

### RCV2-11 — MENOR — Mensagem do PCDT para quem não tem diabetes manda usar HEARTS, sem fonte e contra a SBC

- Tipo: opinião / contradição entre telas.
- Onde: `escalas.ts:489-492`: "A regra do PCDT DM2 é para pessoas com DM2. Sem diabetes, use a calculadora OMS/HEARTS." (também aparece quando o médico desmarca "Considerar diabetes").
- Fonte: PCDT só trata de DM2; a SBC 2025 recomenda o PREVENT para quem não tem diabetes.
- Recomendação: "O PCDT DM2 é para pessoas com DM2." e nada mais.
- Confiança: alta.

### RCV2-12 — MENOR — Notas fixas e textos de conduta da SBD

- Tipo: opinião / ambiguidade.
- Onde: `escalas.ts:213-214` (`HF_NOTE` fixa em todo resultado da SBD com diabetes, inclusive muito alto) e `escalas.ts:405-406`.
- Detalhes: (a) a nota de insuficiência cardíaca (R11, "não iniciar estatina com LDL < 130") aparece para todo diabético, mesmo com infarto prévio, sem campo para insuficiência cardíaca; um leitor apressado pode entender que não se inicia estatina; sugiro rotular "Somente se houver insuficiência cardíaca NYHA II–IV". (b) o texto do iPCSK9 omite "A decisão deve ser avaliada com base na análise de custo-benefício" (R3, IIb A).
- Confiança: média.

### RCV2-13 — MENOR — TFGe digitada fica "escondida" e volta a valer

- Tipo: erro objetivo (borda de UI).
- Onde: `RiscoSection.tsx:105-116` e `331-338`: o campo "ou TFGe" some quando há creatinina, mas `egfr: egfrCalc ?? f.egfr` continua usando o valor escondido se a creatinina passar a ser inválida (fora de 0,3–15) ou a idade ficar vazia.
- Recomendação: limpar `f.egfr` ao digitar creatinina, ou mostrar o campo sempre.
- Confiança: alta.

### RCV2-14 — MENOR — Rótulos e limites de borda

- `RiscoSection.tsx:475`: "Placa carotídea (< 50% ou EIMC ≥ 1,5 mm)" — a SBC diz "≥ 1,5 mm" (seção 4.5.2), a SBD "> 1,5 mm" (Quadro 2). O app usa ≥ nas duas.
- `escalas.ts:76/108`: "DM2 há mais de 10 anos" segue as tabelas (SBC Tab. 4.6, SBD Quadro 2); o texto da SBC (seção 4.6) diz "risco substancialmente aumentado quando ≥ 10 anos". A escolha está certa pelas tabelas; só falta registrar no docs/.
- `RiscoSection.tsx:374`: a dica do NT-proBNP aparece sempre, mas a SBC "não recomenda a dosagem de BNP ou NT-proBNP para a estratificação" (seção 4.4.4); só a SBD usa. Dizer "usado só na SBD".
- `escalas.ts:141-143`: doença renal da OMS = uma TFGe < 60 isolada; DRC exige ≥ 3 meses ou albuminúria. Escolha razoável, mas o rótulo "doença renal crônica (TFGe < 60)" afirma um diagnóstico.
- `who2019.ts:154`: o app OPAS aceita idade 40–75; o app usa 40–74 (PCDT). Escolha correta, sem divergência na tela.
- `escalas.ts:251`: "fármaco só com LDL-c persistentemente acima de 145": a SBC diz "recomenda-se a introdução de terapia farmacológica ... acima de 145" (p.52) e o resumo diz "≥ 145". "só" é mais restritivo que a fonte.
- Confiança: alta nas citações.

### RCV2-15 — MENOR — Aviso "simulação sem diabetes" não aparece na tabela de comparação

- `RiscoSection.tsx:230-234` (faixa amarela no topo) × `819-875` (tabela sem o aviso). Quem rola até a tabela vê "SBC: Baixo" sem aviso de que foi calculada como sem diabetes.
- Recomendação: título da tabela "Comparação (calculada sem diabetes)" quando `!i.diabetes`.
- Confiança: alta.

### RCV2-16 — MENOR — Divergências entre docs/ e código

- `docs/risco-cv.md` (SBD): "grade renal segue o Quadro 3 (TFGe 30 e 45 exatos ficam em 'alto')". No código, TFGe 30 com RAC 30–299 é muito alto (G3b) e TFGe 45 com RAC 30–299 é alto (G3a); só são "alto" quando a albuminúria é < 30. O Quadro 4 da SBD ("TFGe ≤ 45 + RAC 30–300", "TFGe ≤ 30") diverge do Quadro 3 nos pontos exatos 30 e 45; o código segue o Quadro 3 (decisão correta, texto do doc impreciso).
- `docs/risco-cv.md`: diz "OMS: ... DM2 de 40–74 = alto (PCDT)" e "em DM1 ou fora dessa idade a calculadora segue com o diabetes como variável", escolha que a RCV2-01 pede para sinalizar na tela.
- Lacunas de teste: sem teste de FH + CAC > 100; de bordas renais (29/30/44/45/59/60); de pct exato 5 e 20 no SBC; de `cholBand` em mg/dL; do `HF_NOTE`; de PCDT com nefropatia derivada.
- Confiança: alta.

---

## Conferido e correto

- SBC Tab. 4.1 (p.40) e Fig. 4.1 (p.41): ordem do fluxo, < 5% / 5 a < 20% / ≥ 20%, agravante reclassifica (5 a < 20% → alto; < 5% → intermediário), LDL 160–189 → intermediário, LDL ≥ 190 e Lp(a) > 180 mg/dL (> 390 nmol/L) → alto, CAC > 100 ou percentil 75, placa carotídea < 50%, angio-TC < 50%, AAA → alto, obstrução ≥ 50% e CAC > 300 → muito alto, DM2 idade 50/56 (H/M).
- SBC Tab. 4.2 (p.41): eventos maiores (SCA 12 meses, IAM, AVC isquêmico, DAP sintomática) e as 9 condições de alto risco; extremo = múltiplos eventos ou 1 evento + 2 condições; DRC TFGe 15–59 (a Fig. 5.1 diz "< 60").
- SBC Tab. 4.3 (p.43): agravantes (história familiar < 55 H / < 65 M, adiposidade/esteatose/SM, inflamatórias, transplante, fatores femininos com menarca ≤ 12/≥ 17, ≥ 3 abortos, menopausa < 40, Lp(a) ≥ 50 mg/dL ou ≥ 125 nmol/L, PCR-us ≥ 2,0).
- SBC Tab. 4.5 a 4.8 (p.48–50): categorias do diabetes, EAR, grade renal (G1–G5 × albuminúria), EMAR-1 (≥ 3 EAR, DM1 > 20 anos após os 18, estenose > 50%, EMAR renal, CT > 310 ou LDL > 190, neuropatia instalada, retinopatia moderada-grave/proliferativa) e EMAR-2 (angina estável, AIT, revascularização, insuficiência vascular periférica/amputação = muito alto); DM1 < 20 anos → Steno; CAC 10–300 no diabetes; FH com CAC > 100 → muito alto (texto p.46).
- SBC Tab. 5.1 (p.52): metas de LDL, não-HDL (+ 30 mg/dL), ApoB e % de redução das cinco categorias; limiar de 145 no risco baixo.
- SBD Quadros 1–8, R1–R11 (+ notas 1 a 8): idades 38/46/50/56, EAR (inclui LDL > 190, Lp(a) ≥ 50, NT-proBNP 125/190, CAC > 10, ITB < 0,9, EIM > 1,5 mm), EMAR (FH confirmada, ≥ 3 EAR), grade renal do Quadro 3, metas do Quadro 5 (baixo/intermediário < 100/< 130; alto < 70/< 100; muito alto < 50/< 80), redução de 30%/50% da nota do Quadro 5, potência de estatina do Quadro 6, R2 e R3 (ezetimiba e depois iPCSK9), R10 e R11 (conteúdo).
- PCDT 5.5 (p.10–12): HEARTS para 40–74 anos, DM2 alto, muito alto com DAC/AVC/DAP, ≤ 39 com nefropatia/retinopatia → alto, ≤ 39 e ≥ 75 individualizado, DM1 individualizado, "não altera a conduta", reavaliação anual (item 8). Portaria nº 13/2026 e item 5.5 citados corretamente.
- OMS/OPAS: categorias (< 5, 5–9, 10–19, 20–29, ≥ 30 = Baixo/Moderado/Alto/Muito alto/Crítico), chave de faixas (idade < 45/…/≥ 70, PAS < 120/140/160/180, IMC < 20/25/30/35), valores representativos (verificados pelas 2.100 células), região América Latina Tropical (Brasil), fluxo das 3 perguntas (DCV → muito alto; DRC/diabetes → alto, sem percentual).
- PREVENT: transformações de variáveis, splines em 110/30/60, limites 30–79, CT 130–320, HDL 20–100, PAS 90–180, TFGe 15–140, IMC 18,5–39,9, HbA1c 4,5–15, RAC 0,1–25.000 (iguais ao `preventr` 0.12.2); coeficientes do app idênticos à extração do pacote; escolha de modelo (base/uacr/hba1c/full com SDI ausente) igual à do pacote; horizonte de 30 anos até 59; população "30 a 79 anos sem ASCVD ou IC" (Khan, métodos); ASCVD = infarto, AVC, morte coronária (SBC e Khan). 40 vetores do pacote reproduzidos (12 + 28).
- CKD-EPI 2021 sem raça (142; κ 0,7/0,9; α −0,241/−0,302; 0,9938^idade; 1,012 mulher).
- Testes de `escalas.test.ts` conferem com as fontes nos valores esperados (38/46/50/56, EAR ≥ 3 → muito alto, extremo só com evento maior, bordas 39/40/74/75 do PCDT).

## Não consegui verificar

- Coeficientes do PREVENT contra o suplemento oficial (Tabela S12 corrigida) e a calculadora da AHA: ambos bloqueados. A conferência existente é circular (mesmo pacote para coeficientes e vetores). Também não verificado se a AHA usa o modelo "full" com SDI ausente do mesmo jeito que o `preventr`.
- Coeficientes da OMS 2019 contra o programa Stata original/Apêndice (só via pacote CRAN e reprodução exata das tabelas OPAS).
- PCDT de Dislipidemias (2019), citado pelo PCDT DM2: não lido (o app só o menciona).
- Globorisk-LAC e Steno T1 Risk Engine: fora do app; não avaliados.
- Páginas exatas da SBC além das impressas no rodapé (numeração por rodapé "Arq Bras Cardiol").
