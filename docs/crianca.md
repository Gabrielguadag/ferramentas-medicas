# Criança: introdução alimentar e marcos do desenvolvimento

A área Criança tem um cartão "Dados da criança" comum aos dois módulos, com:

- data de nascimento;
- data da consulta;
- IG ao nascer (opcional, para prematuros).

O cartão mostra a idade cronológica e, quando se aplica, a idade corrigida.

Código em `src/crianca/`:

| Arquivo                                  | Conteúdo                                         |
| ---------------------------------------- | ------------------------------------------------ |
| `idade.ts`                               | meses completos e idade corrigida                |
| `alimentacao.ts`                         | plano do dia, como oferecer e cuidados           |
| `marcos.ts`                              | faixas, marcos, fatores de risco e classificação |
| `CriancaPage.tsx`                        | barra de módulos e dados da criança              |
| `AlimentacaoView.tsx` e `MarcosView.tsx` | telas                                            |

Cada arquivo de regras tem o seu `*.test.ts`.

## Fontes

1. **Ministério da Saúde. Guia alimentar para crianças brasileiras menores de 2 anos.** É a
   1ª edição revisada (2022) do texto de 2019. As páginas citadas são as dessa edição.
   <https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_criancas_brasileiras_menores_2anos.pdf>
2. **Ministério da Saúde. Caderneta da Criança: Passaporte da Cidadania, 6ª edição (2023).**
   - <https://bvsms.saude.gov.br/bvs/publicacoes/caderneta_crianca_menina_6ed.pdf>
   - As versões menina e menino têm as mesmas páginas de desenvolvimento. O texto dos marcos foi
     comparado e é idêntico.
   - Páginas usadas:
     - pág. 19 e 88: idade corrigida;
     - pág. 53: sinais de alerta;
     - pág. 78: fatores de risco e alterações fenotípicas;
     - pág. 79: como avaliar;
     - pág. 80: instrumento de classificação e conduta;
     - pág. 81 a 85: marcos;
     - pág. 86: a partir de 6 anos.
3. **Sociedade Brasileira de Pediatria. Manual de alimentação, 5ª edição (2024)**, pág. 24, 27, 28, 31,
   51 e 59 (páginas impressas): leite de vaca no primeiro ano, sal, preparo da fórmula, prematuros e
   suplementação. Ver abaixo.

## Idade

- **Meses completos:** a criança completa _n_ meses no mesmo dia do mês em que nasceu. Se esse
  dia não existe no mês, vale o último dia do mês. Exemplo: quem nasceu em 31/01 completa
  1 mês em 28/02.
- **Idade corrigida** (Caderneta, pág. 19 e 88): diminui-se da idade o tempo que faltou para
  40 semanas.
  - Na tela, a idade corrigida é contada a partir de uma data: nascimento + (280 − IG ao
    nascer, em dias).
  - Vale só para prematuros, com IG ao nascer abaixo de 37 semanas.
  - Vale até 2 anos de idade cronológica, ou até 3 anos se a IG ao nascer foi menor que 28
    semanas.
- Os marcos usam a idade corrigida enquanto ela vale.
- A introdução alimentar usa a idade cronológica para o plano do dia. Para prematuros, enquanto a
  correção vale (até 24 ou 36 meses), a tela mostra a idade corrigida e o início dos outros
  alimentos conforme a SBP (pág. 31): "após seis meses de idade cronológica e entre quatro e seis
  meses de idade corrigida", com desenvolvimento neuropsicomotor adequado; alimentos
  potencialmente alergênicos não devem ser adiados. (O Guia, pág. 94, só diz que o momento é
  indicado pelo profissional de saúde.)

## Introdução alimentar

O usuário escolhe o leite principal: materno, fórmula infantil ou leite de vaca integral. A
tela mostra o esquema do Guia para essa idade.

### Plano do dia por leite e idade (meses completos)

| Leite         | Fases e páginas                                                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Materno       | < 6 (exclusivo); 6 (pág. 113–117); 7–8 (pág. 118–120); 9–11 (pág. 121–123); 12–23 (pág. 124–128)                                                                                  |
| Fórmula       | < 6 (só fórmula, sem água; pág. 139, 142–147); 6 (pág. 148); 7–8 (pág. 149); 9–11 (pág. 150; mantém a fórmula, padrão SBP); 12–23 (pág. 151)                                      |
| Leite de vaca | alternativa do MS, não indicada antes de 1 ano; < 4 (leite modificado em casa, com orientação; pág. 138–146); 4 (pág. 152–153); 5–11 (pág. 154; até 500 mL/dia); 12–23 (pág. 155) |
| Qualquer      | ≥ 24: orientações dos 2 anos (pág. 130–133) e indicação do Guia Alimentar para a População Brasileira                                                                             |

Quantidade aproximada no almoço e no jantar:

