// Montagem e leitura das mensagens (APDUs) do IEEE 11073-20601 que um "manager" precisa para
// baixar a memória de um glicosímetro: associação, configuração, GET do MDS, ações do PM-Store,
// confirmação de dados de segmento e liberação. Somos sempre o manager; o aparelho é o agent.

import { ProtocolError, Reader, Writer } from './bytes'
import { APDU, DATA_APDU, EVENT } from './nomenclature'

// ---------------------------------------------------------------------------------------------
// Estruturas comuns

export interface Ava {
  id: number
  value: Uint8Array
}

/** AttributeList: count u16, length u16, AVA_Type{attribute-id u16, attribute-value octets}. */
export function readAttributeList(r: Reader): Ava[] {
  const count = r.u16('número de atributos')
  const body = r.sub('lista de atributos')
  const out: Ava[] = []
  for (let i = 0; i < count; i++) {
    const id = body.u16('id de atributo')
    out.push({ id, value: body.octets(`valor do atributo ${id}`) })
  }
  return out
}

export function findAttr(attrs: readonly Ava[], id: number): Uint8Array | null {
  return attrs.find((a) => a.id === id)?.value ?? null
}

// ---------------------------------------------------------------------------------------------
// Mensagens recebidas

export interface AssociationRequest {
  kind: 'aarq'
  dataProtoIds: number[]
  systemId: Uint8Array | null
  devConfigId: number | null
}

export interface ConfigObject {
  objClass: number
  handle: number
  attrs: Ava[]
}

export type DataMessage =
  | {
      kind: 'config'
      invokeId: number
      handle: number
      configReportId: number
      objects: ConfigObject[]
    }
  | {
      kind: 'segment-data'
      invokeId: number
      handle: number
      segInstance: number
      entryIndex: number
      entryCount: number
      status: number
      entries: Uint8Array
    }
  | { kind: 'event-other'; invokeId: number; handle: number; eventType: number; confirmed: boolean }
  | { kind: 'get-response'; invokeId: number; handle: number; attrs: Ava[] }
  | {
      kind: 'action-response'
      invokeId: number
      handle: number
      actionType: number
      args: Uint8Array
    }
  | { kind: 'error'; invokeId: number; errorValue: number }
  | { kind: 'reject'; invokeId: number; problem: number }
  | { kind: 'data-other'; invokeId: number; choice: number }

export type IncomingApdu =
  | AssociationRequest
  | { kind: 'aare'; result: number }
  | { kind: 'rlrq'; reason: number }
  | { kind: 'rlre'; reason: number }
  | { kind: 'abrt'; reason: number }
  | { kind: 'prst'; data: DataMessage }
  | { kind: 'unknown'; choice: number }

/** Lê um APDU completo (cabeçalho choice u16 + length u16 + corpo). */
export function parseApdu(bytes: Uint8Array): IncomingApdu {
  const r = new Reader(bytes)
  const choice = r.u16('tipo de APDU')
  const body = r.sub('corpo do APDU')
  switch (choice) {
    case APDU.AARQ:
      return parseAarq(body)
    case APDU.AARE:
      return { kind: 'aare', result: body.u16('resultado da associação') }
    case APDU.RLRQ:
      return { kind: 'rlrq', reason: body.u16('motivo') }
    case APDU.RLRE:
      return { kind: 'rlre', reason: body.u16('motivo') }
    case APDU.ABRT:
      return { kind: 'abrt', reason: body.u16('motivo') }
    case APDU.PRST:
      return { kind: 'prst', data: parseDataApdu(body.sub('DataApdu')) }
    default:
      return { kind: 'unknown', choice }
  }
}

