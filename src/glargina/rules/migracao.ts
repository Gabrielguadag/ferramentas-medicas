// Migração NPH → glargina, alerta de excesso de basal e tubetes para a receita.
// Fontes: NT Conjunta 169/2026 (Quadros 3 e 4; armazenamento) e PCDT DM2 2026 (8.3.4.1 e 8.3.4.2).

export type DiabetesType = 'DM1' | 'DM2'

export interface Conversion {
  glargine: number
  /** Valor antes de arredondar (ex.: 30 × 0,8 = 24). */
  exact: number
  rule: 'equivalent' | 'reduce20'
}

/** Quadro 3: NPH 1x/dia → 1:1; NPH 2 ou mais vezes/dia → reduzir ~20% da dose total diária. */
export function convertNphToGlargine(nphDailyDose: number, applicationsPerDay: number): Conversion {
  const exact = applicationsPerDay <= 1 ? nphDailyDose : nphDailyDose * 0.8
  return {
    glargine: Math.round(exact),
    exact: Math.round(exact * 10) / 10,
    rule: applicationsPerDay <= 1 ? 'equivalent' : 'reduce20',
  }
}

export function uiPerKg(dose: number, weightKg: number | null): number | null {
  if (!weightKg || !(weightKg > 0)) return null
  return Math.round((dose / weightKg) * 100) / 100
}

export interface BasalAlert {
  active: boolean
  reasons: string[]
}

/**
 * Quadro 4 da NT 169 (excesso de insulina basal), critérios calculáveis na tela:
 * DM2 → basal > 0,5 UI/kg/dia; DM1 (criança/adolescente) → basal > 50% da DTDI.
 */
export function basalAlert(
  type: DiabetesType,
  basal: number,
  weightKg: number | null,
  dtdi: number | null,
): BasalAlert {
  const reasons: string[] = []
  if (type === 'DM2' && weightKg && weightKg > 0 && basal / weightKg > 0.5) {
    reasons.push('Insulina basal > 0,5 UI/kg/dia.')
  }
  if (type === 'DM1' && dtdi && dtdi > 0 && basal / dtdi > 0.5) {
    reasons.push('Insulina basal > 50% da dose total diária (DTDI).')
  }
  return { active: reasons.length > 0, reasons }
}

// ---------------------------------------------------------------------------------------------
// Tubetes para a receita
//   tubete (carpule) de 3 mL a 100 UI/mL = 300 UI;
//   aberto, dura no máximo 28 dias (NT 169 e guia do MS) → no mínimo 1 tubete a cada 28 dias;
//   teste de escorva antes de cada aplicação (NT 169). A quantidade da escorva depende da caneta.

export const UI_PER_TUBETE = 300
export const MAX_DAYS_OPEN = 28

export interface TubeteCalc {
  tubetes: number
  byVolume: number
  byExpiry: number
  uiPerDay: number
}

export function tubetesFor(dailyDose: number, days: number, primingUiPerDay: number): TubeteCalc {
  const uiPerDay = dailyDose + primingUiPerDay
  if (!(days > 0) || !(dailyDose >= 0)) return { tubetes: 0, byVolume: 0, byExpiry: 0, uiPerDay }
  const byVolume = Math.ceil((uiPerDay * days) / UI_PER_TUBETE - 1e-9)
  const byExpiry = Math.ceil(days / MAX_DAYS_OPEN - 1e-9)
  return { tubetes: Math.max(byVolume, byExpiry), byVolume, byExpiry, uiPerDay }
}
