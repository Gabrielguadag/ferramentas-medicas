// Risco cardiovascular em 10 anos da OMS 2019 (Kaptoge S et al., Lancet Glob Health
// 2019;7:e1332), recalibrado para a América Latina Tropical (Brasil), como na calculadora
// HEARTS/OPAS recomendada pelo PCDT DM2 2026. Coeficientes e recalibração: who2019.params.json.
//
// A calculadora HEARTS não calcula de forma contínua: ela consulta células por faixa (idade,
// PAS, colesterol ou IMC). Cada célula equivale ao modelo calculado nos valores representativos
// da faixa, arredondado a inteiro (conferido nas 2.100 células oficiais, sem divergência).

import P from './who2019.params.json'

export type WhoModel = 'lab' | 'nonlab'

export interface WhoInput {
  model: WhoModel
  age: number
  sex: 'M' | 'F'
  smoker: boolean
  sbp: number
  /** Laboratorial: diabetes e colesterol total (mg/dL). Não laboratorial: IMC. */
  diabetes?: boolean
  totalCholMgDl?: number | null
  bmi?: number | null
}

interface Coef {
  log_hr_age: number
  log_hr_sbp: number
  log_hr_smoking: number
  log_hr_sbp_age: number
  log_hr_smoking_age: number
  baseline_survival: number
  log_hr_chol?: number
  log_hr_chol_age?: number
  log_hr_diabetes?: number
  log_hr_diabetes_age?: number
  log_hr_bmi?: number
  log_hr_bmi_age?: number
}

const COEF = P.coefficients as unknown as Record<WhoModel, Record<string, Coef>>
const RECAL = P.recalibration as unknown as Record<'male' | 'female', Record<string, number>>

/** Conversão mg/dL → mmol/L usada pelos autores e pela calculadora (só no valor contínuo). */
export const MG_DL_PER_MMOL = 38.67

/** Risco contínuo (fração 0–1) para valores exatos. */
export function whoRiskContinuous(
  model: WhoModel,
  sex: 'M' | 'F',
  age: number,
  sbp: number,
  smoker: boolean,
  x: number, // colesterol (mmol/L) no laboratorial; IMC no não laboratorial
  diabetes = false,
): number {
  const s = sex === 'M' ? 'male' : 'female'
  const a = age - 60
  const p = (endpoint: 'mi_chd' | 'stroke') => {
    const c = COEF[model][`${endpoint}|${s}`]
    if (!c) throw new Error('coeficiente OMS ausente')
    const sb = sbp - 120
    const smk = smoker ? 1 : 0
    let lp =
      c.log_hr_age * a +
      c.log_hr_sbp * sb +
      c.log_hr_smoking * smk +
      c.log_hr_sbp_age * sb * a +
      c.log_hr_smoking_age * smk * a
    if (model === 'lab') {
      const ch = x - 6
      const dm = diabetes ? 1 : 0
      lp +=
        (c.log_hr_chol ?? 0) * ch +
        (c.log_hr_chol_age ?? 0) * ch * a +
        (c.log_hr_diabetes ?? 0) * dm +
        (c.log_hr_diabetes_age ?? 0) * dm * a
    } else {
      const b = x - 25
      lp += (c.log_hr_bmi ?? 0) * b + (c.log_hr_bmi_age ?? 0) * b * a
    }
    const raw = 1 - Math.pow(c.baseline_survival, Math.exp(lp))
    const key = endpoint === 'mi_chd' ? 'chd' : 'stroke'
    const cons = RECAL[s][`${model}_${key}_cons`]
    const slope = RECAL[s][`${model}_${key}_slope`]
    if (cons === undefined || slope === undefined) throw new Error('recalibração OMS ausente')
    return 1 - Math.exp(-Math.exp(cons + slope * Math.log(-Math.log(1 - raw))))
  }
  return 1 - (1 - p('mi_chd')) * (1 - p('stroke'))
}

// Faixas e valores representativos das tabelas OMS/HEARTS.
const AGE_REP = [42.5, 47.5, 52.5, 57.5, 62.5, 67.5, 72.5]
const SBP_REP = [110, 130, 150, 170, 190]
const CHOL_REP = [3.5, 4.5, 5.5, 6.5, 7.5]
const BMI_REP = [17.5, 22.5, 27.5, 32.5, 37.5]

