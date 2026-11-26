# Revisão clínica GLI: Glicosímetro e textos gerais

**Arquivos revisados** (c:\Smedic\ferramentas-diabetes): `src/glicosimetro/analysis.ts` e `analysis.test.ts`, `GlicosimetroPage.tsx`, `GlucoseChart.tsx`, `phdc/nomenclature.ts`, `phdc/segments.ts`, `phdc/types.ts` (SFLOAT e data), `src/App.tsx`, `src/shared/download.ts`, `docs/accu-chek.md`, `README.md`.

**Fontes realmente consultadas**

- Battelino T et al. Diabetes Care 2019;42:1593 (PMC6973648), Tabelas 1 a 3, lidas via web nesta revisão.
- Diretriz SBD 2026, ADA Standards 2026 e IEEE 11073-10417/20601: **não foram abertas** (ver "Não consegui verificar"). As conferências de protocolo abaixo vêm do meu conhecimento prévio, não de leitura do texto.

Trechos literais do consenso usados:

- "Time in range: 70–180 mg/dL (3.9–10.0 mmol/L)".
- "Time below range, Level 1: 54–69 mg/dL" e "Level 2: below 54 mg/dL".
- "Time above range, Level 2: above 250 mg/dL"; Level 1: 181–250.
- "Glycemic variability (%CV) target ≤36%".
- "Number of days CGM worn (recommend 14 days)" e "Percentage of time CGM is active (recommend 70% of data from 14 days)".
- Tabela 1 é intitulada "Standardized CGM metrics".

Resumo: não há afirmação clínica errada nos limiares (<54, <70, >180, >250, todos com comparação estrita, como no consenso). Os problemas relevantes são de **robustez** (unidade declarada ignorada, controle não detectado no caminho provável, reclassificação ao trocar de unidade), de **omissões de aviso** e de **textos de privacidade imprecisos**.

---

## Achados

### GLI-01 — IMPORTANTE (quase crítico) — erro objetivo: trocar mg/dL para mmol/L muda a classificação das medições

- **Onde:** `GlicosimetroPage.tsx:273-284` (`changeUnit`) e `:256-263` (`toMgdl`).
- **O que faz:** ao trocar a unidade, o alvo é convertido e **arredondado a 0,1 mmol/L**: 70 vira 3,9 e 180 vira 10,0. Esses valores são reconvertidos com 18,016, o que dá alvo mínimo = 70,26 mg/dL e máximo = 180,16 mg/dL.
- **Consequência:** uma glicemia de **70 mg/dL passa a ser contada como "abaixo do alvo"** (70 < 70,26) só por ter trocado a unidade. Isso altera `pctBelow`, `pctInRange`, o gráfico (marcador ▼), a observação na tabela e o CSV de leitura. Um valor de 180 continua "no alvo" (180 < 180,16). Ao voltar para mg/dL, o alvo volta a 70 e a classificação muda de novo.
- **Fonte:** o consenso define o alvo como 70–180 mg/dL = 3,9–10,0 mmol/L, ou seja, os limiares são os mesmos nas duas unidades.
- **Recomendação:** manter o alvo internamente em mg/dL (estado único) e converter só para exibição. Se o usuário digitar em mmol/L, converter e **arredondar para inteiro em mg/dL** (3,9 mmol/L = 70). Adicionar teste: leitura de 70 mg/dL contada como "no alvo" nas duas unidades.
- **Confiança:** alta (leitura do código; não executei).

### GLI-02 — IMPORTANTE — escolha não sinalizada: "solução de controle" só é detectada se o aparelho enviar o mapa de entradas

- **Onde:** `segments.ts:163-178` (`decodeRocheFixed` fixa `isControl: false`), `:219` e `docs/accu-chek.md` item 2 e 3. O texto da tela é "N testes com solução de controle ficaram fora do resumo" (`GlicosimetroPage.tsx:464-468`).
- **O que faz:** no layout fixo de 12 bytes, que é o caminho que a própria documentação diz ser o provável (o mapa "não sabemos se os Accu-Chek mandam"), **nenhuma medição é marcada como controle**. Testes com solução de controle entram na média, no desvio, no CV, na distribuição e no gráfico como se fossem glicemia do paciente. Um controle "alto" ou "baixo" (que é de faixa conhecida) pode gerar falsos "hipo/hiper".
- **O que a tela diz:** só mostra a frase de exclusão quando `control > 0`. Quando nada é detectado, a tela dá a impressão de que não há controles, sem avisar que a detecção é incerta.
- **Fonte:** o código de métrica de controle (29136) vem do 10417 e o próprio `docs/accu-chek.md` diz "não foram conferidos". Não pude conferir o texto da norma.
- **Recomendação:** aviso fixo no relatório de leitura real: "Esta página só identifica testes com solução de controle quando o aparelho informa o tipo da medição; confira no aparelho se houve testes de controle no período." Considerar ainda mostrar, na tabela, a coluna de status bruto (hoje só no CSV) para o médico ver diferenças.
- **Confiança:** alta no mecanismo; média no impacto real (depende do que o aparelho transmite).

