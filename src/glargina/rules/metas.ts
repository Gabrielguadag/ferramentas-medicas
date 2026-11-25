// Metas individualizadas — NT Conjunta 169/2026, Quadro 5 (conferido no PDF, pág. 9).

export type Profile =
  'adulto' | 'idoso-saudavel' | 'idoso-comprometido' | 'idoso-muito-comprometido' | 'crianca'

export interface Goal {
  profile: Profile
  label: string
  short: string
  /** HbA1c máxima (%), exclusiva ("<7,0"); null = "evitar sintomas de hiper ou hipoglicemia". */
  hba1cBelow: number | null
  fasting: [number, number]
  postprandialBelow: number
  bedtime: [number, number]
}

export const GOALS: readonly Goal[] = [
  {
    profile: 'adulto',
    label: 'Pessoa com DM1 ou DM2 (adulto)',
    short: 'Adulto (DM1 ou DM2)',
    hba1cBelow: 7.0,
    fasting: [80, 130],
    postprandialBelow: 180,
    bedtime: [90, 150],
  },
  {
    profile: 'idoso-saudavel',
    label: 'Pessoa idosa saudável',
    short: 'Idoso saudável',
    hba1cBelow: 7.5,
    fasting: [80, 130],
    postprandialBelow: 180,
    bedtime: [90, 150],
  },
  {
    profile: 'idoso-comprometido',
    label: 'Pessoa idosa comprometida',
    short: 'Idoso comprometido',
    hba1cBelow: 8.0,
    fasting: [90, 150],
    postprandialBelow: 180,
    bedtime: [100, 180],
  },
  {
    profile: 'idoso-muito-comprometido',
    label: 'Pessoa idosa muito comprometida',
    short: 'Idoso muito comprometido',
    hba1cBelow: null,
    fasting: [100, 180],
    postprandialBelow: 180,
    bedtime: [110, 200],
  },
  {
    profile: 'crianca',
    label: 'Criança e adolescente',
    short: 'Criança/adolescente',
    hba1cBelow: 7.0,
    fasting: [70, 130],
    postprandialBelow: 180,
    bedtime: [90, 150],
  },
]

export function goalOf(p: Profile): Goal {
  const g = GOALS.find((x) => x.profile === p)
  if (!g) throw new Error(`perfil desconhecido: ${p}`)
  return g
}

export const PROFILE_OPTIONS = GOALS.map((g) => ({ value: g.profile, label: g.short }))

export type Check = 'na-meta' | 'fora-da-meta' | 'sem-dado' | 'individual'

export interface GoalEvaluation {
  hba1c: Check
  fasting: Check
  postprandial: Check
  overall: Check
}

/** Avaliação pelo Quadro 5. HbA1c usa a desigualdade estrita da NT ("<7,0": 7,0 está fora). */
export function evaluateGoals(
  p: Profile,
  hba1c: number | null,
  fasting: number | null,
  postprandial: number | null,
): GoalEvaluation {
  const g = goalOf(p)
  const hb: Check =
    g.hba1cBelow === null
      ? 'individual'
      : hba1c === null
        ? 'sem-dado'
        : hba1c < g.hba1cBelow
          ? 'na-meta'
          : 'fora-da-meta'
  const fj: Check =
    fasting === null
      ? 'sem-dado'
      : fasting >= g.fasting[0] && fasting <= g.fasting[1]
        ? 'na-meta'
        : 'fora-da-meta'
  const pp: Check =
    postprandial === null
      ? 'sem-dado'
      : postprandial < g.postprandialBelow
        ? 'na-meta'
        : 'fora-da-meta'
  const checks = [hb, fj, pp]
  let overall: Check
  if (checks.includes('fora-da-meta')) overall = 'fora-da-meta'
  else if (checks.includes('na-meta')) overall = 'na-meta'
  else if (hb === 'individual') overall = 'individual'
  else overall = 'sem-dado'
  return { hba1c: hb, fasting: fj, postprandial: pp, overall }
}
