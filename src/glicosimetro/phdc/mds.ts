// Atributos do MDS (o "aparelho" no modelo do 11073): fabricante, modelo, número de série,
// relógio. Tudo tolerante: um campo ausente vira null em vez de abortar a leitura.

import { Reader } from './bytes'
import { type Ava, findAttr } from './apdu'
import { ATTR, PROD_SPEC, rocheModelName } from './nomenclature'
import { type DeviceDateTime, decodeAbsoluteTime } from './types'

export interface DeviceInfo {
  manufacturer: string | null
  modelNumber: string | null
  modelCode: number | null
  modelName: string | null
  serialNumber: string | null
  firmware: string | null
  clock: DeviceDateTime | null
}

const decoder = new TextDecoder('ascii', { fatal: false })
const text = (b: Uint8Array) => decoder.decode(b).replace(/\0+$/g, '').trim()

function parseSystemModel(v: Uint8Array): { manufacturer: string | null; model: string | null } {
  try {
    const r = new Reader(v)
    const manufacturer = text(r.octets('fabricante'))
    const model = text(r.octets('modelo'))
    return { manufacturer: manufacturer || null, model: model || null }
  } catch {
    // Formato inesperado: trata o atributo inteiro como texto.
    return { manufacturer: null, model: text(v) || null }
  }
}

function parseProdSpec(v: Uint8Array): Map<number, string> {
  const out = new Map<number, string>()
  try {
    const r = new Reader(v)
    const count = r.u16()
    const list = r.sub()
    for (let i = 0; i < count; i++) {
      const type = list.u16('spec-type')
      list.u16('component-id')
      const value = text(list.octets('prod-spec'))
      if (!out.has(type)) out.set(type, value)
    }
  } catch {
    // ignora entradas que não fecham
  }
  return out
}

export function parseDeviceInfo(attrs: readonly Ava[]): DeviceInfo {
  const model = findAttr(attrs, ATTR.MDC_ATTR_ID_MODEL)
  const { manufacturer, model: modelNumber } = model
    ? parseSystemModel(model)
    : { manufacturer: null, model: null }
  const digits = modelNumber?.match(/\d+/)?.[0]
  const modelCode = digits ? Number(digits) : null
  const spec = findAttr(attrs, ATTR.MDC_ATTR_ID_PROD_SPECN)
  const specs = spec ? parseProdSpec(spec) : new Map<number, string>()
  const clock = findAttr(attrs, ATTR.MDC_ATTR_TIME_ABS)
  return {
    manufacturer,
    modelNumber,
    modelCode,
    modelName: modelCode !== null ? rocheModelName(modelCode) : null,
    serialNumber: specs.get(PROD_SPEC.SERIAL_NUMBER) ?? null,
    firmware: specs.get(PROD_SPEC.FW_REVISION) ?? specs.get(PROD_SPEC.SW_REVISION) ?? null,
    clock: clock ? decodeAbsoluteTime(clock) : null,
  }
}
