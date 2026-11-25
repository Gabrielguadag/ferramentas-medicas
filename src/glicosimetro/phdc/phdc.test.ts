import { fromHex, toHex } from './bytes'
import { buildAssociationResponse, buildConfigResponse, buildGetMds, parseApdu } from './apdu'
import { FakeMeter, type FakeReading, demoReadings } from './fakeMeter'
import { SessionError, downloadMeter } from './manager'
import { decodeAbsoluteTime, decodeSfloat, encodeAbsoluteTime, encodeSfloat } from './types'

const t = (day: number, hour: number, minute = 0) => ({
  year: 2026,
  month: 11,
  day,
  hour,
  minute,
  second: 0,
})

const sample: FakeReading[] = [
  { time: t(20, 7, 5), value: 112 },
  { time: t(20, 12, 40), value: 'HI' },
  { time: t(21, 22, 15), value: 'LO' },
  { time: t(22, 8, 0), value: 245 },
]

describe('SFLOAT', () => {
  it('decodifica inteiros, expoente negativo e valores especiais', () => {
    expect(decodeSfloat(0x0070)).toEqual({ kind: 'number', value: 112 })
    expect(decodeSfloat(0xf038)).toEqual({ kind: 'number', value: 5.6 }) // 56 × 10^-1
    expect(decodeSfloat(0x07fe)).toEqual({ kind: 'pos-inf' })
    expect(decodeSfloat(0x0802)).toEqual({ kind: 'neg-inf' })
    expect(decodeSfloat(0x07ff)).toEqual({ kind: 'nan' })
    expect(decodeSfloat(0x0800)).toEqual({ kind: 'nres' })
    expect(decodeSfloat(0x0fff)).toEqual({ kind: 'number', value: -1 })
  })

  it('codifica e decodifica de volta', () => {
    for (const v of [10, 99, 600, 1024]) {
      expect(decodeSfloat(encodeSfloat(v))).toEqual({ kind: 'number', value: v })
    }
  })
})

describe('AbsoluteTime', () => {
  it('lê BCD e rejeita datas inválidas', () => {
    expect(decodeAbsoluteTime(fromHex('20 26 11 24 09 30 15 00'))).toEqual({
      year: 2026,
      month: 11,
      day: 24,
      hour: 9,
      minute: 30,
      second: 15,
    })
    expect(decodeAbsoluteTime(fromHex('20 26 13 24 09 30 15 00'))).toBeNull()
    expect(decodeAbsoluteTime(fromHex('20 26 1a 24 09 30 15 00'))).toBeNull()
    expect(toHex(encodeAbsoluteTime(t(3, 4, 5)))).toBe('20 26 11 03 04 05 00 00')
  })
})

describe('mensagens do manager', () => {
  it('AARE tem os 48 bytes do layout usado com aparelhos Roche', () => {
    const b = buildAssociationResponse()
    expect(b.byteLength).toBe(48)
    expect(toHex(b.subarray(0, 16))).toBe('e3 00 00 2c 00 03 50 79 00 26 80 00 00 02 80 00')
    expect(parseApdu(b)).toEqual({ kind: 'aare', result: 3 })
  })

  it('resposta de configuração e GET do MDS têm os comprimentos esperados', () => {
    const c = buildConfigResponse(0x1234, 0x4000)
    expect(toHex(c)).toBe(
      'e7 00 00 16 00 14 12 34 02 01 00 0e 00 00 00 00 00 00 0d 1c 00 04 40 00 00 00',
    )
    expect(toHex(buildGetMds(7))).toBe('e7 00 00 0e 00 0c 00 07 01 03 00 06 00 00 00 00 00 00')
  })
})

