import {
  FATORES_ALTO,
  FATORES_MODERADO,
  classificarPa,
  indicaPrevencao,
  manutencao,
  mlDaAmpola,
  momentoAas,
  monitorizar,
} from './preeclampsia'

describe('fatores de risco (RBEHG 2023, Quadro 1)', () => {
  it('8 fatores altos e 5 moderados', () => {
    expect(FATORES_ALTO).toHaveLength(8)
    expect(FATORES_MODERADO).toHaveLength(5)
  })

  it('um alto ou dois moderados indicam prevenção', () => {
    expect(indicaPrevencao(1, 0)).toBe(true)
    expect(indicaPrevencao(0, 2)).toBe(true)
    expect(indicaPrevencao(0, 1)).toBe(false)
    expect(indicaPrevencao(0, 0)).toBe(false)
  })
})

describe('momento do AAS', () => {
  it('a partir de 12, ideal antes de 16, até 20; uso até 36', () => {
    expect(momentoAas(10)).toBe('antes-12')
    expect(momentoAas(12)).toBe('ideal')
    expect(momentoAas(15.9)).toBe('ideal')
    expect(momentoAas(16)).toBe('ainda-pode')
    expect(momentoAas(20)).toBe('ainda-pode')
    expect(momentoAas(21)).toBe('apos-20')
    expect(momentoAas(36)).toBe('suspender-36')
  })
})

describe('classificação da PA', () => {
  it('leve 140–159/90–109; grave ≥ 160 e/ou ≥ 110', () => {
    expect(classificarPa(130, 85)).toBe('normal')
    expect(classificarPa(140, 80)).toBe('leve')
    expect(classificarPa(120, 90)).toBe('leve')
    expect(classificarPa(159, 109)).toBe('leve')
    expect(classificarPa(160, 90)).toBe('grave')
    expect(classificarPa(150, 110)).toBe('grave')
  })
})

describe('sulfato de magnésio', () => {
  it('mL da ampola: 4 g = 8 mL a 50%, 20 mL a 20%, 40 mL a 10%', () => {
    expect(mlDaAmpola(4, 0.5)).toBe(8)
    expect(mlDaAmpola(4, 0.2)).toBe(20)
    expect(mlDaAmpola(4, 0.1)).toBe(40)
    expect(mlDaAmpola(2, 0.5)).toBe(4)
  })

  it('Zuspan: 1 g/h a 100 mL/h; metade com creatinina ≥ 1,0', () => {
    expect(manutencao('zuspan', null).doseG).toBe(1)
    expect(manutencao('zuspan', 0.9).texto).toContain('100 mL/h')
    const renal = manutencao('zuspan', 1.0)
    expect(renal).toMatchObject({ doseG: 0.5, metade: true })
    expect(renal.texto).toContain('50 mL/h')
  })

  it('Pritchard: 5 g IM a cada 4 h (10 mL a 50%); metade com creatinina ≥ 1,0', () => {
    expect(manutencao('pritchard', 0.8).texto).toContain('10 mL de MgSO4 50%')
    const renal = manutencao('pritchard', 1.3)
    expect(renal.doseG).toBe(2.5)
    expect(renal.texto).toContain('5 mL de MgSO4 50%')
  })

  it('monitorização: reflexo presente, FR ≥ 16 e diurese ≥ 25 mL/h', () => {
    expect(monitorizar({ reflexo: true, fr: 16, diurese: 25 }).ok).toBe(true)
    const m = monitorizar({ reflexo: false, fr: 14, diurese: 20 })
    expect(m.ok).toBe(false)
    expect(m.falhas).toHaveLength(3)
    expect(monitorizar({ reflexo: true, fr: null, diurese: 30 }).incompleta).toBe(true)
  })
})
