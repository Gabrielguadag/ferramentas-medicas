# Gestante: idade gestacional

Primeiro módulo da área **Gestante**. Esta área é separada da de diabetes e não compartilha
estado com ela. O módulo calcula a idade gestacional (IG) e a data provável do parto (DPP) por
quatro caminhos:

- pela DUM;
- por ultrassonografia anterior;
- pela DPP;
- por FIV.

Também dá a IG em qualquer data, passada ou futura, e a data em que a gestante completa uma IG.

Código: `src/gestante/ig.ts`, que reúne as funções puras, testadas em `ig.test.ts`. A tela
fica em `src/gestante/IdadeGestacional.tsx`.

## Fontes

1. **MS. Cadernos de Atenção Básica nº 32: Atenção ao pré-natal de baixo risco (2012).**
   - 5.5: IG pela DUM conhecida e certa, contando os dias até a data e dividindo por 7. Quando
     a DUM é desconhecida mas o período do mês é conhecido, usa-se o dia 5, 15 ou 25 para
     início, meio ou fim do mês.
   - 5.6: DPP = 280 dias (40 semanas) a partir da DUM, pelo calendário. A regra de Näegele é
     dada como alternativa (+7 dias; −3 meses ou +9 meses; os dias que passam do fim do mês vão
     para o mês seguinte).
   - 5.4.2: pré-termo é antes da 37ª semana; pós-termo, 42 semanas ou mais.
   - 6.3.5: gestação prolongada (pós-datismo) fica entre 40 e 42 semanas.
   - 5.3: com 41 semanas, encaminhar para avaliação do bem-estar fetal.
   - Link: <https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf>
2. **ACOG/AIUM/SMFM. Committee Opinion nº 700: Methods for Estimating the Due Date (2017,
   reafirmada em 2022).**
   - Tabela 1: diferença entre ultrassonografia e DUM que justifica redatar.
   - Trimestres: o 1º vai até 13s 6d, o 2º de 14s 0d a 27s 6d e o 3º a partir de 28s 0d.
   - FIV: DPP = transferência + 261 dias para embrião de 5 dias e + 263 dias para embrião de 3
     dias.
   - Não redatar por exame posterior quando já houve ultrassonografia de 1º trimestre.
   - Link: <https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date>

O Caderno 32 não traz critério numérico para redatar pela ultrassonografia, por isso a Tabela 1
vem da ACOG. Não foi encontrada tabela equivalente em publicação do Ministério da Saúde.

## Regras implementadas

Toda datação vira uma **DUM equivalente**, que é o dia 0 da IG.

| Método           | DUM equivalente                                 |
| ---------------- | ----------------------------------------------- |
| DUM certa        | a própria DUM                                   |
| DUM incerta      | dia 5, 15 ou 25 do mês informado                |
| Ultrassonografia | data do exame − IG do laudo                     |
| DPP              | DPP − 280 dias                                  |
| FIV              | transferência − (14 + idade do embrião em dias) |

Resultados derivados da DUM equivalente:

- IG numa data = (data − DUM) dias, mostrada como semanas e dias.
- DPP = DUM + 280.
- Data em que completa uma IG = DUM + 7 × semanas + dias.

### DUM × ultrassonografia (ACOG, Tabela 1)

A faixa é escolhida pela IG calculada pela DUM no dia do exame. A gestação é redatada quando a
diferença é **maior** que o limite da faixa:

| IG pela DUM no exame | Medida          | Limite              |
| -------------------- | --------------- | ------------------- |
| até 8s 6d            | CCN             | 5 dias              |
| 9s 0d a 13s 6d       | CCN             | 7 dias              |
| 14s 0d a 15s 6d      | DBP, CC, CA, CF | 7 dias              |
| 16s 0d a 21s 6d      | DBP, CC, CA, CF | 10 dias             |
| 22s 0d a 27s 6d      | DBP, CC, CA, CF | 14 dias             |
| 28s 0d em diante     | DBP, CC, CA, CF | 21 dias (com aviso) |

A tela sugere a datação pela regra, mas o médico pode adotar a DUM ou a ultrassonografia.

Se a DUM informada for posterior ao exame, a tela avisa que as datas são inconsistentes e não
calcula a comparação. A 3ª linha da tabela tem um aviso próprio: no 3º trimestre, redatar um
feto pequeno pode esconder restrição de crescimento.

### Situação na data (MS)

- 37 semanas ou mais: termo.
- De 40 a 42 semanas: gestação prolongada.
- 41 semanas ou mais: encaminhar para avaliação do bem-estar fetal.
- 42 semanas ou mais: pós-termo.
- Data anterior à DUM: aviso de que ainda não havia gestação.
- Mais de 44 semanas: aviso para conferir as datas. Este limite de plausibilidade é da
  interface; não vem das fontes.

## Escolhas e limites

- A DPP adotada é a de 280 dias. A regra de Näegele aparece só como conferência e pode diferir
  em até 3 dias, conforme os meses.
- Com DUM incerta (só o período do mês), a comparação com a ultrassonografia fica a cargo do
  médico. O campo de comparação pede DUM exata, e a ACOG recomenda datar pela ultrassonografia
  quando a DUM é incerta.
- A ultrassonografia entra pela IG do laudo. A tela não calcula IG a partir do CCN ou da
  biometria.
- Gestação múltipla e outros cenários de FIV (embrião de 6 dias, ovócito doado com outras
  datas) não foram incluídos.
- As datas são de calendário, sem hora nem fuso: a soma de dias não sofre com horário de verão.

## Verificação

`ig.test.ts`:

- reproduz os três exemplos da regra de Näegele do Caderno 32;
- confere a DPP de 280 dias, inclusive atravessando ano bissexto;
- confere os dias 5, 15 e 25 para DUM incerta;
- confere a equivalência entre USG, DPP e FIV, com os +261 e +263 dias;
- confere os trimestres e a situação na data;
- confere os limites de cada faixa da Tabela 1 nos dois sentidos, com a diferença exatamente
  no limite (não redata) e um dia acima (redata).

`App.test.tsx` cobre o fluxo na tela: DUM → IG numa data → ultrassonografia com redatação e
escolha manual de manter a DUM.
