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
  'Obesidade (IMC ≥ 30 kg/m²)',
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

const NOTE_KEEP_METFORMIN =
  'Manter a metformina, salvo contraindicação (nota h da Figura 2; item 8.3.1). Com esquema basal/bolus não se recomenda manter sulfonilureia (Figura 3, nota b).'
const NOTE_METFORMIN_RENAL =
  'Metformina: no máximo 1 g/dia com TFG de 30 a 45 mL/min/1,73 m²; suspender se TFG < 30 (item 8.3.1). Demais contraindicações: item 8.9.'
const NOTE_SU_SAFETY =
  'Sulfonilureia: contraindicada com TFG < 30 mL/min/1,73 m² (item 8.9). Glibenclamida não é recomendada a partir de 60 anos; nessa idade, preferir gliclazida (item 8.9 e nota f). Demais contraindicações: item 8.9.'

/** Fluxograma da Figura 2 (adulto com DM2), com as notas de segurança do PCDT. */
export function pcdtFlow(i: FlowInput): FlowResult {
  const r = flowCore(i)
  if (r.next === 'insulina') return { ...r, notes: [...r.notes, NOTE_KEEP_METFORMIN] }
  if (r.next === 'metformina') return { ...r, notes: [...r.notes, NOTE_METFORMIN_RENAL] }
  if (r.next === 'sulfonilureia') return { ...r, notes: [NOTE_SU_SAFETY] }
  return r
}

function flowCore(i: FlowInput): FlowResult {
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
        notes: [],
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
            'Meta não atingida: complete os critérios de dapagliflozina no cartão abaixo (idade, sexo, doença cardiovascular, HAS/dislipidemia/tabagismo) para definir a conduta.',
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
  /** null = não informado. */
  sex: 'M' | 'F' | null
  /** null = não respondido. */
  establishedCvd: boolean | null
  /** null = não respondido. */
  highRiskFactor: boolean | null
}

export interface DapaResult {
  /** null = faltam respostas para concluir. */
  eligible: boolean | null
}

type Tri = boolean | null

function and3(a: Tri, b: Tri): Tri {
  if (a === false || b === false) return false
  if (a === null || b === null) return null
  return true
}

/**
 * Critérios da dapagliflozina (item 6 e 8.3.3 do PCDT: homens ≥ 55 anos, mulheres ≥ 60).
 * Escolha registrada em docs/glargina-regras.md (a nota "g" da Figura 2 traz outra idade para homens).
 * Resposta em branco não vira "não": sem resposta que decida, o resultado é null.
 */
export function dapagliflozinCriteria(i: DapaInput): DapaResult {
  if (i.age === null) return { eligible: null }
  const byCvd: Tri = i.age < 40 ? false : i.establishedCvd
  const ageSex: Tri =
    i.age < 55 ? false : i.age >= 60 ? true : i.sex === null ? null : i.sex === 'M'
  const byRisk = and3(i.highRiskFactor, ageSex)
  if (byCvd === true || byRisk === true) return { eligible: true }
  if (byCvd === false && byRisk === false) return { eligible: false }
  return { eligible: null }
}
