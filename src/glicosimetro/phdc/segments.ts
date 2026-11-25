// PM-Store: lista de segmentos, mapa de entradas (PmSegmentEntryMap) e decodificação das
// medições. Quando o aparelho informa o mapa, ele é seguido. Sem mapa (ou mapa que não fecha),
// usa-se o layout fixo de 12 bytes que os drivers de referência leem nos Accu-Chek USB:
// AbsoluteTime (8) + SFLOAT (2) + status (2).

import { ProtocolError, Reader, toHex } from './bytes'
import { type Ava, findAttr, readAttributeList } from './apdu'
import { ATTR, GLUCOSE_METRIC, METRIC_GLU_CONTROL, SEG_ENTRY_HEADER } from './nomenclature'
import { type DeviceDateTime, decodeAbsoluteTime, decodeSfloat } from './types'

export interface SegmentElement {
  classId: number
  metricPartition: number
  metricCode: number
  handle: number
  attrs: { id: number; len: number }[]
}

export interface SegmentEntryMap {
  header: number
  elements: SegmentElement[]
}

export interface SegmentInfo {
  instance: number
  usageCount: number | null
  entryMap: SegmentEntryMap | null
  attrs: Ava[]
}

/** SegmentInfoList (resposta de MDC_ACT_SEG_GET_INFO). */
export function parseSegmentInfoList(args: Uint8Array): SegmentInfo[] {
  if (args.byteLength === 0) return []
  const r = new Reader(args)
  const count = r.u16('número de segmentos')
  const list = r.sub('lista de segmentos')
  const out: SegmentInfo[] = []
  for (let i = 0; i < count; i++) {
    const instance = list.u16('seg-inst-no')
    const attrs = readAttributeList(list)
    const usage = findAttr(attrs, ATTR.MDC_ATTR_SEG_USAGE_CNT)
    const map = findAttr(attrs, ATTR.MDC_ATTR_PM_SEG_MAP)
    out.push({
      instance,
      usageCount: usage && usage.byteLength >= 4 ? new Reader(usage).u32() : null,
      entryMap: map ? safeParseEntryMap(map) : null,
      attrs,
    })
  }
  return out
}

function safeParseEntryMap(bytes: Uint8Array): SegmentEntryMap | null {
  try {
    return parseEntryMap(bytes)
  } catch {
    return null
  }
}

export function parseEntryMap(bytes: Uint8Array): SegmentEntryMap {
  const r = new Reader(bytes)
  const header = r.u16('segm-entry-header')
  const count = r.u16('número de elementos')
  const list = r.sub('lista de elementos')
  const elements: SegmentElement[] = []
  for (let i = 0; i < count; i++) {
    const classId = list.u16('class-id')
    const metricPartition = list.u16('partição da métrica')
    const metricCode = list.u16('código da métrica')
    const handle = list.u16('handle')
    const n = list.u16('número de atributos')
    const map = list.sub('attr-val-map')
    const attrs: { id: number; len: number }[] = []
    for (let j = 0; j < n; j++)
      attrs.push({ id: map.u16('attribute-id'), len: map.u16('attribute-len') })
    elements.push({ classId, metricPartition, metricCode, handle, attrs })
  }
  return { header, elements }
}

function headerSize(header: number): number | null {
  let size = 0
  let known = 0
  if (header & SEG_ENTRY_HEADER.ABSOLUTE_TIME) {
    size += 8
    known |= SEG_ENTRY_HEADER.ABSOLUTE_TIME
  }
  if (header & SEG_ENTRY_HEADER.RELATIVE_TIME) {
    size += 4
    known |= SEG_ENTRY_HEADER.RELATIVE_TIME
  }
  if (header & SEG_ENTRY_HEADER.HIRES_RELATIVE_TIME) {
    size += 8
    known |= SEG_ENTRY_HEADER.HIRES_RELATIVE_TIME
  }
  return (header & ~known & 0xffff) === 0 ? size : null
}

export function entrySize(map: SegmentEntryMap): number | null {
  const h = headerSize(map.header)
  if (h === null) return null
  return h + map.elements.reduce((s, e) => s + e.attrs.reduce((t, a) => t + a.len, 0), 0)
}

// ---------------------------------------------------------------------------------------------

export type GlucoseFlag = 'HI' | 'LO' | null

