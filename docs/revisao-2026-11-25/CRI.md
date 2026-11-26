# Revisão clínica: área CRI (Criança)

Arquivos revisados (c:\Smedic\ferramentas-diabetes): src/crianca/idade.ts, alimentacao.ts, marcos.ts, CriancaPage.tsx, AlimentacaoView.tsx, MarcosView.tsx, sources.ts, idade.test.ts, alimentacao.test.ts, marcos.test.ts, trecho da área em src/App.test.tsx, docs/crianca.md (auditado, não usado como fonte).

Fontes (cópias locais em `<scratchpad>` = <pasta-temporária>):

- MS, Guia alimentar para crianças brasileiras menores de 2 anos, 1ª ed. revisada 2022: `crianca_src/guia.txt` (página impressa N = página PDF N+1).
- MS, Caderneta da Criança, 6ª ed. 2023, menina e menino: `crianca_src/cad_menina.pdf` e `cad_menino.pdf`. Os trechos de desenvolvimento são idênticos nas duas versões (conferido por diff). Faixas conferidas visualmente em PNG renderizados a 3x: `review/src/CRI_s/p82..p86.png`.
- SBP, Manual de Alimentação, 5ª ed. 2024: `sbp_src/man.txt`. As páginas citadas abaixo são as IMPRESSAS (rodapé; página PDF = impressa + 2).
- Não consultei nenhuma calculadora de terceiros. Não verifiquei online se existe edição mais nova do Guia ou da Caderneta (ver "Não consegui verificar").

Resumo: 0 críticos, 5 importantes, 9 menores. Marcos (faixas, textos, classificação) e quantidades/esquemas de refeição conferem com as fontes. Os problemas estão em omissões (suplementação, vegetarianos, prematuros), divergências MS x SBP não sinalizadas (sal, preparo da fórmula) e redações ambíguas.

---

## Achados

### CRI-01 [IMPORTANTE, escolha não sinalizada / omissão] Suplementação de ferro, vitamina D e vitamina A não aparece em nenhum lugar (exceto leite de vaca modificado)

- Onde: alimentacao.ts, planos `materno`/`formula`; AlimentacaoView.tsx. A única menção é a nota de vaca < 4 meses (alimentacao.ts:282).
- App: não diz nada sobre suplementação para lactente em leite materno, fórmula ou prematuro. Também não avisa que ela está fora do escopo.
- Fontes:
  - Guia p. 91: "as crianças entre 6 meses e 2 anos de idade podem precisar receber suplementos desses nutrientes [ferro e vitamina A]. Somente profissionais de saúde podem prescrever suplementos."
  - Guia p. 143: leite de vaca modificado "precisa receber suplementação de vitaminas e minerais".
  - SBP p. 59 (itens 11 e 14): vitamina D 400 UI/dia da 1ª semana até 12 meses e 600 UI/dia de 12 a 24 meses; ferro elementar 1 mg/kg/dia (após 90 ou 180 dias) até 2 anos.
  - SBP p. 51-52: prematuros ou < 2.500 g, 2 a 4 mg/kg/dia de ferro a partir de 30 dias.
  - SBP p. 52: o PNSF do MS prevê dois ciclos de ferro de 10 a 12,5 mg por 3 meses, iniciados aos 6 e 12 meses.
  - A Caderneta p. 76 traz o campo "Suplementação de ferro / micronutrientes / vitamina A" em cada consulta.
- Recomendação: acrescentar ao card "Não oferecer e cuidados" (ou a um card próprio) uma linha como: "Suplementação: avaliar ferro, vitamina D e (em região indicada) vitamina A; ver Guia p. 91 e SBP p. 51-53 e 59". Se o escopo é só alimentar, dizer na tela que a suplementação não está incluída. Divergência MS x SBP a registrar: o PNSF e o Guia falam em 6 a 24 meses; a SBP em 1 mg/kg/dia desde 90 a 180 dias.
- Confiança: alta.

### CRI-02 [IMPORTANTE, divergência entre fontes não sinalizada] Sal: o app segue só o MS, enquanto usa a SBP no leite de vaca

