# Revisão 2 — área GLI (Glicosímetro + textos gerais)

**Arquivos revisados:** `src/glicosimetro/analysis.ts`, `analysis.test.ts`, `GlicosimetroPage.tsx`, `GlucoseChart.tsx`, `phdc/types.ts` e `phdc/segments.ts` (só a interpretação de data, valor e HI/LO), `src/App.tsx`, `README.md`, `docs/accu-chek.md`, `CLAUDE.md` (consistência).

**Fontes:**

- Battelino T et al., Diabetes Care 2019;42(8):1593–1603, doi 10.2337/dci19-0028. Texto integral na versão PMC (PMC6973648), salvo em `<scratchpad>/review/src/gli/b.txt`. O PDF do periódico devolveu 403. Os números de tabela abaixo vêm do texto da PMC, sem paginação.
- SBD 2026 e as normas do fabricante não foram usados. Ver "Não consegui verificar".

## Achados

### GLI2-01 — IMPORTANTE — erro objetivo (robustez) — Troca de unidade altera silenciosamente o alvo digitado

- **Onde:** `GlicosimetroPage.tsx:297-304` (`changeUnit`) e `analysis.ts:15-17`.
- **O que o app faz:** ao trocar mg/dL para mmol/L, o alvo é arredondado a 0,1 mmol/L. Ao voltar, `mmolToMgdl` converte de novo e o valor muda de verdade. Exemplos calculados com 18,016: 100 → 5,6 → **101**; 80 → 4,4 → **79**; 140 → 7,8 → **141**; 70 e 180 voltam intactos.
- **Efeito:** quem alterna a unidade para olhar e volta passa a ter um alvo diferente do que digitou. A classificação "abaixo/acima do alvo" muda para valores de borda (por exemplo, 140 contra 141 mg/dL), sem aviso.
- **Fonte:** não se aplica. É um defeito de interface.
- **Recomendação:** guardar o alvo em mg/dL como estado canônico e só formatar para exibição. Alternativamente, não reconverter quando o campo não foi editado. Acrescentar teste de ida e volta.
- **Confiança:** alta.

### GLI2-02 — IMPORTANTE — erro objetivo / opinião — "Média de medições por dia" divide só pelos dias com medição

- **Onde:** `analysis.ts:215` (`perDay = denom / dayKeys.size`) e `GlicosimetroPage.tsx:477-481`. A tela diz, por exemplo: "Média de medições por dia 10,0 — 1 de 14 dias do período".
- **O que o app faz:** com 10 medições em 1 só dia de 14, mostra 10,0 por dia. Um médico apressado lê isso como adesão alta, quando o paciente mediu 1 dia em 14.
- **Fonte:** a Battelino pede ≥14 dias e ≥70% de dados ativos para CGM. É o contexto de qualidade dos dados, não um critério para SMBG.
- **Recomendação:** rotular "Medições por dia (nos dias com medição)", ou usar `denom / periodDayCount` e manter o "N de M dias" como subtexto.
- **Confiança:** média-alta.

### GLI2-03 — IMPORTANTE — erro objetivo — O denominador "dias do período" supera os dias que a memória cobre

- **Onde:** `analysis.ts:107-111`. O teste `analysis.test.ts:130-136` fixa o comportamento: `periodDayCount(filterPeriod(rs,7),7) === 7`.
- **O que o app faz:** com "Últimos 14 dias" e memória de 5 dias, mostra "5 de 14 dias do período". Isso sugere 9 dias sem medição, quando o aparelho só tem 5 dias gravados.
- **Recomendação:** limitar M ao intervalo coberto pela memória, isto é, do primeiro dia com medição (ou dia mais antigo) até o dia da última medição, com teto de N. O teste atual precisa mudar junto.
- **Confiança:** média.

### GLI2-04 — IMPORTANTE — erro objetivo (borda) — Uma única data futura ou errada desloca a janela e esconde os dados reais

- **Onde:** `analysis.ts:116-127` (`filterPeriod` ancora na maior data). Aviso em `GlicosimetroPage.tsx:383-388`.
- **O que o app faz:** com uma medição datada de 2099, "Últimos 14 dias" mostra só essa medição e o gráfico/resumo ficam quase vazios. O aviso diz apenas "O relógio do aparelho pode estar errado".
- **Efeito:** o médico pode concluir que "não há dados" ou ver estatística de uma medição só.
- **Recomendação:** ancorar na maior data que não seja futura (relógio do PC), ou no mínimo acrescentar ao aviso "essas medições deslocam o período; use 'Toda a memória'". Não há teste para este caso.
- **Confiança:** média-alta.

