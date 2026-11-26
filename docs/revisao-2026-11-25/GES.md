# Revisão clínica — área GES (Gestante: IG, DPP, pré-natal)

**Arquivos revisados** (c:\Smedic\ferramentas-diabetes): `src/gestante/ig.ts`, `prenatal.ts`, `IdadeGestacional.tsx`, `PrenatalView.tsx`, `GestantePage.tsx`, `sources.ts`, `ig.test.ts`, `prenatal.test.ts`, `src/shared/datas.ts`; `docs/gestante-ig.md` e `docs/gestante-prenatal.md` (só auditados).

**Fontes usadas** (todas em `<scratchpad>/gest_src/`, texto extraído em `<scratchpad>/review/src/ges/`):

- `caderneta.pdf`: MS, Caderneta Brasileira da Gestante (2026). Páginas citadas pela numeração impressa: 4.1.2 p.34; 4.1.4 p.34-35; 4.2.1 p.37-38; 4.2.2 p.39; 4.3 p.39-40.
- `c3.pdf`: MS/SAPS, Nota metodológica C3.
- `cab32.pdf`: MS, Caderno de Atenção Básica 32 (2012): 5.3 p.62, 5.5 p.71, 5.6 p.72, 6.3.5 p.170, Coombs/Rh p.186-187, GBS 6.3.20 p.193.
- `mgar.pdf` = MS, **Manual de Gestação de Alto Risco (2022)**.
- `uw.pdf` (imagem da Tabela 1) + `grin.html` (texto integral do CO 700): ACOG/AIUM/SMFM Committee Opinion 700 (reafirmada 2022). `acog700.html` e `co700.pdf` são páginas de bloqueio (Cloudflare/erro), inúteis.
- Extras baixados: MS, Nota Técnica 106/2025 CGFAM/DPNI/SVSA (`nt106.pdf`, VSR, erros de imunização); Nota Técnica conjunta SBIm/SBP/Febrasgo de 04/03/2026, atualizada 24/04/2026 (`sbim_vsr.pdf`, que cita o PNI); busca ao Calendário Nacional de Vacinação da gestante (gov.br, Instrução Normativa 2026), lida só em resumo de busca.

**Resumo:** nenhum erro de cálculo. Datas, DPP, Näegele, DUM por período, FIV e a Tabela 1 do ACOG (limites > e faixas) conferem com as fontes, e os testes batem. Os achados são de omissão, texto ambíguo e divergência entre fontes. O mais relevante: a conduta dos 41 semanas some da tela com ≥ 42 semanas (GES-01), o Coombs aparece "agora" já com 14 semanas (GES-02) e o app não diz que o VSR tem limite de bula (GES-04).

---

## Achados

### GES-01 — IMPORTANTE — erro de interface (omissão de alerta de segurança)

- **Tipo:** escolha não sinalizada / omissão.
- **Onde:** `ig.ts:97-105` (`situacao`) e `IdadeGestacional.tsx:66-75` (`SITUACAO`).
- **App:** com ≥ 41s0d aparece "Gestação prolongada com 41 semanas ou mais: encaminhar para avaliação do bem-estar fetal (índice de líquido amniótico e monitoramento cardíaco fetal)". Com ≥ 42s0d `situacao` devolve só `pos-termo`: "Pós-termo: 42 semanas ou mais." Sem conduta. Além disso `PrenatalNaIg` (`PrenatalView.tsx:48`) retorna `null` com ≥ 42s, então nenhum cartão de pré-natal aparece.
- **Fonte:** CAB 32 p.62 (5.3): "Quando o parto não ocorre até a 41ª semana, é necessário encaminhar a gestante para avaliação do bem-estar fetal..."; p.170 (6.3.5): "Por volta da 41ª semana ... ou antes disso, se houver diminuição da movimentação fetal, encaminhe a gestante para um centro de referência ... nenhuma gestante deve receber alta do pré-natal da unidade básica antes da internação para o parto". O CAB 32 (p.61, 5.2.2) lista "IG a partir de 41 semanas confirmadas" como motivo de encaminhamento. A indicação vale para toda gestante ≥ 41s, não só até 41s6d.
- **Recomendação:** manter o texto de encaminhamento (e a menção a "ou antes, se houver diminuição dos movimentos fetais") também em `pos-termo`: "Pós-termo (≥ 42 semanas): encaminhar para avaliação do bem-estar fetal / centro de referência; não dar alta do pré-natal antes do parto". Quando o cartão de pré-natal não aparece, dizer "≥ 42 semanas: acompanhamento semanal e conduta no serviço de referência" em vez de sumir.
- **Confiança:** alta.