- Onde: alimentacao.ts:533-537, "Sal no mínimo necessário; temperos naturais. Não usar temperos prontos... (pág. 103)".
- Guia p. 103: "quantidade mínima de sal"; "diminua o uso de sal nas preparações".
- SBP p. 24 (item 6): "Não se deve adicionar sal no preparo da papa/refeição da alimentação complementar para lactentes até 12 meses e após esta idade usar sal com moderação". SBP p. 59 (item 9): "Cuidado com a ingestão diária de sal e açúcar. Excluir nos dois primeiros anos de vida." A SBP é internamente inconsistente (12 meses ou 2 anos), mas nas duas versões é mais restritiva que o MS.
- Impacto: um médico que adota a SBP para o leite de vaca (decisão do usuário) lê "sal no mínimo necessário" para um lactente de 6 meses como permissão.
- Recomendação: para < 12 meses escrever "Sal: o Guia do MS permite o mínimo necessário; a SBP recomenda não adicionar sal até 12 meses (SBP p. 24 e 59)". Alternativa: seguir o critério mais restritivo e citar as duas fontes.
- Confiança: alta.

### CRI-03 [IMPORTANTE, omissão] Alimentação de crianças vegetarianas omitida (Guia p. 128-129)

- Onde: ausente de alimentacao.ts.
- Guia p. 129: "No almoço e jantar, diariamente, devem estar presentes: 1 cereal/tubérculo, 1 feijão, 2 ou mais legumes/verduras (1 folhoso verde-escuro e 1 colorido), 1 fruta"; "atenção especial deve ser dada à vitamina B12, principalmente no caso de vegetarianos estritos e veganos"; "leites vegetais ultraprocessados... não substituem a amamentação" nos primeiros 6 meses.
- Divergência: SBP p. 44-45 (PDF 46-47) diz "As crianças não devem ser vegetarianas... caso seja opção da família, devem ser suplementadas".
- O esquema do app (item "carnes e ovos" obrigatório no prato, alimentacao.ts:62) não se aplica a vegetarianos e a tela não diz isso.
- Recomendação: uma nota "Criança vegetariana: o esquema do prato muda; ver Guia p. 128-129; B12 e ferro com acompanhamento profissional". O mínimo seria avisar que o esquema não cobre esse caso.
- Confiança: alta.

### CRI-04 [IMPORTANTE, escolha parcialmente sinalizada] Prematuros: idade cronológica na alimentação, aviso só até 12 meses e sem a posição da SBP

- Onde: AlimentacaoView.tsx:50-55 (aviso só se `meses < 12`) e :39-41 ("A orientação usa a idade cronológica").
- App: aviso "o momento de começar outros alimentos é indicado pelo profissional de saúde". Isso cita fielmente o Guia p. 94 (não p. 93, como diz docs/crianca.md). O plano seguinte é calculado pela idade cronológica em qualquer idade.
- SBP p. 31 (PDF 33): "preconiza-se o início da alimentação complementar após seis meses de idade cronológica e entre quatro e seis meses de idade corrigida... Algumas publicações orientam... entre cinco e oito meses de idade cronológica ou três meses de idade corrigida, ambos com desenvolvimento neuropsicomotor adequado... Deve-se atentar para a suplementação de micronutrientes... A introdução de alimentos potencialmente alergênicos não deve ser postergada também em prematuros."
- Riscos:
  - (a) Um prematuro com 6 meses cronológicos e 3 corrigidos recebe na tela o plano de "Aos 6 meses" com colheres e consistência, além do aviso. O aviso é genérico.
  - (b) Entre 12 e 23 meses cronológicos o aviso some, embora a idade corrigida ainda valha (até 24 ou 36 meses).
  - (c) Os marcos usam a idade corrigida e a alimentação não, sem explicação na tela.
- Recomendação: manter o aviso até 24 meses se a correção ainda vale. Incluir a frase da SBP (4 a 6 meses de idade corrigida, com prontidão neuropsicomotora). Quando `correcao.vale`, mostrar também a idade corrigida no card de alimentação.
- Confiança: média-alta. A escolha é do Guia, mas a tela ficou ambígua.

### CRI-05 [IMPORTANTE, divergência entre fontes] Preparo da fórmula: o app omite "água bem quente / 70 °C"

