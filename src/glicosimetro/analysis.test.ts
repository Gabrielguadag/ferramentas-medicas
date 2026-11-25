import {
  computeStats,
  filterPeriod,
  formatGlucose,
  statsByDayPeriod,
  toCsv,
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

  it('CSV no padrão do Excel PT-BR', () => {
    const csv = toCsv(readings, 'mg/dL', {
      deviceLabel: 'Accu-Chek Guide',
      serialNumber: '123',
      exportedAt: '24/11/2026 10:00',
    })
    expect(csv.startsWith('﻿# Glicosímetro: Accu-Chek Guide (série 123)')).toBe(true)
    const lines = csv.trim().split('\r\n')
    expect(lines[2]).toBe(
      'Data;Hora;Glicemia (mg/dL);Fora da faixa do aparelho;Solução de controle;Status bruto do aparelho;Posição na memória',
    )
    expect(lines[3]).toBe('24/11/2026;13:00;;acima (HI);;0x0000;4')
    expect(lines[4]).toBe('24/11/2026;09:00;120;;sim;0x0000;6')
  })
})
