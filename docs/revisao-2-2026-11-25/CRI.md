# Revisão 2 — Área CRI (Criança: idade, introdução alimentar, marcos do desenvolvimento)

Data: 2026-11-25. Revisão nova e completa do estado atual (somente leitura).

## Arquivos revisados (repo `c:\Smedic\ferramentas-diabetes`)

`src/crianca/idade.ts`, `alimentacao.ts`, `marcos.ts`, `sources.ts`, `CriancaPage.tsx`, `AlimentacaoView.tsx`, `MarcosView.tsx`,
`idade.test.ts`, `alimentacao.test.ts`, `marcos.test.ts`, bloco "criança" de `src/App.test.tsx` (linhas 111-173), `docs/crianca.md`.

## Fontes usadas

- Ministério da Saúde. Guia alimentar para crianças brasileiras menores de 2 anos, 1ª ed. revisada, 2022. Local: `<S>/crianca_src/guia.pdf` (página impressa = PDF − 1; conferi que as páginas citadas pelo app correspondem às impressas).
- Ministério da Saúde. Caderneta da Criança (menina e menino; os textos dos marcos são idênticos), 6ª ed., 2023. Local: `<S>/crianca_src/cad_menina.pdf` e `cad_menino.pdf` (página impressa = PDF − 2). Faixas conferidas renderizando as páginas 81 a 85 impressas (PDF 83 a 87) e ampliando o cabeçalho.
- SBP. Manual de Alimentação, 5ª ed. rev. ampl., 2024. Local: `<S>/sbp_src/man.pdf` (página impressa = PDF − 2).
- `<S>` = <pasta-temporária>
- Scripts auxiliares (só leitura das fontes): `<S>/review2/t/cmp.mjs` (compara os 68 textos "como pesquisar" do código com o texto extraído das duas Cadernetas).

Resumo: 0 CRÍTICO, 6 IMPORTANTE, 12 MENOR. Os marcos, as faixas, a classificação e as páginas do Guia estão corretos; os achados se concentram na suplementação, no prematuro e em ambiguidades de redação.

---

## Achados

### CRI2-01 — IMPORTANTE — erro objetivo / omissão: a suplementação mostra as doses do nascido a termo mesmo quando a IG informada é de prematuro

- **Onde:** `AlimentacaoView.tsx` (bloco "Suplementação de rotina", `subtitle="Criança nascida a termo"`), `alimentacao.ts:584-600` e `:575`.
- **O que o app faz:** com IG ao nascer < 37 semanas informada, a tela continua listando "Vitamina D: 400 UI por dia..." e "Ferro elementar: 1 mg/kg por dia, a partir dos 6 meses (180 dias), ou dos 3 meses (90 dias)...", e só no fim acrescenta "Prematuro ou baixo peso: esquema próprio de suplementação." Um médico apressado lê as duas linhas de dose como a conduta para aquele bebê. O app já sabe a IG (`igNascDias`) mas não a usa neste bloco. Baixo peso ao nascer (< 2.500 g) não é capturado.
- **O que a fonte diz (SBP):** "para os recém-nascidos prematuros (idade gestacional inferior a 37 semanas) ou com baixo peso ao nascer (peso inferior a 2.500 g), a suplementação deve ser iniciada aos 30 dias... A dose será de 2 a 4 mg/Kg/dia no primeiro ano (conforme o peso de nascimento) e após este período com a dose de 1 mg/kg/dia até completar dois anos de vida" (pág. 51); Quadro 13 (pág. 52): a termo com < 2.500 g 2 mg/kg/dia a partir dos 30 dias; prematuros > 1.500 g 2 mg/kg/dia; 1.500-1.000 g 3 mg/kg/dia; < 1.000 g 4 mg/kg/dia. Vitamina D: prematuros iniciam 400 UI "quando o peso for superior a 1500 g e houver tolerância plena à nutrição enteral" (pág. 53; pág. 59 item 12).
- **Recomendação:** quando `igNascDias < 259`, ocultar as duas linhas de dose e mostrar só "Prematuro: esquema próprio de suplementação (ferro a partir dos 30 dias, dose conforme o peso de nascimento; SBP, pág. 51-52)". Sem IG informada, manter o bloco, mas trocar a frase final por "Se nasceu prematuro (< 37 semanas) ou com peso < 2.500 g, as doses acima não valem: esquema próprio" (hoje não dá a regra de "baixo peso" no cabeçalho do cartão). Mantém a regra do usuário de não detalhar o caso excepcional.
- **Confiança:** alta.

