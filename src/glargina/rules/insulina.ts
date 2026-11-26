// Insulinização no DM2 — PCDT DM2 2026, itens 8.3.4.1 (NPH), 8.3.4.3 (bolus), Quadros 7 e 8, Figura 3.

// ---------------------------------------------------------------------------------------------
// Início da NPH: "dose inicial de 10 U ou 0,1 U/kg a 0,2 U/kg", à noite, antes de dormir.

export function nphStart(weightKg: number | null): {
  fixed: number
  range: [number, number] | null
} {
  return {
    fixed: 10,
    range:
      weightKg && weightKg > 0 ? [Math.round(0.1 * weightKg), Math.round(0.2 * weightKg)] : null,
  }
}

/** A dose fixa de 10 U passa de 0,2 U/kg em quem pesa menos de 50 kg. */
export function fixedAboveRange(weightKg: number | null): boolean {
  return !!weightKg && weightKg > 0 && 10 > 0.2 * weightKg
}

/** Teto de insulina basal (8.3.4.1): < 0,5 U/kg/dia; até 0,75 U/kg/dia só com obesidade e resistência. */
export function basalCeiling(weightKg: number | null): { usual: number; obesity: number } | null {
  if (!weightKg || !(weightKg > 0)) return null
  return { usual: Math.round(0.5 * weightKg), obesity: Math.round(0.75 * weightKg) }
}

/**
 * Segunda dose de NPH (8.3.4.1): HbA1c fora da meta com jejum no alvo → 80% da dose de deitar,
 * dividida em 2/3 antes do desjejum e 1/3 antes de dormir.
 */
export function secondNphDose(bedtimeDose: number): {
  total: number
  morning: number
  bedtime: number
} {
  const total = bedtimeDose * 0.8
  return {
    total: Math.round(total),
    morning: Math.round((total * 2) / 3),
    bedtime: Math.round(total / 3),
  }
}

// ---------------------------------------------------------------------------------------------
// Bolus de correção pela glicemia capilar ANTES da refeição.

/** Quadro 8 (algoritmo de correção, Diabetes Coalition of California 2010). */
export function correctionByAlgorithm(preMealGlucose: number): number {
  const g = preMealGlucose
  if (g < 50) return -2
  if (g < 70) return -1
  if (g <= 130) return 0
  if (g <= 180) return 1
  if (g <= 230) return 2
  if (g <= 280) return 3
  if (g <= 330) return 4
  return 5
}

/** Quadro 7: bolus de correção = (GA − LSOG) / FC; FC = 50 ou 1800/DTDI. Só acima do limite. */
export function correctionByFactor(
  preMealGlucose: number,
  upperTarget: number,
  factor: number,
): number {
  if (!(factor > 0) || preMealGlucose <= upperTarget) return 0
  return (preMealGlucose - upperTarget) / factor
}

export function factorFromDtdi(dtdi: number): number {
  return 1800 / dtdi
}

export interface BolusResult {
  correction: number
  exact: number
  total: number
  hypo: boolean
}

/** Dose de bolus = prandial + correção, arredondada para unidade inteira (Quadro 7: 8,2 → 8). */
export function bolusDose(
  prandial: number,
  correction: number,
  preMealGlucose: number,
): BolusResult {
  const exact = prandial + correction
  return {
    correction: Math.round(correction * 10) / 10,
    exact: Math.round(exact * 10) / 10,
    total: Math.max(0, Math.round(exact)),
    hypo: preMealGlucose < 70,
  }
}
