# Risco cardiovascular: escalas implementadas

Atualizado em 2026-11-25. A tela oferece as cinco escalas com um seletor e uma tabela de
comparação. **Pendência para o usuário:** escolher a escala principal. A pesquisa que embasa a
escolha está em `pesquisa-risco-cv.md`.

## Escalas

| Escala                | Para quem          | O que entrega                                                               | Implementação                                  | Verificação                                                              |
| --------------------- | ------------------ | --------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| **SBC 2025**          | Todos              | Categoria (baixo a extremo) e metas de LDL, não-HDL e ApoB                  | `escalas.ts` (`sbc2025`), Fig. 4.1 da diretriz | Testes por critério                                                      |
| **SBD 2026**          | Só com diabetes    | Categoria (baixo a muito alto), metas e potência da estatina                | `escalas.ts` (`sbd2026`)                       | Testes por critério                                                      |
| **PCDT DM2 2026**     | DM2                | Alto (40–74 anos), muito alto (com DCV), individualizado (≤ 39 e ≥ 75 anos) | `escalas.ts` (`pcdt2026`)                      | Testes por critério                                                      |
| **OMS 2019 / HEARTS** | 40–74 anos         | % em 10 anos e categoria da OPAS, com e sem laboratório (ver fluxo abaixo)  | `who2019.ts`                                   | **2.100 células da tabela oficial da OPAS reproduzidas sem divergência** |
| **PREVENT**           | 30–79 anos sem DCV | % em 10 e 30 anos (ASCVD, DCV total, IC)                                    | `prevent.ts`                                   | **40 casos de teste do pacote de referência reproduzidos**               |

### SBC 2025

A fonte é a Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose 2025 (SBC): Tab. 4.1
a 4.8, Fig. 4.1 e Tab. 5.1.

- **Ordem do fluxo (Fig. 4.1):**
  1. Evento aterosclerótico prévio: extremo só se houver **evento maior** da Tab. 4.2 (SCA nos
     últimos 12 meses, infarto prévio, AVC isquêmico prévio ou DAP sintomática) e, além dele,
     múltiplos eventos maiores ou ≥ 2 condições de alto risco; senão, muito alto. Angina estável,
     AIT e revascularização isolada são DCV estabelecida (muito alto), com campos próprios na
     tela. A revascularização só conta como condição se for "fora do evento maior" (campo
     próprio; Tab. 4.2). Idade < 18 anos: fora do escopo.
  2. Obstrução ≥ 50% ou CAC > 300: muito alto.
  3. Diabetes: EMAR ou ≥ 3 EAR dá muito alto; 1 a 2 EAR dão alto; sem estratificadores, homem
     ≥ 50 ou mulher ≥ 56 anos é alto, abaixo disso é intermediário.
  4. Sem diabetes: aterosclerose subclínica, LDL ≥ 190 ou Lp(a) > 180 dão alto.
  5. Nos demais, PREVENT de ASCVD em 10 anos: ≥ 20% é alto; de 5 a < 20% é alto com agravante e
     intermediário sem; < 5% é intermediário com LDL 160–189 ou agravante, e baixo sem.
- **Ambiguidades da própria diretriz e a escolha feita:**
  - "1 ou 2 EAR" vale em qualquer idade (Tab. 4.5 e Fig. 4.1, contra a redação da Tab. 4.1).
  - "LDL > 160-189" foi lido como 160 a 189.
  - No DM, "LDL > 190 ou CT > 310" é EMAR (Tab. 4.8).
  - "3 ≥ EAR" foi lido como ≥ 3.
  - Qualquer agravante reclassifica, como na Tab. 4.1; o texto pede julgamento clínico.
  - Hipertensão é "tratada ou não" (Tab. 4.6): quem usa anti-hipertensivo conta como hipertenso.
  - "DM1 com mais de 20 anos, diagnosticado após os 18" só vale com a resposta marcada; o campo
    começa vazio. DM1 com 20 anos ou mais e sem estratificador: as tabelas só dão a faixa de idade
    para o DM2; a tela mostra "avaliação individualizada".
  - Dado não informado (tempo de DM, TFGe, albuminúria) não entra na classificação; a tela avisa.
  - Limiar de tratamento no risco baixo: LDL "acima de 145" (item 5.1).
  - Obstrução: usa-se "≥ 50%" nas duas escalas (SBC Fig. 4.1; a Tab. 4.8 e o Quadro 4 da SBD
    escrevem "> 50%").