### CRI2-02 — IMPORTANTE — omissão relevante: o ferro "a partir dos 180 dias, com qualquer leite" ignora a antecipação por desmame precoce e não diz o que é fator de risco

- **Onde:** `alimentacao.ts:595-597` e comentário `:577-583` ("Vale com leite materno, fórmula ou leite de vaca"); `docs/crianca.md` ("com qualquer leite").
- **O que o app diz:** "Ferro elementar: 1 mg/kg por dia, a partir dos 6 meses (180 dias), ou dos 3 meses (90 dias) se houver fator de risco de deficiência de ferro, até 2 anos." Esse texto aparece igual quando o usuário escolheu "Fórmula" ou "Leite de vaca" para uma criança de 2 meses, e "fator de risco" não é definido na tela.
- **O que a fonte diz (SBP):** o esquema de 180 dias (Quadro 10, pág. 50) é para "recém-nascidos a termo, peso adequado para a idade gestacional, em aleitamento materno exclusivo até o 6º mês". E: "o início da suplementação deve ser antecipado na presença do desmame precoce a qualquer tempo, independentemente se o aleitamento materno seja predominante, misto ou parcial. Além disso, mesmo nos lactentes em amamentação exclusiva, a suplementação deve ser iniciada aos 90 dias na presença de pelo menos um dos fatores de risco" (pág. 50; fatores no Quadro 12, pág. 51). Pág. 59 item 14: "após 90 ou 180 dias se tiver ou não fator de risco... Independentemente de estar em aleitamento materno exclusivo, fórmula infantil ou leite de vaca."
- **Observação:** a pág. 59 item 14 e a pág. 50 não coincidem totalmente para quem não está em AME (o item 14 fala em 90/180 dias por fator de risco; a pág. 50 manda antecipar no desmame precoce). A escolha é do app; hoje não está sinalizada.
- **Recomendação:** acrescentar uma linha curta: "Se a criança não está em aleitamento materno exclusivo (desmame precoce, fórmula ou leite de vaca), a SBP manda antecipar o início (pág. 50)" ou, no mínimo, alinhar o texto à pág. 59 item 14 e remover a afirmação "vale com qualquer leite" do doc sem esta ressalva. Listar em 1 linha os fatores de risco mais comuns do Quadro 12 (por exemplo, clampeamento do cordão < 60 s, doença hipertensiva da gestação, Apgar ≤ 5 no 1º minuto) ou remeter à pág. 51.
- **Confiança:** média (a SBP é ambígua; o app escolheu a leitura mais permissiva).

### CRI2-03 — IMPORTANTE — omissão de segurança: ferro em dobro com o NutriSUS (Caderneta)