/** Uma medição como veio do aparelho, antes de qualquer interpretação clínica. */
export interface RawReading {
  /** Data e hora do aparelho, sem fuso. Null quando o aparelho não informa. */
  time: DeviceDateTime | null
  /** mg/dL. Null quando HI/LO ou valor especial. */
  mgdl: number | null
  flag: GlucoseFlag
  /** MeasurementStatus como veio (BITS-16), ou null se o aparelho não envia. */
  status: number | null
  /** Tipo de métrica (10417) quando o mapa do segmento informa. */
  metricCode: number | null
  isControl: boolean
  segment: number
  /** Bytes crus da entrada, para conferência e diagnóstico. */
  rawHex: string
}

const ROCHE_FIXED_ENTRY = 12

/**
 * Decodifica as entradas de um evento de dados de segmento. `map` vem do GET_INFO; quando
 * ausente ou incoerente com o tamanho recebido, usa o layout fixo Roche de 12 bytes.
 */
export function decodeEntries(
  entries: Uint8Array,
  entryCount: number,
  map: SegmentEntryMap | null,
  segment: number,
): RawReading[] {
  const mapped = map ? entrySize(map) : null
  const usable = mapped !== null && mapped > 0 && mapped * entryCount === entries.byteLength
  const size = usable ? mapped : ROCHE_FIXED_ENTRY
  if (size * entryCount !== entries.byteLength) {
    throw new ProtocolError(
      `Lote de ${entryCount} medições com ${entries.byteLength} bytes não fecha com entradas de ${size} bytes.`,
    )
  }
  const out: RawReading[] = []
  for (let i = 0; i < entryCount; i++) {
    const bytes = entries.subarray(i * size, (i + 1) * size)
    out.push(usable && map ? decodeMapped(bytes, map, segment) : decodeRocheFixed(bytes, segment))
  }
  return out
}

function valueFromSfloat(raw: number): { mgdl: number | null; flag: GlucoseFlag } {
  const v = decodeSfloat(raw)
  if (v.kind === 'number') return { mgdl: v.value, flag: null }
  if (v.kind === 'pos-inf') return { mgdl: null, flag: 'HI' }
  if (v.kind === 'neg-inf') return { mgdl: null, flag: 'LO' }
  return { mgdl: null, flag: null }
}

function decodeRocheFixed(bytes: Uint8Array, segment: number): RawReading {
  const r = new Reader(bytes)
  const time = decodeAbsoluteTime(r.bytesOf(8, 'data da medição'))
  const { mgdl, flag } = valueFromSfloat(r.u16('valor'))
  const status = r.u16('status')
  return {
    time,
    mgdl,
    flag,
    status,
    metricCode: null,
    isControl: false,
    segment,
    rawHex: toHex(bytes),
  }
}

function decodeMapped(bytes: Uint8Array, map: SegmentEntryMap, segment: number): RawReading {
  const r = new Reader(bytes)
  let time: DeviceDateTime | null = null
  if (map.header & SEG_ENTRY_HEADER.ABSOLUTE_TIME) time = decodeAbsoluteTime(r.bytesOf(8, 'data'))
  if (map.header & SEG_ENTRY_HEADER.RELATIVE_TIME) r.skip(4, 'tempo relativo')
  if (map.header & SEG_ENTRY_HEADER.HIRES_RELATIVE_TIME) r.skip(8, 'tempo relativo')
  let mgdl: number | null = null
  let flag: GlucoseFlag = null
  let status: number | null = null
  let metricCode: number | null = null
  for (const el of map.elements) {
    const isGlucose = el.metricCode in GLUCOSE_METRIC
    for (const a of el.attrs) {
      const v = r.bytesOf(a.len, `atributo ${a.id}`)
      const vr = new Reader(v)
      if (a.id === ATTR.MDC_ATTR_TIME_STAMP_ABS && a.len === 8 && time === null) {
        time = decodeAbsoluteTime(v)
      } else if (
        a.id === ATTR.MDC_ATTR_NU_VAL_OBS_BASIC &&
        a.len === 2 &&
        isGlucose &&
        metricCode === null
      ) {
        ;({ mgdl, flag } = valueFromSfloat(vr.u16()))
        metricCode = el.metricCode
      } else if (a.id === ATTR.MDC_ATTR_MSMT_STAT && a.len === 2 && status === null) {
        status = vr.u16()
      }
    }
  }
  // Mapa sem elemento de glicose reconhecido: cai para a leitura posicional Roche, se couber.
  if (metricCode === null && bytes.byteLength === ROCHE_FIXED_ENTRY)
    return decodeRocheFixed(bytes, segment)
  return {
    time,
    mgdl,
    flag,
    status,
    metricCode,
    isControl: metricCode === METRIC_GLU_CONTROL,
    segment,
    rawHex: toHex(bytes),
  }
}
