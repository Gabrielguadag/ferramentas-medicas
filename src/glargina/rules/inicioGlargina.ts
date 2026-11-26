// Início da glargina sem insulina prévia.
// - DM2 em adultos: PCDT DM2 2026, 8.3.4.2, "Sugere-se iniciar e titular os AIAP da mesma forma da
//   insulina humana NPH" (dose da NPH em insulina.ts).
// - DM1 de 2 a 17 anos (elegível à NT 169/2026): Quadro 1 da NT (DTDI e basal em UI/kg/dia) e o
//   parágrafo seguinte (basal entre 30% e 50% da DTDI; adolescentes 50% a 55%).
// - DM1 adulto fica fora (decisão do usuário, 26/11/2026).

import { outOfScope } from './escopo'
import type { Profile } from './metas'

export type CaminhoGlargina =
  | 'dm2' // PCDT DM2 adulto
  | 'dm1-crianca' // NT 169, Quadro 1 (2 a 17 anos)
  | 'dm1-adulto' // DM1 com 18 anos ou mais: fora do escopo desta seção
  | 'dm1-nao-coberto' // DM1 com menos de 2 anos
  | 'sem-idade'
  | 'fora' // DM2 com menos de 18 anos ou perfil criança

export function caminhoGlargina(
  age: number | null,
  type: 'DM1' | 'DM2',
  profile?: Profile,
): CaminhoGlargina {
  if (type === 'DM2') return outOfScope(age, type, profile) ? 'fora' : 'dm2'
  if (age === null) return 'sem-idade'
  if (age >= 2 && age < 18) return 'dm1-crianca'
  if (age >= 18) return 'dm1-adulto'
  return 'dm1-nao-coberto'
}

/** Faixa em UI/kg/dia: [mínimo, máximo]; mínimo null = "abaixo de". */
export interface FaixaKg {
  min: number | null
  max: number
}

export interface LinhaQuadro {
  rotulo: string
  dtdi: FaixaKg
  basal: FaixaKg
}

export type FaseDm1 = 'pre-pubere' | 'pubere'

/** NT 169, Quadro 1 (crianças e adolescentes). Lactentes ficam fora: a NT começa aos 2 anos. */
export const QUADRO_1: Record<FaseDm1, LinhaQuadro> = {
  'pre-pubere': {
    rotulo: 'Pré-púbere',
    dtdi: { min: 0.5, max: 0.8 },
    basal: { min: 0.2, max: 0.4 },
  },
  pubere: { rotulo: 'Púbere', dtdi: { min: 0.8, max: 2.0 }, basal: { min: 0.4, max: 1.0 } },
}

/** Faixa por kg convertida em UI/dia pelo peso (arredondada à unidade). */
export interface FaixaDia {
  min: number | null
  max: number
}

export function porPeso(f: FaixaKg, weightKg: number | null): FaixaDia | null {
  if (!weightKg || !(weightKg > 0)) return null
  return {
    min: f.min === null ? null : Math.round(f.min * weightKg),
    max: Math.round(f.max * weightKg),
  }
}

/** "6–12" ou "< 15". */
export function fmtFaixa(f: FaixaDia | FaixaKg, digits = 0): string {
  const n = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  return f.min === null ? `< ${n(f.max)}` : `${n(f.min)}–${n(f.max)}`
}