- **Onde:** bloco "Suplementação de rotina" (`AlimentacaoView.tsx`, `alimentacao.ts:584-600`).
- **O que o app faz:** dá ferro 1 mg/kg/dia (padrão SBP, decisão do usuário) sem nenhuma ressalva para a criança que já recebe suplementação do SUS.
- **O que a fonte diz:** Caderneta, pág. 36 (PDF 38): "As crianças que recebem os sachês de micronutrientes em pó (Estratégia NutriSUS) não devem receber outro suplemento de ferro e não necessitam receber a megadose de vitamina A." E "todas as crianças de 6 a 24 meses devem receber... fontes extras de ferro de forma preventiva (por meio do suplemento de ferro ou de fortificação)". A SBP (pág. 52) descreve o PNSF do MS: 6 a 24 meses, 10 a 12,5 mg de ferro elementar por dia, 3 meses em cada ciclo (regime diferente do 1 mg/kg/dia).
- **Recomendação:** acrescentar uma linha: "Se a criança já recebe ferro do SUS (sachês NutriSUS ou o programa de suplementação), não somar outro suplemento (Caderneta, pág. 36)". Registrar em `docs/crianca.md` que o PNSF/MS usa dose fixa (divergência resolvida a favor da SBP; sem mostrar na tela).
- **Confiança:** média (a escolha da SBP é do usuário; o risco é a duplicação).

### CRI2-04 — IMPORTANTE — texto ambíguo: "Ao final da faixa, a criança deve ter todos" versus "alerta" a qualquer momento da faixa

- **Onde:** `MarcosView.tsx` (subtítulo do cartão: "Faixa da idade (N meses completos). Ao final da faixa, a criança deve ter todos."), `marcos.ts:343-383` (classificação) e nota "No dia em que a criança completa o mês do limite (ex.: 4 meses), já vale a faixa seguinte."
- **O que o app faz:** usa `de <= meses < ate`. Uma criança de 4 meses e 0 dias já é avaliada com os marcos de 4 a 6 meses (que só são esperados "ao final" da faixa) e, se faltar um, recebe "Alerta" e retorno em 30 dias.
- **O que a fonte diz:** Caderneta pág. 79: "Ao final da faixa etária, a criança deve ter atingido todos os marcos previstos." e pág. 80 (instrumento): alerta = "Ausência de 1 ou mais reflexos/posturas/habilidades para a sua faixa etária (de 1 mês a 6 anos)". As faixas das células coloridas conferem (ver "Conferido"), mas a fonte não diz se a faixa começa ou termina no limite. O app segue a letra do instrumento (correto), mas o subtítulo "ao final da faixa" sugere ao médico que a ausência no início da faixa ainda é aceitável, enquanto a classificação não faz essa distinção.
- **Recomendação:** trocar o subtítulo por algo que não induza: "O instrumento da Caderneta classifica como alerta a ausência de qualquer marco da faixa, mesmo no início dela." e manter a nota do limite (já existente) mais visível (hoje está dentro do `Details` "Como foi calculado e fonte"). É escolha de interface não sinalizada onde importa (no cartão).
- **Confiança:** média.

### CRI2-05 — IMPORTANTE — generalização indevida: "farinhas instantâneas com açúcar"

- **Onde:** `alimentacao.ts:466` ("...achocolatados, farinhas instantâneas com açúcar, bolos prontos...").
- **O que o app diz:** só farinhas instantâneas "com açúcar" entram nos ultraprocessados a evitar.
- **O que a fonte diz:** Guia pág. 104 usa exatamente "farinhas instantâneas com açúcar" na lista de ultraprocessados com açúcar, mas a pág. 78 é categórica: "farinhas instantâneas de arroz, aveia, milho e/ou trigo utilizadas para o preparo de mingau ou como engrossantes ou complemento de leite. Embora contenham cereais, esses alimentos ultraprocessados não devem ser oferecidos à criança por causa de seus outros ingredientes."
- **Risco:** um médico pode concluir que farinha instantânea (cereal infantil de caixa) sem açúcar é liberada.
- **Recomendação:** trocar por "farinhas instantâneas para mingau (com ou sem açúcar)" e citar pág. 78 no item (hoje cita 87, 88, 104 e 223).
- **Confiança:** média-alta.

### CRI2-06 — IMPORTANTE — escolha não sinalizada: prematuro, plano por idade cronológica contradiz o aviso de início

