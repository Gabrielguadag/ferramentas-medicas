// Titulação da insulina basal (NPH ou glargina) pela glicemia de jejum.
// Fontes: PCDT DM2 2026, item 8.3.4.1 e Figura 3; NT 169/2026, Quadros 3 e 5.
//   - "Aumentar 2 U a cada 3 dias até atingir a meta para glicemia de jejum";
//   - "Glicemia de jejum < 70 mg/dL ou hipoglicemia noturna: diminuir a dose diária de 2 U a 4 U";
//   - "Glicemia < 80 mg/dL durante a madrugada ou em glicemia de jejum diurna: diminuir 2 U";
//   - AIAP (glargina): iniciar e titular da mesma forma que a NPH (PCDT 8.3.4.2);
//   - NT 169: titulação em intervalos de até três dias, com base na glicemia de jejum.
// A meta de jejum vem do perfil (NT 169, Quadro 5).

import { type Profile, goalOf } from './metas'

export type Action = 'reduzir-2-4' | 'reduzir-2' | 'aumentar-2' | 'manter' | 'manter-avaliar'

export interface Titration {
  mean: number
  count: number
  min: number
  action: Action
  label: string
  explanation: string
}

const LABEL: Record<Action, string> = {
  'reduzir-2-4': 'Reduzir 2 a 4 U',
  'reduzir-2': 'Reduzir 2 U',
  'aumentar-2': 'Aumentar 2 U',
  manter: 'Manter a dose',
  'manter-avaliar': 'Manter e reavaliar',
}

export function titrate(
  values: readonly (number | null)[],
  profile: Profile,
  nocturnalHypo = false,
): Titration | null {
  const v = values.filter((x): x is number => x !== null && Number.isFinite(x))
  if (v.length === 0 && !nocturnalHypo) return null
  const mean = v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : 0
  const min = v.length ? Math.min(...v) : 0
  const [lo, hi] = goalOf(profile).fasting
  let action: Action
  let explanation: string
  if (nocturnalHypo || (v.length && min < 70)) {
    action = 'reduzir-2-4'
    explanation = nocturnalHypo
      ? 'Hipoglicemia noturna relatada: reduzir a dose diária em 2 a 4 U até atingir a meta.'
      : `Jejum de ${min} mg/dL (< 70): reduzir a dose diária em 2 a 4 U até atingir a meta.`
  } else if (min < 80) {
    action = 'reduzir-2'
    explanation = `Jejum de ${min} mg/dL (< 80): reduzir a dose diária em 2 U até atingir a meta.`
  } else if (mean > hi) {
    action = 'aumentar-2'
    explanation = `Média de jejum ${mean} mg/dL, acima da meta (${lo}–${hi}): aumentar 2 U e reavaliar em 3 dias.`
  } else if (mean < lo) {
    action = 'manter-avaliar'
    explanation = `Média de jejum ${mean} mg/dL, abaixo da meta do perfil (${lo}–${hi}), sem valores < 80: manter e reavaliar.`
  } else {
    action = 'manter'
    explanation = `Média de jejum ${mean} mg/dL, dentro da meta (${lo}–${hi}): manter a dose e seguir monitorando.`
  }
  return { mean, count: v.length, min, action, label: LABEL[action], explanation }
}
