// Organização e estatística das medições baixadas. Tudo em memória; nada é gravado.
// As medições ficam em mg/dL (a unidade em que o aparelho transmite); mmol/L é só exibição.

import type { RawReading } from './phdc/segments'
import { type DeviceDateTime, formatDeviceDateTime } from './phdc/types'

export const MGDL_PER_MMOL = 18.016

export type Unit = 'mg/dL' | 'mmol/L'

/**
 * mmol/L digitado -> mg/dL inteiro. A meta fica sempre em mg/dL inteiro, para que trocar a unidade
 * não mude a classificação (3,9 mmol/L -> 70 mg/dL, 10,0 -> 180).
 */
export function mmolToMgdl(mmol: number): number {
  return Math.round(mmol * MGDL_PER_MMOL)
}

/** Percentual para a tela: nunca "0%" se houve ocorrência (usa "<1%") nem "100%" se houve exceção. */
export function formatPct(v: number | null): string {
  if (v === null) return '—'
  if (v > 0 && v < 0.5) return '<1%'
  if (v >= 99.5 && v < 100) return '>99%'
  return `${v.toFixed(0)}%`
}

/** Medições sem data (não entram nos filtros de período). */
export function countUndated(readings: readonly Reading[]): number {
  return readings.filter((r) => r.minutes === null).length
}

/** Medições com data posterior ao dia de hoje no relógio do computador. */
export function countFuture(readings: readonly Reading[], now: Date = new Date()): number {
  const todayEnd = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 60_000 + 1440
  return readings.filter((r) => r.minutes !== null && r.minutes >= todayEnd).length
}

/** Diferença, em dias de calendário, entre uma data do aparelho e o dia de hoje no computador. */
export function dayDiffFromToday(d: DeviceDateTime, now: Date = new Date()): number {
  const dev = Date.UTC(d.year, d.month - 1, d.day)
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((dev - today) / 86_400_000)
}

export interface Reading {
  /** Ordem de leitura (não é a posição física na memória do aparelho). */
  index: number
  time: DeviceDateTime | null
  /** "AAAA-MM-DD HH:MM:SS" ou "" sem data. */
  timeKey: string
  /** Minutos desde 1970 tratando a hora do aparelho como "relógio de parede" (sem fuso). */
  minutes: number | null
  mgdl: number | null
  flag: 'HI' | 'LO' | null
  isControl: boolean
  status: number | null
  /** Status bruto em hexadecimal. O significado nos aparelhos Roche não está documentado. */
  statusHex: string
  rawHex: string
}

export function toReadings(raw: readonly RawReading[]): Reading[] {
  return raw
    .map((r, index) => ({
      index,
      time: r.time,
      timeKey: r.time ? formatDeviceDateTime(r.time) : '',
      minutes: r.time
        ? Date.UTC(r.time.year, r.time.month - 1, r.time.day, r.time.hour, r.time.minute) / 60_000
        : null,
      mgdl: r.mgdl,
      flag: r.flag,
      isControl: r.isControl,
      status: r.status,
      statusHex: r.status === null ? '' : '0x' + r.status.toString(16).padStart(4, '0'),
      rawHex: r.rawHex,
    }))
    .sort((a, b) => (a.timeKey < b.timeKey ? 1 : a.timeKey > b.timeKey ? -1 : b.index - a.index))
}

/**
 * Remove medições repetidas (vindas de segmentos diferentes da memória): mesma data/hora, mesmo
 * valor/flag e mesmo tipo (controle ou paciente). Mantém a primeira lida (menor posição).
 * Medições sem data nunca são tratadas como duplicata (não há como saber).
 */
export function dedupeReadings(readings: readonly Reading[]): {
  readings: Reading[]
  duplicates: number
} {
  const seen = new Set<string>()
  const kept = new Set<number>()
  for (const r of [...readings].sort((a, b) => a.index - b.index)) {
    if (!r.timeKey) {
      kept.add(r.index)
      continue
    }
    const key = [r.timeKey, r.mgdl ?? '', r.flag ?? '', r.isControl ? 'c' : 'p'].join('|')
    if (seen.has(key)) continue
    seen.add(key)
    kept.add(r.index)
  }
  const out = readings.filter((r) => kept.has(r.index))
  return { readings: out, duplicates: readings.length - out.length }
}

/**
 * Dias que a memória cobre dentro do período: do primeiro ao último dia com medição (nunca mais
 * que N). Não conta dias anteriores à primeira medição guardada, para não sugerir dias "sem teste".
 */
export function periodDayCount(shown: readonly Reading[], days: PeriodDays): number {
  const d = shown.flatMap((r) => (r.minutes === null ? [] : [Math.floor(r.minutes / 1440)]))
  if (!d.length) return 0
  const span = Math.max(...d) - Math.min(...d) + 1
  return days === 'all' ? span : Math.min(days, span)
}