### GES-02 — IMPORTANTE — divergência entre fontes / janela sem respaldo

- **Tipo:** divergência CAB 32 × Caderneta; o app segue a Caderneta sem avisar.
- **Onde:** `prenatal.ts:110` (`t2-coombs`, janela do 2º trimestre = 14s0d a 27s6d); teste `prenatal.test.ts:85-90`.
- **App:** a partir de 14s0d, "Solicitar agora: Coombs indireto (se Rh negativo e Coombs negativo no 1º trimestre)". Em 28s0d vira "já deveria ter sido feito" e o do 3º trimestre vira "agora". O doc `gestante-prenatal.md` declara a repetição a cada 4 semanas "fora do escopo".
- **Fonte:** Caderneta p.37: 2º trimestre e 3º trimestre ambos listam "Teste de Coombs indireto (para gestantes com fator Rh negativo e resultado negativo no primeiro trimestre)", sem semana. CAB 32 p.186 e Quadro 13 (p.111): "Caso o Coombs indireto resulte negativo, ele deve ser novamente solicitado a cada 4 semanas, após a 24ª semana gestacional" / "a cada 4 semanas, a partir da 24ª semana". MGAR (2022), proteção Rh: "realizar teste de Coombs indireto (CI), na primeira visita pré-natal, e repetir mensalmente".
- **Risco:** o app sugere o 2º Coombs com 14 semanas (cedo demais para a lógica de sensibilização) e depois mostra o do 2º trimestre como "atrasado" aos 28s. Também omite a repetição a cada 4 semanas (CAB 32 e MGAR) e a imunoglobulina anti-D. Na Caderneta 2026 não há menção a repetição mensal nem a semana, então é divergência, não erro.
- **Recomendação:** dar ao `t2-coombs` janela própria a partir de 24s0d (CAB 32), ou ao menos texto "repetir a cada 4 semanas a partir de 24 semanas (CAB 32, Manual de Alto Risco)" e unificar t2/t3 numa linha; registrar na tela que a Caderneta lista por trimestre e o CAB 32 por intervalo. A profilaxia com imunoglobulina anti-D (CAB 32 p.187: "300 mcg ... nas primeiras 72 horas após o parto de RN Rh positivo e Coombs direto negativo") não aparece; se o app quiser tratar Rh negativo, citar (a data de uso antes do parto não foi verificada nas fontes lidas).
- **Confiança:** alta para a divergência; média para a janela proposta.

### GES-03 — IMPORTANTE — vacina dT: caso "nenhuma dose" omitido

- **Tipo:** omissão / divergência (Caderneta × Calendário Nacional).
- **Onde:** `prenatal.ts:169-176`: `dT`, "se só 1 dose anterior", "1 dose de dT, além da dTpa a partir da 20ª semana".
- **Fonte:** Caderneta p.40 diz só "Usada se a gestante tiver tomado apenas 1 dose anterior. Deve receber 1 dose de dT e 1 dose de dTpa a partir da 20ª semana". O Calendário Nacional vigente (gov.br, Instrução Normativa 2026, lido via resumo de busca, não o PDF) traz: sem nenhuma dose anterior de dT/DTP/penta: 2 doses de dT + 1 dTpa (a dTpa substitui a 3ª dose; doses com 60 dias de intervalo, mínimo 30). O app diz "se só 1 dose" e fica silencioso para 0 dose e para esquema incompleto de outro tipo.
- **Recomendação:** acrescentar linha "dT: sem nenhuma dose anterior: 2 doses de dT + 1 dTpa (a partir da 20ª semana); com 1 dose anterior: 1 dT + 1 dTpa; esquema completo: só dTpa". Confirmar no PDF do Calendário Nacional vigente antes de publicar.
- **Confiança:** média (fonte lida só em resumo).