export function ageBand(age: number): number {
  if (age < 45) return 1
  if (age >= 70) return 7
  return Math.floor((age - 45) / 5) + 2
}
export const sbpBand = (v: number) => (v < 120 ? 1 : v < 140 ? 2 : v < 160 ? 3 : v < 180 ? 4 : 5)
/** Colesterol total em mg/dL: cortes 155/193/232/270, iguais aos do aplicativo HEARTS/OPAS. */
export const cholBand = (mgDl: number) =>
  mgDl < 155 ? 1 : mgDl < 193 ? 2 : mgDl < 232 ? 3 : mgDl < 270 ? 4 : 5
export const bmiBand = (v: number) => (v < 20 ? 1 : v < 25 ? 2 : v < 30 ? 3 : v < 35 ? 4 : 5)

/** Valor da célula da tabela (risco % inteiro), igual à calculadora HEARTS. */
export function whoCell(
  model: WhoModel,
  sex: 'M' | 'F',
  smoker: boolean,
  diabetes: boolean,
  aBand: number,
  sBand: number,
  xBand: number,
): number {
  const age = AGE_REP[aBand - 1]
  const sbp = SBP_REP[sBand - 1]
  const x = (model === 'lab' ? CHOL_REP : BMI_REP)[xBand - 1]
  if (age === undefined || sbp === undefined || x === undefined) throw new Error('faixa inválida')
  return Math.round(100 * whoRiskContinuous(model, sex, age, sbp, smoker, x, diabetes))
}

export type WhoCategory = 'Baixo' | 'Moderado' | 'Alto' | 'Muito alto' | 'Crítico'

/** Categorias da calculadora HEARTS/OPAS. */
export function whoCategory(pct: number): WhoCategory {
  if (pct < 5) return 'Baixo'
  if (pct < 10) return 'Moderado'
  if (pct < 20) return 'Alto'
  if (pct < 30) return 'Muito alto'
  return 'Crítico'
}

/** Faixas aceitas pelo aplicativo HEARTS/OPAS (fora delas ele não calcula). */
export const WHO_LIMITS = { sbp: [90, 200], totalChol: [140, 300] } as const

/** Entradas fora das faixas do aplicativo oficial (sem calcular, avisar). */
export function whoProblems(
  model: WhoModel,
  sbp: number | null,
  totalCholMgDl: number | null,
): string[] {
  const p: string[] = []
  const [s0, s1] = WHO_LIMITS.sbp
  if (sbp !== null && (sbp < s0 || sbp > s1))
    p.push(`PA sistólica fora da faixa da calculadora (${s0} a ${s1} mmHg): confira o valor`)
  const [c0, c1] = WHO_LIMITS.totalChol
  if (model === 'lab' && totalCholMgDl !== null && (totalCholMgDl < c0 || totalCholMgDl > c1))
    p.push(`colesterol total fora da faixa da calculadora (${c0} a ${c1} mg/dL): confira a unidade`)
  return p
}

export interface WhoResult {
  pct: number
  category: WhoCategory
  continuousPct: number
  outsideAge: boolean
}

export function whoHearts(i: WhoInput): WhoResult | null {
  if (i.model === 'lab' && (i.totalCholMgDl === null || i.totalCholMgDl === undefined)) return null
  if (i.model === 'nonlab' && (i.bmi === null || i.bmi === undefined)) return null
  if (whoProblems(i.model, i.sbp, i.totalCholMgDl ?? null).length) return null
  const x = i.model === 'lab' ? (i.totalCholMgDl as number) / MG_DL_PER_MMOL : (i.bmi as number)
  const xb = i.model === 'lab' ? cholBand(i.totalCholMgDl as number) : bmiBand(x)
  const dm = i.model === 'lab' && Boolean(i.diabetes)
  const pct = whoCell(i.model, i.sex, i.smoker, dm, ageBand(i.age), sbpBand(i.sbp), xb)
  return {
    pct,
    category: whoCategory(pct),
    continuousPct:
      Math.round(1000 * whoRiskContinuous(i.model, i.sex, i.age, i.sbp, i.smoker, x, dm)) / 10,
    outsideAge: i.age < 40 || i.age > 74,
  }
}
