import {
  computeStats,
  countFuture,
  countUndated,
  dayDiffFromToday,
  filterPeriod,
  formatGlucose,
  formatPct,
  mmolToMgdl,
  statsByDayPeriod,
  toCsv,
  dedupeReadings,
  periodDayCount,
  toReadings,
} from './analysis'
import type { RawReading } from './phdc/segments'

const raw = (
  day: number,
  hour: number,
  mgdl: number | null,
  flag: 'HI' | 'LO' | null = null,
  isControl = false,
): RawReading => ({
  time: { year: 2026, month: 11, day, hour, minute: 0, second: 0 },
  mgdl,
  flag,
  status: 0,
  metricCode: null,
  isControl,
  segment: 0,
  rawHex: '',
})

describe('análise das medições', () => {
  const readings = toReadings([
    raw(1, 7, 100),
    raw(10, 7, 50),
    raw(20, 7, 200),
    raw(24, 13, null, 'HI'),
    raw(24, 2, 160),
    raw(24, 9, 120, null, true),
  ])

  it('ordena da mais recente para a mais antiga', () => {
    expect(readings.map((r) => r.timeKey.slice(8, 13))).toEqual([
      '24 13',
      '24 09',
      '24 02',
      '20 07',
      '10 07',
      '01 07',
    ])
  })

  it('filtra o período a partir da última medição', () => {
    expect(filterPeriod(readings, 7).map((r) => r.timeKey.slice(8, 10))).toEqual([
      '24',
      '24',
      '24',
      '20',
    ])
    expect(filterPeriod(readings, 'all')).toHaveLength(6)
  })

  it('estatística exclui controle e trata HI/LO como fora da faixa sem entrar na média', () => {
    const s = computeStats(readings)
    expect(s.control).toBe(1)
    expect(s.numeric).toBe(4)
    expect(s.hi).toBe(1)
    expect(s.mean).toBe(127.5)
    expect(s.min).toBe(50)
    expect(s.max).toBe(200)
    // 5 medições de paciente: 50 (abaixo), 100 e 160 (alvo), 200 e HI (acima)
    expect(s.pctBelow).toBeCloseTo(20)
    expect(s.pctInRange).toBeCloseTo(40)
    expect(s.pctAbove).toBeCloseTo(40)
    expect(s.pctBelow54).toBeCloseTo(20)
    expect(s.days).toBe(4)
  })

  it('separa por período do dia', () => {
    const p = statsByDayPeriod(readings)
    expect(p.find((x) => x.key === 'madrugada')?.stats.numeric).toBe(1)
    expect(p.find((x) => x.key === 'manha')?.stats.numeric).toBe(3)
  })

  it('converte para mmol/L com vírgula', () => {
    expect(formatGlucose(180, 'mmol/L')).toBe('10,0')
    expect(formatGlucose(99.6, 'mg/dL')).toBe('100')
  })

  it('CSV no padrão do Excel PT-BR: cabeçalho na 1ª linha, sem comentários', () => {
    const csv = toCsv(readings, 'mg/dL')
    expect(csv.startsWith('﻿Data;Hora;')).toBe(true)
    expect(csv).not.toContain('#')
    const lines = csv.slice(1).trim().split('\r\n')
    expect(lines[0]).toBe(
      'Data;Hora;Glicemia (mg/dL);Fora da faixa do aparelho;Solução de controle;Status bruto do aparelho;Posição na memória',
    )
    expect(lines[1]).toBe('24/11/2026;13:00;;acima (HI);;0x0000;4')
    expect(lines[2]).toBe('24/11/2026;09:00;120;;sim;0x0000;6')
  })
})