| Idade         | Colheres de sopa, no total |
| ------------- | -------------------------- |
| 4 a 6 meses   | 2 a 3                      |
| 7 a 8 meses   | 3 a 4                      |
| 9 a 11 meses  | 4 a 5                      |
| 12 a 23 meses | 5 a 6                      |

As quantidades de 4 e 5 meses só aparecem com leite de vaca. A tela repete o aviso do Guia: a
quantidade é só referência e não deve ser seguida de forma rígida.

### Também na tela

- **Como oferecer**, dos 6 aos 23 meses: consistência, aspectos do desenvolvimento ligados à
  alimentação e sinais de fome e saciedade de cada faixa (pág. 113 a 126).
- **Não oferecer e cuidados**, filtrados pela idade:
  - açúcar, mel e adoçantes até 2 anos;
  - ultraprocessados;
  - sucos: nenhum antes de 1 ano; de 1 a 3 anos, no máximo cerca de 120 mL;
  - cafeína e leite desnatado;
  - composto lácteo: não é leite em pó nem fórmula, e sim uma mistura com outros ingredientes (pág. 144);
  - pipoca;
  - leite de vaca integral antes de 1 ano (não indicado em condições gerais, SBP);
  - engasgo: castanhas, uva e acerola;
  - carnes e ovos bem cozidos;
  - sal e temperos prontos;
  - mamadeira;
  - telas.

  Cada item mostra a página do Guia de onde veio.

- **Suplementação de rotina** (criança nascida a termo; escolha: padrão SBP, pág. 51 e 59):
  vitamina D 400 UI/dia da 1ª semana até 12 meses e 600 UI/dia de 12 a 24 meses; ferro
  elementar 1 mg/kg/dia a partir dos 180 dias (90 dias se houver fator de risco) até 24 meses,
  com qualquer leite. Prematuro ou baixo peso: a tela só diz que o esquema é próprio, sem doses.
  Vitamina A (regiões de alta prevalência) não entra. O Guia (pág. 91) fala só em suplementos
  de ferro e vitamina A para 6 meses a 2 anos, prescritos por profissional.
- **Sal** (escolha: padrão SBP, pág. 24): não adicionar sal nas papas e refeições até 12 meses;
  depois, sal com moderação. O Guia (pág. 103) diz "quantidade mínima de sal".
- **Preparo da fórmula** (Guia, pág. 145 e 146; SBP, pág. 27): ferver a água por 5 minutos, mesmo
  se filtrada ou mineral; misturar o pó na água ainda bem quente (cerca de 70 °C pela SBP; o Guia
  diz no máximo 15 minutos após a fervura, nunca fervendo), o que descontamina o pó; testar a
  temperatura; descartar a sobra. MS e SBP concordam no princípio.
- **Iogurtes**: só os adoçados ou com sabor entram nos ultraprocessados (Guia, pág. 88); iogurte
  natural sem açúcar pode (pág. 87 e 132).
- **Vegetarianos**: fora do escopo (decisão do usuário); a tela não trata do assunto.
- **Os doze passos** (pág. 220 a 226).

### Leite de vaca antes de 1 ano: padrão SBP, alternativa do MS

Decisão do usuário (2026-11-25): **o padrão é a SBP**, e o esquema do MS aparece como
**alternativa não indicada em condições gerais** a partir dos 6 meses. Antes dos 6 meses o
leite de vaca não é recomendado: o Guia indica a fórmula como primeira alternativa (pág. 142) e
só orienta como usar o leite de vaca quando não há outra opção (leitura definida pelo usuário).

- **SBP**, Manual de alimentação, 5ª ed. (2024):
  - "O leite de vaca integral não deve ser consumido no primeiro ano de vida" (pág. 24);
  - o leite de vaca "não é considerado alimento apropriado para crianças menores de um ano"
    (fim da pág. 27 e início da 28);
  - na impossibilidade do aleitamento materno, usar fórmula infantil (pág. 57 e 58).
  - <https://www.sbp.com.br/fileadmin/user_upload/24607c-ManAlim-OrientAlim_Lactente_ao_adl_na_escola-gest.pdf>
- **Guia do MS:** admite o leite de vaca integral antes de 1 ano quando não há acesso à fórmula.
  - Antes de 4 meses, modificado em casa.
  - A partir de 4 meses, integral, até 500 mL por dia.
  - Com fórmula, ela pode ser trocada pelo leite de vaca a partir de 9 meses (pág. 142 a 155).

Como isso aparece na tela:

- **Escolha "Leite de vaca integral" antes de 6 meses:**
  - a opção leva o rótulo "(não recomendado; só quando não há outra opção)";
  - o aviso diz que não é recomendado e que, sem leite materno, se usa fórmula infantil;
  - as orientações do Guia para essa situação aparecem logo abaixo.
- **Escolha "Leite de vaca integral" de 6 a 11 meses:**
  - a opção leva o rótulo "(alternativa do MS, não indicada em condições gerais)";
  - um aviso mostra o padrão da SBP;
  - o esquema do MS aparece logo abaixo, para quando a família não tem acesso à fórmula.