### GES-04 — IMPORTANTE — VSR: sem limite superior no MS, mas a bula limita; app não sinaliza

- **Tipo:** divergência entre fontes oficiais (registrar).
- **Onde:** `prenatal.ts:153-160`: `janela: { de: 28s0d, ate: null }`, "a partir da 28ª semana, dose única em cada gestação".
- **Fonte:** Caderneta p.40: "A partir da 28ª semana de gestação" e "Toda gestante, a partir de 28 semanas, deve tomá-la!"; sem limite superior. MS Nota Técnica 106/2025: "administrar a vacina VSR na gestante a partir da 28ª semana" (erro de imunização se aplicada "antes da 28ª semana"). Nota técnica SBIm/SBP/Febrasgo 04/03/2026, atualizada 24/04/2026: "O PNI recomenda a vacinação contra o VSR para gestantes a partir da 28ª semana de idade gestacional, sem limite superior"; "a vacina Abrysvo é licenciada pela ANVISA a partir de 24 semanas" e o estudo pivotal foi "entre 24 e 36 semanas"; nirsevimabe no RN se "parto ocorrido até 14 dias após a vacinação materna", prematuridade ou mãe imunossuprimida.
- **Conclusão:** o app não omite um limite que o MS tenha (o MS não tem limite superior, então a janela está correta). Mas não registra que (a) antes de 28 semanas no SUS é erro programático e (b) vacinação com parto em < 14 dias exige considerar nirsevimabe no RN. Com 37+ semanas, "agora" sem ressalva pode levar a vacina muito perto do parto sem avisar sobre a proteção do bebê.
- **Recomendação:** acrescentar "sem limite superior no MS; se o parto ocorrer em < 14 dias da vacina (ou RN prematuro) o RN deve receber nirsevimabe (MS/Nota Técnica SBIm-SBP-Febrasgo 2026)". Esse trecho vem da nota conjunta, não do MS diretamente; conferir no Informe técnico do MS.
- **Confiança:** alta para o que o MS diz; média para a complementação.

### GES-05 — IMPORTANTE — GBS 35-37 semanas: escolha local, mas a fonte do MS desaconselha rastreio sistemático e a janela é antiga

- **Tipo:** escolha não sinalizada (a decisão é do usuário e não é erro) + divergência de fonte.
- **Onde:** `prenatal.ts:240-252`; texto exibido: "Cultura para estreptococo do grupo B (swab vaginal e retal) · de 35 a 37 semanas"; `resumo` diz "(não está na lista do MS)".
- **Fonte:** CAB 32 p.193 (6.3.20): "A coleta para cultura de EGB é recomendada de forma sistemática para todas as gestantes entre 35 e 37 semanas (CDC)", mas conclui: "Neste momento, não se tem elementos suficientes para recomendar a realização sistemática da coleta ... e o uso de antibiótico intraparto". A janela 35-37 é a do CDC 2002; as diretrizes de ACOG/CDC mais novas usam 36s0d a 37s6d (não está na pasta de fontes, ver "Não consegui verificar").
- **Observação:** a tela só diz "não está na lista do MS"; diz menos do que o CAB 32, que **recomenda não rastrear** com a evidência da época. Para o médico ficar informado de que é protocolo local, melhor dizer "protocolo do município; o CAB 32 não recomenda rastreio sistemático". Código usa 35s0d a 37s6d, o texto diz "de 35 a 37 semanas"; ambíguo (37s0d ou 37s6d?).
- **Recomendação:** rótulo "protocolo local (CAB 32 não recomenda rastreio sistemático)" e janela escrita como "35s0d a 37s6d".
- **Confiança:** alta (CAB 32), baixa para a atualização ACOG/CDC.

