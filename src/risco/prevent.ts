// Equações AHA PREVENT (Khan SS et al., Circulation 2024;149:430–449), com a errata de HbA1c
// (outubro de 2026). Coeficientes em prevent.coefficients.json (ver _meta). Sem SDI (índice por
// CEP dos EUA): quando HbA1c e RAC são informados juntos, usa o modelo "full" com SDI ausente.

import data from './prevent.coefficients.json'

export type Outcome = 'total_cvd' | 'ascvd' | 'heart_failure'
export type Horizon = '10yr' | '30yr'
export type Model = 'base' | 'uacr' | 'hba1c' | 'full'

export interface PreventInput {
  age: number
  sex: 'M' | 'F'
  totalChol: number // mg/dL
  hdl: number // mg/dL
  sbp: number
  bpTx: boolean
  statin: boolean
  diabetes: boolean
  smoker: boolean
  egfr: number
  bmi: number | null
  hba1c: number | null
  uacr: number | null
}

export const PREVENT_LIMITS = {
  age: [30, 79],
  sbp: [90, 180],
  totalChol: [130, 320],
  hdl: [20, 100],
  egfr: [15, 140],
  bmi: [18.5, 39.9],
  hba1c: [4.5, 15],
  uacr: [0.1, 25000],
} as const

export type PreventCheck = { ok: true } | { ok: false; problems: string[] }

export function checkPrevent(i: {
  age: number | null
  totalChol: number | null
  hdl: number | null
  sbp: number | null
  egfr: number | null
}): PreventCheck {
  const p: string[] = []
  const need = (
    v: number | null | undefined,
    name: string,
    [lo, hi]: readonly [number, number],
    unit = '',
  ) => {
    if (v === null || v === undefined) p.push(`informe ${name}`)
    else if (v < lo || v > hi) p.push(`${name} fora da faixa do modelo (${lo}–${hi}${unit})`)
  }
  need(i.age, 'idade', PREVENT_LIMITS.age, ' anos')
  need(i.totalChol, 'colesterol total', PREVENT_LIMITS.totalChol, ' mg/dL')
  need(i.hdl, 'HDL', PREVENT_LIMITS.hdl, ' mg/dL')
  need(i.sbp, 'PA sistólica', PREVENT_LIMITS.sbp, ' mmHg')
  need(i.egfr, 'TFGe', PREVENT_LIMITS.egfr)
  return p.length ? { ok: false, problems: p } : { ok: true }
}

const inRange = (v: number | null, [lo, hi]: readonly [number, number]) =>
  v !== null && v >= lo && v <= hi

export function selectModel(i: PreventInput): Model {
  const h = inRange(i.hba1c, PREVENT_LIMITS.hba1c)
  const u = inRange(i.uacr, PREVENT_LIMITS.uacr)
  if (h && u) return 'full'
  if (h) return 'hba1c'
  if (u) return 'uacr'
  return 'base'
}