- **Fórmula de 9 a 11 meses:** o plano mantém a fórmula. Uma nota cita a troca pelo leite de
  vaca permitida pelo MS como alternativa não indicada.
- **"Não oferecer e cuidados", antes de 1 ano:** um item diz que o leite de vaca integral como
  bebida ou refeição não é indicado em condições gerais. Leite e derivados continuam podendo
  entrar como ingredientes de receitas caseiras desde os 6 meses (Guia, pág. 162).

### Escolhas da interface

- **Marcos na fronteira da faixa:** a Caderneta não diz qual faixa usar na idade exata do limite.
  O app usa a faixa dos meses completos (`de <= meses < ate`); por isso um marco ausente na
  fronteira dá "alerta", e a tela explica isso em uma linha. A regra de só considerar a
  informação do cuidador nos itens assinalados (pág. 78) também aparece em uma linha.
- Marco ausente com outros "não verificados": a tela diz que a classificação é no mínimo alerta.
- O Guia não tem um esquema próprio para a criança em leite materno mais outro leite. A tela
  avisa que, nesse caso, o início depende da quantidade de cada leite e pede orientação
  individual (pág. 139).

## Marcos do desenvolvimento

### Faixas

São 17 faixas, de 0 a 72 meses, com 4 marcos cada. Os limites vêm das colunas coloridas das
tabelas da Caderneta (pág. 81 a 85), conferidas na imagem das páginas:

| Meses completos | Faixas                            |
| --------------- | --------------------------------- |
| 0 a 6           | 0–1, 1–2, 2–4, 4–6                |
| 6 a 18          | 6–9, 9–12, 12–15, 15–18           |
| 18 a 42         | 18–24, 24–30, 30–36, 36–42        |
| 42 a 72         | 42–48, 48–54, 54–60, 60–66, 66–72 |

O texto de "como pesquisar" é o da Caderneta, com correções mínimas de crase.

### Classificação (pág. 79 e 80)

| Classificação                 | Quando                                                                                                                                                                           | Conduta                                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Provável atraso               | PC < −2 ou > +2 escores Z; ou 3 ou mais alterações fenotípicas; ou ausência de 1 ou mais marcos da faixa anterior (na faixa de 0 a 1 mês, basta faltar 1 marco da própria faixa) | acionar a equipe multiprofissional ou a rede especializada          |
| Alerta para o desenvolvimento | ausência de 1 ou mais marcos da própria faixa; ou todos presentes com 1 ou mais fatores de risco                                                                                 | orientar estimulação; retorno em 30 dias; sinais de alerta          |
| Desenvolvimento adequado      | todos os marcos da faixa presentes, sem fator de risco                                                                                                                           | elogiar; continuar estimulando; rotina do serviço; sinais de alerta |

Como a tela segue o roteiro da pág. 79:

1. Cada marco da faixa é marcado como presente, ausente ou não verificado. Enquanto algum
   estiver "não verificado", a tela não classifica. A exceção é quando o PC ou as alterações
   fenotípicas já dão "provável atraso".
2. Se falta algum marco da faixa, a tela abre a faixa anterior ("vá para a faixa etária
   anterior") e pede que ela seja marcada.
3. Com IG ao nascer abaixo de 37 semanas, a prematuridade entra sozinha como fator de risco.

## Fora do escopo

- Orientações de estimulação por faixa (Caderneta, pág. 37 a 52): a tela só remete a elas.
- Curvas de crescimento e escore Z do perímetro cefálico: o profissional informa se o PC está
  fora de ±2 escores Z.
- A partir de 6 anos, a Caderneta não traz marcos; a tela mostra o texto da pág. 86.

## Verificação

- `idade.test.ts`:
  - meses completos, inclusive quem nasceu no dia 31;
  - formato da idade;
  - exemplo da Caderneta (6 meses de vida, faltaram 2 meses: 4 meses corrigidos);
  - limites de 37 e 28 semanas e de 2 e 3 anos.
- `marcos.test.ts`:
  - faixas contíguas e ids únicos;
  - limites das colunas;
  - as três classificações, a regra da faixa de 0 a 1 mês, o PC e as alterações fenotípicas;
  - avaliação incompleta.
- `alimentacao.test.ts`:
  - esquemas por leite e idade;
  - quantidades;
  - 500 mL do leite de vaca;
  - cuidados que mudam com a idade.
- `App.test.tsx`:
  - criança de 6 meses e 14 dias: "Aos 6 meses" e, com leite de vaca, "Entre 5 e 11 meses";
  - marcos de 6 a 9 meses, todos presentes: "adequado";
  - com IG ao nascer de 30 semanas: idade corrigida de 4 meses, faixa de 4 a 6 meses e
    "alerta" pela prematuridade.
