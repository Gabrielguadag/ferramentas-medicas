// Sessão de download IEEE 11073-20601 (somos o manager). Fluxo:
//   aparelho → AARQ        | nós → AARE (accepted-unknown-config)
//   aparelho → config      | nós → aceita a config
//   nós → GET MDS          | aparelho → atributos (modelo, série, relógio)
//   nós → GET_INFO         | aparelho → lista de segmentos do PM-Store
//   por segmento: nós → TRIG_XFER | aparelho → lotes de medições, cada um confirmado por nós
//   nós → RLRQ             | aparelho → RLRE
// Nada é gravado: o resultado volta em memória para a tela.

import { ProtocolError, Reader, Writer, toHex } from './bytes'
import {
  type ConfigObject,
  type DataMessage,
  type IncomingApdu,
  apduLength,
  assertKnownApduChoice,
  buildAction,
  buildAssociationResponse,
  buildConfigResponse,
  buildGetMds,
  buildReleaseRequest,
  buildReleaseResponse,
  buildSegmentDataConfirm,
  findAttr,
  parseApdu,
} from './apdu'
import { type DeviceInfo, parseDeviceInfo } from './mds'
import { ACTION, ATTR, OBJ_CLASS, SEG_EVT_STATUS, TRIG_XFER_RSP, UNIT } from './nomenclature'
import { type RawReading, type SegmentInfo, decodeEntries, parseSegmentInfoList } from './segments'

export interface Transport {
  send(bytes: Uint8Array): Promise<void>
  /** Uma transferência do aparelho (pode conter parte de um APDU ou mais de um). */
  receive(timeoutMs: number): Promise<Uint8Array>
}

export class TimeoutError extends Error {
  override name = 'TimeoutError'
}

export type SessionErrorCode =
  | 'no-association' // o aparelho não iniciou a conversa (cabo, aparelho já em outra sessão)
  | 'device-ended' // o aparelho encerrou ou abortou a sessão
  | 'protocol' // resposta inesperada
  | 'timeout'
  | 'unsupported-unit' // o aparelho declara mmol/L (o app só lê aparelhos em mg/dL)

export class SessionError extends Error {
  override name = 'SessionError'
  constructor(
    readonly code: SessionErrorCode,
    message: string,
  ) {
    super(message)
  }
}

export interface TrafficEntry {
  dir: 'in' | 'out'
  hex: string
}

export interface Progress {
  step: 'associating' | 'config' | 'device-info' | 'segments' | 'transfer' | 'releasing' | 'done'
  received: number
  expected: number | null
}

export interface DownloadResult {
  device: DeviceInfo
  /** Unidade que o aparelho declara na configuração (a transferência é em mg/dL). */
  declaredUnit: 'mg/dL' | 'mmol/L' | null
  readings: RawReading[]
  segments: { instance: number; usageCount: number | null; hasEntryMap: boolean }[]
  traffic: TrafficEntry[]
}

export interface DownloadOptions {
  onProgress?: (p: Progress) => void
  /** Espera pelo primeiro contato do aparelho, em ms. */
  associationTimeoutMs?: number
  /** Espera por cada resposta, em ms. */
  responseTimeoutMs?: number
}

class ApduStream {
  private buffer = new Uint8Array()

  constructor(
    private readonly transport: Transport,
    private readonly traffic: TrafficEntry[],
  ) {}

  async send(bytes: Uint8Array): Promise<void> {
    this.traffic.push({ dir: 'out', hex: toHex(bytes) })
    await this.transport.send(bytes)
  }

  async next(timeoutMs: number): Promise<IncomingApdu> {
    for (;;) {
      const len = apduLength(this.buffer)
      if (len !== null && this.buffer.byteLength >= len) {
        const one = this.buffer.slice(0, len)
        this.buffer = this.buffer.slice(len)
        this.traffic.push({ dir: 'in', hex: toHex(one) })
        assertKnownApduChoice(one)
        return parseApdu(one)
      }
      const chunk = await this.transport.receive(timeoutMs)
      const merged = new Uint8Array(this.buffer.byteLength + chunk.byteLength)
      merged.set(this.buffer)
      merged.set(chunk, this.buffer.byteLength)
      this.buffer = merged
    }
  }
}

