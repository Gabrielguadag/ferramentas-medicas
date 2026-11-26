import { omsPreclass, pcdt2026, sbc2025, sbd2026 } from './escalas'
import { ckdEpi2021, emptyInputs, renalGrid } from './inputs'
import type { PreventResult } from './prevent'

const base = (over: Partial<ReturnType<typeof emptyInputs>> = {}) => ({
  ...emptyInputs(),
  age: 55,
  ...over,
})
const prev = (ascvdPct: number): PreventResult => ({
  model: 'base',
  tenYear: { total_cvd: 0, ascvd: ascvdPct / 100, heart_failure: 0 },
  thirtyYear: null,
  bmiMissing: false,
})

describe('CKD-EPI 2021 e grade renal', () => {
  it('CKD-EPI 2021 sem raça', () => {
    // Homem 50 anos, creatinina 1,0 → 142 × (1/0,9)^-1,2 × 0,9938^50 ≈ 92
    expect(ckdEpi2021(1.0, 50, 'M')).toBe(92)
    // Mulher 60 anos, creatinina 0,7 → 142 × 0,9938^60 × 1,012 ≈ 99
    expect(ckdEpi2021(0.7, 60, 'F')).toBe(99)
  })
  it('grade TFG × albuminúria (SBC Tab. 4.7)', () => {
    expect(renalGrid(95, 10)).toBe('ver-idade')
    expect(renalGrid(95, 100)).toBe('alto')
    expect(renalGrid(95, 400)).toBe('muito-alto')
    expect(renalGrid(50, 10)).toBe('alto')
    expect(renalGrid(40, 10)).toBe('alto')
    expect(renalGrid(40, 100)).toBe('muito-alto')
    expect(renalGrid(25, null)).toBe('muito-alto')
  })
})

describe('SBC 2025', () => {
  it('diabetes sem estratificadores: idade define intermediário ou alto', () => {
    expect(sbc2025(base({ age: 49 }), null).category).toBe('intermediario')
    expect(sbc2025(base({ age: 50 }), null).category).toBe('alto')
    expect(sbc2025(base({ age: 55, sex: 'F' }), null).category).toBe('intermediario')
    expect(sbc2025(base({ age: 56, sex: 'F' }), null).category).toBe('alto')
  })
  it('1–2 EAR = alto; 3 EAR ou EMAR = muito alto', () => {
    expect(sbc2025(base({ age: 30, hypertension: true }), null).category).toBe('alto')
    expect(
      sbc2025(base({ hypertension: true, smoker: true, metabolicSyndrome: true }), null).category,
    ).toBe('muito-alto')
    expect(sbc2025(base({ retinopathy: 'moderada-grave' }), null).category).toBe('muito-alto')
    expect(sbc2025(base({ ldl: 195 }), null).category).toBe('muito-alto')
  })
  it('evento prévio: muito alto; com 2 condições de alto risco: extremo', () => {
    expect(sbc2025(base({ diabetes: false, priorMi: true }), null).category).toBe('muito-alto')
    expect(sbc2025(base({ priorMi: true, hypertension: true }), null).category).toBe('extremo') // DM + HAS
  })
  it('sem diabetes: PREVENT e agravantes', () => {
    const nd = (o = {}) => base({ diabetes: false, ...o })
    expect(sbc2025(nd(), prev(3)).category).toBe('baixo')
    expect(sbc2025(nd({ aggravators: ['x'] }), prev(3)).category).toBe('intermediario')
    expect(sbc2025(nd({ ldl: 170 }), prev(3)).category).toBe('intermediario')
    expect(sbc2025(nd(), prev(10)).category).toBe('intermediario')
    expect(sbc2025(nd({ lpaMgDl: 60 }), prev(10)).category).toBe('alto')
    expect(sbc2025(nd(), prev(25)).category).toBe('alto')
    expect(sbc2025(nd({ ldl: 190 }), prev(3)).category).toBe('alto')
    expect(sbc2025(nd({ cac: 350 }), prev(3)).category).toBe('muito-alto')
    expect(sbc2025(nd(), null).category).toBe('indeterminado')
  })
  it('metas da Tab. 5.1', () => {
    expect(sbc2025(base({ age: 60 }), null).target?.ldl).toBe('< 70')
  })
})

describe('SBD 2026', () => {
  it('idade sem estratificadores', () => {
    expect(sbd2026(base({ age: 37 })).category).toBe('baixo')
    expect(sbd2026(base({ age: 38 })).category).toBe('intermediario')
    expect(sbd2026(base({ age: 50 })).category).toBe('alto')
    expect(sbd2026(base({ age: 45, sex: 'F' })).category).toBe('baixo')
    expect(sbd2026(base({ age: 56, sex: 'F' })).category).toBe('alto')
  })
  it('LDL > 190 é EAR na SBD (e EMAR na SBC)', () => {
    expect(sbd2026(base({ age: 30, ldl: 195 })).category).toBe('alto')
  })
  it('não se aplica sem diabetes', () => {
    expect(sbd2026(base({ diabetes: false })).applicable).toBe(false)
  })
})