- **Onde:** `AlimentacaoView.tsx` (aviso "Prematuro:" e plano), `alimentacao.ts:88-105`, `idade.ts`.
- **O que o app faz:** o aviso diz que os outros alimentos começam "depois dos 6 meses de idade cronológica e entre 4 e 6 meses de idade corrigida", mas o cartão do plano é escolhido pela idade cronológica. Exemplo: nascido com 28 semanas, 6 meses cronológicos (3 corrigidos): o cartão "Aos 6 meses" mostra almoço com 2 a 3 colheres e lanches com fruta, e o aviso (acima) diz que ainda não começa. Aos 8 meses cronológicos (5 corrigidos), o cartão mostra "Entre 7 e 8 meses" (4 refeições, 3 a 4 colheres) para uma criança que acabou de iniciar. O aviso diz "Depois do início, os tipos de alimentos e a forma de oferecer são os mesmos", mas o número de refeições e as colheres vêm do cartão da idade cronológica. Além disso, o aviso aparece em todo prematuro enquanto a correção vale (até 24 ou 36 meses), inclusive para criança de 20 meses, para a qual a frase sobre "começar" não faz sentido.
- **O que a fonte diz:** SBP pág. 31: "preconiza-se o início da alimentação complementar após seis meses de idade cronológica e entre quatro e seis meses de idade corrigida" e, na sequência, "Algumas publicações orientam que a AC em prematuros deve ser iniciada entre cinco e oito meses de idade cronológica ou três meses de idade corrigida". Guia pág. 94: "O momento de início da oferta de outros alimentos para crianças prematuras deve ser indicado pelo profissional de saúde. Quando a família começar a oferecê-los, as orientações sobre os tipos de alimentos e a forma de oferta serão iguais".
- **Recomendação:** (a) mostrar o aviso só até o prematuro completar 6 meses corrigidos (depois disso o início já passou); (b) enquanto o prematuro não atingiu o início, trocar o cartão do plano por uma linha "Ainda não é a idade de iniciar; veja o aviso" ou, no mínimo, acrescentar "o esquema abaixo vale para quem já iniciou; o número de refeições e as colheres seguem a idade desde o início da oferta"; (c) registrar em `docs/` que a SBP traz duas faixas e que o app adotou a da pág. 31 (sem mostrar a divergência).
- **Confiança:** média (a fonte é ambígua; a interface deve deixar claro).

### CRI2-07 — MENOR — vitamina D: exceção da SBP omitida e página incompleta

- **Onde:** `alimentacao.ts:589-593` (`pagina: 'SBP, pág. 59'`) e comentário `:581`; `docs/crianca.md` ("com qualquer leite").
- **Fonte:** SBP pág. 53: "independentemente do tipo de aleitamento/alimentação. A exceção fica para os lactentes em uso de fórmula infantil, que ingerem um volume igual ou maior que 1000 mL/dia." Pág. 59 item 11 (que o app cita) não traz a exceção.
- **Recomendação:** citar "SBP, pág. 53 e 59" e acrescentar à linha da fórmula: "não precisa se usa fórmula em volume ≥ 1.000 mL/dia". Como o app tem o seletor de leite, é simples. Confiança alta (é omissão, o risco é suplementar sem necessidade, baixo).

### CRI2-08 — MENOR — página citada incorreta (quadros 10 e 11 do ferro)

- **Onde:** `alimentacao.ts:579` ("pág. 51, quadros 10 e 11"), `:597` (`pagina: 'SBP, pág. 51 e 59'`), `docs/crianca.md` (Suplementação: "pág. 51 e 59").
- **Fonte:** os Quadros 10 e 11 estão na pág. 50 (a pág. 51 tem o Quadro 12 e o texto do prematuro). A regra 180/90 dias está na pág. 50 e no item 14 da pág. 59.
- **Recomendação:** citar "SBP, pág. 50 e 59" (e pág. 51-52 quando se tratar do prematuro, ver CRI2-01).

### CRI2-09 — MENOR — página citada incorreta no doc (fórmula no lugar do leite de vaca)