### GES-06 — IMPORTANTE — USG como único método (sem DUM) não avisa acurácia nem datação subótima

- **Tipo:** opinião clínica sustentada por fonte primária (ACOG).
- **Onde:** `IdadeGestacional.tsx:116-130` (método `usg` sem DUM): `usandoUsg = true; dumEq = pelaUsg`, sem alerta.
- **Fonte:** CO 700: "Gestational age assessment by ultrasonography in the third trimester ... is the least reliable method, with an accuracy of ± 21-30 days"; 22 0/7 a 27 6/7: ± 10-14 dias; 14-21 6/7: ± 7-10; "A pregnancy without an ultrasound examination that confirms or revises the EDD before 22 0/7 weeks should be considered suboptimally dated"; "If the patient is unsure of her LMP, dating should be based on ultrasound ... ideally obtained before or at 13 6/7 weeks, with the earliest CRL prioritized".
- **App:** com DUM em branco aceita qualquer USG (também de 3º trimestre) e calcula DPP/IG/"pós-termo" sem avisar que a precisão é de semanas. O aviso de 3º trimestre (`ComparacaoView`) só aparece quando há DUM para comparar.
- **Recomendação:** quando o exame estiver além de 13s6d, mostrar a acurácia do CO 700 (±7-10, ±10-14, ±21-30 dias) e, se > 22s, "datação subótima (CO 700)".
- **Confiança:** alta para a fonte.

### GES-07 — IMPORTANTE (texto ambíguo) — "Gestação prolongada" aparece já com 40s0d, na DPP

- **Tipo:** escolha de interface sobre definição do MS.
- **Onde:** `IdadeGestacional.tsx:66-69`; `ig.ts:97-105`: com 40s0d a 40s6d alerta amarelo "Gestação prolongada (pós-datismo): entre 40 e 42 semanas."
- **Fonte:** CAB 32 p.170 (6.3.5): "Conceitua-se gestação prolongada, também referida como pós-datismo, aquela cuja IG encontra-se entre 40 e 42 semanas. Gravidez pós-termo é aquela que ultrapassa 42 semanas." Ou seja, a definição do MS é literalmente a do app. Mas o MS dá a conduta (encaminhar) só por volta de 41 semanas; a mesma tela marca "Gestação prolongada" (alerta amarelo) na própria data prevista do parto, o que um médico apressado pode ler como patologia/conduta imediata. Convenções internacionais (ACOG: "late-term" 41s0d-41s6d, post-term ≥ 42s0d) não usam "prolongada" aos 40.
- **Recomendação:** "40 semanas ou mais (definição do MS: prolongada de 40 a 42 sem). A avaliação de bem-estar fetal é indicada a partir de 41 semanas" e usar tom informativo, não de alerta, com 40s.
- **Confiança:** média.

### GES-08 — MENOR — divergência interna do CAB 32 sobre o início do pós-termo

- **Tipo:** divergência entre trechos da mesma fonte.
- **Onde:** `ig.ts:98-101`, `IdadeGestacional.tsx:75` ("Pós-termo: 42 semanas ou mais").
- **Fonte:** CAB 32 p.164 (5.4.2, ficha de antecedentes): "pós-termo (igual ou mais de 42 semanas de gestação)" × p.170 (6.3.5): "Gravidez pós-termo é aquela que ultrapassa 42 semanas". O app adotou 42s0d. Aceitável; registrar a divergência (também o 6.3.4 define pré-termo entre "22 semanas e 37 semanas (259 dias)", enquanto 5.4.2 diz "antes da 37ª semana": 37s0d é termo, como o app fez).
- **Confiança:** alta.

### GES-09 — MENOR — consultas puerperais: texto da Caderneta alterado