export type PeriodDays = 7 | 14 | 30 | 90 | 'all'

/**
 * Filtra pelos últimos N dias contados a partir da última medição que NÃO seja futura (relógio do
 * computador). Medições com data futura ficam fora dos períodos de N dias (não deslocam a janela);
 * "Toda a memória" as inclui. Se todas forem futuras, ancora na mais recente.
 */
export function filterPeriod(
  readings: readonly Reading[],
  days: PeriodDays,
  now: Date = new Date(),
): Reading[] {
  if (days === 'all') return [...readings]
  const todayEnd = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 60_000 + 1440
  const latestOf = (pred: (m: number) => boolean) =>
    readings.reduce<number | null>(
      (m, r) =>
        r.minutes !== null && pred(r.minutes) && (m === null || r.minutes > m) ? r.minutes : m,
      null,
    )
  const pastLatest = latestOf((m) => m < todayEnd)
  const latest = pastLatest ?? latestOf(() => true)
  if (latest === null) return [...readings]
  // Do início do dia (N-1) dias antes do dia da última medição.
  const lastDayStart = Math.floor(latest / 1440) * 1440
  const from = lastDayStart - (days - 1) * 1440
  const upper = pastLatest === null ? Infinity : todayEnd
  return readings.filter((r) => r.minutes !== null && r.minutes >= from && r.minutes < upper)
}

/** Faixa em que o alvo pode ser ajustado: entre os limiares fixos <54 e >250 da fonte. */
export const TARGET_BOUNDS = { min: 54, max: 250 } as const

/**
 * Alvo em uso a partir do que foi digitado (mg/dL; null = campo vazio). Fora de 54–250 ou invertido
 * é recusado e volta ao padrão 70–180.
 */
export function resolveTarget(
  lowMg: number | null,
  highMg: number | null,
): { target: Target; lowEmpty: boolean; highEmpty: boolean; invalid: boolean } {
  const low = lowMg ?? DEFAULT_TARGET.low
  const high = highMg ?? DEFAULT_TARGET.high
  const invalid =
    !Number.isFinite(low) ||
    !Number.isFinite(high) ||
    low < TARGET_BOUNDS.min ||
    high > TARGET_BOUNDS.max ||
    low >= high
  return {
    target: invalid ? DEFAULT_TARGET : { low, high },
    lowEmpty: lowMg === null,
    highEmpty: highMg === null,
    invalid,
  }
}

/** Faixa de valores possível para um glicosímetro capilar (mg/dL); fora dela o registro é inválido. */
export const PLAUSIBLE_MGDL = { min: 10, max: 600 } as const

/**
 * Plausibilidade dos valores lidos. `mmolSuspect`: todos os valores numéricos são menores que 30,
 * típico de mmol/L lido como mg/dL (a leitura não deve ser interpretada). Valores fora de 10–600
 * viram "sem valor" (contados em `implausible`).
 */
export function sanitizeReadings(readings: readonly Reading[]): {
  readings: Reading[]
  implausible: number
  mmolSuspect: boolean
} {
  const nums = readings.flatMap((r) => (r.mgdl !== null && r.flag === null ? [r.mgdl] : []))
  const mmolSuspect = nums.length > 0 && nums.every((v) => v < 30)
  let implausible = 0
  const out = readings.map((r) => {
    if (r.mgdl !== null && (r.mgdl < PLAUSIBLE_MGDL.min || r.mgdl > PLAUSIBLE_MGDL.max)) {
      implausible++
      return { ...r, mgdl: null }
    }
    return r
  })
  return { readings: out, implausible, mmolSuspect }
}

export interface Target {
  low: number
  high: number
}

export const DEFAULT_TARGET: Target = { low: 70, high: 180 }

export interface Stats {
  total: number
  /** Medições de paciente com número (sem controle, sem HI/LO). */
  numeric: number
  hi: number
  lo: number
  control: number
  mean: number | null
  sd: number | null
  cv: number | null
  min: number | null
  max: number | null
  /** Medições de paciente com valor ou HI/LO: base dos percentuais. */
  count: number
  /** Medições de paciente sem valor numérico nem HI/LO (registro inválido no aparelho). */
  invalid: number
  below54N: number
  belowN: number
  inRangeN: number
  aboveN: number
  above250N: number
  /** Percentuais sobre medições de paciente (numéricas + HI + LO). */
  pctBelow54: number | null
  pctBelow: number | null
  pctInRange: number | null
  pctAbove: number | null
  pctAbove250: number | null
  days: number
  perDay: number | null
  firstKey: string | null
  lastKey: string | null
}