### GLI2-05 — IMPORTANTE — escolha não sinalizada / opinião clínica — Sem checagem de plausibilidade da unidade ou do valor

- **Onde:** `manager.ts:118-125` e `212` (bloqueio só se a unidade declarada for mmol/L). `segments.ts:155-160` aceita qualquer SFLOAT numérico. O único tratamento está em `analysis.ts`, e `formatGlucose` só arredonda.
- **O que o app faz:** se um aparelho em mmol/L não declarar a unidade (`declaredUnit = null`), os valores 5,6 e 7,2 seriam lidos como mg/dL. Apareceriam como "6 mg/dL" e "7 mg/dL", todos "abaixo de 54". Não há aviso. Valores negativos, zero ou acima de 600 também passam sem aviso.
- **Fonte:** não verificada (ver "Não consegui verificar"). É conhecimento clínico geral, de peso menor.
- **Recomendação:** quando `declaredUnit` for nulo, ou quando valores fora de 10–600 mg/dL (faixa típica de medidores capilares, a confirmar no manual do fabricante) existirem, mostrar aviso ou bloquear. Tratar como registro inválido o que estiver fora de uma faixa plausível.
- **Confiança:** média.

### GLI2-06 — IMPORTANTE — erro objetivo — A fonte citada na tela fixa "Alvo 70–180" mesmo com alvo editado

- **Onde:** `GlicosimetroPage.tsx:536-543`.
- **O que o app diz:** "Alvo 70–180 mg/dL (3,9–10,0 mmol/L); abaixo de 70 e de 54 mg/dL; acima de 180 e de 250 mg/dL", ao lado de tiles que podem mostrar outro alvo, como "Abaixo de 80" e "No alvo".
- **O que a fonte diz:** a Battelino define 70–180, <70, <54, >180 e >250 mg/dL. Esses cortes batem com o app. O 54 e o 250 são fixos no código, e o alvo é livre.
- **Recomendação:** dizer "Limiares da fonte: 54, 70, 180 e 250; o alvo mínimo e o máximo acima são editáveis". Opcional: avisar quando o alvo for diferente de 70–180.
- **Confiança:** alta.

### GLI2-07 — IMPORTANTE — erro objetivo — Alvo editado fora de ordem com 54/250 gera contagens incoerentes

- **Onde:** `analysis.ts:182-185` e `GlicosimetroPage.tsx:276-281`. A única validação é `low < high`.
- **O que o app faz:** com alvo mínimo 50, "Abaixo do alvo" (<50) fica menor que "Abaixo de 54". Com alvo máximo 300, "Acima do alvo" (>300) fica menor que "Acima de 250". A tela mostra o percentual do subconjunto maior que o do conjunto.
- **Recomendação:** exigir mínimo ≥54 e máximo ≤250, ou avisar. Isso é MENOR se o produto aceitar essa liberdade.
- **Confiança:** média.

### GLI2-08 — IMPORTANTE (cabeçalho do relatório) — escolha não sinalizada — Campo de alvo vazio volta ao padrão sem aviso

- **Onde:** `GlicosimetroPage.tsx:276-277` (`toMgdl(props.low) ?? DEFAULT_TARGET.low`).
- **O que o app faz:** apagar o campo faz o app usar 70/180 em silêncio. O texto "usando 70–180" só aparece quando `low >= high`. Em mmol/L, ele aparece como "70–180", em mg/dL, sem aviso de unidade.
- **Recomendação:** mostrar "campo vazio: usando 70 mg/dL / 180 mg/dL", com a unidade correta.
- **Confiança:** alta.

### GLI2-09 — MENOR — escolha não sinalizada — Tabela "Por período do dia": colunas "Abaixo" e "Acima" sem unidade, sem base, sem n