describe('PCDT DM2 2026', () => {
  it('40–74 anos: alto; com DCV: muito alto', () => {
    expect(pcdt2026(base({ age: 50 })).category).toBe('alto')
    expect(pcdt2026(base({ age: 50, ischemicStroke: true })).category).toBe('muito-alto')
  })
  it('≤ 39 e ≥ 75: individualizado (≤ 39 com nefro/retinopatia = alto)', () => {
    expect(pcdt2026(base({ age: 35 })).category).toBe('individual')
    expect(pcdt2026(base({ age: 35, nephropathy: true })).category).toBe('alto')
    expect(pcdt2026(base({ age: 80 })).category).toBe('individual')
  })
})

describe('correções da revisão (RCV)', () => {
  it('revascularização isolada não conta duas vezes: muito alto, não extremo', () => {
    expect(sbc2025(base({ revascularization: true }), null).category).toBe('muito-alto')
    expect(
      sbc2025(base({ revascularization: true, revascOutsideEvent: true }), null).category,
    ).toBe('extremo')
  })
  it('anti-hipertensivo conta como hipertensão', () => {
    expect(sbc2025(base({ age: 30, onBpMeds: true }), null).category).toBe('alto')
    expect(sbd2026(base({ age: 30, onBpMeds: true })).category).toBe('alto')
  })
  it('DM1: regra de >20 anos só com "após os 18 anos" marcado', () => {
    const dm1 = { dmType: 'DM1' as const, dmYears: 25 }
    expect(sbc2025(base({ ...dm1 }), null).category).toBe('individual')
    expect(sbd2026(base({ ...dm1 })).category).toBe('individual')
    expect(sbd2026(base({ ...dm1, dmDiagnosedAfter18: false })).category).toBe('individual')
    expect(sbd2026(base({ ...dm1, dmDiagnosedAfter18: true })).category).toBe('muito-alto')
    expect(sbc2025(base({ ...dm1, dmDiagnosedAfter18: true }), null).category).toBe('muito-alto')
    expect(sbd2026(base({ dmType: 'DM1', dmYears: 5 })).category).toBe('indeterminado')
    expect(sbd2026(base({ dmType: 'DM1', dmYears: null })).notes[0]).toContain('Informe o tempo')
  })
  it('menor de 18 anos: fora do escopo em todas as escalas', () => {
    expect(sbc2025(base({ age: 17 }), null).applicable).toBe(false)
    expect(sbd2026(base({ age: 17 })).applicable).toBe(false)
    expect(pcdt2026(base({ age: 17 })).applicable).toBe(false)
    expect(sbd2026(base({ age: 18 })).applicable).toBe(true)
  })
  it('PCDT: bordas 39/40/74/75 e idade decimal', () => {
    expect(pcdt2026(base({ age: 39 })).category).toBe('individual')
    expect(pcdt2026(base({ age: 39.5 })).category).toBe('individual')
    expect(pcdt2026(base({ age: 40 })).category).toBe('alto')
    expect(pcdt2026(base({ age: 74 })).category).toBe('alto')
    expect(pcdt2026(base({ age: 75 })).category).toBe('individual')
  })
  it('dado não informado vira aviso, não "sem estratificadores"', () => {
    const r = sbc2025(base({ age: 45 }), null)
    expect(r.reasons[0]).toContain('nenhum estratificador marcado')
    expect(r.notes.join(' ')).toContain('Não informado')
  })
  it('TFGe < 15 (diálise): aviso sobre estatina (SBD R10)', () => {
    expect(sbd2026(base({ egfr: 10 })).notes.join(' ')).toContain('diálise')
    expect(sbd2026(base({ egfr: 40, uacr: 10 })).notes.join(' ')).not.toContain('diálise')
  })
})

describe('OMS/HEARTS: classificação direta', () => {
  it('DCV = muito alto; DRC = alto; DM2 de 40 a 74 = alto; sem percentual', () => {
    expect(omsPreclass(base({ priorMi: true }))?.category).toBe('Muito alto')
    expect(omsPreclass(base({ priorMi: true, egfr: 40 }))?.category).toBe('Muito alto')
    expect(omsPreclass(base({ diabetes: false, egfr: 55 }))?.category).toBe('Alto')
    expect(omsPreclass(base({ egfr: 60, age: 50 }))?.category).toBe('Alto') // DM2 40-74
    expect(omsPreclass(base({ diabetes: false, egfr: 60 }))).toBeNull()
  })
  it('DM1 ou fora de 40–74 anos não é classificado direto', () => {
    expect(omsPreclass(base({ dmType: 'DM1' }))).toBeNull()
    expect(omsPreclass(base({ age: 39 }))).toBeNull()
    expect(omsPreclass(base({ age: 75 }))).toBeNull()
    expect(omsPreclass(base({ age: 74 }))?.category).toBe('Alto')
  })
})