### SBD 2026

A fonte é o capítulo "Manejo do risco cardiovascular: dislipidemia", Quadros 1 a 6. As
diferenças em relação à SBC:

- Há categoria **baixo**: homem < 38 e mulher < 46 anos.
- Não há a categoria extremo.
- São EAR na SBD: LDL > 190, Lp(a) ≥ 50, NT-proBNP ≥ 125 (≥ 190 em idosos) e CAC > 10 sem teto.
- A hipercolesterolemia familiar é EMAR.
- "> 3 EAR" na tabela foi lido como ≥ 3, de acordo com o texto ("até dois EAR = alto").
- Para o corte de "idoso" do NT-proBNP, a tela usa 60 anos.
- Divergências internas da SBD resolvidas pelos quadros, sem aparecer na tela: mulher de 56 anos
  é alto (Quadro 1 e SBC); meta de não-HDL no risco alto é < 100 (Quadro 5; o texto de R4 diz
  < 80); LDL > 190 é EAR (Quadro 2; a R9 fala em muito alto só com HF confirmada); grade renal
  segue o Quadro 3 (TFGe < 30 é muito alto; com TFGe 30–44 ou 45–59, albuminúria < 30 dá alto e
  30–299 dá muito alto no G3b e alto no G3a; o Quadro 4 diverge nos pontos exatos 30 e 45).
