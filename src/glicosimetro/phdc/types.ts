// Tipos básicos do IEEE 11073-20601: SFLOAT-Type (16 bits) e AbsoluteTime (8 bytes BCD).

export type SfloatValue =
  { kind: 'number'; value: number } | { kind: 'nan' | 'nres' | 'pos-inf' | 'neg-inf' | 'reserved' }

/**
 * SFLOAT: expoente de 4 bits (com sinal) nos bits altos e mantissa de 12 bits (com sinal).
 * Valores especiais: 0x07FF NaN, 0x0800 NRes, 0x07FE +INF, 0x0802 -INF, 0x0801 reservado.
 * Nos glicosímetros Accu-Chek, +INF significa "HI" (acima da faixa) e -INF "LO".
 */
export function decodeSfloat(raw: number): SfloatValue {
  const v = raw & 0xffff
  switch (v) {
    case 0x07ff:
      return { kind: 'nan' }
    case 0x0800:
      return { kind: 'nres' }
    case 0x07fe:
      return { kind: 'pos-inf' }
    case 0x0802:
      return { kind: 'neg-inf' }
    case 0x0801:
      return { kind: 'reserved' }
  }
  let mantissa = v & 0x0fff
  if (mantissa >= 0x0800) mantissa -= 0x1000
  let exponent = (v >> 12) & 0x0f
  if (exponent >= 0x08) exponent -= 0x10
  // Arredonda para não carregar ruído binário de 10^exp (ex.: 5.6 vira 5.6000000001).
  const value = Number((mantissa * Math.pow(10, exponent)).toFixed(Math.max(0, -exponent)))
  return { kind: 'number', value }
}

export function encodeSfloat(value: number, exponent = 0): number {
  const mantissa = Math.round(value / Math.pow(10, exponent))
  if (mantissa < -2046 || mantissa > 2045) throw new RangeError('mantissa SFLOAT fora da faixa')
  return (((exponent & 0x0f) << 12) | (mantissa & 0x0fff)) & 0xffff
}

/** Data e hora do aparelho, sem fuso (o aparelho não sabe o fuso). */
export interface DeviceDateTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function bcd(b: number): number {
  const hi = b >> 4
  const lo = b & 0x0f
  if (hi > 9 || lo > 9) return Number.NaN
  return hi * 10 + lo
}

function toBcd(n: number): number {
  return ((Math.floor(n / 10) % 10) << 4) | (n % 10)
}

/** AbsoluteTime: century, year, month, day, hour, minute, second, sec-fractions (BCD). */
export function decodeAbsoluteTime(bytes: Uint8Array): DeviceDateTime | null {
  if (bytes.byteLength < 8) return null
  const [c, y, mo, d, h, mi, s] = [0, 1, 2, 3, 4, 5, 6].map((i) => bcd(bytes[i] ?? 0xff)) as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  const dt = { year: c * 100 + y, month: mo, day: d, hour: h, minute: mi, second: s }
  if (Object.values(dt).some((n) => Number.isNaN(n))) return null
  if (dt.month < 1 || dt.month > 12 || dt.day < 1 || dt.day > 31) return null
  if (dt.hour > 23 || dt.minute > 59 || dt.second > 60) return null
  return dt
}

export function encodeAbsoluteTime(dt: DeviceDateTime): Uint8Array {
  return Uint8Array.from([
    toBcd(Math.floor(dt.year / 100)),
    toBcd(dt.year % 100),
    toBcd(dt.month),
    toBcd(dt.day),
    toBcd(dt.hour),
    toBcd(dt.minute),
    toBcd(dt.second),
    0,
  ])
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0')

/** "AAAA-MM-DD HH:MM:SS" — usado para ordenar e exportar. */
export function formatDeviceDateTime(dt: DeviceDateTime): string {
  return `${pad(dt.year, 4)}-${pad(dt.month)}-${pad(dt.day)} ${pad(dt.hour)}:${pad(dt.minute)}:${pad(dt.second)}`
}
