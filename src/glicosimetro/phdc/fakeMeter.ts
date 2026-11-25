// Glicosímetro simulado (lado "agent" do IEEE 11073-20601). Usado nos testes e no modo de
// demonstração da tela. Só gera dados sintéticos. As mensagens seguem o layout que os drivers de
// referência leem em aparelhos Accu-Chek reais (offsets conferidos em fakeMeter.test.ts).

import { Reader, Writer } from './bytes'
import { APDU, ACTION, ATTR, DATA_APDU, EVENT, OBJ_CLASS, PROD_SPEC, UNIT } from './nomenclature'
import { type Transport, TimeoutError } from './manager'
import { type DeviceDateTime, encodeAbsoluteTime, encodeSfloat } from './types'

export interface FakeReading {
  time: DeviceDateTime
  /** mg/dL, ou 'HI' / 'LO'. */
  value: number | 'HI' | 'LO'
  status?: number
}

export interface FakeMeterOptions {
  readings: FakeReading[]
  modelNumber?: string
  serialNumber?: string
  clock?: DeviceDateTime
  /** Medições por lote de transferência. */
  batchSize?: number
  /** Inclui o PmSegmentEntryMap na lista de segmentos (aparelhos podem omitir). */
  entryMap?: boolean
  /** Tamanho máximo de cada transferência USB simulada (fragmenta os APDUs). */
  chunkSize?: number
  /** Comportamentos de falha para testes. */
  behavior?: 'normal' | 'silent' | 'abort-mid-transfer' | 'no-release-response'
}

const PM_STORE_HANDLE = 0x0100
const NUMERIC_HANDLE = 1
const GLUCOSE_CAPILLARY_WB = 29112

export class FakeMeter implements Transport {
  private readonly outbox: Uint8Array[] = []
  private readonly waiters: ((b: Uint8Array) => void)[] = []
  private agentInvoke = 0x0040
  private pending: FakeReading[] = []
  private batchIndex = 0
  readonly received: Uint8Array[] = []

  constructor(private readonly opts: FakeMeterOptions) {
    if ((opts.behavior ?? 'normal') !== 'silent') this.emit(this.aarq())
  }

  // Transport -------------------------------------------------------------------------------
  async send(bytes: Uint8Array): Promise<void> {
    this.received.push(bytes)
    this.react(bytes)
  }