- **Tipo:** erro objetivo (paráfrase imprecisa).
- **Onde:** `prenatal.ts:6-8` e `PrenatalView.tsx:181`: "No mínimo 2 consultas: a 1ª até 7 dias e a 2ª até 30 dias" (e docs: "após o parto").
- **Fonte:** Caderneta p.35 (4.1.4): "pelo menos duas consultas, sendo uma na primeira semana após a saída da maternidade e outra em torno de 30 dias após o parto". O app troca "após a saída da maternidade" por "após o parto" implicitamente e "em torno de 30 dias" por "até 30 dias". A C3 (indicador I) exige só "pelo menos 01 consulta durante o puerpério" (até 42 dias).
- **Recomendação:** "1ª na primeira semana após a saída da maternidade; 2ª em torno de 30 dias após o parto".
- **Confiança:** alta.

### GES-10 — MENOR — frequência das consultas: Caderneta × CAB 32

- **Tipo:** divergência entre fontes oficiais.
- **Onde:** `prenatal.ts:321-327`, `PrenatalView.tsx:167-178`.
- **Fonte:** Caderneta p.34: "A partir da 36ª semana: consultas semanais". CAB 32 p.61 e p.62 (5.3): "semanais no termo". O app segue a Caderneta (documentado). Registrar. Também "Da 28ª à 36ª semana" e "A partir da 36ª" na Caderneta se sobrepõem em números ordinais ("36ª semana" começa em 35s0d); o app interpreta como semanas completas (28s0d e 36s0d), razoável mas não escrito.
- **Confiança:** alta.

### GES-11 — MENOR — "Mínimo na gestação": texto elíptico

- **Onde:** `PrenatalView.tsx:78-79`: "1ª até a 12ª semana, intercaladas entre médico e enfermeiro, e ao menos 1 consulta odontológica."
- **Problema:** parece que as 7 consultas devem ser "até a 12ª semana". A Caderneta p.34 diz "no mínimo sete consultas, intercaladas entre médica(o) e enfermeira(o), além de, no mínimo, uma consulta odontológica" e que começar "de preferência até a 12ª semana".
- **Recomendação:** "7 consultas no mínimo (intercaladas médico/enfermeiro) + 1 odontológica; a 1ª, de preferência até a 12ª semana".

### GES-12 — MENOR — alerta de 1ª consulta tardia usa "deve" e limite 12s6d

- **Onde:** `PrenatalView.tsx:67-71`, `prenatal.ts:298` (`INICIO_ATE = 12s6d`): "O pré-natal deve começar até a 12ª semana."
- **Fonte:** Caderneta p.34 (4.1.2): "devem começar o quanto antes, de preferência até a 12ª semana de gestação (nos primeiros 3 meses)"; C3: "Captação precoce: início do pré-natal até a 12ª semana". O MS diz "de preferência" no texto ao usuário; o app diz "deve". O limite exato (12s0d ou 12s6d) não é definido pelo MS; o app escolheu 12s6d (mesmo critério de MGAR p.210: "primeiro trimestre até 12 semanas e 6 dias", aborto). Aceitável, só sinalizar.
- **Recomendação:** "de preferência até a 12ª semana (captação precoce, C3)".

### GES-13 — MENOR — FIV: só embrião de 3 e 5 dias

- **Tipo:** omissão.
- **Onde:** `IdadeGestacional.tsx:267-276` (só 3 dias e 5 dias).
- **Fonte:** CO 700: "for a day-5 embryo, the EDD would be 261 days from the embryo replacement date. Likewise, the EDD for a day-3 embryo would be 263 days". A fórmula DUM = transferência − (14 + idade do embrião) é correta e reproduz 261/263 (280 − 19 = 261; 280 − 17 = 263; confere com `ig.test.ts:67-70`). Embriões de dia 4 e 6 (blastocisto tardio) são comuns na prática; usar "5" para um de dia 6 gera erro de 1 dia, e o app não oferece a opção nem avisa. A fórmula "2 semanas + idade do embrião" não está literal no CO 700; é derivada (correta).
- **Recomendação:** permitir idade do embrião 3 a 6 dias, ou aviso "para outros dias use DUM equivalente = transferência − (14 + idade)". Texto "(blastocisto)" só no dia 5 pode induzir a erro com blastocisto de dia 6.
- **Confiança:** alta.

### GES-14 — MENOR — "Manter a DUM" apresentado como regra fechada