### GLI-03 — IMPORTANTE — a unidade declarada pelo aparelho é lida e ignorada

- **Onde:** `manager.ts:122-123` e `:210` (lê `declaredUnit`); `analysis.ts:7` e `docs/accu-chek.md` ("A transferência é sempre em mg/dL"); `GlicosimetroPage.tsx:554` (só exibe em "Detalhes técnicos").
- **O que faz:** o valor SFLOAT é sempre tratado como mg/dL. Se algum aparelho/firmware transmitir 5,6 com unidade mmol/L, o app mostraria 6 mg/dL e classificaria como "LO/abaixo de 54". A afirmação "sempre em mg/dL" aparece como fato na documentação, mas é uma hipótese não testada em aparelho real.
- **Recomendação:** se `declaredUnit === 'mmol/L'`, ou converter (×18,016, com aviso) ou **abortar** a leitura com mensagem clara. Se `declaredUnit` for nulo ou diferente de mg/dL, avisar no cabeçalho do relatório. Plausibilidade: valores numéricos <20 em toda a série sugerem mmol/L.
- **Confiança:** alta no código; média no risco real (os Accu-Chek brasileiros são mg/dL).

### GLI-04 — IMPORTANTE — omissão de aviso: leitura nunca testada em aparelho real não é sinalizada na tela de resultado

- **Onde:** `GlicosimetroPage.tsx:312-319` (aviso só no modo demonstração); `README.md:8-9` e `ConnectPanel` (lista Performa Connect e Aviva Connect como lidos).
- **O que faz:** a decisão do usuário de não testar é intencional, mas a tela de resultado de um aparelho real não traz nenhum aviso. Um médico vê "Guide, Guide Me, Instant, Instant S, Performa Connect e Aviva Connect" como lidos e uma tabela de valores sem aviso de que a decodificação nunca foi conferida contra o visor.
- **Recomendação:** nota fixa no relatório real, por exemplo: "Leitura experimental: confira alguns valores, datas e horas com o visor do aparelho antes de usar estes dados." No README e no texto da conexão, falar em "modelos previstos" e não em modelos lidos.
- **Confiança:** alta.

### GLI-05 — IMPORTANTE — escolha não sinalizada: métricas e limiares de CGM aplicados a glicemia capilar (SMBG)

- **Onde:** `analysis.ts:68` (`DEFAULT_TARGET` 70–180), tiles "Abaixo de 54" e "Acima de 250" (`GlicosimetroPage.tsx:428-437`), barra "No alvo" (`:444-462`), CV (`:417-422`).
- **O que faz:** o app usa os cortes do consenso de CGM sobre medições pontuais. A tela já avisa: "Percentuais sobre medições capilares pontuais (inclui HI e LO), não sobre tempo contínuo como no sensor (CGM)" (`:469-472`). Isso está **correto e sinalizado**; há três lacunas.
  1. O rótulo "No alvo" e a barra evocam "tempo no alvo". O consenso é de CGM (Tabela 1: "Standardized CGM metrics") e recomenda ≥14 dias e ≥70% de dados. Não existe equivalente validado para SMBG. Em SMBG, a amostragem é enviesada (o paciente mede mais quando acha que está mal ou em jejum).
  2. Não há aviso de **número mínimo de medições**: com 3 medições, a tela mostra "33%" como se fosse distribuição.
  3. O CV (consenso: ≤36%) e o desvio padrão são calculados sobre amostragem irregular e **excluem HI/LO** (subestimam variabilidade). A tela mostra o CV sem referência, o que é prudente, mas não avisa que o CV por SMBG não é comparável ao do CGM.