- **Onde:** `docs/crianca.md`, seção "Leite de vaca antes de 1 ano": "na impossibilidade do aleitamento materno, usar fórmula infantil (pág. 57 e 58)".
- **Fonte:** só a pág. 58 (1.7, item 6: "Diante da impossibilidade do aleitamento materno, deve-se utilizar fórmula infantil..."); a pág. 57 é tabela de fontes alimentares de nutrientes. Corrigir para "pág. 58".

### CRI2-10 — MENOR — SBP contraditória sobre o sal; o doc registra só uma das duas passagens

- **Onde:** `alimentacao.ts:535-541`, `docs/crianca.md` ("Sal (escolha: padrão SBP, pág. 24)").
- **Fonte:** SBP pág. 24 item 6: "Não se deve adicionar sal no preparo da papa... até 12 meses e após esta idade usar sal com moderação"; item 7 (mesma página): "Alimentos com adição de sal, açúcar... não devem ser oferecidos aos lactentes menores de dois anos"; pág. 59 item 9: "Cuidado com a ingestão diária de sal e açúcar. Excluir nos dois primeiros anos de vida."
- **O que o app faz:** adota o item 6 da pág. 24 (e o texto do Guia pág. 103 "quantidade mínima"). A escolha é razoável e não aparece como polêmica na tela, mas o doc não registra que a própria SBP diz "excluir nos dois primeiros anos" (pág. 59 item 9). Acrescentar ao doc. A tela, depois dos 12 meses, mostra "Sal com moderação (de preferência o mínimo necessário)", que é a leitura mais branda.

### CRI2-11 — MENOR — divergência entre fontes visível na tela

- **Onde:** `alimentacao.ts:36-41` (aviso 6-11 meses: "Padrão (SBP)... O esquema abaixo é o do Guia do MS..."), `:255` (fórmula 9-11: "O Guia do MS permite trocá-la pelo leite de vaca integral a partir dos 9 meses"), `:515` (cuidado: "O Guia do MS o admite como alternativa"), `AlimentacaoView.tsx` (parágrafo final de "Doze passos e fonte"), `alimentacao.ts:540` e `:597` (páginas "SBP, pág. 24; Guia, pág. 103").
- **Observação:** a regra do produto diz que divergência não deve aparecer na tela. O usuário decidiu os rótulos do leite de vaca ("alternativa do MS, não indicada em condições gerais") e isso está feito; mas o texto vai além do rótulo e nomeia as duas fontes em oposição em 4 lugares. É decisão do usuário; registro para que ele confirme se quer manter ou reduzir a um rótulo só ("alternativa, não indicada em condições gerais"), com o detalhe das fontes só no doc.

### CRI2-12 — MENOR — "Marcos de do nascimento a 1 mês"

- **Onde:** `MarcosView.tsx` (`title={\`Marcos de ${rotuloFaixa(faixa)}\`}`) com `rotuloFaixa` devolvendo "do nascimento a 1 mês" (`marcos.ts` `rotuloFaixa`).
- **Efeito:** título "Marcos de do nascimento a 1 mês" (erro de português). Também afeta o subtítulo da faixa anterior ("Faixa anterior: do nascimento a 1 mês" fica ok). Sugestão: `rotuloFaixa` devolver "0 a 1 mês" ou o título usar "Marcos do nascimento a 1 mês" para a faixa 0. O teste `marcos.test.ts` fixa o rótulo atual ('do nascimento a 1 mês'), então ajustar o teste junto.

### CRI2-13 — MENOR — limite da idade corrigida aplicado ao desenvolvimento

