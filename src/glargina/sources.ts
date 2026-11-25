// Fontes citadas na tela. Textos entre aspas são literais das fontes.

export const NT_169 = {
  short: 'NT Conjunta 169/2026 (MS)',
  url: 'https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/notas-tecnicas/2026/nota-tecnica-conjunta-no-169-2026-dafsctie-deprossaps-daetsaes-ms.pdf',
}

export const PCDT_DM2 = {
  short: 'PCDT DM2 2026 (Portaria SCTIE/MS nº 13/2026)',
  url: 'https://www.gov.br/conitec/pt-br/midias/protocolos/2026/pcdt-diabete-melito-tipo-2',
}

export const ELIGIBILITY_LITERAL =
  'Crianças e adolescentes com diabetes mellitus tipo 1 (DM1), com idade igual ou superior a 2 anos e inferior a 18 anos; Pessoas com idade igual ou superior a 70 anos, com diabetes mellitus tipo 1 (DM1) ou tipo 2 (DM2).'

export type DiabetesType = 'DM1' | 'DM2'

export type EligibilityResult =
  | { kind: 'eligible'; reason: string }
  | { kind: 'not-eligible'; reason: string }
  | { kind: 'unknown' }

/** Elegibilidade à glargina pela NT 169/2026, item 3.1 (apenas idade e tipo de diabetes). */
export function eligibility(age: number | null, type: DiabetesType): EligibilityResult {
  if (age === null || age < 0) return { kind: 'unknown' }
  if (type === 'DM1' && age >= 2 && age < 18)
    return { kind: 'eligible', reason: 'DM1 entre 2 e 17 anos.' }
  if (age >= 70) return { kind: 'eligible', reason: `${type} com 70 anos ou mais.` }
  if (type === 'DM1' && age < 2)
    return { kind: 'not-eligible', reason: 'A NT contempla DM1 a partir de 2 anos.' }
  return {
    kind: 'not-eligible',
    reason:
      type === 'DM1'
        ? 'DM1 de 18 a 69 anos não está na estratégia (quem completou 18 anos durante a estratégia pode manter o esquema, item 3.3).'
        : 'DM2 só é elegível a partir de 70 anos.',
  }
}