describe('duplicatas e dias do período', () => {
  it('remove repetidas (mesmo horário, valor e tipo) e mantém a primeira lida', () => {
    const rs = toReadings([raw(1, 8, 100), raw(1, 8, 100), raw(1, 8, 100, null), raw(2, 8, 150)])
    const d = dedupeReadings(rs)
    expect(d.duplicates).toBe(2)
    expect(d.readings.map((r) => r.index).sort()).toEqual([0, 3])
    expect(computeStats(d.readings).numeric).toBe(2)
  })

  it('não remove mesmo horário com valor, flag ou tipo diferentes', () => {
    const rs = toReadings([
      raw(1, 8, 100),
      raw(1, 8, 101),
      raw(1, 8, null, 'HI'),
      raw(1, 8, null, 'LO'),
    ])
    expect(dedupeReadings(rs).duplicates).toBe(0)
  })

  it('controle e paciente com mesmo valor e horário não são duplicata', () => {
    const rs = toReadings([raw(1, 8, 100), raw(1, 8, 100, null, true)])
    expect(dedupeReadings(rs).duplicates).toBe(0)
  })

  it('conta dias do período: N para filtro; primeiro ao último dia para "todas"', () => {
    const rs = toReadings([raw(1, 8, 100), raw(5, 8, 110), raw(10, 8, 120)])
    expect(periodDayCount(filterPeriod(rs, 7), 7)).toBe(7)
    expect(periodDayCount(rs, 'all')).toBe(10)
    expect(periodDayCount([], 'all')).toBe(0)
    expect(computeStats(rs).days).toBe(3)
  })
})

describe('bordas clínicas e unidade', () => {
  const vals = (vs: number[]) => toReadings(vs.map((v, i) => raw(1 + i, 8, v)))

  it('limiares são estritos: 70 e 180 no alvo; 69 abaixo; 181 acima', () => {
    const s = computeStats(vals([69, 70, 180, 181]))
    expect(s.belowN).toBe(1)
    expect(s.inRangeN).toBe(2)
    expect(s.aboveN).toBe(1)
  })

  it('54 não é abaixo de 54; 53 é; 250 não é acima de 250; 251 é', () => {
    const s = computeStats(vals([53, 54, 250, 251]))
    expect(s.below54N).toBe(1)
    expect(s.above250N).toBe(1)
  })

  it('LO conta como abaixo de 54 e de 70; HI como acima de 250 e de 180', () => {
    const s = computeStats(
      toReadings([raw(1, 8, null, 'LO'), raw(2, 8, null, 'HI'), raw(3, 8, 100)]),
    )
    expect(s.lo).toBe(1)
    expect(s.below54N).toBe(1)
    expect(s.belowN).toBe(1)
    expect(s.above250N).toBe(1)
    expect(s.aboveN).toBe(1)
    expect(s.count).toBe(3)
  })

  it('converter o alvo de mmol/L não muda a classificação: 3,9 -> 70 e 10,0 -> 180', () => {
    expect(mmolToMgdl(3.9)).toBe(70)
    expect(mmolToMgdl(10)).toBe(180)
    const target = { low: mmolToMgdl(3.9), high: mmolToMgdl(10) }
    const s = computeStats(vals([70, 180]), target)
    expect(s.inRangeN).toBe(2)
    expect(s.belowN).toBe(0)
    expect(s.aboveN).toBe(0)
  })

  it('percentual nunca mostra 0% com ocorrência', () => {
    const many = Array.from({ length: 299 }, () => 100)
    const s = computeStats(vals([45, ...many]))
    expect(s.pctBelow54).toBeCloseTo(0.33, 1)
    expect(formatPct(s.pctBelow54)).toBe('<1%')
    expect(formatPct(0)).toBe('0%')
    expect(formatPct(null)).toBe('—')
    expect(formatPct(99.7)).toBe('>99%')
    expect(formatPct(62.4)).toBe('62%')
  })

  it('conta medições sem data e com data futura (relógio do computador)', () => {
    const rs = toReadings([
      raw(1, 8, 100),
      { ...raw(2, 8, 100), time: null },
      {
        ...raw(20, 8, 100),
        time: { year: 2026, month: 12, day: 5, hour: 8, minute: 0, second: 0 },
      },
    ])
    const now = new Date(2026, 10, 25, 12, 0)
    expect(countUndated(rs)).toBe(1)
    expect(countFuture(rs, now)).toBe(1)
    expect(
      dayDiffFromToday({ year: 2026, month: 11, day: 20, hour: 0, minute: 0, second: 0 }, now),
    ).toBe(-5)
  })

  it('registro sem valor numérico é contado à parte', () => {
    const s = computeStats(toReadings([raw(1, 8, null), raw(2, 8, 100)]))
    expect(s.invalid).toBe(1)
    expect(s.count).toBe(1)
  })
})