- **Onde:** `idade.ts:70-90`, `MarcosView.tsx`, `sources.ts` (pág. 19, 88).
- **Fonte:** o limite "Até 2 anos de idade cronológica / Até 3 anos, se IG < 28 semanas" está na pág. 88, que trata do crescimento (curvas OMS): "Se não for utilizar o gráfico Intergrowth-21 (pág. 89) deve-se calcular a idade corrigida para acompanhar a criança nascida pré-termo nas curvas da OMS. Até quando utilizar idade corrigida?". A pág. 19 (desenvolvimento) manda corrigir a idade para estimular e avaliar (pág. 78 a 86) sem dar limite.
- **Observação:** estender o limite de 2/3 anos ao desenvolvimento é prática comum e razoável, mas é extrapolação do texto; o doc cita "pág. 19 e 88" sem dizer isso. Registrar como escolha no doc. Também o limite é exclusivo (< 24 meses): aos 24 meses exatos a correção termina ("Até 2 anos" é ambíguo).

### CRI2-14 — MENOR — sucos: "de preferência" aparece diferente nas duas páginas do Guia

- **Onde:** `alimentacao.ts:477-480`: "junto a uma refeição (de preferência um lanche)"; páginas citadas "pág. 85 e 132".
- **Fonte:** pág. 85: "Pode fazer parte de uma refeição, sendo oferecido, de preferência, ao término dela"; pág. 132: "como parte de uma refeição, de preferência em um lanche, e nunca nos intervalos". O app adota a pág. 132 (que é a seção de 2 anos ou mais) e cita as duas. Sem erro de conduta; apenas uma escolha entre duas frases do Guia. Citar "pág. 85 e 132" é correto.

### CRI2-15 — MENOR — plano "Fórmula" aos 12-23 meses troca para leite de vaca sem avisar

- **Onde:** `alimentacao.ts:260-273` (`'Entre 1 e 2 anos, sem leite materno'`, `CAFE_1_2('leite de vaca integral')`).
- **Observação:** quem escolheu "Fórmula infantil" passa, aos 12 meses, a ver "leite de vaca integral" nas refeições (Guia pág. 151). A SBP pág. 58 item 7 diz "Na falta do leite materno, estimular o consumo de fórmula infantil (600mL/dia)... no segundo ano de vida". O leite de vaca depois de 1 ano é aceito pela SBP (pág. 28: inadequado só "para crianças menores de um ano"), então não é erro; mas a mudança é silenciosa. Acrescentar uma nota curta "A partir de 1 ano o Guia usa leite de vaca integral no lugar da fórmula" e registrar a escolha no doc.

### CRI2-16 — MENOR — "Não oferecer e cuidados" para menores de 6 meses lista itens fora de contexto

- **Onde:** `alimentacao.ts:444-556`.
- **Observação:** para um lactente de 2 meses a tela lista carnes e ovos bem cozidos, frutas com caroço, amendoim, sal em papas etc. Não é erro, mas dilui os avisos que importam (leite de vaca, água, mel). Sugestão: abaixo de 6 meses, mostrar só leite de vaca, composto lácteo, açúcar/mel/adoçante, mamadeira e telas.

### CRI2-17 — MENOR — prematuridade como fator de risco permanente

- **Onde:** `MarcosView.tsx` (`if (prematura) fatoresAtivos.add('prematuridade')`).
- **Observação:** segue a Caderneta (pág. 78, item 5 "Prematuridade (<37 semanas)"), então não é erro. Mas, como a caixa é desabilitada, um ex-prematuro de 5 anos com todos os marcos presentes sempre cai em "Alerta" e "retorno em 30 dias". É conforme a fonte; vale uma nota de uma linha na tela ou no doc para o médico não achar que é falha do cálculo.

### CRI2-18 — MENOR — arquivos/documentação

- `sources.ts:1` diz "citadas na tela e em docs/crianca-*.md"; só existe `docs/crianca.md`.
- `idade.ts` comentário de `fmtIdade` ("1 ano e 5 meses") não bate com o código (abaixo de 24 meses mostra "17 meses e 3 dias"; o teste está certo com o código).
- `docs/crianca.md` cita fórmula 6 meses "(pág. 148)" e o código "pág. 147 e 148": trivial.
- IG: se o usuário digita só os dias e não as semanas, `okIg` descarta sem mensagem (`CriancaPage.tsx`); semanas fora de 22-44 geram aviso, mas dias sozinhos não.
- A interpretação de "Só considere a informação dos cuidadores nos itens que estão assinalados" (Caderneta pág. 78) como "itens cujo texto de como pesquisar prevê a informação do acompanhante" é razoável, mas não consegui ver marcação gráfica nas tabelas; ver "Não consegui verificar".

