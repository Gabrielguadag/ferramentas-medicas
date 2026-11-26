# Revisão clínica: INS (consulta de diabetes: insulinas, glargina, NPH, titulação, prandial, metas, fluxograma DM2)

Data da revisão: 2026-11-25. Somente leitura; nenhum arquivo do repositório foi alterado.

## Escopo e fontes

Arquivos auditados (`c:\Smedic\ferramentas-diabetes\`):
`src/glargina/rules/{migracao,insulina,titulacao,metas,pcdt}.ts`, `rules/rules.test.ts`, `src/glargina/sources.ts`,
`sections.tsx`, `patient.tsx`, `ConsultaPage.tsx`, `docs/glargina-regras.md` (auditado, não usado como fonte).
Citações de linha de `sections.tsx` referem-se à numeração do arquivo.

Fontes primárias lidas:

- **NT Conjunta 169/2026** (MS; assinada 12/06/2026), PDF baixado da URL de `sources.ts` e salvo em
  `<scratchpad>/review/src/INS/nt169.pdf` (texto em `nt169.txt`); páginas 7 e 9 conferidas em imagem.
- **PCDT DM2 2026** (Portaria SCTIE/MS nº 13, de 21/02/2026): `<scratchpad>/pcdt-src/pcdt-dm2-2026.pdf`, texto em
  `<scratchpad>/dl/pcdt.txt`, Figuras 2 e 3 conferidas em imagem (`pcdt-out/fig-p22.png`, `fig2-notes.png`, `fig-p30.png`).
- Guia MS "Os benefícios da insulina glargina" (só o trecho extraído em `<scratchpad>/guia.txt`, p. 9).
- SBD: o `sbd.txt` local trata de risco cardiovascular (outra área); o app não cita SBD diretamente (só via NT/PCDT).

Resumo: 1 CRÍTICO (INS-01), 12 IMPORTANTES (INS-02 a INS-13), 11 MENORES (INS-14 a INS-24). Os números e fórmulas centrais (conversão 1:1/−20%, 10 U ou 0,1–0,2 U/kg,
+2 U/3 dias, −2 a −4 U, 80% em 2/3+1/3, 3–4 U de bolus, Quadros 5, 7 e 8, Figura 2) batem com as fontes. Os problemas
estão sobretudo em generalização de regras do DM2 adulto para outros públicos, omissões de segurança e escolhas não sinalizadas.

---

## Achados

### INS-01 — CRÍTICO — Regras de titulação do PCDT DM2 adulto (±2 U fixos, limiar 80 mg/dL) aplicadas a DM1, crianças e qualquer perfil

- **Tipo:** erro objetivo (generalização indevida da fonte).
- **Onde:** `rules/titulacao.ts:34-58`; `sections.tsx:251-320` (Titulação), `sections.tsx:174-215` (Início NPH); `patient.tsx` (tipo DM1 e perfil "Criança/adolescente" selecionáveis).
  Texto de tela: "Aumentar 2 U", "Reduzir 2 a 4 U", "Reduzir 2 U", "Vale para NPH e para glargina".
- **O que o app faz:** com `type = DM1` e/ou `profile = crianca` (meta de jejum 70–130), a seção Titulação devolve as mesmas
  condutas em unidades fixas: jejum < 70 → reduzir 2–4 U; < 80 → reduzir 2 U; média acima da meta → aumentar 2 U. Não há nenhum
  aviso de que a regra é do DM2 adulto. O corte de 80 mg/dL também contradiz a meta exibida para criança (70–130): jejum de 75 mg/dL
  está dentro da meta da criança e o app manda reduzir.
- **O que a fonte diz:**
  - PCDT 8.3.4.1 (p. 25–26) e Figura 3 (p. 30) são do DM2 em adultos: "Figura 2 ... para indivíduos com idade igual ou maior a 18
    anos com DM2"; critério de inclusão (item 6): "indivíduos com idade igual ou superior a 18 anos e com diagnóstico confirmado de DM2".
  - NT 169, Quadro 3 (p. 7) para a titulação da glargina após a transição, sem incremento fixo: "Ajustar a dose de forma
    individualizada, com base na glicemia de jejum. Quando necessário, realizar titulação em intervalos de até três dias."
  - NT 169, Anexo item 1: doses de DM1 em crianças são por kg (Quadro 1: basal 0,1–0,2 a 0,4–1,0 UI/kg/dia). Para criança pequena, 2 U
    pode ser 20–50% da basal.
- **Recomendação:** quando `type === 'DM1'` ou `age < 18` (ou perfil criança): não exibir "±2 U" como conduta; mostrar a direção
  (reduzir/manter/aumentar) com aviso em destaque: "O passo de 2 U/3 dias vem do PCDT DM2 adulto. Em DM1/criança, a NT 169 manda
  ajuste individualizado pela glicemia de jejum em intervalos de até 3 dias; definir o incremento por peso e DTDI". Usar o limiar de
  hipoglicemia da própria meta do perfil. Aplicar o mesmo aviso à seção "Início da NPH" (10 U fixos / 0,1–0,2 U/kg são do DM2 adulto).
- **Confiança:** alta (a restrição de público é literal nas fontes; a ausência de aviso na tela é verificável no código).

### INS-02 — IMPORTANTE — Fluxograma "Tratamento do DM2" e "Início da NPH/bolus" sem trava de idade (< 18) nem de tipo (DM1)

- **Tipo:** erro objetivo / omissão.
- **Onde:** `sections.tsx:566-698` (`TratamentoSection` não usa `patient.type` nem valida idade); `rules/pcdt.ts` (todo).
- **O que o app faz:** com paciente DM1 ou de 12 anos, entrega "Iniciar metformina...", "adicionar sulfonilureia", "dapagliflozina" normalmente.
- **O que a fonte diz:** Figura 2, título: "Fluxograma de tratamento para indivíduos com idade igual ou maior a 18 anos com diabete melito tipo 2" (p. 22).
  Crianças com DM2 têm item próprio (8.11.1, p. 40) com outra conduta (metformina se HbA1c < 8,5%; insulina de ação prolongada se glicemia ≥ 250 e HbA1c ≥ 8,5% com sintomas).
- **Recomendação:** exibir faixa de alerta e suprimir a conduta quando `type === 'DM1'` ou `age < 18`: "Fluxograma do PCDT vale para DM2 com 18 anos ou mais".
- **Confiança:** alta.

### INS-03 — IMPORTANTE — Titulação "+2 U" sem checar a dose atual: não alerta para excesso de basal (> 0,5 U/kg/dia) antes de mandar aumentar

- **Tipo:** escolha não sinalizada / omissão de segurança.
- **Onde:** `rules/titulacao.ts:44-52`, `sections.tsx:251-320`. A seção não recebe a dose atual, apesar de o peso estar no painel.
- **O que o app diz:** "Média de jejum ... acima da meta: aumentar 2 U e reavaliar em 3 dias" sem considerar a dose total.
- **O que a fonte diz:** NT 169, Quadro 4 (p. 8–9), Observação: "Nessas situações, recomenda-se reavaliar o esquema terapêutico, evitando o aumento adicional da insulina basal e, quando necessário, realizar o cuidado compartilhado com a Atenção Especializada" (critérios: basal > 0,5 UI/kg/dia; HbA1c acima da meta com jejum no alvo; hipoglicemias; queda > 50 mg/dL deitar→acordar). PCDT 8.3.4.1 (p. 26): teto "< 0,5 U/kg/dia ... 0,75 U/kg/dia reservada, apenas, para aqueles com maior obesidade e resistência à insulina".
- **Recomendação:** acrescentar o campo "dose basal atual (U/dia)"; se dose/peso > 0,5 (ou ≥ teto do perfil), trocar "aumentar 2 U" por alerta de revisão do esquema (excesso de basal). Hoje o alerta só existe na seção Migração e o teto só em Início da NPH; a Titulação (onde o médico decide aumentar) não os usa.
- **Confiança:** alta.

### INS-04 — IMPORTANTE — Alerta de excesso de basal no DM1 usa DTDI anterior com a glargina já convertida (falso negativo)

- **Tipo:** erro objetivo de cálculo/UX.
- **Onde:** `sections.tsx:37` (`basalAlert(patient.type, conv.glargine, patient.weight, dtdi)`), `rules/migracao.ts:38-41`; rótulo "DTDI (basal + rápida)" em `sections.tsx:79`.
- **O que o app faz:** divide a glargina convertida pela DTDI informada, que é (pelo rótulo) a dose atual com a NPH. Exemplo: NPH 30 U (2x) + rápida 20 U → DTDI 50; glargina 24; o app calcula 24/50 = 48% (sem alerta). A DTDI pós-conversão é 24 + 20 = 44 e a basal seria 54,5% (> 50%: alerta).
- **O que a fonte diz:** Quadro 4 (p. 8–9): "Insulina basal > 50% da DTDI" (DTDI = soma de basal e prandial, Anexo item 1, p. 5–6).
- **Recomendação:** pedir a dose prandial (rápida) e calcular DTDI = glargina convertida + prandial; ou calcular `(dtdi − nph + glargina)`. Deixar claro no rótulo qual DTDI é pedida.
- **Confiança:** alta.

### INS-05 — IMPORTANTE — Omissão de contraindicações/limites de TFG de metformina e sulfonilureia e de gestação no fluxograma

- **Tipo:** omissão de segurança (a fonte traz).
- **Onde:** `rules/pcdt.ts:95-116` (notas de metformina e sulfonilureia); `sections.tsx:647-664`. O app só cita TFGe < 25 para dapagliflozina e nunca pergunta TFG nem gestação.
- **O que a fonte diz:**
  - PCDT 8.3.1 (p. 23): metformina "contraindicada em pacientes com insuficiência renal (TFG menor que 30 mL/min/1,73 m2)"; "Não se deve usar mais de 1 g/dia em pessoas com TFG 30 a 45 mL/min/1.73 m² e deve ser suspensa quando TFG < 30".
  - PCDT 8.9 (p. 39–40): metformina e sulfonilureias contraindicadas em "gravidez e durante amamentação"; sulfonilureias com "TFG menor que 30"; dapagliflozina em "gravidez e período de lactação".
  - PCDT 8.3 (p. 21): "Gestantes com DM2 pré-gestacional devem interromper tratamento não insulínico antes ou logo após o início da gestação".
- **Recomendação:** adicionar à card Tratamento: campo opcional TFGe (e aviso: metformina ≤ 1 g/dia se 30–45, suspender < 30; sulfonilureia contraindicada < 30, gliclazida MR só com muita cautela) e checkbox "gestante/lactante" que troca a conduta por "gestação: tratamento não insulínico deve ser interrompido; insulinoterapia (PCDT 8.3)". Ver também INS-09 (gestação nas metas).
- **Confiança:** alta.

### INS-06 — IMPORTANTE — Conduta "Iniciar insulinoterapia" não diz para manter a metformina/hipoglicemiantes orais

- **Tipo:** omissão (a fonte traz).
- **Onde:** `rules/pcdt.ts:58-67, 128-165`.
- **O que a fonte diz:** Figura 2, nota h (p. 22): "Os hipoglicemiantes orais podem ser mantidos, a critério médico, principalmente a metformina nos casos com resistência à insulina." PCDT 8.3.1 (p. 23): "O cloridrato de metformina deve ser mantida quando o paciente inicia o uso de insulina ... a não ser que tenha alguma contraindicação". PCDT 8.3.4 (p. 25): "indicação de insulina basal e bolus" para HbA1c > 9% / jejum ≥ 300 / sintomas.
- **Recomendação:** incluir nas notas da conduta de insulina: "Manter metformina, salvo contraindicação (nota h da Figura 2; 8.3.1)". Para a indicação por hiperglicemia grave (nota b), acrescentar que o PCDT 8.3.4 fala em "insulina basal e bolus" (a conduta só cita NPH).
- **Confiança:** alta.

### INS-07 — IMPORTANTE — Elegibilidade à glargina omite o item 3.5 (usuários do CEAF) e os critérios de 3.4

- **Tipo:** omissão (a fonte traz).
- **Onde:** `sources.ts:20-38` e `sections.tsx:43-58, 124-127` (faixa verde "Elegível à glargina (NT 169/2026)").
- **O que a fonte diz:** NT 169, 3.4 (p. 2): critérios que "permanecem aplicáveis": "Necessidade de prescrição válida, conforme normativas locais; Avaliação clínica individualizada pelo profissional de saúde; Observância dos fluxos assistenciais ... APS e ... AES". 3.5: "As pessoas das referidas faixas etárias já em acompanhamento no Componente Especializado da Assistência Farmacêutica (Ceaf) deverão manter, neste momento, seu acompanhamento conforme as regras vigentes, assegurando o acesso e evitando duplicidade de fornecimento." 8.2: "sem a migração de pessoas usuárias do Ceaf".
- **O que o app diz:** apenas idade/tipo (documentado: "apenas idade e tipo de diabetes"), mas a faixa verde afirma "Elegível à glargina" sem ressalva. A leitura apressada é "elegível = migrar", inclusive quem está no CEAF.
- **Recomendação:** texto da faixa: "Elegível pela idade/tipo (item 3.1). Também exige prescrição válida e avaliação clínica individualizada (3.4); quem já é atendido pelo CEAF mantém o fluxo atual (3.5)". Mencionar ainda que o item 3.1 inclui "novos diagnósticos" (não só migração de NPH).
- **Confiança:** alta.

### INS-08 — IMPORTANTE — Meta pré-prandial/limite superior do bolus de correção não segue o perfil (idoso); algoritmo fixo "70–130 = 0"

- **Tipo:** escolha não sinalizada.
- **Onde:** `sections.tsx:327` (`useState(130)` para o limite superior), `rules/insulina.ts:36-45` (Quadro 8 fixo).
- **O que a fonte diz:** NT 169 Quadro 5: a coluna é "Glicemia de jejum e pré-prandial": 80–130 (adulto), 90–150 (idoso comprometido), 100–180 (idoso muito comprometido), 70–130 (criança). PCDT Quadro 7 usa 130 como LSOG para um paciente "idoso" apenas como exemplo.
- **O que o app faz:** limite superior fixo em 130 independentemente do perfil, e o Quadro 8 (valores absolutos) não é adaptável. Em idoso comprometido/muito comprometido a correção acrescenta insulina a glicemias que a própria meta aceita (ex.: 160 mg/dL em idoso muito comprometido recebe +1 U).
- **Recomendação:** pré-preencher o limite superior com o teto de jejum/pré-prandial do perfil (`goal.fasting[1]`) e avisar que o Quadro 8 foi desenhado com meta 70–130; para idosos frágeis, sugerir revisão da dose de correção. Rotular a faixa na seção Metas como "jejum e pré-prandial" (ver INS-15).
- **Confiança:** média (a fonte não proíbe o algoritmo; a inconsistência com o Quadro 5 é objetiva).

### INS-09 — IMPORTANTE — Nenhuma sinalização de gestação nas metas, na titulação e no fluxograma

- **Tipo:** omissão / opinião clínica com lastro parcial na fonte.
- **Onde:** `patient.tsx` (não há campo de gestação), `rules/metas.ts` (perfis), `sections.tsx` (Metas/Titulação).
- **O que a fonte diz:** PCDT item 6, nota (p. 15): "Gestantes com DM2 pré-gestacional também são contempladas por este Protocolo"; 8.3 (p. 21) ver INS-05. As metas do Quadro 5/6 são para não gestantes; os alvos de gestação são diferentes (outra diretriz; não verificados aqui).
- **Recomendação:** pelo menos um aviso (sexo feminino em idade fértil) "Se gestante: as metas e condutas desta tela não se aplicam; seguir protocolo de diabetes na gestação".
- **Confiança:** média (a fonte confirma a existência da população; os alvos gestacionais não foram checados).

### INS-10 — IMPORTANTE — Titulação decide "aumentar" pela média de 3 jejuns; o PCDT não define média (escolha de interface) e a faixa abaixo da meta sem valor < 80 vira "manter" (não sinalizado na tela)

- **Tipo:** escolha não sinalizada.
- **Onde:** `rules/titulacao.ts:34-52`, `sections.tsx:251-320`; teste `rules.test.ts:57` trava `[85,85,85]`, idoso muito comprometido → "manter-avaliar".
- **O que a fonte diz:** PCDT 8.3.4.1: "ajustando-se em 2 U, a cada 3 dias, até atingir a meta estabelecida para a glicemia em jejum"; sem regra de média. Para o caso "abaixo da meta, sem < 80", o PCDT não tem regra (reconhecido em `docs/glargina-regras.md`, mas a tela só diz "manter e reavaliar").
- **Problemas concretos:** (a) jejuns `[200, 100, 100]` (média 133) → "aumentar 2 U" com 2 de 3 valores na meta; (b) idoso muito comprometido (meta 100–180) com jejum 85–99 → "manter e reavaliar", embora esteja abaixo da meta do perfil e do limite de segurança desse perfil; (c) a regra "< 80" da Figura 3 foi escrita para meta 80–130; (d) a média é arredondada antes de comparar (130,6 → 131 aciona aumento, 130,4 → 130 não).
- **Recomendação:** exibir na tela a regra usada ("média dos jejuns informados") e a ressalva "o PCDT não define como combinar vários jejuns"; para jejum abaixo da meta do perfil, trocar o texto por "abaixo da meta do perfil: avaliar redução da dose (risco de hipoglicemia), a fonte não define o passo"; comparar com a média sem arredondar.
- **Confiança:** média.

### INS-11 — IMPORTANTE — Fator de idade da dapagliflozina: texto do PCDT (homem ≥ 55) vs nota g da Figura 2 (≥ 65): app escolhe a leitura menos restritiva e a conduta do fluxograma não repete o conflito

- **Tipo:** divergência entre trechos da mesma fonte (sinalizada, mas parcialmente).
- **Onde:** `rules/pcdt.ts:146-172`; `sections.tsx:676-692` (faixa "Atende aos critérios." verde + faixa de aviso); `sections.tsx:648-656` (conduta "com critérios: adicionar dapagliflozina 10 mg/dia", sem aviso).
- **O que a fonte diz:** PCDT item 6 (p. 15): "Ter 55 anos ou mais (no caso de homens) ou ter 60 anos ou mais (no caso de mulheres)" e 8.3.3 (p. 25): "homens ≥ 55 anos ou mulheres ≥ 60 anos". Figura 2, nota g (p. 22): "ou homens com 65 anos ou mais ou mulheres com 60 anos ou mais e alto risco...". Dois trechos de texto dizem 55; a figura diz 65.
- **Avaliação:** o conflito é real e foi tratado (aviso nas idades 55–64), mas o título verde "Atende aos critérios" é assertivo e o conduct do fluxo ("com critérios: adicionar dapagliflozina") não carrega o aviso.
- **Recomendação:** nos homens de 55–64 anos, mostrar título neutro ("Atende ao texto do PCDT (≥ 55); não atende à nota g da Figura 2 (≥ 65)") e repetir isso nas notas do fluxo. Acrescentar as cautelas do 8.3.3 (p. 25): idosos têm maior risco de cetoacidose euglicêmica e infecções urogenitais; eficácia menor com TFG < 45; contraindicada na gestação/lactação.
- **Confiança:** alta.

### INS-12 — IMPORTANTE — "Sobrepeso ou obesidade (IMC ≥ 30 kg/m²)" como fator de risco copia uma incoerência da fonte sem alertar

- **Tipo:** fonte ambígua; app copia literalmente.
- **Onde:** `rules/pcdt.ts:20` e checkbox em `sections.tsx:631-643`.
- **O que a fonte diz:** Figura 2, nota a (p. 22): "sobrepeso ou obesidade (IMC ≥ 30 kg/m²)". Sobrepeso é IMC ≥ 25; o PCDT 8.3 (p. 21) fala em "sobrepeso e obesidade". O app tem altura e peso e calcula o IMC, mas deixa a decisão ao marcar manual.
- **Impacto:** em diagnóstico < 3 meses, quem tem IMC 27 e marca "não" cai em "só mudança de estilo de vida" (ramo sem fator de risco), quando o texto pode pretender metformina desde o início.
- **Recomendação:** acrescentar "(o PCDT escreve IMC ≥ 30 na nota, mas fala em 'sobrepeso e obesidade'; IMC 25–29,9 é decisão do médico)" e mostrar o IMC calculado ao lado.
- **Confiança:** média.

### INS-13 — IMPORTANTE — Nota sobre sulfonilureia em idosos é mais fraca que o aviso do PCDT para glibenclamida (≥ 60 anos)

- **Tipo:** omissão de segurança.
- **Onde:** `rules/pcdt.ts:111` ("Para idosos, preferir gliclazida à glibenclamida (nota f)").
- **O que a fonte diz:** Figura 2, nota f: "Para idosos, sugere-se a gliclazida como sulfonilureia como opção à glibenclamida" (consistente com o app). Mas PCDT 8.9 (p. 40): "glibenclamida não é recomendada para pacientes com idade superior ou igual a 60 anos"; 8.3.2: "Para pacientes idosos, recomenda-se utilizar preferencialmente gliclazida". Também 8.3.2: "Nas pessoas idosas, as sulfonilureias de ação curta devem ser evitadas, além das sulfonilureias de ação prolongada" (texto interno incoerente).
- **Recomendação:** completar: "Glibenclamida: não recomendada ≥ 60 anos (PCDT 8.9). Preferir gliclazida MR". Definir "idoso" (PCDT 8.1 usa ≥ 60).
- **Confiança:** alta.

---

### INS-14 — MENOR — Rotulagem "Jejum" omite "e pré-prandial" do Quadro 5

- **Onde:** `rules/metas.ts:14`, `sections.tsx:518-525, 541`. **Fonte:** NT Quadro 5 (p. 9) coluna "Glicemia de jejum e pré-prandial (mg/dL)". **Recomendação:** rotular "Jejum e pré-prandial". **Confiança:** alta.

### INS-15 — MENOR — Divergências PCDT × NT nas metas não informadas na tela

- **Onde:** `rules/metas.ts` (HbA1c estrita; pós-prandial < 180 para idoso muito comprometido).
- **Fonte:** PCDT 8.1 (p. 13): "cujos valores esperados como meta terapêutica correspondem a ≤ 7,0%" (Quadro 6 e NT dizem "< 7,0"). PCDT Quadro 6 (p. 14): idoso muito comprometido, glicemia 2 h pós-prandial = "-" (sem meta); a NT Quadro 5 diz "<180". PCDT 8.1 define idoso como "idade ≥ 60 anos" (o app só infere no hint).
- **Recomendação:** nota na tabela "Todas as metas": HbA1c 7,0% exatamente: NT/Quadro 6 "< 7,0", texto do PCDT "≤ 7,0"; pós-prandial do idoso muito comprometido não tem meta no PCDT. **Confiança:** alta (divergência, não erro).

### INS-16 — MENOR — Conversão NPH→glargina: arredondamento e linguagem imperativa não sinalizados

- **Onde:** `rules/migracao.ts:17-24` (`Math.round`); `sections.tsx:92` ("Aplicar no horário da maior dose anterior de NPH").
- **O que a fonte diz:** NT Quadro 3 (p. 7): "Reduzir aproximadamente 20% da dose total diária prévia de NPH"; "preferencialmente no horário correspondente à maior dose anterior". Nenhum critério de arredondamento. PCDT 8.3.4.2: "dose total reduzida em 20% ... podendo ser administrada pela manhã ou à noite".
- **Observações:** arredondamento ao inteiro mais próximo é escolha do app (26,4 → 26; para doses pequenas de criança, 4,8 → 5 ou 0,4 → 0 UI); o app mostra o valor exato ("= 26,4 UI"), o que é bom. Em idoso propenso a hipoglicemia, arredondar para baixo seria opção conservadora (opinião). "Aplicar" vs "preferencialmente" muda a força da recomendação. **Recomendação:** trocar por "preferencialmente no horário da maior dose anterior (NT 169, Quadro 3)"; aviso quando o resultado arredondado for 0 ou a dose for pequena. **Confiança:** alta (texto) / baixa (arredondamento).

### INS-17 — MENOR — Tubetes/agulhas: omissões menores

- **Onde:** `sections.tsx:150-166`, `rules/migracao.ts:55-75`.
- **Conferido:** 3 mL × 100 UI/mL = 300 UI; 28 dias aberto; 2–8 °C; até 30 °C; caneta 3 anos/5.000 aplicações (NT p. 10–11). A NT cita média de "3,66 carpules/mês por pessoa", compatível com o cálculo.
- **Omissões:** NT: "Agulhas 4mm: uma agulha por dia (por tipo de insulina)", a tela diz só "Uma agulha por dia" (quem usa também insulina prandial precisa de mais); guia MS (p. 9, trecho extraído): "Refil (carpule) em uso, se você morar em local com temperatura acima de 30ºC: armazene na geladeira" e retirar 30 minutos antes (o app só diz "até 30 °C"). A escorva padrão de 2 UI é do app (a NT não define; o aviso "confira no manual" existe, boa prática). A referência "guia ... (MS, 2026)" não tem URL em `sources.ts`.
- **Recomendação:** acrescentar "uma agulha por dia por tipo de insulina" e a regra de armazenamento acima de 30 °C; incluir URL do guia. **Confiança:** média (guia lido só por trecho).

### INS-18 — MENOR — Bolus de correção: comportamento com glicemia < 70 no modo "Fator de correção" e arredondamentos

- **Onde:** `sections.tsx:331-338`; `rules/insulina.ts:62-84`; `sections.tsx:411` (hint FC arredondado).
- **Observações:** (a) no modo "Fator de correção", glicemia < 70 usa silenciosamente o Quadro 8 (−1/−2 U), o que o PCDT não prevê para o FC (o aviso só aparece no alerta vermelho); (b) FC = 1800/DTDI é exibido arredondado (`fmt(factor,0)`), mas o cálculo usa o valor exato (DTDI 37 → exibe 49, usa 48,65), diferença pequena porém inconsistente na tela; (c) total arredondado por `Math.round` (8,5 → 9; fonte só mostra 8,2 → 8), sem sinalizar; (d) com glicemia < 70 a tela ainda mostra "Dose a aplicar" em destaque (tom perigo) e só abaixo "Tratar a hipoglicemia" (opinião: suprimir ou pôr a dose só após o tratamento).
- **Recomendação:** explicitar a regra de < 70 no modo FC; mostrar FC com 1 decimal ou usar o FC arredondado no cálculo; decidir e documentar o arredondamento. **Confiança:** média.

### INS-19 — MENOR — Subtítulo do "Início do bolus" restringe a NPH 2x/dia e cita só insulina regular

- **Onde:** `sections.tsx:345-361`. **Fonte:** PCDT 8.3.4.3 (p. 27): bolus "em uso de duas doses diárias da insulina humana NPH"; Figura 3 (p. 30): o bolus também segue a substituição por AIAP; análogas de ação rápida: "entre 15 minutos à imediatamente antes das refeições" (p. 29), "iniciados e titulados da mesma forma da regular". **Recomendação:** mencionar que vale também com AIAP (Figura 3) e o horário de AIAR. **Confiança:** média.

### INS-20 — MENOR — Elegibilidade e idade: borda de DM1 em idade fracionária e idade informada como "anos" inteiros

- **Onde:** `sources.ts:30-34`; `patient.tsx` (`step=1`, mas o campo aceita decimais).
- **Observação:** os limites estão corretos (≥ 2 e < 18; ≥ 70). Idade decimal (1,9; 17,9; 69,9) é tratada de forma matematicamente coerente; não há validação de faixa. Item 3.3 (quem completa 18 anos durante a estratégia mantém o esquema) aparece só no texto do "Detalhes" e na mensagem de "não elegível" (boa). **Recomendação:** `min/max` nos campos (idade 0–120; doses, glicemias plausíveis) e rejeitar negativos/zero; hoje não há limites de plausibilidade (ex.: 300 UI digitado no lugar de 30). **Confiança:** alta.

### INS-21 — MENOR — Metformina: dose inicial e tempo de aumento diferem entre o texto e a Figura 2

- **Onde:** `rules/pcdt.ts:83-86, 98-101`. **Fonte:** PCDT 8.3.1 (p. 23): iniciar com "500 mg ou 850 mg" e "Após 5 a 7 dias ... pode-se aumentar para 500 mg ou 850 mg, duas vezes ao dia"; Figura 2 nota e: "850 mg, 1 comprimido ao dia, podendo aumentar após 2 semanas". O app usa a nota e, citando "(nota e)" corretamente, mas sem registrar a divergência. **Recomendação:** acrescentar "(o texto 8.3.1 diz 5 a 7 dias)". **Confiança:** alta.

### INS-22 — MENOR — Cosmético: rótulos em minúsculas e "U" como abreviatura de unidade

- **Onde:** `sections.tsx:267, 500` (`label.toLowerCase()` gera "dm1/dm2" em minúscula: "Metas: pessoa com dm1 ou dm2 (adulto)"); uso generalizado de "U" ("Reduzir 2 a 4 U"). A fonte (PCDT) também usa "U"/"UI"; a recomendação de segurança de medicação (ISMP) é de evitar "U" por confusão com "0"/"4" (conhecimento geral, sem fonte primária lida aqui; opinião, peso baixo). **Recomendação:** manter siglas em maiúscula e preferir "UI" (como a NT 169) ou "unidades" nos resultados prescritivos. **Confiança:** baixa-média.

### INS-23 — MENOR — "Dose fixa 10 U" é exibida com destaque mesmo para paciente de baixo peso

- **Tipo:** opinião clínica (sem fonte contrária; a fonte permite "10 U ou 0,1 a 0,2 U/kg").
- **Onde:** `rules/insulina.ts:5-16`, `sections.tsx:187-189`. Para peso < 50 kg, 10 U ultrapassa 0,2 U/kg; o app mostra os dois lado a lado sem sugerir o menor (no PCDT Quadro 15, a dose inicial do AIAP é só "0,1-0,2 U/kg/dia"). **Recomendação:** quando 10 U > 0,2 × peso, avisar "10 U excede 0,2 U/kg neste peso". **Confiança:** baixa.

### INS-24 — MENOR — Citações e documentação

- `docs/glargina-regras.md:11` cita "itens 5.5, 8.3.3 e 8.3.4" para o PCDT; 5.5 é "Estratificação do risco cardiovascular" (área de risco CV), não regra de insulina; a elegibilidade à dapagliflozina está no item 6 (critérios de inclusão, p. 15) e em 8.3.3. A doc omite a Figura 3 nas fontes de titulação/segunda dose (há menção na tabela). A fonte de armazenamento (guia) não tem URL. Páginas citadas no código (NT p. 9, PCDT Fig. 2 p. 22) estão corretas. **Confiança:** alta.

---

## Conferido e correto

- Elegibilidade (`sources.ts:22-38`): NT 169 item 3.1 (p. 2): "idade igual ou superior a 2 anos e inferior a 18 anos" (DM1) e "idade igual ou superior a 70 anos, com DM1 ou DM2"; literal `ELIGIBILITY_LITERAL` idêntico ao texto da NT; limites 2/18/70 corretos (`age >= 70`, `age >= 2 && age < 18`); item 3.3 (permanência aos 18 anos) correto.
- Conversão (`migracao.ts:17-24`): NT Quadro 3 (p. 7): NPH 1x/dia → 1:1; NPH duas ou mais vezes → "Reduzir aproximadamente 20%"; exemplo 30 UI × 0,8 = 24 UI (p. 7) reproduzido no teste; PCDT 8.3.4.2 (p. 27) idem.
- Alerta de excesso de basal DM2 (`migracao.ts:38-48`): "> 0,5 UI/kg/dia" (Quadro 4, p. 8–9); desigualdade estrita correta (35/70 = 0,5 não alerta). DM1: "> 50% da DTDI" (ver INS-04 para o cálculo).
- Tubetes: 300 UI, 28 dias aberto, 2–8 °C, até 30 °C, caneta 3 anos/5.000 aplicações, escorva antes de cada aplicação (NT p. 10–11).
- NPH inicial: "dose inicial de 10 U ou 0,1 U/kg a 0,2 U/kg", à noite "próximo às 22 horas ou 8 horas antes do desjejum" (PCDT 8.3.4.1, p. 25–26; Figura 3 p. 30).
- Titulação: "ajustando-se em 2 U, a cada 3 dias"; "inferior a 70 mg/dL ou hipoglicemia noturna, diminui-se 2 U a 4 U"; "< 80 mg/dL durante a madrugada ou em glicemia de jejum diurna: diminuir 2 U" (Figura 3). Aplicável a AIAP: "Sugere-se iniciar e titular os AIAP da mesma forma da insulina humana NPH" (8.3.4.2, p. 27) (ressalvas em INS-01/03/10).
- Teto de basal (`insulina.ts:19-22`): "< 0,5 U/kg/dia ... 0,75 U/kg/dia reservada, apenas, para aqueles com maior obesidade e resistência à insulina" (8.3.4.1, p. 26).
- Segunda dose de NPH: "80% da dose total ... 2/3 da dose pela manhã e 1/3 da dose antes de dormir", titular "aumentando 1 U a 3 U, a cada 3 dias", alvo pré-jantar 80–130 (p. 26). Arredondamentos checados: soma dos componentes arredondados coincide com o total para as doses testadas.
- Bolus: 6 glicemias/dia, 3–4 U na maior pós-prandial, +1 U 2x/semana até 90–180, 2ª e 3ª doses se > 180, reduzir NPH de deitar (8.3.4.3, p. 27–28; Figura 3). Quadro 7 (190, LSOG 130, FC 50, prandial 7 → 8,2 → 8) e FC = 1800/DTDI: corretos. Quadro 8: todos os pontos de corte conferem (< 50 = −2; < 70 = −1; 70–130 = 0; 131–180 = +1; 181–230 = +2; 231–280 = +3; 281–330 = +4; > 330 = +5), inclusive os valores de teste (45, 60, 100, 130, 131, 180, 200, 250, 300, 350).
- Metas (`metas.ts`): Quadro 5 da NT (imagem p. 9): todos os 5 perfis × 4 colunas conferem (7,0/7,5/8,0/evitar sintomas/7,0; 80–130, 80–130, 90–150, 100–180, 70–130; < 180; 90–150, 90–150, 100–180, 110–200, 90–150). PCDT Quadro 6 coincide (exceto pós-prandial do idoso muito comprometido, INS-15). Idoso comprometido: aviso do PCDT (jejum até 180 mg/dL) e da NT (90–150) mostrado na Titulação (`sections.tsx:297-302`) e correto.
- Fluxograma (Figura 2, p. 22): ramos "< 3 meses sem fator de risco" × "3 meses ou mais / com fator" corretos e coerentes com o texto 8.3 (p. 21); sequência MEV → metformina → sulfonilureia → (dapagliflozina se critério) → insulina; ramo curto sem dapagliflozina; nota b ("HbA1c > 9% ... jejum ≥ 300 ..."); nota c (reavaliar em 2 a 6 meses); nota d (HbA1c < 7,0% ou, em idosos, 7,5–8,0%); nota e (850 mg 1 cp/dia, máx. 2.550 mg); nota f (gliclazida); dapagliflozina 10 mg/dia e "não iniciada se TFGe < 25" (8.3.3, p. 25). Critérios de DCV estabelecida (IAM, revascularização, angioplastia, angina, AVC isquêmico, AIT, IC com FE < 40%) conferem.
- Testes (`rules.test.ts`): valores esperados batem com as fontes nos casos de conversão, Quadros 7/8, 80%·2/3·1/3, Quadro 5 e Figura 2. Observação: o teste de `[85,85,85]` idoso muito comprometido → "manter-avaliar" fixa um comportamento sem fonte (INS-10). Faltam casos de borda: DM1 aos 17/18 anos e 1/2 anos, DM2 aos 69/70 (parcial), glicemia exata em 70/80, 330/331 no Quadro 8, jejum exatamente no limite superior da meta, e DM1/criança na titulação.
- URLs das fontes em `sources.ts` respondem; o PDF da NT foi baixado da URL indicada (arquivo íntegro, 13 páginas).

## Não consegui verificar

- Se existe versão mais nova da NT 169/2026 ou do PCDT após junho/2026 (a NT 2.8 prevê "ampliação gradual das faixas etárias elegíveis"; não pesquisei atualizações posteriores à NT de 12–15/06/2026).
- Guia do MS "Os benefícios da insulina glargina": só o trecho extraído (p. 9–10) em `guia.txt`; não há PDF completo nem URL no código.
- Passo mínimo de dose e quantidade de escorva da caneta reutilizável (Biopemm): não consta na NT; não encontrei bula/manual oficial.
- Metas de glicemia na gestação (INS-09) e de DM1 em crianças em outras diretrizes (SBD/ADA/ISPAD): fora do escopo e não conferidos.
- Recomendação de ISMP sobre "U" (INS-22) não foi lida em fonte primária.
- Páginas exatas de alguns itens do PCDT (8.9, 8.11) foram inferidas pelo rodapé do texto extraído (± 1 página).