  receive(timeoutMs: number): Promise<Uint8Array> {
    const ready = this.outbox.shift()
    if (ready) return Promise.resolve(ready)
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const i = this.waiters.indexOf(waiter)
        if (i >= 0) this.waiters.splice(i, 1)
        reject(new TimeoutError('timeout'))
      }, timeoutMs)
      const waiter = (b: Uint8Array) => {
        clearTimeout(timer)
        resolve(b)
      }
      this.waiters.push(waiter)
    })
  }

  // ------------------------------------------------------------------------------------------
  private emit(apdu: Uint8Array): void {
    const size = this.opts.chunkSize ?? 1024
    for (let i = 0; i < apdu.byteLength; i += size) {
      const chunk = apdu.slice(i, i + size)
      const w = this.waiters.shift()
      if (w) w(chunk)
      else this.outbox.push(chunk)
    }
  }

  private prst(invokeId: number, choice: number, msg: Writer): Uint8Array {
    const data = new Writer().u16(invokeId).u16(choice).block(msg)
    return new Writer().u16(APDU.PRST).block(new Writer().block(data)).toBytes()
  }

  private aarq(): Uint8Array {
    const info = new Writer()
      .u32(0x80000000) // protocol-version
      .u16(0xa000) // encoding-rules: MDER | PER
      .u32(0x80000000) // nomenclature-version
      .u32(0) // functional-units
      .u32(0x00800000) // system-type: agent
      .block(Uint8Array.from([0x00, 0x60, 0x19, 0x00, 0x00, 0x00, 0x00, 0x01])) // system-id
      .u16(0x4000) // dev-config-id: extended
      .u16(0x0001)
      .u8(1)
      .u8(0) // data-req-mode-capab
      .u16(0)
      .u16(0) // option-list
    const protos = new Writer().u16(20601).block(info)
    const body = new Writer().u32(0x80000000).u16(1).block(protos)
    return new Writer().u16(APDU.AARQ).block(body).toBytes()
  }

  private configReport(): Uint8Array {
    const attr = (id: number, value: Writer | Uint8Array) => new Writer().u16(id).block(value)
    const numericAttrs = [
      attr(ATTR.MDC_ATTR_ID_TYPE, new Writer().u16(2).u16(GLUCOSE_CAPILLARY_WB)),
      attr(ATTR.MDC_ATTR_UNIT_CODE, new Writer().u16(UNIT.MG_PER_DL)),
    ]
    const pmAttrs = [
      attr(ATTR.MDC_ATTR_PM_STORE_CAPAB, new Writer().u16(0x4000)),
      attr(ATTR.MDC_ATTR_NUM_SEG, new Writer().u16(1)),
    ]
    const obj = (cls: number, handle: number, attrs: Writer[]) => {
      const list = new Writer()
      for (const a of attrs) list.raw(a.toBytes())
      return new Writer().u16(cls).u16(handle).u16(attrs.length).block(list)
    }
    const objects = [
      obj(OBJ_CLASS.MDC_MOC_VMO_METRIC_NU, NUMERIC_HANDLE, numericAttrs),
      obj(OBJ_CLASS.MDC_MOC_VMO_PMSTORE, PM_STORE_HANDLE, pmAttrs),
    ]
    const list = new Writer()
    for (const o of objects) list.raw(o.toBytes())
    const info = new Writer().u16(0x4000).u16(objects.length).block(list)
    const msg = new Writer().u16(0).u32(0xffffffff).u16(EVENT.MDC_NOTI_CONFIG).block(info)
    return this.prst(this.agentInvoke++, DATA_APDU.ROIV_CONFIRMED_EVENT_REPORT, msg)
  }

  private mdsResponse(invokeId: number): Uint8Array {
    const enc = new TextEncoder()
    const systemModel = new Writer()
      .block(enc.encode('Roche'))
      .block(enc.encode(this.opts.modelNumber ?? '929'))
    const spec = new Writer()
      .u16(PROD_SPEC.SERIAL_NUMBER)
      .u16(0)
      .block(enc.encode(this.opts.serialNumber ?? '00000000'))
    const prodSpec = new Writer().u16(1).block(spec)
    const clock = this.opts.clock ?? {
      year: 2026,
      month: 11,
      day: 24,
      hour: 9,
      minute: 30,
      second: 0,
    }
    const attrs = [
      new Writer().u16(ATTR.MDC_ATTR_ID_MODEL).block(systemModel),
      new Writer().u16(ATTR.MDC_ATTR_ID_PROD_SPECN).block(prodSpec),
      new Writer().u16(ATTR.MDC_ATTR_TIME_ABS).block(encodeAbsoluteTime(clock)),
    ]
    const list = new Writer()
    for (const a of attrs) list.raw(a.toBytes())
    const msg = new Writer().u16(0).u16(attrs.length).block(list)
    return this.prst(invokeId, DATA_APDU.RORS_GET, msg)
  }

  private segmentInfo(invokeId: number): Uint8Array {
    const attrs: Writer[] = []
    if (this.opts.entryMap ?? true) {
      const attrMap = new Writer()
        .u16(ATTR.MDC_ATTR_NU_VAL_OBS_BASIC)
        .u16(2)
        .u16(ATTR.MDC_ATTR_MSMT_STAT)
        .u16(2)
      const element = new Writer()
        .u16(OBJ_CLASS.MDC_MOC_VMO_METRIC_NU)
        .u16(2)
        .u16(GLUCOSE_CAPILLARY_WB)
        .u16(NUMERIC_HANDLE)
        .u16(2)
        .block(attrMap)
      const map = new Writer().u16(0x8000).u16(1).block(element)
      attrs.push(new Writer().u16(ATTR.MDC_ATTR_PM_SEG_MAP).block(map))
    }
    attrs.push(
      new Writer()
        .u16(ATTR.MDC_ATTR_SEG_USAGE_CNT)
        .block(new Writer().u32(this.opts.readings.length)),
    )
    const attrList = new Writer()
    for (const a of attrs) attrList.raw(a.toBytes())
    const seg = new Writer().u16(0).u16(attrs.length).block(attrList)
    const list = new Writer().u16(1).block(seg)
    const msg = new Writer().u16(PM_STORE_HANDLE).u16(ACTION.MDC_ACT_SEG_GET_INFO).block(list)
    return this.prst(invokeId, DATA_APDU.RORS_CONFIRMED_ACTION, msg)
  }

  private trigResponse(invokeId: number, segment: number): Uint8Array {
    const empty = this.opts.readings.length === 0
    const args = new Writer().u16(segment).u16(segment !== 0 ? 1 : empty ? 3 : 0)
    const msg = new Writer().u16(PM_STORE_HANDLE).u16(ACTION.MDC_ACT_SEG_TRIG_XFER).block(args)
    return this.prst(invokeId, DATA_APDU.RORS_CONFIRMED_ACTION, msg)
  }

  private nextBatch(): Uint8Array {
    const size = this.opts.batchSize ?? 30
    const start = this.batchIndex
    const batch = this.pending.slice(start, start + size)
    this.batchIndex += batch.length
    const entries = new Writer()
    for (const r of batch) {
      const value = r.value === 'HI' ? 0x07fe : r.value === 'LO' ? 0x0802 : encodeSfloat(r.value)
      entries
        .raw(encodeAbsoluteTime(r.time))
        .u16(value)
        .u16(r.status ?? 0)
    }
    let status = 0
    if (start === 0) status |= 0x8000
    if (this.batchIndex >= this.pending.length) status |= 0x4000
    const info = new Writer().u16(0).u32(start).u32(batch.length).u16(status).block(entries)
    const msg = new Writer()
      .u16(PM_STORE_HANDLE)
      .u32(0xffffffff)
      .u16(EVENT.MDC_NOTI_SEGMENT_DATA)
      .block(info)
    return this.prst(this.agentInvoke++, DATA_APDU.ROIV_CONFIRMED_EVENT_REPORT, msg)
  }

  private react(bytes: Uint8Array): void {
    const r = new Reader(bytes)
    const choice = r.u16()
    r.u16()
    if (choice === APDU.AARE) {
      this.emit(this.configReport())
      return
    }
    if (choice === APDU.RLRQ) {
      if (this.opts.behavior !== 'no-release-response') {
        this.emit(new Writer().u16(APDU.RLRE).block(new Writer().u16(0)).toBytes())
      }
      return
    }
    if (choice !== APDU.PRST) return
    r.u16() // octet string length
    const invokeId = r.u16()
    const dataChoice = r.u16()
    const m = r.sub()
    if (dataChoice === DATA_APDU.ROIV_GET) {
      this.emit(this.mdsResponse(invokeId))
    } else if (dataChoice === DATA_APDU.ROIV_CONFIRMED_ACTION) {
      m.u16() // handle
      const action = m.u16()
      const args = m.sub()
      if (action === ACTION.MDC_ACT_SEG_GET_INFO) this.emit(this.segmentInfo(invokeId))
      else if (action === ACTION.MDC_ACT_SEG_TRIG_XFER) {
        const segment = args.u16()
        this.emit(this.trigResponse(invokeId, segment))
        if (segment === 0 && this.opts.readings.length > 0) {
          this.pending = [...this.opts.readings]
          this.batchIndex = 0
          this.emit(this.nextBatch())
        }
      }
    } else if (dataChoice === DATA_APDU.RORS_CONFIRMED_EVENT_REPORT) {
      m.u16()
      m.u32()
      const event = m.u16()
      if (event === EVENT.MDC_NOTI_SEGMENT_DATA && this.batchIndex < this.pending.length) {
        if (this.opts.behavior === 'abort-mid-transfer') {
          this.emit(new Writer().u16(APDU.ABRT).block(new Writer().u16(0)).toBytes())
          return
        }
        this.emit(this.nextBatch())
      }
    }
  }
}

/** Medições sintéticas para o modo de demonstração: 14 dias, 4 medições por dia. */
export function demoReadings(
  endDate: DeviceDateTime = { year: 2026, month: 11, day: 24, hour: 22, minute: 0, second: 0 },
): FakeReading[] {
  const out: FakeReading[] = []
  const end = Date.UTC(endDate.year, endDate.month - 1, endDate.day)
  // Pseudoaleatório determinístico (sem Math.random), para a demonstração ser sempre igual.
  let seed = 7
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  for (let d = 13; d >= 0; d--) {
    const day = new Date(end - d * 86_400_000)
    for (const [hour, base] of [
      [7, 135],
      [12, 175],
      [19, 160],
      [22, 145],
    ] as const) {
      const minute = Math.floor(rnd() * 50)
      let value: number | 'HI' | 'LO' = Math.round(base + (rnd() - 0.5) * 110)
      if (d === 9 && hour === 12) value = 'HI'
      if (d === 4 && hour === 22) value = 58
      out.push({
        time: {
          year: day.getUTCFullYear(),
          month: day.getUTCMonth() + 1,
          day: day.getUTCDate(),
          hour,
          minute,
          second: 0,
        },
        value,
      })
    }
  }
  return out
}