- **Onde:** `IdadeGestacional.tsx:491-500`: título "Manter a DUM." / "só se redata com diferença maior que N dias".
- **Fonte:** CO 700: "single-point cutoffs were chosen based on expert review"; "Dating changes for smaller discrepancies are appropriate based on how early in the first trimester the ultrasound examination was performed and clinical assessment of the reliability of the LMP date"; 2º trimestre: "Date changes for smaller discrepancies (10-14 days) are appropriate ... on clinician assessment of LMP reliability". O limite é um corte padronizado; o ACOG admite redatar por diferenças menores quando a DUM não é confiável. O app dá a opção manual (radio "Datação adotada"), então é só texto. Também o ACOG diz que, com USG de 1º trimestre, não se redata por USG posterior "with rare exception" (consta só dentro do `Details`, p.439-440 do tsx).
- **Recomendação:** "Pela regra do ACOG: manter a DUM (diferença ≤ N dias). Pode ser redatada conforme a confiabilidade da DUM".
- **Confiança:** média.

### GES-15 — MENOR — itens "sem oferta no município" no bloco "Já deveria ter sido feito"

- **Onde:** `PrenatalView.tsx:96-100`: texto "Confira o resultado; se não foi feito, peça agora." para todos os atrasados; HTLV e eletroforese têm `semOferta` mas aparecem nessa lista (e em "Solicitar agora" na 1ª consulta) com texto "· rotina do MS para todas as gestantes, mas não disponível na rede do município".
- **Avaliação:** a decisão do usuário (no fim da lista, marcados) está cumprida e o texto da tela deixa claro que é ajuste local. Sinalização suficiente para HTLV/eletroforese; o resumo `PROTOCOLO_LOCAL.resumo` está presente nos dois cartões. Problema só de coerência: "peça agora" convive com "não disponível". Sugestão: nesses itens substituir por "ver alternativa de acesso (referência/particular)". Para Chagas, malária, toxo do 2º trimestre e exames do parto, o resumo diz "sem...": claro. Mas note-se que **toxoplasmose de 2º trimestre removida** aparece apenas no `resumo` ("toxoplasmose só no 1º e no 3º"), enquanto o texto do módulo de referência continua dizendo "Para todas (feitos no município)" para o 1º trimestre: coerente.
- **Confiança:** média.

### GES-16 — MENOR — dTpa/influenza: opção pós-parto omitida nos itens

- **Onde:** `prenatal.ts:145-152`, 177-183.
- **Fonte:** Caderneta p.40: influenza "Se não tomar na gravidez, aplicar até 45 dias após o parto"; hepatite B idem; NOTA: "Caso alguma vacina não possa ser aplicada durante a gestação, ela será oferecida após o parto." O app tem isso para hepatite B e influenza e a nota geral no cartão de Vacinas. Para dTpa não explicita "até 45 dias após o parto" (Calendário Nacional: puerpério até 45 dias; ver GES-03). Também a Caderneta diz para dTpa "Mesmo que tenha tomado em gravidez anterior, precisa repetir": o app diz "em toda gestação" (equivalente).
- **Confiança:** média.

### GES-17 — MENOR — arredondamentos/tom em "Termo (a partir de 37 semanas)" e `implausivel`

- **Onde:** `IdadeGestacional.tsx:65` (tom verde "ok" a partir de 37s0d até 39s6d) e `situacao` > 44 semanas.
- **Observações:** o MS (CAB 32) define pré-termo < 37s e não subdivide termo. Marcar "ok" em verde aos 37 semanas é consistente com a fonte; classificações de termo inicial/pleno (ACOG) não são exibidas. O limite de 44 semanas é da interface (docs admitem). Sem ação obrigatória.
- **Confiança:** média.

### GES-18 — MENOR — Marco "41 semanas: Encaminhar para avaliação..." sem condição