- **Onde:** `GlicosimetroPage.tsx:565-566, 577-578`.
- **O que o app faz:** "Abaixo/Acima" são percentuais em relação ao alvo editável. Com 1 medição mostra "100%". A coluna "Medições" ajuda, mas o cabeçalho não diz que é o alvo (e não <54/>250).
- **Recomendação:** cabeçalhos "% abaixo do alvo" e "% acima do alvo".
- **Confiança:** alta.

### GLI2-10 — MENOR — erro objetivo — A exportação CSV exporta só o período filtrado, e o nome do arquivo não diz isso

- **Onde:** `GlicosimetroPage.tsx:306-309` (`toCsv(shown...)`). O arquivo é `glicemias-<data>.csv`.
- **O que o app faz:** o padrão da tela é "Últimos 14 dias" e o CSV carrega só 14 dias. O médico pode crer que exportou a memória toda. A coluna "Posição na memória" é `index+1` da lista pós-parse. Depois da deduplicação e de vários segmentos, não é a posição física na memória do aparelho.
- **Recomendação:** incluir o período no nome do arquivo ou perguntar. Renomear a coluna para "Ordem de leitura".
- **Confiança:** média.

### GLI2-11 — MENOR — erro objetivo — Contagens do gráfico diferem das do resumo

- **Onde:** `GlucoseChart.tsx:80-86, 124-125, 129` (exclui medições sem data) contra `computeStats` (inclui).
- **O que o app faz:** com "Toda a memória" e medições sem data, a legenda do gráfico mostra números diferentes de "Abaixo/No alvo/Acima" do resumo, sem nota.
- **Recomendação:** nota "N medições sem data não aparecem no gráfico".
- **Confiança:** média.

### GLI2-12 — MENOR — erro objetivo — Validação de data aceita dias impossíveis

- **Onde:** `phdc/types.ts:72-74` (`day ≤ 31` para qualquer mês, ano sem faixa). `analysis.ts:68-70` usa `Date.UTC`, que "rola" 30/02 para 02/03.
- **Efeito:** uma data do aparelho inválida vira outra data sem aviso. É raro.
- **Recomendação:** validar o dia pelo mês e o ano.
- **Confiança:** média.

### GLI2-13 — MENOR — opinião — A deduplicação usa segundos no timeKey

- **Onde:** `analysis.ts:97`.
- **O que o app faz:** dois testes reais do mesmo valor no mesmo minuto só se distinguem se o aparelho enviar segundos diferentes. Não se sabe se o Accu-Chek envia segundos distintos de 00. A tela diz "mesma data, hora e valor" (`GlicosimetroPage.tsx:366-372`).
- **Recomendação:** aguardar o teste físico e confirmar nos diagnósticos. Se os segundos forem sempre 00, restringir a regra a segmentos diferentes.
- **Confiança:** baixa.

### GLI2-14 — MENOR — erro objetivo (doc) — CLAUDE.md diz "duas áreas separadas" e lista três

- **Onde:** `CLAUDE.md`, 1º parágrafo: "com duas áreas separadas ... **Diabetes**, **Gestante** e **Criança**".
- **Também:** README diz "modelos previstos: Guide, Instant e família". A tela e `docs/accu-chek.md` listam Guide, Guide Me, Instant, Instant S, Performa Connect e Aviva Connect (o doc ainda inclui ReliOn Platinum, que a tela não cita).
- **Recomendação:** alinhar os três textos.
- **Confiança:** alta.

### GLI2-15 — MENOR — opinião — A tela não diz que o alvo 70–180 não vale na gestação

- **Onde:** `GlicosimetroPage.tsx:536-543`, no mesmo app que tem área Gestante.
- **Fonte:** Battelino, Tabela 4 (gestação): metas de TIR/TBR/TAR próprias, com alvo menor (por exemplo, 63–140 mg/dL no DM1 gestacional, conforme o texto). "It should be noted that premeal and postprandial SMBG targets remain for diabetes in pregnancy".
- **Mitigação:** os campos de alvo são editáveis. Pela regra do produto, a gestação é um caso excepcional.
- **Recomendação opcional:** uma linha curta "70–180: adultos em geral; gestação e outros grupos usam alvos diferentes (ajuste o alvo)".
- **Confiança:** média.

### GLI2-16 — MENOR — erro objetivo (acessibilidade) — Abas sem navegação por setas

