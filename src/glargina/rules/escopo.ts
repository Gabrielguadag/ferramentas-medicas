// Escopo das regras de insulinização e do fluxograma de tratamento.
// Fonte: PCDT DM2 2026, Figura 2: "Fluxograma de tratamento para indivíduos com idade igual ou maior
// a 18 anos com diabete melito tipo 2" (pág. 22) e item 8.3.4 (insulinização do DM2 em adultos).
// DM1 e menores de 18 anos ficam fora (a migração para glargina e as metas da NT 169 não usam esta regra).

import type { Profile } from './metas'

export const OUT_OF_SCOPE_TEXT = 'Fora do escopo: regra do PCDT para DM2 em adultos (≥ 18 anos).'
export const PREGNANCY_TEXT = 'Não se aplica a gestantes.'

export function outOfScope(age: number | null, type: 'DM1' | 'DM2', profile?: Profile): boolean {
  return type === 'DM1' || (age !== null && age < 18) || profile === 'crianca'
}