function parseAarq(r: Reader): AssociationRequest {
  r.u32('assoc-version')
  const count = r.u16('número de protocolos')
  const list = r.sub('lista de protocolos')
  const ids: number[] = []
  let systemId: Uint8Array | null = null
  let devConfigId: number | null = null
  for (let i = 0; i < count; i++) {
    const id = list.u16('data-proto-id')
    const info = list.sub('data-proto-info')
    ids.push(id)
    if (id === 20601 && info.remaining >= 18) {
      info.u32('protocol-version')
      info.u16('encoding-rules')
      info.u32('nomenclature-version')
      info.u32('functional-units')
      info.u32('system-type')
      systemId = info.octets('system-id')
      if (info.remaining >= 2) devConfigId = info.u16('dev-config-id')
    }
  }
  return { kind: 'aarq', dataProtoIds: ids, systemId, devConfigId }
}

function parseDataApdu(r: Reader): DataMessage {
  const invokeId = r.u16('invoke-id')
  const choice = r.u16('tipo de mensagem')
  const m = r.sub('mensagem')
  switch (choice) {
    case DATA_APDU.ROIV_EVENT_REPORT:
    case DATA_APDU.ROIV_CONFIRMED_EVENT_REPORT: {
      const handle = m.u16('obj-handle')
      m.u32('event-time')
      const eventType = m.u16('event-type')
      const info = m.sub('event-info')
      const confirmed = choice === DATA_APDU.ROIV_CONFIRMED_EVENT_REPORT
      if (eventType === EVENT.MDC_NOTI_CONFIG) {
        const configReportId = info.u16('config-report-id')
        const count = info.u16('número de objetos')
        const list = info.sub('lista de objetos')
        const objects: ConfigObject[] = []
        for (let i = 0; i < count; i++) {
          const objClass = list.u16('obj-class')
          const objHandle = list.u16('obj-handle')
          objects.push({ objClass, handle: objHandle, attrs: readAttributeList(list) })
        }
        return { kind: 'config', invokeId, handle, configReportId, objects }
      }
      if (eventType === EVENT.MDC_NOTI_SEGMENT_DATA) {
        const segInstance = info.u16('seg-instance')
        const entryIndex = info.u32('entry-index')
        const entryCount = info.u32('entry-count')
        const status = info.u16('segm-evt-status')
        const entries = info.octets('entradas do segmento')
        return {
          kind: 'segment-data',
          invokeId,
          handle,
          segInstance,
          entryIndex,
          entryCount,
          status,
          entries,
        }
      }
      return { kind: 'event-other', invokeId, handle, eventType, confirmed }
    }
    case DATA_APDU.RORS_GET: {
      const handle = m.u16('obj-handle')
      return { kind: 'get-response', invokeId, handle, attrs: readAttributeList(m) }
    }
    case DATA_APDU.RORS_CONFIRMED_ACTION: {
      const handle = m.u16('obj-handle')
      const actionType = m.u16('action-type')
      // Alguns aparelhos mandam a resposta sem os argumentos; aceita corpo vazio.
      const args = m.remaining >= 2 ? m.octets('action-info-args') : new Uint8Array()
      return { kind: 'action-response', invokeId, handle, actionType, args }
    }
    case DATA_APDU.ROER:
      return { kind: 'error', invokeId, errorValue: m.u16('error-value') }
    case DATA_APDU.RORJ:
      return { kind: 'reject', invokeId, problem: m.u16('problem') }
    default:
      return { kind: 'data-other', invokeId, choice }
  }
}

// ---------------------------------------------------------------------------------------------
// Mensagens enviadas

function apdu(choice: number, body: Writer): Uint8Array {
  return new Writer().u16(choice).block(body).toBytes()
}

/** PRST com um DataApdu dentro (octet string). */
function prst(invokeId: number, choice: number, message: Writer): Uint8Array {
  const data = new Writer().u16(invokeId).u16(choice).block(message)
  return apdu(APDU.PRST, new Writer().block(data))
}

/**
 * AARE "accepted-unknown-config": aceita a associação e pede ao aparelho que envie a
 * configuração. Os valores (protocol-version 0x80000002, nomenclatura, system-id) são os
 * mesmos que dois drivers usam com aparelhos Roche reais.
 */