export function computeStats(readings: readonly Reading[], target: Target = DEFAULT_TARGET): Stats {
  const patient = readings.filter((r) => !r.isControl)
  const values = patient.flatMap((r) => (r.mgdl !== null && r.flag === null ? [r.mgdl] : []))
  const hi = patient.filter((r) => r.flag === 'HI').length
  const lo = patient.filter((r) => r.flag === 'LO').length
  const denom = values.length + hi + lo
  const n = values.length
  const mean = n ? values.reduce((s, v) => s + v, 0) / n : null
  const sd =
    n > 1 && mean !== null
      ? Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1))
      : null
  const pct = (count: number) => (denom ? (count / denom) * 100 : null)
  const below54 = values.filter((v) => v < 54).length + lo
  const below = values.filter((v) => v < target.low).length + lo
  const above = values.filter((v) => v > target.high).length + hi
  const above250 = values.filter((v) => v > 250).length + hi
  const dayKeys = new Set(patient.flatMap((r) => (r.timeKey ? [r.timeKey.slice(0, 10)] : [])))
  const keys = patient
    .map((r) => r.timeKey)
    .filter(Boolean)
    .sort()
  return {
    total: readings.length,
    numeric: n,
    hi,
    lo,
    control: readings.length - patient.length,
    count: denom,
    invalid: patient.filter((r) => r.mgdl === null && r.flag === null).length,
    below54N: below54,
    belowN: below,
    inRangeN: denom - below - above,
    aboveN: above,
    above250N: above250,
    mean,
    sd,
    cv: mean && sd !== null ? (sd / mean) * 100 : null,
    min: n ? Math.min(...values) : null,
    max: n ? Math.max(...values) : null,
    pctBelow54: pct(below54),
    pctBelow: pct(below),
    pctInRange: pct(denom - below - above),
    pctAbove: pct(above),
    pctAbove250: pct(above250),
    days: dayKeys.size,
    perDay: dayKeys.size ? denom / dayKeys.size : null,
    firstKey: keys[0] ?? null,
    lastKey: keys.at(-1) ?? null,
  }
}

export const DAY_PERIODS = [
  { key: 'madrugada', label: 'Madrugada (0h–6h)', from: 0, to: 6 },
  { key: 'manha', label: 'Manhã (6h–12h)', from: 6, to: 12 },
  { key: 'tarde', label: 'Tarde (12h–18h)', from: 12, to: 18 },
  { key: 'noite', label: 'Noite (18h–24h)', from: 18, to: 24 },
] as const

export function statsByDayPeriod(readings: readonly Reading[], target: Target = DEFAULT_TARGET) {
  return DAY_PERIODS.map((p) => ({
    ...p,
    stats: computeStats(
      readings.filter((r) => r.time && r.time.hour >= p.from && r.time.hour < p.to),
      target,
    ),
  }))
}

export function formatGlucose(mgdl: number, unit: Unit): string {
  if (unit === 'mg/dL') return String(Math.round(mgdl))
  return (mgdl / MGDL_PER_MMOL).toFixed(1).replace('.', ',')
}

export function readingLabel(r: Reading, unit: Unit): string {
  if (r.flag === 'HI') return 'HI'
  if (r.flag === 'LO') return 'LO'
  return r.mgdl === null ? '—' : formatGlucose(r.mgdl, unit)
}

// ---------------------------------------------------------------------------------------------
// CSV (padrão do Excel em PT-BR: separador ";", vírgula decimal, BOM UTF-8)

function csvCell(v: string): string {
  return /[";\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

/** CSV só com cabeçalho de colunas na 1ª linha (abre direto em planilha); sem metadados. */
export function toCsv(readings: readonly Reading[], unit: Unit): string {
  const header = [
    'Data',
    'Hora',
    `Glicemia (${unit})`,
    'Fora da faixa do aparelho',
    'Solução de controle',
    'Status bruto do aparelho',
    'Ordem de leitura',
  ]
  const lines = [
    header.join(';'),
    ...readings.map((r) =>
      [
        r.timeKey ? r.timeKey.slice(0, 10).split('-').reverse().join('/') : '',
        r.timeKey ? r.timeKey.slice(11, 16) : '',
        r.flag ? '' : r.mgdl === null ? '' : formatGlucose(r.mgdl, unit),
        r.flag === 'HI' ? 'acima (HI)' : r.flag === 'LO' ? 'abaixo (LO)' : '',
        r.isControl ? 'sim' : '',
        r.statusHex,
        String(r.index + 1),
      ]
        .map(csvCell)
        .join(';'),
    ),
  ]
  return '﻿' + lines.join('\r\n') + '\r\n'
}
