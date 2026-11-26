// Entradas da estratificação de risco cardiovascular, compartilhadas por todas as escalas.
// Cada escala usa o subconjunto que a fonte define; o que não foi informado é "não avaliado".

export type Retinopathy = 'nenhuma' | 'np-leve' | 'moderada-grave'
export type Neuropathy = 'nenhuma' | 'incipiente' | 'instalada'

export interface RiskInputs {
  // Pessoa (vem do painel do paciente)
  age: number | null
  sex: 'M' | 'F'
  /** Considerar diabetes no cálculo (o médico pode desmarcar). */
  diabetes: boolean
  dmType: 'DM1' | 'DM2'
  dmYears: number | null
  /** null = não informado (a regra do DM1 só vale quando o médico marca "após os 18 anos"). */
  dmDiagnosedAfter18: boolean | null
  bmi: number | null

  // Clínica
  smoker: boolean
  hypertension: boolean
  sbp: number | null
  onBpMeds: boolean
  onStatin: boolean

  // Exames
  totalChol: number | null
  hdl: number | null
  ldl: number | null
  egfr: number | null
  uacr: number | null
  hba1c: number | null
  lpaMgDl: number | null
  lpaNmolL: number | null
  ntProBnp: number | null
  cac: number | null
  cacAbove75thPercentile: boolean

  // Doença aterosclerótica estabelecida (eventos)
  recentAcs: boolean // SCA nos últimos 12 meses
  priorMi: boolean // IAM prévio (evento maior, SBC Tab. 4.2)
  stableAngina: boolean // angina estável (DCV sintomática, não é evento maior)
  ischemicStroke: boolean // AVC isquêmico prévio (evento maior, SBC Tab. 4.2)
  tia: boolean // AIT (DCV sintomática, não é evento maior)
  revascularization: boolean // revascularização coronária, carotídea, renal ou periférica
  revascOutsideEvent: boolean // revascularização/ICP em momento diferente do evento maior (SBC Tab. 4.2)
  pad: boolean // DAP sintomática, insuficiência vascular periférica ou amputação
  multipleEvents: boolean
  eventUnder2Years: boolean
  ldlHighDespiteMaxTherapy: boolean // LDL ≥ 100 apesar de estatina máxima + ezetimiba

  // Aterosclerose subclínica e outros
  stenosisOver50: boolean // obstrução ≥ 50% em qualquer território
  carotidPlaque: boolean // placa carotídea < 50% (ou EIMC ≥ 1,5 mm)
  coronaryCtPlaque: boolean // placa < 50% na angiotomografia
  aaa: boolean // aneurisma de aorta abdominal
  abnormalAbi: boolean // ITB alterado (SBD lista sem ponto de corte)
  familialHypercholesterolemia: boolean

  // Estratificadores do diabetes
  prematureCadFamily: boolean // pai/mãe/irmãos com DAC < 55 (H) ou < 65 (M)
  metabolicSyndrome: boolean // IDF
  neuropathy: Neuropathy
  retinopathy: Retinopathy
  nephropathy: boolean // PCDT (≤ 39 anos)

  // Agravantes (SBC, Tab. 4.3), contados como lista
  aggravators: string[]
}

export function emptyInputs(): RiskInputs {
  return {
    age: null,
    sex: 'M',
    diabetes: true,
    dmType: 'DM2',
    dmYears: null,
    dmDiagnosedAfter18: null,
    bmi: null,
    smoker: false,
    hypertension: false,
    sbp: null,
    onBpMeds: false,
    onStatin: false,
    totalChol: null,
    hdl: null,
    ldl: null,
    egfr: null,
    uacr: null,
    hba1c: null,
    lpaMgDl: null,
    lpaNmolL: null,
    ntProBnp: null,
    cac: null,
    cacAbove75thPercentile: false,
    recentAcs: false,
    priorMi: false,
    stableAngina: false,
    ischemicStroke: false,
    tia: false,
    revascularization: false,
    revascOutsideEvent: false,
    pad: false,
    multipleEvents: false,
    eventUnder2Years: false,
    ldlHighDespiteMaxTherapy: false,
    stenosisOver50: false,
    carotidPlaque: false,
    coronaryCtPlaque: false,
    aaa: false,
    abnormalAbi: false,
    familialHypercholesterolemia: false,
    prematureCadFamily: false,
    metabolicSyndrome: false,
    neuropathy: 'nenhuma',
    retinopathy: 'nenhuma',
    nephropathy: false,
    aggravators: [],
  }
}

export function hasAscvdEvent(i: RiskInputs): boolean {
  return hasMajorEvent(i) || i.stableAngina || i.tia || i.revascularization
}

/**
 * Eventos cardiovasculares ateroscleróticos maiores (SBC 2025, Tab. 4.2): SCA nos últimos 12 meses,
 * IAM prévio, AVC isquêmico prévio e DAP sintomática. Só eles abrem a avaliação de risco extremo;
 * angina estável, AIT e revascularização isolada são DCV estabelecida (muito alto).
 */
export function hasMajorEvent(i: RiskInputs): boolean {
  return i.recentAcs || i.priorMi || i.ischemicStroke || i.pad
}