export function buildAssociationResponse(): Uint8Array {
  const info = new Writer()
    .u32(0x80000002) // protocol-version
    .u16(0x8000) // encoding-rules: MDER
    .u32(0x80000000) // nomenclature-version
    .u32(0) // functional-units: associação normal
    .u32(0x80000000) // system-type: manager
    .block(Uint8Array.from([0x12, 0x34, 0x56, 0x78, 0x87, 0x65, 0x43, 0x21])) // system-id
    .u16(0) // dev-config-id (manager)
    .u16(0)
    .u8(0)
    .u8(0) // data-req-mode-capab
    .u16(0)
    .u16(0) // option-list vazia
  const body = new Writer()
    .u16(0x0003) // accepted-unknown-config
    .u16(20601) // data-proto-id
    .block(info)
  return apdu(APDU.AARE, body)
}

/** Resposta ao relatório de configuração: aceita a configuração enviada. */
export function buildConfigResponse(invokeId: number, configReportId: number): Uint8Array {
  const reply = new Writer().u16(configReportId).u16(0) // accepted-config
  const msg = new Writer().u16(0).u32(0).u16(EVENT.MDC_NOTI_CONFIG).block(reply)
  return prst(invokeId, DATA_APDU.RORS_CONFIRMED_EVENT_REPORT, msg)
}

/** GET de todos os atributos do MDS (handle 0). */
export function buildGetMds(invokeId: number): Uint8Array {
  const msg = new Writer().u16(0).u16(0).u16(0) // handle 0, lista de ids vazia = todos
  return prst(invokeId, DATA_APDU.ROIV_GET, msg)
}

/** Ação confirmada sobre um objeto (PM-Store). */
export function buildAction(
  invokeId: number,
  handle: number,
  actionType: number,
  args: Writer,
): Uint8Array {
  const msg = new Writer().u16(handle).u16(actionType).block(args)
  return prst(invokeId, DATA_APDU.ROIV_CONFIRMED_ACTION, msg)
}

/** Confirma o recebimento de um lote de entradas de segmento. */
export function buildSegmentDataConfirm(
  invokeId: number,
  handle: number,
  segInstance: number,
  entryIndex: number,
  entryCount: number,
  status: number,
): Uint8Array {
  const reply = new Writer().u16(segInstance).u32(entryIndex).u32(entryCount).u16(status)
  const msg = new Writer()
    .u16(handle)
    .u32(0xffffffff) // current-time: não informado
    .u16(EVENT.MDC_NOTI_SEGMENT_DATA)
    .block(reply)
  return prst(invokeId, DATA_APDU.RORS_CONFIRMED_EVENT_REPORT, msg)
}

export function buildReleaseRequest(): Uint8Array {
  return apdu(APDU.RLRQ, new Writer().u16(0)) // normal
}

export function buildReleaseResponse(): Uint8Array {
  return apdu(APDU.RLRE, new Writer().u16(0))
}

export function buildAbort(): Uint8Array {
  return apdu(APDU.ABRT, new Writer().u16(0)) // undefined
}

/** Comprimento total de um APDU a partir dos 4 primeiros bytes; null se ainda não há 4 bytes. */
export function apduLength(prefix: Uint8Array): number | null {
  if (prefix.byteLength < 4) return null
  return 4 + (((prefix[2] ?? 0) << 8) | (prefix[3] ?? 0))
}

export function assertKnownApduChoice(bytes: Uint8Array): void {
  const choice = ((bytes[0] ?? 0) << 8) | (bytes[1] ?? 0)
  if ((choice & 0xff00) < 0xe200 || (choice & 0xff00) > 0xe700 || (choice & 0x00ff) !== 0) {
    throw new ProtocolError(
      `Bytes não reconhecidos como mensagem IEEE 11073 (0x${choice.toString(16)}).`,
    )
  }
}