---

## Conferido e correto

**Idade (`idade.ts`, testes)**

- Meses completos, dia 31, fevereiro e bissexto (`idade.test.ts`): coerentes com a regra adotada; exemplo da Caderneta pág. 19 (nasceu 2 meses antes, 6 meses de vida → 4 meses corrigidos) reproduzido e correto.
- Prematuro < 37 semanas (259 dias): Caderneta pág. 19 ("menos de 37 semanas") e pág. 78 item 5. Termo = 280 dias (40 semanas): pág. 19 e 88. Correção até 2 anos, ou 3 anos se IG < 28 semanas: pág. 88 ("Até 2 anos de idade cronológica; Até 3 anos, se IG < 28 semanas"). 27s6d entra nos 3 anos (`< 28*7`).
- Teste do `App.test.tsx`: 30 semanas, nascimento 01/01/2026, consulta 15/07/2026 → corrigida 4 meses (termo em 12/03/2026), faixa 4-6, fator prematuridade → alerta: aritmética correta.

**Marcos (Caderneta, PDF 83-87 = pág. 81 a 85)**

- 17 faixas, 4 marcos cada, 68 marcos; nomes conferem com a coluna "Marcos".
- Faixas (células coloridas renderizadas; os números do cabeçalho são limites de coluna): 0-1, 1-2, 2-4, 4-6 (pág. 81); 6-9, 9-12, 12-15, 15-18 (pág. 82); 18-24, 24-30, 30-36, 36-42 (pág. 83; colunas de 2 meses, verde de 18 a 24 etc.); 42-48, 48-54, 54-60 (pág. 84); 60-66, 66-72 (pág. 85). Conferem com `FAIXAS` e com os testes.
- Textos "como pesquisar": os 68 foram comparados automaticamente com o texto extraído de `cad_menina.pdf` e `cad_menino.pdf`. 55 são idênticos; as 13 diferenças são só: crase ("à boca", "à frente", "à mãe"), vírgula/aspas, "Define 5 palavras" no lugar de "Define cinco palavras", "criança" onde a fonte omite o artigo. Nenhuma altera o conteúdo.
- Rótulos de faixa em anos ("2 anos a 2 anos e meio" ... "5 anos e meio a 6 anos"): coerentes com os títulos "Marcos do Desenvolvimento de 1 Ano e Meio a 3 Anos e Meio" etc.
- Instrumento (pág. 80 impressa, PDF 82): provável atraso (PC < -2Z ou > +2Z; ≥ 3 alterações fenotípicas; ausência de ≥ 1 marco da faixa anterior; faixa 0 a 1 mês: ausência na própria faixa), alerta (ausência de ≥ 1 marco da própria faixa, de 1 mês a 6 anos; ou todos presentes com ≥ 1 fator de risco), adequado, e os textos de conduta ("Acionar as equipes multiprofissionais...", "Marcar consulta de retorno em 30 dias", "Elogiar a mãe/cuidador" etc.): conferem palavra por palavra com `CONDUTA` e `classificar`. Fluxo "vá para a faixa etária anterior" (pág. 79): conforme.
- Fatores de risco (pág. 78, 10 itens) e 8 alterações fenotípicas: idênticos à fonte. Sinais de alerta (pág. 53): 15 itens, idênticos (exceto crase).
- A partir de 6 anos: texto da pág. 86 correto. Orientação de estimulação pág. 37 a 52: conforme pág. 79.
- Testes de `marcos.test.ts`: valores esperados batem com a fonte.

**Introdução alimentar (Guia, páginas impressas)**