- **Recomendação:** trocar o título do bloco por "Distribuição das glicemias capilares" (evitar "tempo no alvo"); mostrar o n absoluto ao lado de cada percentual (ex.: "No alvo: 62% (31 de 50)"); aviso quando n < ~30 ou há poucos dias; completar a nota atual com "o CV e o desvio padrão não são comparáveis aos do CGM". O alvo padrão 70–180 vale para adultos com DM1/DM2; para gestantes e idosos/alto risco o consenso traz outras metas (63–140 mg/dL na gestação). Vale um hint de que o alvo é editável e o padrão é o do consenso para adultos.
- **Tipo:** escolha não sinalizada (parcialmente sinalizada). **Confiança:** alta.

### GLI-06 — IMPORTANTE — arredondamento oculta hipoglicemia: "0%" com ocorrência real

- **Onde:** `GlicosimetroPage.tsx:47` (`fmtPct` com `toFixed(0)`), tile "Abaixo de 54 mg/dL", RangeBar (`GlucoseChart.tsx:272-296`).
- **O que faz:** 1 medição <54 em 300 (0,33%) aparece como "0%". Também há tabela "Por período do dia" com "Abaixo 0%" mesmo com evento. O subtítulo do tile mostra só "LO: n", então um valor numérico de 45 mg/dL não aparece em lugar nenhum do resumo, a não ser no "Menor". A soma das faixas arredondadas pode dar 99% ou 101%.
- **Recomendação:** mostrar o n absoluto (ex.: "0,3% (1 de 300)") e uma casa decimal quando <1%; nunca mostrar "0%" se count > 0 (usar "<1%"). Em segurança de hipoglicemia, a contagem de eventos importa mais que o percentual.
- **Confiança:** alta.

### GLI-07 — IMPORTANTE — textos de privacidade imprecisos sobre exportações

- **Onde:** `App.tsx:45-48` ("tudo o que você digita ou lê do glicosímetro fica só nesta aba e some ao fechar ou recarregar a página") e `GlicosimetroPage.tsx:152-155` ("nada é enviado ou gravado").
- **O que faz:** a frase é verdadeira para o estado do app. Mas CSV, diagnóstico (.txt) e PDF **são gravados em disco** (com data, hora, valores, número de série do aparelho e a "Identificação" do paciente no PDF), e o botão "Apagar e ler outro" apaga só a tela. "Nada é … gravado" contradiz o botão "Exportar CSV" que a própria tela oferece. Além disso, "sem servidor" é impreciso quando a página é publicada em hospedagem estática (existe servidor que entrega os arquivos, mas nenhum dado do paciente é enviado a ele; a CSP `connect-src 'none'` sustenta isso).
- **Recomendação:** "Nada é enviado nem guardado pela página. Arquivos que você exportar (CSV, PDF, diagnóstico) ficam no seu computador e contêm dado de saúde: guarde e descarte conforme a política do seu serviço." Trocar "nada é … gravado" por "não é gravado pela página". O hint "Fica só nesta tela e no PDF que você gerar" (`:354`) está correto; incluir um alerta de que o nome do paciente no PDF/impressão é dado pessoal.
- **Confiança:** alta.

### GLI-08 — IMPORTANTE — data e hora do aparelho: o aviso é genérico e o filtro de período depende do relógio do aparelho

- **Onde:** `GlicosimetroPage.tsx:339-342` e `:336-337`; `analysis.ts:49-61` (`filterPeriod`).
- **O que faz:** a tela mostra o relógio do aparelho e uma nota estática. Não compara com o relógio do computador (que o app tem em `nowStamp`), não alerta se há medições **futuras** em relação ao relógio do PC ou se o relógio do aparelho difere em mais de 1 dia. O filtro "Últimos 14 dias" conta a partir da **medição mais recente**, o que o rótulo não diz; um relógio do aparelho adiantado ou errado desloca toda a série e a janela. Medições sem data são silenciosamente excluídas quando se escolhe 7/14/30/90 dias, mas entram em "Toda a memória".
- **Recomendação:** alerta quando |relógio do aparelho − relógio do PC| > 1 dia ou houver medição posterior ao relógio do aparelho; rótulo "Últimos 14 dias (a partir da última medição)"; aviso "N medições sem data não entram neste período".
- **Confiança:** alta.

### GLI-09 — IMPORTANTE — o disclaimer não cobre o glicosímetro nem cita fonte dos limiares

