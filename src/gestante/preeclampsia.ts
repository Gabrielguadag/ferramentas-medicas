// Pré-eclâmpsia e eclâmpsia: fatores de risco, prevenção (AAS e cálcio), anti-hipertensivos e
// sulfato de magnésio. Fonte base (decisão do usuário, 27/11/2026): RBEHG, Pré-eclâmpsia —
// Protocolo 03, 2023 (Peraçoli et al.). Regras e páginas em docs/gestante-preeclampsia.md.

// ---------------------------------------------------------------------------------------------
// Fatores de risco (Quadro 1): um alto ou pelo menos dois moderados indicam prevenção.

export const FATORES_ALTO = [
  'História de pré-eclâmpsia, principalmente acompanhada de desfechos adversos',
  'Gestação múltipla',
  'Obesidade (IMC > 30)',
  'Hipertensão arterial crônica',
  'Diabetes tipo 1 ou 2',
  'Doença renal',
  'Doenças autoimunes (ex.: lúpus eritematoso sistêmico, síndrome antifosfolípide)',
  'Gestação decorrente de reprodução assistida',
] as const

export const FATORES_MODERADO = [
  'Nuliparidade',
  'História familiar de pré-eclâmpsia (mãe e/ou irmãs)',
  'Idade ≥ 35 anos',
  'Gravidez prévia com desfecho adverso (descolamento prematuro de placenta, baixo peso ao nascer com > 37 semanas, trabalho de parto prematuro)',
  'Intervalo > 10 anos desde a última gestação',
] as const

export function indicaPrevencao(altos: number, moderados: number): boolean {
  return altos >= 1 || moderados >= 2
}

/** AAS 100 mg/dia à noite: a partir de 12 semanas (preferência antes de 16, até 20) e até 36. */
export type MomentoAas = 'antes-12' | 'ideal' | 'ainda-pode' | 'apos-20' | 'suspender-36'

export function momentoAas(igSemanas: number): MomentoAas {
  if (igSemanas >= 36) return 'suspender-36'
  if (igSemanas < 12) return 'antes-12'
  if (igSemanas < 16) return 'ideal'
  if (igSemanas <= 20) return 'ainda-pode'
  return 'apos-20'
}

// ---------------------------------------------------------------------------------------------
// Pressão arterial na gestação (Tratamento farmacológico).

export type ClassePa = 'normal' | 'leve' | 'grave'

/** Leve: PAS 140–159 e/ou PAD 90–109. Grave (crise): PAS ≥ 160 e/ou PAD ≥ 110. */
export function classificarPa(pas: number, pad: number): ClassePa {
  if (pas >= 160 || pad >= 110) return 'grave'
  if (pas >= 140 || pad >= 90) return 'leve'
  return 'normal'
}

// ---------------------------------------------------------------------------------------------
// Sulfato de magnésio hepta-hidratado (Quadro 6 e "Aspectos relacionados ao uso do MgSO4").

/** Gramas de MgSO4 em 1 mL de cada apresentação (ampolas de 10 mL com 5 g, 2 g e 1 g). */
export const AMPOLAS = [
  { id: '50', rotulo: '50% (10 mL = 5 g)', gPorMl: 0.5 },
  { id: '20', rotulo: '20% (10 mL = 2 g)', gPorMl: 0.2 },
  { id: '10', rotulo: '10% (10 mL = 1 g)', gPorMl: 0.1 },
] as const

/** mL da ampola para uma dose em gramas. */
export function mlDaAmpola(doseG: number, gPorMl: number): number {
  return Math.round((doseG / gPorMl) * 10) / 10
}

export type Esquema = 'zuspan' | 'pritchard'

/** Creatinina ≥ 1,0 mg/dL (lesão renal aguda ou DRC): a manutenção é a metade da dose. */
export const CREATININA_METADE = 1.0

export interface Manutencao {
  /** g por hora (Zuspan) ou g por aplicação IM a cada 4 h (Pritchard). */
  doseG: number
  metade: boolean
  texto: string
}

/**
 * Manutenção. Zuspan: 1 g/h IV em bomba (10 mL de MgSO4 50% em 490 mL de SF 0,9% = 1 g/100 mL,
 * a 100 mL/h). Pritchard: 5 g IM profunda a cada 4 h (1 ampola de 50%). Com creatinina ≥ 1,0,
 * metade da dose.
 */
export function manutencao(esquema: Esquema, creatinina: number | null): Manutencao {
  const metade = creatinina !== null && creatinina >= CREATININA_METADE
  if (esquema === 'zuspan') {
    const g = metade ? 0.5 : 1
    const mlh = g * 100
    return {
      doseG: g,
      metade,
      texto: `${fmtG(g)} g/h IV em bomba de infusão: solução de 1 g/100 mL (10 mL de MgSO4 50% em 490 mL de SF 0,9%) a ${mlh} mL/h.`,
    }
  }
  const g = metade ? 2.5 : 5
  return {
    doseG: g,
    metade,
    texto: `${fmtG(g)} g IM profunda a cada 4 horas (${mlDaAmpola(g, 0.5).toLocaleString('pt-BR')} mL de MgSO4 50%).`,
  }
}

export interface Monitorizacao {
  ok: boolean
  /** Parâmetros fora do alvo. */
  falhas: string[]
  /** Algum parâmetro não informado. */
  incompleta: boolean
}

/** Antes de cada manutenção: reflexo patelar presente, FR ≥ 16 irpm e diurese ≥ 25 mL/h. */
export function monitorizar(m: {
  reflexo: boolean | null
  fr: number | null
  diurese: number | null
}): Monitorizacao {
  const falhas: string[] = []
  if (m.reflexo === false) falhas.push('reflexo patelar ausente')
  if (m.fr !== null && m.fr < 16) falhas.push(`frequência respiratória ${m.fr} irpm (< 16)`)
  if (m.diurese !== null && m.diurese < 25) falhas.push(`diurese ${m.diurese} mL/h (< 25)`)
  const incompleta = m.reflexo === null || m.fr === null || m.diurese === null
  return { ok: falhas.length === 0 && !incompleta, falhas, incompleta }
}

const fmtG = (g: number) => g.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
