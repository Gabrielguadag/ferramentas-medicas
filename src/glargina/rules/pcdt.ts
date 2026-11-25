// Fluxograma de tratamento do DM2 — PCDT DM2 2026, Figura 2 (pág. 22) e item 8.3.4.

export type Branch = 'recente-sem-risco' | 'demais'

export type Stage =
  'inicio' | 'mev' | 'metformina' | 'metformina-su' | 'metformina-su-dapagliflozina'

export const STAGE_LABEL: Record<Stage, string> = {
  inicio: 'Ainda sem tratamento',
  mev: 'Só mudança de estilo de vida',
  metformina: 'Metformina + MEV',
  'metformina-su': 'Metformina + sulfonilureia',
  'metformina-su-dapagliflozina': 'Metformina + sulfonilureia + dapagliflozina',
}

/** Nota "a" da Figura 2: fatores de risco que levam ao ramo da metformina desde o início. */
export const PCDT_RISK_FACTORS = [
  'Sobrepeso ou obesidade (IMC ≥ 30 kg/m²)',
  'Sedentarismo',
  'Familiar de primeiro grau com diabetes',
  'Gestação prévia com feto ≥ 4 kg ou diabetes gestacional',
  'PA ≥ 140/90 mmHg ou anti-hipertensivo',
  'HDL ≤ 35 mg/dL ou triglicerídeos ≥ 250 mg/dL',
  'Síndrome dos ovários policísticos',
  'Outras condições de resistência à insulina',
  'História de doença cardiovascular',
] as const

export interface FlowInput {
  monthsSinceDiagnosis: 'menos-3' | '3-ou-mais'
  hasRiskFactor: boolean
  stage: Stage
  /** Meta terapêutica atingida (e medicamento tolerado) na etapa atual. */
  atGoal: boolean
  /** Nota "b": HbA1c > 9%, jejum ≥ 300, sintomas de hiperglicemia aguda ou intercorrências/internações. */
  insulinIndication: boolean
  /** Critérios de dapagliflozina (nota "g"); null = não avaliado. */
  dapagliflozinEligible: boolean | null
}

export interface FlowResult {
  branch: Branch
  conduct: string
  next:
    | 'monitorar'
    | 'mev'
    | 'metformina'
    | 'sulfonilureia'
    | 'dapagliflozina'
    | 'insulina'
    | 'avaliar-dapagliflozina'
  notes: string[]
}

export function pcdtFlow(i: FlowInput): FlowResult {
  const branch: Branch =
    i.monthsSinceDiagnosis === 'menos-3' && !i.hasRiskFactor ? 'recente-sem-risco' : 'demais'
  const notes: string[] = []
  if (i.insulinIndication) {
    return {
      branch,
      next: 'insulina',
      conduct: 'Iniciar insulinoterapia (NPH à noite, 10 U ou 0,1–0,2 U/kg).',
      notes: [
        'Nota b da Figura 2: HbA1c > 9%, jejum ≥ 300 mg/dL, sintomas de hiperglicemia aguda ou intercorrências/internações pelo DM2.',
      ],
    }
  }
  if (i.atGoal && i.stage !== 'inicio') {
    return {
      branch,
      next: 'monitorar',
      conduct: 'Meta atingida: manter o tratamento e monitorar (reavaliar em 2 a 6 meses).',
      notes,
    }
  }
  switch (i.stage) {
    case 'inicio':
      return branch === 'recente-sem-risco'
        ? {
            branch,
            next: 'mev',
            conduct: 'Iniciar mudança de estilo de vida e reavaliar em até 3 meses.',
            notes,
          }
        : {
            branch,
            next: 'metformina',
            conduct: 'Iniciar metformina + mudança de estilo de vida.',
            notes: [
              'Metformina 850 mg, 1 comprimido ao dia, podendo aumentar após 2 semanas; dose máxima 2.550 mg/dia (nota e).',
            ],
          }
    case 'mev':
      return {
        branch,
        next: 'metformina',
        conduct: 'Meta não atingida com MEV: iniciar metformina + mudança de estilo de vida.',
        notes: [
          'Metformina 850 mg, 1 comprimido ao dia, podendo aumentar após 2 semanas; dose máxima 2.550 mg/dia (nota e).',
        ],
      }
    case 'metformina':
      return {
        branch,
        next: 'sulfonilureia',
        conduct: 'Meta não atingida (ou intolerância): adicionar sulfonilureia.',
        notes: ['Para idosos, preferir gliclazida à glibenclamida (nota f).'],
      }
    case 'metformina-su':
      if (branch === 'recente-sem-risco') {
        return {
          branch,
          next: 'insulina',
          conduct: 'Meta não atingida: iniciar insulinoterapia.',
          notes,
        }
      }
      if (i.dapagliflozinEligible === null) {
        return {
          branch,
          next: 'avaliar-dapagliflozina',
          conduct:
            'Meta não atingida: verificar critérios de dapagliflozina; sem critérios, iniciar insulinoterapia.',
          notes,
        }
      }
      return i.dapagliflozinEligible
        ? {
            branch,
            next: 'dapagliflozina',
            conduct: 'Meta não atingida e com critérios: adicionar dapagliflozina 10 mg/dia.',
            notes: ['Não iniciar com TFGe < 25 mL/min/1,73 m².'],
          }
        : {
            branch,
            next: 'insulina',
            conduct:
              'Meta não atingida e sem critérios para dapagliflozina: iniciar insulinoterapia.',
            notes,
          }
    case 'metformina-su-dapagliflozina':
      return {
        branch,
        next: 'insulina',
        conduct: 'Meta não atingida: iniciar insulinoterapia.',
        notes,
      }
  }
}

export interface DapaInput {
  age: number | null
  sex: 'M' | 'F'
  establishedCvd: boolean
  highRiskFactor: boolean
}

export interface DapaResult {
  eligible: boolean | null
  /** O texto (8.3.3) diz homens ≥ 55; a nota "g" da Figura 2 diz homens ≥ 65. */
  maleAgeConflict: boolean
}

/** Critérios da dapagliflozina (8.3.3 e nota "g" da Figura 2). */
export function dapagliflozinCriteria(i: DapaInput): DapaResult {
  if (i.age === null) return { eligible: null, maleAgeConflict: false }
  if (i.age >= 40 && i.establishedCvd) return { eligible: true, maleAgeConflict: false }
  if (!i.highRiskFactor) return { eligible: false, maleAgeConflict: false }
  if (i.sex === 'F') return { eligible: i.age >= 60, maleAgeConflict: false }
  return { eligible: i.age >= 55, maleAgeConflict: i.age >= 55 && i.age < 65 }
}