- **Onde:** `App.tsx:125-129`: "Os cálculos seguem as fontes citadas em cada seção".
- **O que faz:** a seção do glicosímetro **não cita fonte alguma** para 70, 180, 54 e 250 nem para 18,016. O invariante 5 do `CLAUDE.md` exige a fonte citada na tela. Nenhuma menção à acurácia do glicosímetro (a norma ISO 15197 admite erro de até ±15%; opinião clínica geral, sem fonte aberta nesta revisão) ou ao fato de que "abaixo do alvo" não é diagnóstico.
- **Recomendação:** rodapé no resumo: "Alvo padrão 70–180 mg/dL e níveis <70/<54/>250 mg/dL: Consenso internacional de tempo no alvo (Battelino et al., Diabetes Care 2019;42:1593), definido para CGM e aplicado aqui, por convenção, a glicemias capilares. Conversão: 1 mmol/L = 18,016 mg/dL." Conferir se a SBD 2026 adota os mesmos cortes antes de citá-la.
- **Confiança:** alta.

### GLI-10 — MENOR — "Menor / maior" e a média excluem HI/LO sem aviso no próprio tile

- **Onde:** `GlicosimetroPage.tsx:438-442`; `analysis.ts:125-126`. A nota geral diz "A média e o desvio padrão não incluem HI/LO", mas não menciona min/max.
- **O que faz:** com um LO no período, o "menor" mostrado pode ser 45 mg/dL, quando o menor real é "LO" (<10 mg/dL no Accu-Chek, valor do fabricante, não conferido). A média também fica **enviesada para o centro**.
- **Recomendação:** quando houver HI/LO, exibir "LO" ou "HI" no menor/maior (ex.: "LO / 312") ou adicionar "(sem HI/LO)". Incluir "e os extremos" na nota.
- **Confiança:** alta.

### GLI-11 — MENOR — medição de controle recebe observação "abaixo/acima do alvo"

- **Onde:** `GlicosimetroPage.tsx:534-538`. A linha de controle com valor <70 exibe "solução de controle; abaixo do alvo". O controle não é glicemia do paciente e não deveria ser comparado ao alvo. A tabela também lista as linhas de controle junto às medições do paciente, e o título "Medições (N)" as conta.
- **Recomendação:** não gerar observação de alvo quando `isControl`; opcionalmente atenuar a linha.
- **Confiança:** alta.

### GLI-12 — MENOR — "Medições por dia" ignora os dias sem medição

- **Onde:** `analysis.ts:133` (`denom / dayKeys.size`). A tela rotula "dias com medição", correto, mas o valor sugere frequência de automonitorização maior que a real (um paciente que mede em 3 dias de 14 aparece com média alta). Para avaliar adesão à automonitorização, dividir pelo número de dias do período.
- **Recomendação:** mostrar também "dias com medição: 3 de 14".
- **Confiança:** alta.

### GLI-13 — MENOR — rótulos em mg/dL fixos quando a unidade é mmol/L; escala do eixo

- **Onde:** tiles "Abaixo de 54 mg/dL" e "Acima de 250 mg/dL" (`:429, :434`); eixo Y do gráfico com passo de 50 mg/dL convertido (`GlucoseChart.tsx:94-96`), o que gera marcas como 2,8 / 5,5 / 8,3 / 11,1 em mmol/L.
- **Recomendação:** "Abaixo de 54 mg/dL (3,0 mmol/L)" ou rótulo na unidade escolhida; marcas do eixo em valores redondos da unidade (2, 4, 6...).
- **Confiança:** alta.

### GLI-14 — MENOR — CSV: comentários antes do cabeçalho e conteúdo do aparelho

- **Onde:** `analysis.ts:190-193`. As linhas `# Glicosímetro…` e `# Exportado em…` entram como linhas de dados no Excel (a coluna A). Linhas de controle e HI/LO ficam no arquivo, o que é correto (rotuladas). O CSV não registra o alvo usado nem o período. O CSV tem o rótulo "Glicemia (mmol/L)" com vírgula decimal: coerente. `deviceLabel` vem do aparelho e não é sanitizado contra fórmula (`=`, `+`): risco baixo.
- **Recomendação:** aceitável; opcionalmente cabeçalho de colunas na linha 1 e metadados em colunas ou arquivo à parte; prefixar com apóstrofo células que iniciem com `=+-@`.
- **Confiança:** média.

### GLI-15 — MENOR — duplicatas e medições inválidas não tratadas

- **Onde:** `analysis.ts:28-45` e `segments.ts:155-161`. Medições com SFLOAT NaN/NRes/reservado viram `mgdl:null, flag:null`: contadas em `total` ("N medições na memória") mas ausentes de qualquer estatística e exibidas como "—" sem explicação. Medições duplicadas em múltiplos segmentos não são deduplicadas (o doc diz que o leitor percorre todos os segmentos, algo que as referências não faziam).
- **Recomendação:** contar e exibir "N registros sem valor numérico"; avaliar dedupe por (data/hora, valor) com aviso.
- **Confiança:** média.