describe('download completo contra o glicosímetro simulado', () => {
  it('lê aparelho, medições, HI/LO e libera a sessão', async () => {
    const meter = new FakeMeter({ readings: sample, serialNumber: '12345678', batchSize: 3 })
    const steps: string[] = []
    const r = await downloadMeter(meter, { onProgress: (p) => steps.push(p.step) })
    expect(r.device).toMatchObject({
      manufacturer: 'Roche',
      modelCode: 929,
      modelName: 'Accu-Chek Guide',
      serialNumber: '12345678',
    })
    expect(r.declaredUnit).toBe('mg/dL')
    expect(r.readings.map((x) => [x.mgdl, x.flag])).toEqual([
      [112, null],
      [null, 'HI'],
      [null, 'LO'],
      [245, null],
    ])
    expect(r.readings[0]?.time).toEqual(t(20, 7, 5))
    expect(r.readings[0]?.metricCode).toBe(29112)
    expect(r.segments).toEqual([{ instance: 0, usageCount: 4, hasEntryMap: true }])
    expect(steps.at(-1)).toBe('done')
    // última mensagem enviada é o pedido de liberação
    expect(toHex(meter.received.at(-1) ?? new Uint8Array())).toBe('e4 00 00 02 00 00')
  })

  it('remonta APDUs fragmentados em pacotes USB de 64 bytes', async () => {
    const readings = demoReadings()
    const r = await downloadMeter(new FakeMeter({ readings, chunkSize: 64, batchSize: 10 }))
    expect(r.readings).toHaveLength(readings.length)
  })

  it('sem mapa de entradas usa o layout fixo Roche de 12 bytes', async () => {
    const r = await downloadMeter(new FakeMeter({ readings: sample, entryMap: false }))
    expect(r.segments[0]?.hasEntryMap).toBe(false)
    expect(r.readings.map((x) => x.mgdl)).toEqual([112, null, null, 245])
    expect(r.readings[0]?.metricCode).toBeNull()
  })

  it('memória vazia devolve lista vazia', async () => {
    const r = await downloadMeter(new FakeMeter({ readings: [] }))
    expect(r.readings).toEqual([])
  })

  it('aparelho mudo vira erro de associação com orientação', async () => {
    const p = downloadMeter(new FakeMeter({ readings: sample, behavior: 'silent' }), {
      associationTimeoutMs: 20,
    })
    await expect(p).rejects.toMatchObject({ code: 'no-association' })
    await expect(p).rejects.toBeInstanceOf(SessionError)
  })

  it('aborto no meio da transferência vira erro', async () => {
    const p = downloadMeter(
      new FakeMeter({ readings: demoReadings(), batchSize: 5, behavior: 'abort-mid-transfer' }),
    )
    await expect(p).rejects.toMatchObject({ code: 'device-ended' })
  })

  it('aparelho que desliga sem responder à liberação não perde os dados', async () => {
    const r = await downloadMeter(
      new FakeMeter({ readings: sample, behavior: 'no-release-response' }),
    )
    expect(r.readings).toHaveLength(4)
  })

  it('guarda o tráfego para diagnóstico', async () => {
    const r = await downloadMeter(new FakeMeter({ readings: sample }))
    expect(r.traffic[0]).toMatchObject({ dir: 'in' })
    expect(r.traffic[0]?.hex.startsWith('e2 00')).toBe(true)
    expect(r.traffic[1]?.hex.startsWith('e3 00')).toBe(true)
  })
})

describe('compatibilidade com os offsets dos drivers de referência', () => {
  // O Tidepool Uploader lê os lotes por posição fixa: quantidade em 30, primeira data em 36,
  // valor em 44, status em 46, status do lote no byte 32. O simulador precisa produzir
  // exatamente esse layout, senão os testes acima não provam nada sobre aparelhos reais.
  it('lote de medições do simulador bate com o layout lido em aparelhos reais', async () => {
    const meter = new FakeMeter({ readings: sample, batchSize: 10 })
    const r = await downloadMeter(meter)
    const batchHex = r.traffic.find((x) => x.dir === 'in' && x.hex.includes('0d 21'))?.hex ?? ''
    const b = fromHex(batchHex)
    const view = new DataView(b.buffer)
    expect(view.getUint16(30)).toBe(4)
    expect(toHex(b.subarray(36, 42))).toBe('20 26 11 20 07 05')
    expect(view.getUint16(44)).toBe(112)
    expect(b[32]! & 0x40).toBe(0x40) // último lote
  })
})