/** Hipertensão arterial "tratada ou não" (SBC Tab. 4.6; SBD Quadro 2): quem usa anti-hipertensivo conta. */
export function hasHypertension(i: RiskInputs): boolean {
  return i.hypertension || i.onBpMeds
}

/** DRC pelo corte de TFGe < 60 (SBC Tab. 4.2: "DRC, TFGe 15 a 59"; abaixo de 15 também é DRC). */
export function hasCkd(i: RiskInputs): boolean {
  return i.egfr !== null && i.egfr < 60
}

/** Nefropatia para o PCDT (≤ 39 anos): marcada à mão ou derivada de TFGe < 60 ou albuminúria ≥ 30 mg/g. */
export function hasNephropathy(i: RiskInputs): boolean {
  return i.nephropathy || (i.egfr !== null && i.egfr < 60) || (i.uacr !== null && i.uacr >= 30)
}

/** Faixas plausíveis das entradas numéricas (fora delas, quase sempre é erro de unidade ou digitação). */
const PLAUSIBLE: {
  key: 'sbp' | 'totalChol' | 'hdl' | 'ldl' | 'egfr' | 'uacr' | 'bmi' | 'lpaMgDl' | 'lpaNmolL'
  label: string
  unit: string
  lo: number
  hi: number
}[] = [
  { key: 'sbp', label: 'PA sistólica', unit: 'mmHg', lo: 60, hi: 260 },
  { key: 'totalChol', label: 'Colesterol total', unit: 'mg/dL', lo: 80, hi: 800 },
  { key: 'hdl', label: 'HDL', unit: 'mg/dL', lo: 10, hi: 200 },
  { key: 'ldl', label: 'LDL', unit: 'mg/dL', lo: 20, hi: 600 },
  { key: 'egfr', label: 'TFGe', unit: 'mL/min/1,73 m²', lo: 2, hi: 150 },
  { key: 'uacr', label: 'Albuminúria', unit: 'mg/g', lo: 0, hi: 30000 },
  { key: 'bmi', label: 'IMC', unit: 'kg/m²', lo: 12, hi: 70 },
  { key: 'lpaMgDl', label: 'Lp(a)', unit: 'mg/dL', lo: 0, hi: 600 },
  { key: 'lpaNmolL', label: 'Lp(a)', unit: 'nmol/L', lo: 0, hi: 1500 },
]

/**
 * Valores fora da faixa plausível não entram no cálculo (viram "não informado") e geram um aviso.
 * Os avisos são curtos e pedem para conferir a unidade.
 */
export function sanitizeInputs(i: RiskInputs): { inputs: RiskInputs; problems: string[] } {
  const inputs = { ...i }
  const problems: string[] = []
  for (const { key, label, unit, lo, hi } of PLAUSIBLE) {
    const v = inputs[key]
    if (v !== null && (v < lo || v > hi)) {
      problems.push(
        `${label} ${v} ${unit} fora da faixa esperada (${lo} a ${hi}): confira a unidade. Não foi usado no cálculo.`,
      )
      inputs[key] = null
    }
  }
  return { inputs, problems }
}

/** SBC Tab. 4.3 — fatores agravantes (Lp(a) é avaliada pelo valor informado). */
export const AGGRAVATORS = [
  'História familiar de DCV prematura (parente de 1º grau: homem < 55, mulher < 65 anos)',
  'Adiposidade, esteatose hepática (especialmente com fibrose) ou síndrome metabólica',
  'Condição inflamatória crônica (AR, psoríase, LES, DII, HIV)',
  'Transplante de órgão',
  'Específico da mulher: menarca ≤ 12 ou ≥ 17 anos, distúrbio da gestação, parto prematuro, RCIU, ≥ 3 abortos, menopausa precoce',
  'PCR ultrassensível ≥ 2,0 mg/L',
] as const

// ---------------------------------------------------------------------------------------------
// CKD-EPI 2021 sem raça (Inker et al., NEJM 2021;385:1737).

export function ckdEpi2021(creatinineMgDl: number, age: number, sex: 'M' | 'F'): number {
  const k = sex === 'F' ? 0.7 : 0.9
  const a = sex === 'F' ? -0.241 : -0.302
  const r = creatinineMgDl / k
  const egfr =
    142 *
    Math.pow(Math.min(r, 1), a) *
    Math.pow(Math.max(r, 1), -1.2) *
    Math.pow(0.9938, age) *
    (sex === 'F' ? 1.012 : 1)
  return Math.round(egfr)
}

// ---------------------------------------------------------------------------------------------
// Grade renal (SBC Tab. 4.7 = SBD Quadro 3): TFG × albuminúria.

export type RenalRisk = 'sem-dado' | 'ver-idade' | 'alto' | 'muito-alto'

export function renalGrid(egfr: number | null, uacr: number | null): RenalRisk {
  if (egfr === null) return 'sem-dado'
  if (egfr < 30) return 'muito-alto'
  if (uacr === null) return egfr < 60 ? 'alto' : 'sem-dado'
  const alb = uacr < 30 ? 0 : uacr < 300 ? 1 : 2
  if (alb === 2) return 'muito-alto'
  if (egfr < 45) return alb === 1 ? 'muito-alto' : 'alto'
  if (egfr < 60) return 'alto'
  return alb === 1 ? 'alto' : 'ver-idade'
}