- **Onde:** `ig.ts:197`: marco fixo "Encaminhar para avaliação do bem-estar fetal" em 41s0d.
- **Fonte:** CAB 32 usa "até a 41ª semana"/"por volta da 41ª semana" (ambíguo entre 41s0d e 41s6d). Marco em 41s0d é a leitura mais segura; só dizer "a partir de". Também omite que a indução com 41 semanas é preferível à avaliação seriada (CAB 32 p.62: "a conduta de induzir o trabalho de parto em todas as gestantes com 41 semanas de gravidez é preferível à avaliação seriada do bem-estar fetal"), informação da fonte que o app não traz.
- **Confiança:** média.

### GES-19 — MENOR — docs e comentários

- `docs/gestante-ig.md` diz "pós-termo, 42 semanas ou mais" no item 5.4.2 e "com 41 semanas" no item 5.3: confere (ver GES-08 para divergência). Diz Näegele difere "em até 3 dias": calculei casos 0 a 2 dias; não encontrei 3, mas não varri todos os dias do ano (sem impacto clínico).
- `docs/gestante-prenatal.md` afirma que o Caderno 32 "não incluía hepatite C nem HTLV" (não verifiquei) e que a repetição do Coombs fica "fora do escopo": mas é recomendação explícita das fontes (ver GES-02).
- `sources.ts:216`: título da Caderneta cita os itens, mas sem páginas (4.1.2 p.34; 4.1.4 p.34-35; 4.2.1 p.37-38; 4.2.2 p.39; 4.3 p.39-40). `CAB_32.titulo` cita "5.3, 5.4.2, 5.5, 5.6, 6.3.5": todos os cinco existem e estão corretos.
- `prenatal.ts:307-311`: o comentário "Programação mínima de consultas" está colado a um segundo bloco JSDoc (de `proximaConsulta`); cosmético.

---

## Conferido e correto