- Com TFGe < 15, a tela acrescenta uma linha condicional ("Se estiver em diálise e sem doença
  arterial clínica: não iniciar estatina; se já usava, manter", R10). O app não tem campo de
  diálise e não infere diálise pela TFGe. Insuficiência cardíaca (R11) não tem campo.
- iPCSK9 (R3, IIb A): a tela traz "decisão com análise de custo-benefício".
- Mulher com menos de 50 anos: linha "Não se aplica a gestantes" nas metas da SBC e da SBD
  (SBD, nota importante 7: "Estatinas estão contra indicadas em gestantes"; SBC: suspensão
  imediata da estatina na gestação).
- Muito alto: "estatina de alta potência; se a meta não for atingida na dose máxima tolerada,
  considerar ezetimiba (R2, IIa) e depois, se ainda não atingida, iPCSK9 (R3, IIb)".

### PCDT DM2 2026 (item 5.5)

- **40 a 74 anos:** o DM2 já é alto risco; com DAC, AVC ou DAP passa a muito alto.
- **≤ 39 anos:** avaliação individualizada; nefropatia ou retinopatia dão alto risco. O PCDT não
  define nefropatia; o app considera nefropatia a caixa marcada à mão **ou** TFGe < 60 **ou**
  albuminúria ≥ 30 mg/g já informadas (mesma grade da SBC Tab. 4.7; o PCDT manda avaliar
  nefropatia por creatinina e albuminúria). A caixa vale só até 39 anos.
- **≥ 75 anos ou DM1:** avaliação individualizada (≥ 75 traz a mesma frase de autocuidado dos
  ≤ 39 anos, do PCDT p. 12).
- Sem diabetes, a tela diz apenas "O PCDT DM2 é para pessoas com DM2" (sem remeter a outra escala).
- Idade em anos completos (a tela usa o piso); < 18 anos: fora do escopo.
- O PCDT afirma que a estratificação "não altera a conduta para o DM2" e remete ao PCDT de
  Dislipidemia (2019), que não foi lido.

### OMS 2019 / HEARTS

- **Modelo:** Kaptoge et al., Lancet Glob Health 2019, recalibrado para a América Latina Tropical
  (ano 2017).
- **Coeficientes:** vêm do pacote R `WHORiskCalculator` (MIT), que reproduz o programa dos autores.
- **Cálculo:** igual ao da calculadora HEARTS. Usa faixas de idade, PA e colesterol (ou IMC) e
  calcula o modelo no valor representativo de cada célula. A tela mostra também o valor contínuo.
- **Categorias:** < 5% baixo; 5–9% moderado; 10–19% alto; 20–29% muito alto; ≥ 30% crítico.
- **Fluxo oficial (aplicativo HEARTS/OPAS, texto de ajuda):** "A estimativa de risco cardiovascular
  começa com a identificação de subpopulações de risco alto e muito alto usando três perguntas
  dicotômicas consecutivas" (doença cardiovascular estabelecida, doença renal crônica, diabetes).
  No código do aplicativo: diabetes ou doença renal = "Paciente de Alto Risco"; só doença
  cardiovascular = "Paciente de Risco Muito Alto". Sem percentual em nenhum caso.
- **Na tela:** doença cardiovascular estabelecida mostra "Muito alto" e doença renal crônica
  (TFGe < 60, a mesma definição da SBC Tab. 4.2) ou **qualquer diabetes** (DM1 ou DM2, qualquer
  idade) mostram "Alto", sem percentual, na aba e na comparação, como no fluxo oficial do
  aplicativo OPAS (a pergunta "Tem diabetes mellitus?" não tem restrição de tipo nem de idade).
  Escolha registrada aqui, sem aparecer na tela: o PCDT manda individualizar o DM1 e as idades
  ≤ 39 e ≥ 75, mas a aba OMS segue o fluxo HEARTS. A tela não discute a divergência entre a SBC
  (PREVENT) e o PCDT (HEARTS), nem coloca na tela qual escala é a principal.
- **Cortes de colesterol (mg/dL):** 155/193/232/270, comparados direto em mg/dL como no aplicativo
  (a conversão por 38,67 errava nas bordas 193, 232 e 270). A conversão só vale no valor
  contínuo. Testes de borda em `who2019.test.ts`.
- **Faixas aceitas pelo aplicativo OPAS:** PA sistólica 90–200 mmHg e colesterol total 140–300
  mg/dL (idade 40–75 no aplicativo; o app usa 40–74). Fora delas a tela não calcula e avisa.
- **Idade:** < 18 anos fora do escopo.

### PREVENT

- **Fonte:** Khan et al., Circulation 2024, com a errata de HbA1c de outubro de 2026.
- **Coeficientes:** vêm do pacote R `preventr` 0.12.2 (MIT).
- **Modelo escolhido como no pacote:** básico; com HbA1c; com albuminúria; ou completo, com os
  dois e sem SDI (índice dos EUA).
- **Faixas aceitas:** idade 30–79, CT 130–320, HDL 20–100, PAS 90–180 e TFGe 15–140. A IC exige
  IMC de 18,5 a 39,9. O horizonte de 30 anos é mostrado até 59 anos. HbA1c fora de 4,5–15% e
  albuminúria fora de 0,1–25.000 mg/g são ignoradas (a tela avisa).
- **Quem não entra:** doença cardiovascular estabelecida e insuficiência cardíaca (artigo: "without
  known ASCVD or HF"). A tela diz que as equações foram desenvolvidas nos EUA.
- **Não verificado:** os coeficientes contra o suplemento oficial (S12) e a calculadora da AHA.
  Os dois estavam bloqueados para download automático. Os 40 vetores vêm dos testes do próprio
  pacote `preventr` (mesma origem dos coeficientes) e todos têm diabetes = sim; não há fonte
  independente para o ramo sem diabetes. **Valores com HbA1c sem diabetes (termo `hba1c_no_dm`,
  o da errata de 14/10/2026) ainda não foram conferidos** contra a calculadora oficial; os modelos
  básico e com albuminúria não são afetados pela errata. Os testes do ramo sem diabetes só
  protegem a coerência (risco válido e crescente com a HbA1c).
- **Arredondamento:** o ASCVD em 10 anos é arredondado a 0,1% antes de comparar com 5% e 20%, para
  o número mostrado e a categoria coincidirem. A aba PREVENT não mostra faixas de categoria
  (a categoria final depende de agravantes e LDL e fica na SBC).

## Diabetes como fator

A caixa "Considerar diabetes" vem marcada para quem tem DM. Desmarcada, a tela mostra a faixa
"Cálculo como pessoa sem diabetes (simulação)" e:

- a SBC segue o ramo sem diabetes (PREVENT e agravantes);
- a SBD e o PCDT deixam de se aplicar;
- o PREVENT e a OMS laboratorial calculam com diabetes = não.

## Entradas fora da faixa

Valores implausíveis (PA sistólica 60–260, colesterol total 80–800, HDL 10–200, LDL 20–600,
TFGe 2–150, albuminúria 0–30.000, IMC 12–70, Lp(a) até 600 mg/dL ou 1.500 nmol/L) não entram em
nenhuma escala: a tela avisa "confira a unidade". A aba OMS e o PREVENT têm faixas próprias, mais
estreitas. Com creatinina digitada, a TFGe vem dela e o campo "ou TFGe" (oculto) não vale.

## Comparação entre as escalas

A tabela mostra o resultado de cada escala com a sua própria categoria; a tela avisa que as
categorias não equivalem entre si. Metas de LDL aparecem só para SBC e SBD.

## Não implementado

- **Globorisk-LAC:** a SBC o cita como calibrado para o Brasil, mas não houve conferência contra
  valores publicados.
- **Steno Type 1 Risk Engine:** indicado para DM1 com menos de 20 anos de doença e sem
  estratificadores. A tela avisa e não calcula.
- **PCDT de Dislipidemia (2019)**, citado pelo PCDT DM2: não foi lido; o app só o menciona.
- **Insuficiência cardíaca e diálise como campos:** são casos excepcionais; a tela tem só a linha
  de escopo (diálise, SBD R10) e a nota do PREVENT.

## Escolhas de borda

- CKD-EPI 2021 sem raça (Inker, NEJM 2021); o PCDT (Quadro 5) traz a fórmula de 2009. Creatinina
  fora de 0,3 a 15 mg/dL não calcula a TFGe (provável erro de unidade).
- Idade em anos completos; < 18 anos fora do escopo em todas as escalas.

## Escolhas de rótulo e borda (3ª rodada)

- Placa carotídea: a SBC diz EIMC "≥ 1,5 mm" (4.5.2) e a SBD "> 1,5 mm" (Quadro 2); o app usa ≥.
- "DM2 há mais de 10 anos" segue as tabelas (SBC Tab. 4.6; SBD Quadro 2); o texto da SBC diz
  "≥ 10 anos".
- NT-proBNP: a SBC não o recomenda para estratificação (4.4.4); só a SBD o usa (a tela diz).
- Doença renal da OMS = TFGe < 60 isolada (escolha de interface; DRC exige ≥ 3 meses).
- Risco baixo: a SBC indica fármaco com LDL-c acima de 145 mg/dL apesar do estilo de vida.

## Ajustes da 2ª rodada da revisão (25/11/2026)

- **SBC, risco extremo:** só com evento maior da Tab. 4.2 (SCA nos últimos 12 meses, infarto
  prévio, AVC isquêmico prévio ou DAP sintomática). Angina estável e AIT ganharam campos
  próprios e, como a revascularização isolada, dão muito alto. Nas outras escalas, continuam
  contando como DCV estabelecida.
- **Notas da SBD:** aparecem só no resultado da escala SBD, para quem tem diabetes.
  - R10: diálise (TFGe < 15).
  - R11: insuficiência cardíaca NYHA II a IV com LDL-c < 130 mg/dL. Como não há campo de
    insuficiência cardíaca, a nota é fixa.
- **NT-proBNP:** a SBD usa 190 pg/mL para "idosos" sem dizer a idade. O app usa 60 anos, idade em
  que o PCDT DM2 considera a pessoa idosa, e mostra o corte no campo.