- Planos por leite e idade, todos conferidos com as páginas citadas: materno 6 meses (pág. 113-117), 7-8 (118-120), 9-11 (121-123), 1-2 anos (124-128); fórmula <6 meses (139, 142-147), 6 meses (148), 7-8 (149), 9-11 (150), 1-2 anos (151); leite de vaca <4 meses (138-146), 4 meses (152-153), 5-11 (152, 154), 1-2 anos (155); a partir de 2 anos (130-133). Refeições e quantidades (2-3, 3-4, 4-5, 5-6 colheres de sopa), "1 colher de sobremesa até 3 colheres" aos 6 meses, 500 mL de leite de vaca por dia (pág. 152), "não aquecer em micro-ondas" (pág. 146).
- Etapas (desenvolvimento, sinais de fome e saciedade, como oferecer) aos 6, 7-8, 9-11 e 12-23 meses: conferem (pág. 113-126).
- Preparo da fórmula: ferver 5 minutos, também água mineral, pó em até 15 minutos depois da fervura e não fervendo (Guia pág. 145); 70 °C (SBP pág. 27, RDC 43/2011); testar a temperatura no antebraço (Guia pág. 146); descartar a sobra (pág. 146).
- Cuidados: açúcar e mel (pág. 104; botulismo, risco maior < 1 ano); adoçantes (pág. 71 e 222-223); cafeína (pág. 87); desnatado/semidesnatado (pág. 143); composto lácteo (pág. 144, "não são indicados para crianças menores de 2 anos"); pipoca (pág. 78); amendoim/castanhas (pág. 88); frutas pequenas (pág. 84); carnes e ovos bem cozidos, porco/peixe/clara liberados aos 6 meses (pág. 86); sucos < 1 ano não, 1 a 3 anos 120 mL (pág. 85 e 132); água (pág. 100 e 221); mamadeira (pág. 105-106); telas "Crianças menores de 2 anos não devem utilizar televisão, celular, computador e tablet" (pág. 226; 97); temperos prontos (pág. 103); leite e derivados como ingrediente de receitas desde os 6 meses (pág. 125 e 162).
- Doze passos (pág. 220-226): títulos conferem.
- SBP: leite de vaca "não deve ser consumido no primeiro ano de vida" (pág. 24); "não é considerado alimento apropriado para crianças menores de um ano" (pág. 27-28); sal sem adicionar até 12 meses (pág. 24 item 6); prematuro "após seis meses de idade cronológica e entre quatro e seis meses de idade corrigida... A introdução de alimentos potencialmente alergênicos não deve ser postergada" (pág. 31); vitamina D 400 UI da 1ª semana a 12 meses e 600 UI de 12 a 24 meses (pág. 53 e 59 item 11); ferro 1 mg/kg/dia, 180 dias (90 se fator de risco) até 24 meses, para nascidos a termo (pág. 50 e 59 item 14).
- Edições citadas (Caderneta 6ª ed. 2023; Guia 1ª ed. rev. 2022; SBP 5ª ed. 2024): conferem com as capas. Nada mais novo encontrado nas pastas locais (não consultei a internet).
- Testes de `alimentacao.test.ts`: valores esperados conferem com as fontes e com as decisões do usuário.

## Não consegui verificar

- URLs de `sources.ts` (sem acesso à internet nesta revisão); conferi só edição e conteúdo dos PDFs locais.
- Se existe versão mais nova do Guia, da Caderneta ou do Manual da SBP além das baixadas.
- O que a Caderneta quer dizer com itens "assinalados" (pág. 78): não há marcação gráfica detectável no PDF; assumi que são os itens com "Considere a informação do acompanhante" ou "Pergunte aos cuidadores/à mãe".
- Quadro 4 da SBP (esquema de introdução): não comparado com o app porque o app segue o Guia do MS por decisão do usuário.
- Não rodei a suíte de testes (só leitura do código e dos testes).
