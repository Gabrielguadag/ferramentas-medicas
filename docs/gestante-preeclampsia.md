# Gestante: pré-eclâmpsia e eclâmpsia

Dois módulos na barra da área Gestante. As regras puras estão em `src/gestante/preeclampsia.ts`
e as telas em `PreeclampsiaView.tsx` e `EclampsiaView.tsx`.

**Fonte base (decisão do usuário, 27/11/2026):** RBEHG, _Pré-eclâmpsia — Protocolo 03, 2023_
(Peraçoli JC et al.), PDF publicado pelo Cofen:
https://cofen.gov.br/wp-content/uploads/2025/02/PROTOCOLO-2023-FINAL.pdf. As páginas citadas são
as impressas no protocolo.

O Manual de Gestação de Alto Risco do MS (2022) se baseia na versão de 2020 da RBEHG e diverge em
alguns pontos (ver "Escolhas entre fontes"). Dele só entra a contraindicação na miastenia grave
(Quadro 7), porque a RBEHG não fala dela e não há conflito.

## Pré-eclâmpsia

| Item                             | Regra                                                                                                                                                                                                                                                                                                                                        | Fonte                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Fatores de risco                 | Altos (basta um): PE prévia, gestação múltipla, obesidade (IMC > 30), HAS crônica, DM1 ou DM2, doença renal, doença autoimune (LES, SAF), reprodução assistida. Moderados (dois ou mais): nuliparidade, história familiar de PE, idade ≥ 35 anos, gravidez prévia com desfecho adverso (DPP, BPN com > 37 semanas, TPP), intervalo > 10 anos | Quadro 1, pág. 19-20 |
| Indicação                        | Um alto ou dois moderados → AAS e cálcio. Sem indicação clínica: o teste combinado de 11 a 14 semanas, se disponível                                                                                                                                                                                                                         | pág. 18-19           |
| AAS                              | 100 mg/dia à noite; a partir da 12ª semana, de preferência antes da 16ª, podendo iniciar até a 20ª; até a 36ª semana                                                                                                                                                                                                                         | pág. 22              |
| Momento pela IG (campo opcional) | < 12: aguardar; 12 a < 16: ideal; 16 a 20: ainda pode; > 20: o protocolo indica iniciar até 20; ≥ 36: não usar mais                                                                                                                                                                                                                          | derivado da pág. 22  |
| Cálcio                           | Carbonato 1 a 2 g/dia (ou citrato 2 a 4 g/dia), em 2 a 3 tomadas às refeições, do 1º trimestre ao fim da gestação                                                                                                                                                                                                                            | pág. 22-23           |
| Suspensão                        | AAS e cálcio suspensos se a PE for confirmada                                                                                                                                                                                                                                                                                                | pág. 23              |
| Sem efeito                       | Repouso, restrição de sal, vitaminas C, E e D, ômega-3, ácido fólico, enoxaparina                                                                                                                                                                                                                                                            | pág. 22              |
| PA                               | Leve: 140-159 e/ou 90-109; grave: ≥ 160 e/ou ≥ 110. PA persistente ≥ 140/90 é tratada, com meta de PAD em torno de 85                                                                                                                                                                                                                        | pág. 27-28           |
| Manutenção VO                    | Quadro 3 (metildopa, nifedipino retard e de liberação rápida, anlodipino, hidralazina, metoprolol, carvedilol). Hidralazina e betabloqueadores como 3ª droga. Contraindicados: IECA, BRA, alisquireno                                                                                                                                        | pág. 29-30           |
| Crise hipertensiva               | PA ≥ 160/110 persistente após 15 min; meta de redução de 15-25% (PAS 140-150, PAD 90-100). Hidralazina 5 mg IV a cada 20 min até 30 mg (1 mL de 20 mg em 19 mL de AD); nifedipino 10 mg VO a cada 20 min até 30 mg; hidralazina contínua 5 mg/h; nitroprussiato 0,5-10 mcg/kg/min (200 mcg/mL)                                               | pág. 31-34, Quadro 4 |
| Emergência hipertensiva          | Com sintomas: não esperar 15 min; sulfato antes do anti-hipertensivo                                                                                                                                                                                                                                                                         | pág. 10              |

## Eclâmpsia e sulfato de magnésio