- **Onde:** `App.tsx:50-80`. Os botões têm `role="tab"`, mas o padrão WAI-ARIA espera setas e `tabIndex` roving.
- **Recomendação:** implementar ou remover `role="tab"` (usar botões simples).
- **Confiança:** média.

### GLI2-17 — MENOR — erro objetivo — Marcas do eixo X do gráfico podem se sobrepor

- **Onde:** `GlucoseChart.tsx:108-122`. Com "Toda a memória" em vários meses/anos, a cada 14 dias haverá dezenas de rótulos "dd/mm" sem ano, e ficam apertados.
- **Recomendação:** passo adaptativo e incluir o ano quando o intervalo ultrapassar 1 ano.
- **Confiança:** média.

## Conferido e correto

- **Limiares:** os cortes de `computeStats` (`<54`, `<limite inferior`, `>limite superior`, `>250`) batem com a Battelino. A fonte diz "Time >250 mg/dL (>13.9 mmol/L)", "Time >180 mg/dL (>10.0 mmol/L)", "Time 70–180 mg/dL (3.9–10.0 mmol/L)", "Time <70 mg/dL (<3.9 mmol/L)" e "Time <54 mg/dL (<3.0 mmol/L)" (Tabela 1 e 2, PMC6973648).
- **Comparação estrita:** 70 e 180 ficam "no alvo", e os testes de borda `analysis.test.ts:142-153` batem com a fonte (inclusivo em 70–180; <70; >180; <54; >250).
- **Inclusão de <54 em <70:** a Battelino define nível 2 como <54 e nível 1 como 54–69 (dentro de <70). O app trata "abaixo de 70" e "<54" como cumulativos, coerente com a fonte.
- **Conversão para mmol/L:** 54, 70, 180 e 250 mg/dL viram 3,0, 3,9, 10,0 e 13,9 mmol/L. Isso bate com os valores da fonte.
- **Média, desvio padrão e CV:** o desvio usa n−1, o CV = DP/média, e HI/LO ficam fora, o que a tela declara. Sem CGM, a tela avisa que os percentuais são sobre medições pontuais e indicativos.
- **Status bruto:** não é interpretado (hex exibido e exportado), em linha com o invariante 6. Não encontrei significado inventado para bits do status.
- **Nenhuma conduta clínica:** a tela só mostra "abaixo/acima do alvo" e "HI/LO acima/abaixo da faixa do aparelho".
- **Textos de privacidade** (`App.tsx:45-49`, `GlicosimetroPage.tsx:170-174`): coerentes com os invariantes (nada persiste, exportar é ação do usuário, CSV/PDF/diagnóstico citados como dado de saúde).
- **Avisos de relógio e datas:** `countFuture` e `dayDiffFromToday` tratam a hora do aparelho como "relógio de parede". O teste de `now` fixa 2026-11-25. As bordas estão corretas.
- **Percentual "<1%" / ">99%":** não mostra "0%" nem "100%" com exceção. O teste confere 0,33% → "<1%".
- **Unidade mmol/L bloqueada:** `manager.ts:212` bloqueia a leitura do aparelho que declara mmol/L, coerente com `docs/accu-chek.md`.
- **Disclaimer geral** (`App.tsx:126-130`): não diz que há "polêmica entre fontes" e não faz recomendação. Os textos de gráfico e tabela usam formas além da cor (▼ ● ▲).
- **Impressão:** o cabeçalho do app, as abas e os controles ficam fora (`header.app` e `.no-print`). O relatório impresso mostra título, identificação, aparelho, relógio, avisos e fonte.
- **README e docs** descrevem fielmente o que o código faz, exceto pelos itens GLI2-14.

## Não consegui verificar

- O PDF do periódico (403). Usei a versão integral da PMC. As tabelas 2–4 (percentuais-meta, CV ≤36%) não são exibidas pelo app, então não foram conferidas linha a linha.
- SBD 2026 não foi aberto; os limiares do app vêm da Battelino, que é a fonte citada.
- A lista de modelos Accu-Chek com micro-USB (Guide, Guide Me, Instant, Instant S, Performa Connect, Aviva Connect), a faixa de medição (HI/LO) e a unidade dos modelos no Brasil: não há fonte oficial do fabricante nos arquivos baixados.
- O comportamento real de segundos, HI/LO e `PmSegmentEntryMap` em aparelho físico (o próprio app avisa que a leitura ainda não foi validada).