### GLI-16 — MENOR — `MSMT_STATUS_BITS` define interpretações que o app não usa

- **Onde:** `nomenclature.ts:133-144`. Dead code com significados ("inválida", "questionável", "validada"...). Hoje **não é usado** (confirmado por busca), então o invariante 6 ("status bruto não é interpretado") está respeitado; a lista conferida com minha memória do 20601 coincide em bits (invalid 0x8000, questionable 0x4000 ... validated-data 0x0080). Risco: alguém ligá-lo à UI sem teste.
- **Recomendação:** remover ou marcar no código "não usar na UI". Nenhum texto de tela inventa significado clínico: o status aparece só como hex no CSV. OK.
- **Confiança:** alta.

### GLI-17 — MENOR — testes: cobertura das bordas clínicas

- `analysis.test.ts` está coerente (média 127,5; 50 abaixo; 200 e HI acima; 4 dias). Mas **não testa**: valor exatamente 70, 180, 54 e 250 (comparações estritas); LO; CV e desvio; trocar unidade; mmol/L com alvo; controle contado; medição sem data; filtro com data errada.
- **Recomendação:** adicionar testes das bordas (70 está no alvo; 69 abaixo; 180 no alvo; 181 acima; 54 não é <54; 53 é; 250 não é >250) e do GLI-01.

---

## Conferido e correto

- Limiares <70 / ≤180 no alvo / >180 acima / <54 / >250, todos com comparação estrita (`analysis.ts:107-110`) e no alvo inclusivo nos extremos, conforme o consenso (Tabela, níveis 1 e 2).
- 70–180 mg/dL = 3,9–10,0 mmol/L: o teste `formatGlucose(180,'mmol/L') = '10,0'` confere. Conversão 18,016 (aproximação padrão; a diretriz brasileira pode usar 18, diferença <0,1%).
- Nenhum texto usa "grave", "severa" ou conduta: o rótulo é só "abaixo de 54 mg/dL". Não há recomendação terapêutica na tela do glicosímetro.
- Mediana/GMI/HbA1c estimada **não** são exibidos (corretamente: GMI é válido só para CGM).
- Desvio padrão amostral (n−1); CV = DP/média×100 sem inferir "estável/instável".
- HI/LO entram como acima/abaixo de alvo e de 250/54, e não entram na média: coerente e informado.
- Controle excluído das estatísticas quando detectado (`computeStats`) e do gráfico.
- Ordenação mais recente primeiro com desempate pela posição na memória; cálculo de dias por data de calendário do aparelho sem fuso (adequado).
- SFLOAT especiais (+INF 0x07FE = HI, −INF 0x0802 = LO, NaN 0x07FF, NRes 0x0800, reservado 0x0801) e códigos de unidade 2130 (mg/dL) e 4722 (mmol/L): conferem com o que conheço do 11073-20601/10101 (sem checagem do texto da norma).
- Status bruto exportado em hex sem interpretação (invariante 6 respeitado); nenhum marcador de refeição é interpretado ou inventado.
- A nota de CGM vs capilar existe (`:469-472`); aviso de relógio do aparelho existe (parcial, ver GLI-08).

## Não consegui verificar

- Diretriz SBD 2026 (metas de automonitorização, hipoglicemia níveis 1 e 2, pré/pós-prandial) e ADA Standards 2026 seção 6: não abertas. Não confirmei se a SBD usa 18 ou 18,016, nem metas específicas de SMBG (jejum/pré-prandial e pós-prandial), que diferem da faixa de TIR.
- Consenso de Battelino: só li as Tabelas 1 a 3 (primeiros 100 mil caracteres); não li o trecho final (34 mil caracteres) nem a atualização 2023 sobre CGM.
- IEEE 11073-10417 e 20601: texto da norma não acessado (pago). Códigos de métrica 29112 a 29140 (inclusive 29136 = controle), bits do MeasurementStatus e código de unidade: só memória.
- Valor de "LO" do Accu-Chek (<10 mg/dL) e "HI" (>600): conhecimento geral do fabricante, não conferido; o app não depende deles.
- Comportamento real de CSS de impressão (`styles.css:395-421`) e conteúdo da impressão: não renderizei.
- Nada foi executado (código lido, testes não rodados).