function terms(i: PreventInput, model: Model): Record<string, number> {
  const mmol = 0.02586
  const age = (i.age - 55) / 10
  const nonHdl = (i.totalChol - i.hdl) * mmol - 3.5
  const hdl = (i.hdl * mmol - 1.3) / 0.3
  const sbpLt = (Math.min(i.sbp, 110) - 110) / 20
  const sbpGte = (Math.max(i.sbp, 110) - 130) / 20
  // IMC só pesa nos modelos de IC; fora da faixa ou ausente, usa-se o centro (25) só para não
  // quebrar o cálculo de DCV total/ASCVD, em que o coeficiente é 0.
  const bmi = i.bmi ?? 25
  const bmiLt = (Math.min(bmi, 30) - 25) / 5
  const bmiGte = (Math.max(bmi, 30) - 30) / 5
  const egfrLt = (Math.min(i.egfr, 60) - 60) / -15
  const egfrGte = (Math.max(i.egfr, 60) - 90) / -15
  const dm = i.diabetes ? 1 : 0
  const smk = i.smoker ? 1 : 0
  const bpTx = i.bpTx ? 1 : 0
  const statin = i.statin ? 1 : 0
  const useH = (model === 'hba1c' || model === 'full') && inRange(i.hba1c, PREVENT_LIMITS.hba1c)
  const useU = (model === 'uacr' || model === 'full') && inRange(i.uacr, PREVENT_LIMITS.uacr)
  const h = useH ? (i.hba1c as number) - 5.3 : 0
  return {
    age,
    age_squared: age * age,
    non_hdl_c: nonHdl,
    hdl_c: hdl,
    sbp_lt_110: sbpLt,
    sbp_gte_110: sbpGte,
    dm,
    smoking: smk,
    bmi_lt_30: bmiLt,
    bmi_gte_30: bmiGte,
    egfr_lt_60: egfrLt,
    egfr_gte_60: egfrGte,
    bp_tx: bpTx,
    statin,
    bp_tx_sbp_gte_110: bpTx * sbpGte,
    statin_non_hdl_c: statin * nonHdl,
    age_non_hdl_c: age * nonHdl,
    age_hdl_c: age * hdl,
    age_sbp_gte_110: age * sbpGte,
    age_dm: age * dm,
    age_smoking: age * smk,
    age_bmi_gte_30: age * bmiGte,
    age_egfr_lt_60: age * egfrLt,
    ln_uacr: useU ? Math.log(i.uacr as number) : 0,
    missing_uacr: useU ? 0 : 1,
    hba1c_dm: useH && dm ? h : 0,
    hba1c_no_dm: useH && !dm ? h : 0,
    missing_hba1c: useH ? 0 : 1,
    sdi_4_to_6: 0,
    sdi_7_to_10: 0,
    missing_sdi: 1,
    constant: 1,
  }
}

type Coefs = Record<string, number>
const COEF = data.coefficients as unknown as Record<
  Model,
  Record<Outcome, Record<Horizon, Record<'female' | 'male', Coefs>>>
>
const ORDER = data.term_order as unknown as Record<Model, Record<Horizon, string[]>>

/** Risco (fração 0–1, sem arredondar). */
export function preventRisk(
  i: PreventInput,
  outcome: Outcome,
  horizon: Horizon,
  model = selectModel(i),
): number {
  const t = terms(i, model)
  const c = COEF[model][outcome][horizon][i.sex === 'F' ? 'female' : 'male']
  let x = 0
  for (const name of ORDER[model][horizon]) {
    const coef = c[name]
    const v = t[name]
    if (coef === undefined || v === undefined) throw new Error(`termo PREVENT ausente: ${name}`)
    x += coef * v
  }
  return Math.exp(x) / (1 + Math.exp(x))
}

export interface PreventResult {
  model: Model
  tenYear: Record<Outcome, number>
  thirtyYear: Record<Outcome, number> | null
  /** IC usa IMC; sem IMC válido, o risco de IC (e DCV total) não é calculado. */
  bmiMissing: boolean
}

export function prevent(i: PreventInput): PreventResult {
  const model = selectModel(i)
  const bmiOk = inRange(i.bmi, PREVENT_LIMITS.bmi)
  const calc = (h: Horizon) =>
    ({
      total_cvd: preventRisk(i, 'total_cvd', h, model),
      ascvd: preventRisk(i, 'ascvd', h, model),
      heart_failure: preventRisk(i, 'heart_failure', h, model),
    }) as Record<Outcome, number>
  return {
    model,
    tenYear: calc('10yr'),
    // O pacote de referência avisa que o horizonte de 30 anos não se aplica acima de 59 anos.
    thirtyYear: i.age <= 59 ? calc('30yr') : null,
    bmiMissing: !bmiOk,
  }
}

/** Arredondamento "meio para cima" a 3 casas, como o pacote de referência. */
export function roundHalfUp3(v: number): number {
  return (Math.sign(v) * Math.trunc(Math.abs(v) * 1000 + 0.5 + Math.sqrt(2.22e-16))) / 1000
}
