// Organização e estatística das medições baixadas. Tudo em memória; nada é gravado.
// As medições ficam em mg/dL (a unidade em que o aparelho transmite); mmol/L é só exibição.

import type { RawReading } from './phdc/segments'
import { type DeviceDateTime, formatDeviceDateTime } from './phdc/types'

export const MGDL_PER_MMOL = 18.016

export type Unit = 'mg/dL' | 'mmol/L'

export interface Reading {
  /** Posição na memória do aparelho (ordem de leitura). */
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

export type PeriodDays = 7 | 14 | 30 | 90 | 'all'

/** Filtra pelos últimos N dias contados a partir da medição mais recente (não do relógio do PC). */
export function filterPeriod(readings: readonly Reading[], days: PeriodDays): Reading[] {
  if (days === 'all') return [...readings]
  const latest = readings.reduce<number | null>(
    (m, r) => (r.minutes !== null && (m === null || r.minutes > m) ? r.minutes : m),
    null,
  )
  if (latest === null) return [...readings]
  // Do início do dia (N-1) dias antes do dia da última medição.
  const lastDayStart = Math.floor(latest / 1440) * 1440
  const from = lastDayStart - (days - 1) * 1440
  return readings.filter((r) => r.minutes !== null && r.minutes >= from)
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

export interface CsvMeta {
  deviceLabel: string
  serialNumber: string | null
  exportedAt: string
}

export function toCsv(readings: readonly Reading[], unit: Unit, meta: CsvMeta): string {
  const header = [
    'Data',
    'Hora',
    `Glicemia (${unit})`,
    'Fora da faixa do aparelho',
    'Solução de controle',
    'Status bruto do aparelho',
    'Posição na memória',
  ]
  const lines = [
    `# Glicosímetro: ${meta.deviceLabel}${meta.serialNumber ? ` (série ${meta.serialNumber})` : ''}`,
    `# Exportado em: ${meta.exportedAt}. Data e hora são as do relógio do aparelho.`,
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