function unitOf(objects: readonly ConfigObject[]): 'mg/dL' | 'mmol/L' | null {
  for (const o of objects) {
    const u = findAttr(o.attrs, ATTR.MDC_ATTR_UNIT_CODE)
    if (u && u.byteLength >= 2) {
      const code = new Reader(u).u16()
      if (code === UNIT.MG_PER_DL) return 'mg/dL'
      if (code === UNIT.MMOL_PER_L) return 'mmol/L'
    }
  }
  return null
}

export async function downloadMeter(
  transport: Transport,
  opts: DownloadOptions = {},
): Promise<DownloadResult> {
  const traffic: TrafficEntry[] = []
  const stream = new ApduStream(transport, traffic)
  const report = opts.onProgress ?? (() => {})
  const assocTimeout = opts.associationTimeoutMs ?? 10_000
  const timeout = opts.responseTimeoutMs ?? 5_000

  const receive = async (ms: number, what: string): Promise<IncomingApdu> => {
    let msg: IncomingApdu
    try {
      msg = await stream.next(ms)
    } catch (e) {
      if (e instanceof TimeoutError)
        throw new SessionError('timeout', `O aparelho parou de responder (${what}).`)
      throw e
    }
    if (msg.kind === 'rlrq') {
      await stream.send(buildReleaseResponse()).catch(() => {})
      throw new SessionError('device-ended', 'O aparelho encerrou a sessão antes do fim.')
    }
    if (msg.kind === 'abrt') throw new SessionError('device-ended', 'O aparelho abortou a sessão.')
    return msg
  }

  const receiveData = async (what: string): Promise<DataMessage> => {
    const msg = await receive(timeout, what)
    if (msg.kind !== 'prst')
      throw new SessionError('protocol', `Mensagem inesperada (${msg.kind}) em ${what}.`)
    if (msg.data.kind === 'error' || msg.data.kind === 'reject') {
      throw new SessionError('protocol', `O aparelho recusou o pedido (${what}).`)
    }
    return msg.data
  }

  // 1. Associação ----------------------------------------------------------------------------
  report({ step: 'associating', received: 0, expected: null })
  let first: IncomingApdu
  try {
    first = await stream.next(assocTimeout)
  } catch (e) {
    if (e instanceof TimeoutError) {
      throw new SessionError(
        'no-association',
        'O glicosímetro não iniciou a comunicação. Desconecte o cabo, aguarde o aparelho desligar, reconecte e tente de novo.',
      )
    }
    throw e
  }
  if (first.kind !== 'aarq') {
    throw new SessionError(
      'no-association',
      'O glicosímetro já estava no meio de outra sessão. Desconecte o cabo, reconecte e tente de novo.',
    )
  }
  if (!first.dataProtoIds.includes(20601)) {
    throw new SessionError('protocol', 'O aparelho não oferece o protocolo IEEE 11073-20601.')
  }
  await stream.send(buildAssociationResponse())

  // 2. Configuração --------------------------------------------------------------------------
  report({ step: 'config', received: 0, expected: null })
  let config: Extract<DataMessage, { kind: 'config' }> | null = null
  for (let attempt = 0; attempt < 2 && !config; attempt++) {
    const data = await receiveData('configuração')
    if (
      data.kind === 'config' &&
      data.objects.some((o) => o.objClass === OBJ_CLASS.MDC_MOC_VMO_PMSTORE)
    ) {
      config = data
    } else if (attempt === 0) {
      // Mesmo comportamento dos drivers de referência: reenviar a aceitação uma vez.
      await stream.send(buildAssociationResponse())
    }
  }
  if (!config)
    throw new SessionError('protocol', 'A configuração do aparelho não tem memória (PM-Store).')
  const pmStore = config.objects.find((o) => o.objClass === OBJ_CLASS.MDC_MOC_VMO_PMSTORE)
  if (!pmStore) throw new SessionError('protocol', 'PM-Store ausente.')
  const declaredUnit = unitOf(config.objects)
  if (declaredUnit === 'mmol/L') {
    // Não há conversão testada com aparelho em mmol/L: melhor não mostrar números do que errar.
    throw new SessionError(
      'unsupported-unit',
      'Este glicosímetro está configurado em mmol/L. Esta página só lê aparelhos em mg/dL, então as medições não foram mostradas.',
    )
  }
  await stream.send(buildConfigResponse(config.invokeId, config.configReportId))

  let invokeId = (config.invokeId + 1) & 0xffff
  const nextInvoke = () => {
    const id = invokeId
    invokeId = (invokeId + 1) & 0xffff
    return id
  }

  // 3. Dados do aparelho ---------------------------------------------------------------------
  report({ step: 'device-info', received: 0, expected: null })
  const getId = nextInvoke()
  await stream.send(buildGetMds(getId))
  const mds = await receiveData('dados do aparelho')
  if (mds.kind !== 'get-response')
    throw new SessionError('protocol', 'Resposta inesperada ao pedir os dados do aparelho.')
  const device = parseDeviceInfo(mds.attrs)

  // 4. Segmentos -----------------------------------------------------------------------------
  report({ step: 'segments', received: 0, expected: null })
  await stream.send(
    buildAction(
      nextInvoke(),
      pmStore.handle,
      ACTION.MDC_ACT_SEG_GET_INFO,
      new Writer().u16(1).u16(2).u16(0),
    ),
  )
  const info = await receiveData('lista de segmentos')
  if (info.kind !== 'action-response')
    throw new SessionError('protocol', 'Resposta inesperada à lista de segmentos.')
  let segments: SegmentInfo[]
  try {
    segments = parseSegmentInfoList(info.args)
  } catch {
    segments = []
  }
  // Sem lista legível, faz como os drivers de referência: segmento 0.
  const targets: SegmentInfo[] =
    segments.length > 0 ? segments : [{ instance: 0, usageCount: null, entryMap: null, attrs: [] }]
  const expected = targets.every((s) => s.usageCount !== null)
    ? targets.reduce((n, s) => n + (s.usageCount ?? 0), 0)
    : null

  // 5. Transferência -------------------------------------------------------------------------
  const readings: RawReading[] = []
  report({ step: 'transfer', received: 0, expected })
  for (const seg of targets) {
    await stream.send(
      buildAction(
        nextInvoke(),
        pmStore.handle,
        ACTION.MDC_ACT_SEG_TRIG_XFER,
        new Writer().u16(seg.instance),
      ),
    )
    const rsp = await receiveData('início da transferência')
    if (rsp.kind !== 'action-response' || rsp.actionType !== ACTION.MDC_ACT_SEG_TRIG_XFER) {
      throw new SessionError('protocol', 'Resposta inesperada ao pedir a transferência.')
    }
    const rr = new Reader(rsp.args)
    rr.u16('seg-inst-no')
    const code = rr.u16('trig-segm-xfer-rsp')
    if (code === 3) continue // segmento vazio
    if (code !== 0) {
      throw new SessionError(
        'protocol',
        `O aparelho não liberou a memória: ${TRIG_XFER_RSP[code] ?? code}.`,
      )
    }
    for (;;) {
      const ev = await receiveData('medições')
      if (ev.kind !== 'segment-data')
        throw new SessionError('protocol', 'Mensagem inesperada durante a transferência.')
      let batch: RawReading[]
      try {
        batch = decodeEntries(ev.entries, ev.entryCount, seg.entryMap, seg.instance)
      } catch (e) {
        throw new SessionError(
          'protocol',
          e instanceof ProtocolError ? e.message : 'Lote de medições ilegível.',
        )
      }
      readings.push(...batch)
      await stream.send(
        buildSegmentDataConfirm(
          ev.invokeId,
          ev.handle,
          ev.segInstance,
          ev.entryIndex,
          ev.entryCount,
          SEG_EVT_STATUS.MANAGER_CONFIRM,
        ),
      )
      report({ step: 'transfer', received: readings.length, expected })
      if (ev.status & SEG_EVT_STATUS.AGENT_ABORT) {
        throw new SessionError('device-ended', 'O aparelho interrompeu a transferência.')
      }
      if (ev.status & SEG_EVT_STATUS.LAST_ENTRY) break
    }
  }

  // 6. Liberação (falha aqui não invalida o que já foi lido) ---------------------------------
  report({ step: 'releasing', received: readings.length, expected })
  try {
    await stream.send(buildReleaseRequest())
    await stream.next(2_000)
  } catch {
    // aparelho desligou antes de responder: os dados já estão completos
  }
  report({ step: 'done', received: readings.length, expected })

  return {
    device,
    declaredUnit,
    readings,
    segments: targets.map((s) => ({
      instance: s.instance,
      usageCount: s.usageCount,
      hasEntryMap: s.entryMap !== null,
    })),
    traffic,
  }
}