| Item                      | Regra                                                                                                                                                                                                     | Fonte                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Indicação                 | Iminência de eclâmpsia, eclâmpsia, HELLP, PE com deterioração clínica e/ou laboratorial (inclusive hipertensão de difícil controle sem sintomas), crise hipertensiva com PE conhecida ou suspeita         | pág. 10-11 e 34-35                                  |
| Ataque (os dois esquemas) | 4 g IV: 8 mL de MgSO4 50% + 12 mL de AD ou SF (20 mL), em 15 a 20 min; ou 8 mL em 100 mL de SF a 300 mL/h                                                                                                 | Quadro 6, pág. 36                                   |
| Pritchard                 | Ataque + 10 g IM (5 g em cada nádega); manutenção de 5 g IM profunda a cada 4 h. Preferido para transporte                                                                                                | Quadro 6; pág. 37                                   |
| Zuspan                    | Manutenção de 1 g/h em bomba: 10 mL de MgSO4 50% + 490 mL de SF (1 g/100 mL) a 100 mL/h. Sintomática: 2 g/h (20 mL + 480 mL, a 100 mL/h)                                                                  | Quadro 6                                            |
| Função renal              | Creatinina ≥ 1,0 mg/dL: manutenção pela metade (Zuspan 0,5 g/h = 50 mL/h; Pritchard 2,5 g = 5 mL a 50%). Interromper só com diurese < 25 mL/h                                                             | pág. 38                                             |
| Monitorização             | Antes de cada manutenção: reflexo patelar presente, FR ≥ 16 irpm, diurese ≥ 25 mL/h. Se alterado: reduzir ou parar a infusão, ou não fazer a dose IM; dosar magnésio e função renal; reiniciar se normais | pág. 37                                             |
| Níveis                    | Terapêutico 4-7 mEq/L (4,8-8,4 mg/dL); reflexo abolido com 8-10; parada respiratória a partir de 12                                                                                                       | pág. 37                                             |
| Antídoto                  | Gluconato de cálcio 10%, 10 mL (1 g) IV lentamente                                                                                                                                                        | pág. 37                                             |
| Recorrência               | 2 g IV em bolus (4 mL a 50% em 10 mL) e manutenção de 2 g/h; se dois bolus falharem, difenil-hidantoína e investigação de hemorragia intracraniana                                                        | pág. 37-38                                          |
| Duração                   | 24 h após o parto ou após a última convulsão; também 24 h quando usado por crise hipertensiva                                                                                                             | pág. 38                                             |
| Ampolas                   | 50% (10 mL = 5 g), 20% (10 mL = 2 g), 10% (10 mL = 1 g). As diluições são para a de 50%; a tela traz a equivalência em mL para 2, 4 e 5 g                                                                 | pág. 35-36                                          |
| Miastenia grave           | Contraindicado                                                                                                                                                                                            | MS, Manual de Gestação de Alto Risco 2022, Quadro 7 |

## Escolhas entre fontes (não mostradas na tela)

Divergências do Manual do MS 2022 para a RBEHG 2023:

- **Ataque:** MS em 5 a 10 min; RBEHG em 15 a 20 min.
- **Manutenção do Zuspan:** MS com 10 mL em 240 mL de SF, 1 g/h = 50 mL/h; RBEHG com 10 mL em
  490 mL, 1 g/h = 100 mL/h. Não misturar as duas preparações.
- **Frequência respiratória mínima:** MS ≥ 12; RBEHG ≥ 16.
- **Função renal:** MS "creatinina > 1,3: aplicar a metade da dose"; RBEHG "creatinina ≥ 1,0: dose de
  manutenção pela metade".
- **Convulsão que volta após dois bolus:** MS diazepam, lorazepam ou midazolam; RBEHG
  difenil-hidantoína.
- **Antídoto:** igual nas duas. O MS acrescenta "3 min" e O2 a 5 L/min.
- **Fatores de risco:** o MS 2022 (a partir da RBEHG 2020) incluía baixo nível socioeconômico, etnia
  afrodescendente e história pessoal de baixo peso ao nascer. A RBEHG 2023 tirou esses itens e pôs a
  reprodução assistida como risco alto.
- **Cálcio:** MS "mínimo de 1 g/dia até o parto".

## Fora da tela

- **Diuréticos:** o protocolo trata o tema como controverso.
- **FullPIERS:** calculadora de terceiros.
- **Biomarcadores:** sFlt-1/PlGF.
- **Neuroproteção fetal com sulfato (< 32 semanas):** é outro uso.
- **Quadro 5 da RBEHG (nitroprussiato):** o cabeçalho de doses (0,5 a 5,0 mcg/kg/min) não bate com
  as velocidades da tabela, que correspondem a 0,5, 1, 2, 4, 6 e 8 mcg/kg/min a 200 mcg/mL. A tela
  traz só a faixa de dose e a diluição.