- **IG pela DUM:** dias ÷ 7 (CAB 32 p.71, 5.5). `igEm`, `ig`, `fmtIg` ok.
- **DUM por período do mês:** início/meio/fim = dias 5/15/25 (CAB 32 p.71, 5.5, II). `dumPorPeriodo` ok, teste ok.
- **DPP = 280 dias, calendário** (CAB 32 p.72, 5.6) e **regra de Näegele** (+7 dias, −3 meses ou +9 meses, dias excedentes passam ao mês seguinte; mesmos três exemplos do texto, `ig.test.ts:41-45`). Implementação `addMonths(dum+7, 9)` equivale; verifiquei bordas: fim de mês (25/05, 25/02), 27/01 e 31/05 → 03/03, todas iguais à regra do MS.
- **Testes de datas:** 2026-01-01 + 280 = 2026-10-08 e 2027-06-01 + 280 = 2028-03-07 corretos; 28s a partir de 2026-01-01 = 2026-07-16 correto.
- **FIV:** `DUM = transferência − (14 + idade)` dá DPP = transf + 261 (dia 5) e + 263 (dia 3): conferido com CO 700 ("261 days ... 263 days").
- **Tabela 1 ACOG** (imagem `uw.pdf`): ≤ 8 6/7: > 5 d; 9 0/7-13 6/7: > 7 d; 14 0/7-15 6/7: > 7 d; 16 0/7-21 6/7: > 10 d; 22 0/7-27 6/7: > 14 d; ≥ 28 0/7: > 21 d. `TABELA_REDATACAO` idêntica; comparação `Math.abs(diferenca) > limite` (estrito) correta; faixas usam IG pela DUM ("*Based on LMP"), certo; medidas (CCN; DBP, CC, CA, CF) corretas; testes (limite exato não redata, +1 redata, para menos também) corretos.
- **Aviso 3º trimestre** (≥ 28s): coerente com o rodapé † e o texto do CO 700.
- **Trimestres:** 1º até 13s6d; 2º 14s0d-27s6d; 3º ≥ 28s0d (CO 700). Divergência: MGAR p.210 usa "primeiro trimestre até 12s6d" para definir aborto precoce, e a Caderneta fala em "12ª semana (3 primeiros meses)"; sem erro, só convenção.
- **Pré-termo < 37s; prolongada 40-42; pós-termo ≥ 42** (CAB 32 5.4.2 e 6.3.5), e encaminhamento a ≥ 41s (ver GES-01 para o que falta).
- **Frequência de consultas** mensal < 28s / quinzenal 28-35s6d / semanal ≥ 36s (Caderneta p.34), e ≥ 7 consultas, ≥ 1 odontológica, "não existe alta do pré-natal".
- **Exames por trimestre** (Caderneta p.37-38) conferidos linha a linha: T1 (hemograma, ABO/Rh, Coombs se Rh negativo, eletroforese, glicemia de jejum/TOTG se > 24 sem, sífilis, HIV, hepatite B, hepatite C, toxo IgG/IgM, HTLV, urina + urocultura, Chagas, malária, USG), T2 (TOTG 24-28, Coombs, malária, toxo se IgG não reagente), T3 (hemograma, glicemia de jejum, Coombs, sífilis, HIV, toxo, malária, urina + urocultura), parto (HIV, sífilis, hepatite B e C). Lista `COM_INDICACAO` (7 itens) e alto risco (6 itens, p.39) conferem.
- **TOTG 75 g "preferencialmente entre 24 e 28 semanas"** (p.37): janela 24s0d-28s6d é leitura razoável e consistente com o teste.
- **Vacinas** (Caderneta p.39-40): dTpa a partir da 20ª semana a cada gestação; hepatite B (esquema incompleto, 3 doses, concluir até 45 dias pós-parto); dT se 1 dose anterior; influenza 1 dose por temporada (até 45 dias pós-parto se não tomar); covid-19 1 dose por gestação, ≥ 6 meses após a última; VSR ≥ 28 semanas dose única por gestação; febre amarela e raiva só em situações específicas. C3: dTpa "a partir da vigésima semana", mesma janela.
- **Fontes citadas:** CAB 32, ACOG CO 700 (reafirmada 2022, confere no `uw.pdf`), Caderneta 2026, C3: existem e os itens citados estão corretos.
- **Aplicação do protocolo local** (`aplicarProtocolo`): HTLV/eletroforese no fim com nota; Chagas, malária, TR de gravidez, toxo T2 e exames do parto removidos; USG 11-13s6d e 20-24s6d; GBS 35s0d-37s6d depois da urina T3; lista nacional preservada em `ITENS_MS`; teste de ordem confere. O resumo aparece nos dois cartões, mostrando ao médico que são ajustes locais.
- **Próxima consulta:** a lógica de "não passar do limite 28/36 sem e mínimo 7 dias" é escolha da interface, declarada como tal em comentário e docs; sinalização na tela: "próxima por volta de ...". Testes coerentes com o código.
- **`datas.ts`:** datas como dias UTC, sem erro de fuso/horário de verão; `parseIso` rejeita 30/02; `addMonths` mantém a regra do dia excedente.

## Não consegui verificar

- **Página do ACOG** (`acog700.html`, bloqueada): usei o texto integral do CO 700 em `grin.html` e a Tabela 1 em imagem (`uw.pdf`). Não confirmei se há errata posterior de 2022-2026.
- **Calendário Nacional de Vacinação vigente (gov.br, Instrução Normativa 2026):** lido apenas por resumo de busca (dTpa 20ª semana, dT 0/1 dose, 45 dias pós-parto); os PDFs oficiais não foram abertos. A janela do VSR foi verificada na Nota Técnica 106/2025 do MS e na nota conjunta SBIm/SBP/Febrasgo (que cita o PNI), não no "Estratégia de Vacinação contra o VSR em Gestantes" do MS, que não consegui abrir.
- **Intervalo mínimo VSR antes do parto, duração da proteção** e nirsevimabe: vêm só da nota conjunta (não do MS direto).
- **GBS 36-37s6d (ACOG/CDC atuais) e profilaxia anti-D antes do parto:** conhecimento geral; fontes não estavam na pasta, não verifiquei.
- **Interpretação "até a 12ª semana" (12s0d vs 12s6d)**, **"35 a 37"** e **"24 a 28"**: a fonte não define o dia exato; só registrado.
- **`App.test.tsx`** e CSS não foram lidos (fora da lista).