- Onde: alimentacao.ts:205: "Preparo: água tratada fervida por 5 minutos; misturar o pó em até 15 minutos depois da fervura, nunca com a água fervendo; não aquecer no micro-ondas."
- Guia p. 145: "O pó deve ser misturado em água bem quente para evitar contaminação. Para isso, após a fervura da água, espere, no máximo, 15 minutos para colocar o pó. Não misture o pó na água enquanto ela estiver fervendo".
- SBP p. 25 (PDF 27): "a água deve ser filtrada e aquecida a 70°C... adicione primeiro a água aquecida e depois as medidas do pó... observar a temperatura pingando uma gota... Evite... microondas." A SBP p. 27 cita a RDC 43/2011 da Anvisa (reconstituição a 70 °C).
- O app diz "em até 15 minutos", mas não diz que a água deve estar bem quente. Um cuidador pode esperar esfriar. A razão (contaminação, Cronobacter) é omitida.
- Omitidos também: testar a temperatura na parte interna do antebraço (Guia p. 146), descartar o que sobrou e esterilizar os utensílios (Guia p. 146; SBP p. 24 itens 10 e 11).
- Recomendação: "Misturar o pó em água ainda bem quente (cerca de 70 °C; no máximo 15 min depois da fervura); testar a temperatura antes de oferecer; descartar a sobra". Registrar que MS e SBP concordam no princípio e divergem só na forma de dizer.
- Confiança: alta.

### CRI-06 [MENOR, erro objetivo de citação] Páginas citadas incorretas

- MarcosView.tsx:189 e sources.ts:182 dizem "Sinais de alerta (Caderneta, pág. 53 e 54)". A lista está só na pág. 53 (a pág. 54 é "Crianças com Deficiência").
- docs/crianca.md cita "Guia (pág. 93)" para "O momento de início... prematuras". O texto está na pág. 94.
- docs/crianca.md cita SBP "pág. 26 e 27" para "não é considerado alimento apropriado para crianças menores de um ano". A frase vai do fim da p. 27 ao início da p. 28 (a p. 26 trata de fórmulas).
- alimentacao.ts:514 cita "SBP, pág. 24 e 58" para "não recomenda leite de vaca integral no 1º ano". O item 16 está na p. 59 (a p. 58 tem os itens 6 e 7, sobre fórmula).
- Doze passos "pág. 219 a 227": o conteúdo está nas pág. 220-226.
- Marcos: o cabeçalho de marcos.ts diz "pág. 78 a 86". Correto: 78-80 (vigilância e instrumento), 81-85 (marcos) e 86 (a partir de 6 anos).
- Confiança: alta.

### CRI-07 [MENOR, ambiguidade] "iogurtes" na lista de ultraprocessados

- Onde: alimentacao.ts:464: "Alimentos ultraprocessados (refrigerantes, achocolatados, farinhas instantâneas com açúcar, bolos prontos, biscoitos, iogurtes, sucos de caixinha...): não oferecer."
- Guia p. 104 usa a mesma lista, mas p. 88 especifica "iogurtes adoçados, com sabor e coloridos artificialmente", e p. 87 e p. 132 aceitam "iogurtes naturais sem açúcar" e "coalhadas". O texto da tela, sem o qualificador, pode ser lido como proibição de qualquer iogurte.
- Recomendação: "iogurtes adoçados ou com sabor" (iogurte natural sem açúcar pode, Guia p. 87 e 132).
- Confiança: alta.

### CRI-08 [MENOR, omissão] Regra de uso da informação do cuidador (Caderneta p. 78) não aparece

- A Caderneta p. 78: "Só considere a informação dos cuidadores nos itens que estão assinalados." e "Sempre pergunte aos cuidadores o que eles acham do desenvolvimento da sua criança. Valorize esta informação." O app mostra o texto de "como pesquisar" (que já traz "considere a informação do acompanhante" em alguns itens), mas não a regra geral. Como o app aceita "Presente" marcado pelo médico, convém reforçar que, onde o texto não prevê informação do cuidador, o marco deve ser observado.
- Recomendação: uma linha no card "Marcos".
- Confiança: média.

### CRI-09 [MENOR, escolha não sinalizada] Marco no limite da faixa (4, 6, 9, 12... meses completos)

- A Caderneta rotula as colunas com números nos limites (0 e 1, 2 e 4 etc.). Eu conferi nas imagens que as células coloridas vão do número inicial ao final: por exemplo, 2-4 e 4-6, 6-9, 18-24 (colunas de 2 em 2 meses), 60-66. A lógica `de <= meses < ate` (marcos.ts:470) é coerente com isso.
- A Caderneta não diz qual faixa usar em idade exata de fronteira (ex.: 4 meses e 0 dias). O app escolhe a faixa posterior. Isso tende a classificar "alerta" mais cedo, porque o marco da faixa que acabou de começar costuma estar ausente. A frase "Ao final da faixa, a criança deve ter todos" (MarcosView.tsx:89, da Caderneta p. 79) ajuda, mas não esclarece.
- Recomendação: dizer na tela que se usa a faixa dos meses completos e que, na fronteira, a ausência de marco gera "alerta" (não "atraso") justamente por isso.
- Confiança: média.

### CRI-10 [MENOR, escolha de interface] Marco "não verificado" bloqueia a classificação mesmo com marco ausente já marcado

- Onde: marcos.ts:566-570. Se há um 'A' na faixa e um 'NV', o retorno é `incompleta`, sem dizer que a classificação mínima já é "alerta".
- A Caderneta define NV mas não diz como classificar com NV. A escolha é razoável e está descrita em docs/crianca.md, mas a tela só diz "Marque cada marco... como presente ou ausente".
- Recomendação: se já há 'A', mostrar "pelo menos alerta; complete as marcações".
- Confiança: média.

### CRI-11 [MENOR, omissão] Leite de vaca modificado antes de 4 meses sem nenhuma proporção

- Guia p. 142-143 também não dá a diluição ("conforme diluição orientada pelo profissional"). A SBP p. 28 (PDF 30) detalha: diluição a 2/3, e acréscimo de óleo vegetal e de carboidrato, citando as inadequações nutricionais do leite de vaca.
- O app diz "é modificado em casa conforme a orientação do profissional" e para aí. É coerente com o Guia (e a decisão do usuário está respeitada), mas o médico pode esperar a orientação. Sugestão: apontar a SBP p. 28.
- Confiança: média.

### CRI-12 [MENOR, interpretação] Limite de 500 mL de leite de vaca

- alimentacao.ts:322 aplica o limite só a 5-11 meses. No Guia p. 152 a frase está na parte do 5º mês ("A quantidade total de leite... não deve ultrapassar 500 mL por dia"). Aos 4 meses (4 mamadas de leite no esquema) a frase não aparece, embora o mesmo risco (anemia) valha. Também não há nota de limite para 12-23 meses (o Guia não traz).
- Recomendação: repetir o limite aos 4 meses.
- Confiança: média-baixa.

### CRI-13 [MENOR, divergência entre fontes] Sucos

- O app segue o MS: nenhum antes de 1 ano; de 1 a 3 anos, cerca de 120 mL/dia (Guia p. 85 e 132). Está certo. A SBP p. 37 (PDF 39) diz "Os sucos (naturais e artificiais) devem ser evitados", e SBP p. 82 (PDF 84) e p. 96 (PDF 98) dão máximo de 120 mL/dia para 1 a 3 anos. Não há conflito material, só nota: o app poderia citar a SBP para reforçar.
- Confiança: alta (sem ação obrigatória).

### CRI-14 [MENOR, paráfrase imprecisa do Guia] "só orienta como usar o leite de vaca quando não há outra opção"

- alimentacao.ts:31 e docs/crianca.md afirmam que o Guia "só orienta como usar o leite de vaca quando não há outra opção". Guia p. 142: "Caso a família opte pelo leite de vaca integral, precisa ser modificado em casa"; p. 138: "grande parte das famílias... não tem condições de adquirir a fórmula... utiliza como alternativa o leite de vaca"; p. 147 permite trocar por leite de vaca aos 9 meses sem condicionar a acesso. A decisão do usuário (padrão SBP, MS como alternativa) está respeitada; só o motivo atribuído ao Guia ("não há acesso") é uma inferência. Sugestão: "o Guia admite o leite de vaca como alternativa, sobretudo quando a família não tem acesso à fórmula".
- Confiança: média.

---

## Conferido e correto

Marcos e instrumento (Caderneta 6ª ed.):

- 17 faixas e seus limites conferidos nas células coloridas (imagens das pág. 81-85): 0-1, 1-2, 2-4, 4-6; 6-9, 9-12, 12-15, 15-18; 18-24, 24-30, 30-36, 36-42; 42-48, 48-54, 54-60; 60-66, 66-72. Os 4 marcos de cada grupo também batem (cores verde, rosa, azul e amarelo).
- Os 68 textos de "como pesquisar" conferem com a Caderneta pág. 81-85. As únicas diferenças são crases ("à boca", "à mãe", "à frente"), "se a criança" no lugar de "se criança", pontuação e "Define 5 palavras" no lugar de "Define cinco palavras". Não há mudança de conteúdo.
- Fatores de risco (pág. 78, 10 itens), alterações fenotípicas (8 itens, p. 78), PC < -2 ou > +2 escores Z: ok. Sinais de alerta (15 itens, pág. 53): ok.
- Instrumento (pág. 80): provável atraso, alerta, adequado e as condutas conferem literalmente. A regra da faixa 0-1 mês confere. A exigência de olhar a faixa anterior só quando falta marco da faixa atual vem da pág. 79.
- Idade corrigida (pág. 19, 79 e 88): diminuir da idade o que faltou para 40 semanas (280 dias); até 2 anos de idade cronológica, ou até 3 anos se IG < 28 semanas; prematuro = < 37 semanas. O exemplo da Caderneta (31s4d, 6 meses vira 4 corrigidos) está testado. O teste App.test.tsx com 30 semanas (corrigida 4m3d, faixa 4-6) está coerente.
  - Nota: a pág. 88 é do contexto de crescimento (curvas da OMS). A extensão ao desenvolvimento vem da pág. 19 e 79, que mandam corrigir sem informar o limite de idade. É uma extensão razoável, mas é do app.
- Meses completos e fim de mês (31/01 → 28/02): lógica e testes corretos (idade.ts:11-26).
- pág. 86 "a partir dos 6 anos": ok.

Alimentação (Guia 2022):

- Esquemas de refeição por leite e idade conferem: materno (6, 7-8, 9-11, 12-23; p. 113-128), fórmula (p. 147-151), vaca (p. 152-155). Os casos de 6, 7-8, 9-11 e 12-23 meses usam as mesmas refeições, e a 7-8 usa as 4 refeições. O esquema do Guia para fórmula aos 9-11 meses usa leite de vaca; o app mantém fórmula (decisão do usuário, SBP), com nota visível.
- Colheres: 2-3 (6 meses e 4-6 com vaca), 3-4, 4-5, 5-6. Conferem nas p. 117, 120, 123, 126-127, 148-150, 153-154. Início "1 colher de sobremesa... até 3 colheres de sopa" (p. 115): ok.
- Consistência, sinais de fome e saciedade, desenvolvimento por faixa e páginas citadas: ok (p. 113-116, 118-119, 121-122, 124-126).
- Água: exclusivo sem água (p. 139, 220); fórmula sem água antes de 6 meses (p. 139); água a partir dos novos alimentos (p. 100, 147): ok. Preparo da fórmula (5 min de fervura, 15 min, sem micro-ondas; p. 145-146): ok no que diz (ver CRI-05).
- Leite de vaca: modificado antes de 4 meses, não diluído depois, 500 mL/dia, desnatado e semidesnatado (< 2 anos), suplementação do leite modificado (p. 142-143, 152): ok. Composto lácteo: texto simplificado por decisão do usuário; consistente com p. 144.
- Cuidados: açúcar e mel (p. 104, 222), adoçantes (p. 71, 223), cafeína (p. 87), pipoca (p. 78), nozes (p. 88), frutas pequenas (p. 84), carnes e ovos bem cozidos e liberação de porco, peixe e clara de ovo aos 6 meses (p. 86), mamadeira (p. 105-106), telas (p. 97 e 226), temperos prontos (p. 103): ok.
- Mel: o app diz não oferecer até 2 anos (açúcar) e risco de botulismo, maior antes de 1 ano. Confere com Guia p. 104 e SBP p. 42 (PDF 44).
- Doze passos: texto fiel.
- Testes: os valores esperados em idade.test.ts, marcos.test.ts, alimentacao.test.ts e App.test.tsx não contradizem as fontes. Nenhum teste "verde e errado" encontrado.

## Não consegui verificar

- Se existe edição mais nova do Guia (além da 1ª ed. revisada 2022) ou da Caderneta (além da 6ª ed. 2023). Não fiz busca web; as cópias locais são as que o briefing indicou.
- SBP Guia prático de alimentação complementar e MS Caderno 33: não consultados. Só o Manual SBP 2024 foi usado para as divergências.
- O trecho de leite materno + outro leite 4-6 meses (Guia p. 138) foi lido, mas o app só remete a orientação individual. Não encontrei erro, só ausência de detalhe.
- O app.test.tsx foi lido só no trecho da área Criança.
