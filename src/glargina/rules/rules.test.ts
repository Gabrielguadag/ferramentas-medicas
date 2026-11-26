import {
  basalCeiling,
  bolusDose,
  correctionByAlgorithm,
  correctionByFactor,
  factorFromDtdi,
  fixedAboveRange,
  nphStart,
  secondNphDose,
} from './insulina'
import { evaluateGoals } from './metas'
import { basalAlert, convertNphToGlargine, dtdiAfterSwitch, tubetesFor, uiPerKg } from './migracao'
import { outOfScope } from './escopo'
import { dapagliflozinCriteria, pcdtFlow } from './pcdt'
import { titrate } from './titulacao'
import { eligibility } from '../sources'

describe('migração (NT 169, Quadros 3 e 4)', () => {
  it('1:1 com NPH 1x/dia; −20% com 2x ou mais (exemplo da NT: 30 → 24)', () => {
    expect(convertNphToGlargine(30, 1).glargine).toBe(30)
    expect(convertNphToGlargine(30, 2)).toMatchObject({ glargine: 24, rule: 'reduce20' })
    expect(convertNphToGlargine(33, 2)).toMatchObject({ glargine: 26, exact: 26.4 })
  })
  it('UI/kg e alerta de excesso de basal', () => {
    expect(uiPerKg(24, 70)).toBe(0.34)
    expect(basalAlert('DM2', 36, 70, null).active).toBe(true)
    expect(basalAlert('DM2', 35, 70, null).active).toBe(false)
    expect(basalAlert('DM1', 31, 70, 60).active).toBe(true)
    // o critério de DTDI é da NT para crianças e adolescentes
    expect(basalAlert('DM1', 31, 70, 60, 15).active).toBe(true)
    expect(basalAlert('DM1', 31, 70, 60, 72).active).toBe(false)
  })
  it('DM1: a DTDI do alerta já tem a glargina no lugar da NPH', () => {
    // NPH 30 U (2x) + rápida 20 U: DTDI 50; glargina 24; DTDI nova 44; 24/44 = 54,5% (> 50%)
    const conv = convertNphToGlargine(30, 2)
    const novo = dtdiAfterSwitch(50, 30, conv.glargine)
    expect(novo).toBe(44)
    expect(basalAlert('DM1', conv.glargine, null, novo).active).toBe(true)
    expect(basalAlert('DM1', conv.glargine, null, 50).active).toBe(false)
    expect(dtdiAfterSwitch(null, 30, 24)).toBeNull()
  })
  it('tubetes: 300 UI e no máximo 28 dias depois de aberto', () => {
    expect(tubetesFor(24, 30, 2)).toMatchObject({ tubetes: 3, byVolume: 3, byExpiry: 2 }) // 26×30/300 = 2,6
    expect(tubetesFor(8, 30, 2)).toMatchObject({ tubetes: 2, byVolume: 1, byExpiry: 2 })
    expect(tubetesFor(8, 28, 2).tubetes).toBe(1)
  })
  it('elegibilidade (item 3.1)', () => {
    expect(eligibility(10, 'DM1').kind).toBe('eligible')
    expect(eligibility(70, 'DM2').kind).toBe('eligible')
    expect(eligibility(69, 'DM2').kind).toBe('not-eligible')
    expect(eligibility(30, 'DM1').kind).toBe('not-eligible')
    expect(eligibility(30, 'DM1')).toMatchObject({ reason: expect.stringContaining('não cobre') })
  })
})

describe('titulação (PCDT 8.3.4.1 e Figura 3)', () => {
  it('acima da meta: +2 U; na meta: manter', () => {
    expect(titrate([150, 160, 170], 'adulto')?.action).toBe('aumentar-2')
    expect(titrate([100, 110, 120], 'adulto')?.action).toBe('manter')
  })
  it('jejum < 70 ou hipoglicemia noturna: −2 a −4 U; < 80: −2 U', () => {
    expect(titrate([65, 200, 200], 'adulto')?.action).toBe('reduzir-2-4')
    expect(titrate([110, 110, 110], 'adulto', true)?.action).toBe('reduzir-2-4')
    expect(titrate([78, 120, 120], 'adulto')?.action).toBe('reduzir-2')
  })
  it('meta pelo perfil (NT, Quadro 5)', () => {
    expect(titrate([140, 140, 140], 'idoso-comprometido')?.action).toBe('manter')
    expect(titrate([140, 140, 140], 'adulto')?.action).toBe('aumentar-2')
    expect(titrate([85, 85, 85], 'idoso-muito-comprometido')?.action).toBe('manter-avaliar')
  })
  it('compara a média sem arredondar (130,33 já está acima de 130)', () => {
    expect(titrate([130, 130, 131], 'adulto')?.action).toBe('aumentar-2') // 130,33 (antes arredondava para 130)
    expect(titrate([131, 131, 130], 'adulto')?.action).toBe('aumentar-2') // 130,67
    expect(titrate([130, 130, 130], 'adulto')?.action).toBe('manter')
  })
  it('limiares 70 e 80 (jejum mínimo)', () => {
    expect(titrate([70, 120, 120], 'adulto')?.action).toBe('reduzir-2')
    expect(titrate([69, 120, 120], 'adulto')?.action).toBe('reduzir-2-4')
    expect(titrate([80, 120, 120], 'adulto')?.action).toBe('manter')
  })
  it('sem dados, sem resultado', () => {
    expect(titrate([null, null, null], 'adulto')).toBeNull()
  })
})

describe('escopo: DM2 adulto (Figura 2 e 8.3.4 do PCDT)', () => {
  it('DM1 e menores de 18 anos ficam fora; perfil criança também', () => {
    expect(outOfScope(40, 'DM1')).toBe(true)
    expect(outOfScope(17, 'DM2')).toBe(true)
    expect(outOfScope(18, 'DM2')).toBe(false)
    expect(outOfScope(null, 'DM2')).toBe(false)
    expect(outOfScope(30, 'DM2', 'crianca')).toBe(true)
    expect(outOfScope(30, 'DM2', 'adulto')).toBe(false)
  })
})

describe('insulinização (PCDT 8.3.4)', () => {
  it('10 U passa de 0,2 U/kg abaixo de 50 kg', () => {
    expect(fixedAboveRange(49)).toBe(true)
    expect(fixedAboveRange(50)).toBe(false)
    expect(fixedAboveRange(null)).toBe(false)
  })
  it('NPH inicial: 10 U ou 0,1–0,2 U/kg; teto de basal', () => {
    expect(nphStart(70)).toEqual({ fixed: 10, range: [7, 14] })
    expect(basalCeiling(80)).toBe(40)
    expect(basalCeiling(71)).toBe(35.5)
    expect(basalCeiling(null)).toBeNull()
  })
  it('segunda dose: 80% dividido 2/3 e 1/3', () => {
    expect(secondNphDose(30)).toEqual({ total: 24, morning: 16, bedtime: 8 })
    // as duas doses somam o total (33 × 0,8 = 26,4 → 26 = 18 + 8)
    expect(secondNphDose(33)).toEqual({ total: 26, morning: 18, bedtime: 8 })
  })
  it('Quadro 8: algoritmo de correção', () => {
    expect([45, 60, 100, 130, 131, 180, 200, 250, 300, 350].map(correctionByAlgorithm)).toEqual([
      -2, -1, 0, 0, 1, 1, 2, 3, 4, 5,
    ])
    // bordas
    expect([49, 50, 69, 70, 230, 231, 280, 281, 330, 331].map(correctionByAlgorithm)).toEqual([
      -2, -1, -1, 0, 2, 3, 3, 4, 4, 5,
    ])
  })
  it('Quadro 7: exemplo do PCDT (190, LSOG 130, FC 50, prandial 7 → 8 U)', () => {
    const c = correctionByFactor(190, 130, 50)
    expect(c).toBeCloseTo(1.2)
    expect(bolusDose(7, c, 190)).toMatchObject({ exact: 8.2, total: 8, hypo: false })
    expect(factorFromDtdi(60)).toBe(30)
    expect(bolusDose(1, -2, 45)).toMatchObject({ total: 0, hypo: true })
  })
})

describe('metas (NT 169, Quadro 5)', () => {
  it('HbA1c estrita e jejum/pós-prandial avaliados', () => {
    expect(evaluateGoals('adulto', 7.0, null, null).hba1c).toBe('fora-da-meta')
    expect(evaluateGoals('adulto', 6.9, 100, 150).overall).toBe('na-meta')
    expect(evaluateGoals('idoso-comprometido', 7.9, 140, 170).overall).toBe('na-meta')
    expect(evaluateGoals('idoso-muito-comprometido', null, null, null).overall).toBe('individual')
  })
})

describe('fluxograma do PCDT (Figura 2)', () => {
  const base = {
    monthsSinceDiagnosis: '3-ou-mais' as const,
    hasRiskFactor: true,
    atGoal: false,
    insulinIndication: false,
    dapagliflozinEligible: null,
  }
  it('ramos', () => {
    expect(
      pcdtFlow({ ...base, monthsSinceDiagnosis: 'menos-3', hasRiskFactor: false, stage: 'inicio' })
        .next,
    ).toBe('mev')
    expect(pcdtFlow({ ...base, stage: 'inicio' }).next).toBe('metformina')
    expect(pcdtFlow({ ...base, stage: 'metformina' }).next).toBe('sulfonilureia')
    expect(pcdtFlow({ ...base, stage: 'metformina-su', dapagliflozinEligible: true }).next).toBe(
      'dapagliflozina',
    )
    expect(pcdtFlow({ ...base, stage: 'metformina-su', dapagliflozinEligible: false }).next).toBe(
      'insulina',
    )
    expect(
      pcdtFlow({
        ...base,
        monthsSinceDiagnosis: 'menos-3',
        hasRiskFactor: false,
        stage: 'metformina-su',
      }).next,
    ).toBe('insulina')
    expect(pcdtFlow({ ...base, stage: 'metformina', atGoal: true }).next).toBe('monitorar')
    expect(pcdtFlow({ ...base, stage: 'inicio', insulinIndication: true }).next).toBe('insulina')
  })
  it('conduta de insulina mantém a metformina; metformina e sulfonilureia trazem os limites de TFG', () => {
    const ins = pcdtFlow({ ...base, stage: 'inicio', insulinIndication: true })
    expect(ins.notes.join(' ')).toContain('Manter a metformina')
    expect(ins.notes.join(' ')).toContain('sulfonilureia')
    expect(pcdtFlow({ ...base, stage: 'inicio' }).notes.join(' ')).toContain('TFG < 30')
    const su = pcdtFlow({ ...base, stage: 'metformina' }).notes.join(' ')
    expect(su).toContain('TFG < 30')
    expect(su).toContain('a partir de 60 anos')
  })
  it('dapagliflozina: homem ≥ 55, mulher ≥ 60 (texto do PCDT)', () => {
    expect(
      dapagliflozinCriteria({ age: 45, sex: 'M', establishedCvd: true, highRiskFactor: false })
        .eligible,
    ).toBe(true)
    expect(
      dapagliflozinCriteria({ age: 55, sex: 'M', establishedCvd: false, highRiskFactor: true })
        .eligible,
    ).toBe(true)
    expect(
      dapagliflozinCriteria({ age: 54, sex: 'M', establishedCvd: false, highRiskFactor: true })
        .eligible,
    ).toBe(false)
    expect(
      dapagliflozinCriteria({ age: 59, sex: 'F', establishedCvd: false, highRiskFactor: true })
        .eligible,
    ).toBe(false)
  })
  it('dapagliflozina: resposta em branco não vira "não"', () => {
    const d = (o: Partial<Parameters<typeof dapagliflozinCriteria>[0]>) =>
      dapagliflozinCriteria({
        age: 57,
        sex: 'F',
        establishedCvd: null,
        highRiskFactor: null,
        ...o,
      }).eligible
    expect(d({})).toBeNull()
    expect(d({ age: null })).toBeNull()
    expect(d({ establishedCvd: false, highRiskFactor: false })).toBe(false)
    expect(d({ sex: 'M', establishedCvd: false, highRiskFactor: null })).toBeNull()
    expect(d({ establishedCvd: true })).toBe(true)
    // 55–59 anos depende do sexo; sexo não informado não decide
    expect(d({ sex: null, establishedCvd: false, highRiskFactor: true })).toBeNull()
    expect(d({ sex: 'M', establishedCvd: false, highRiskFactor: true })).toBe(true)
    expect(d({ sex: null, age: 62, establishedCvd: false, highRiskFactor: true })).toBe(true)
    expect(d({ sex: null, age: 50, establishedCvd: false, highRiskFactor: true })).toBe(false)
  })
  it('sulfonilureia com resposta pendente pede para completar, sem concluir insulina', () => {
    const r = pcdtFlow({ ...base, stage: 'metformina-su', dapagliflozinEligible: null })
    expect(r.next).toBe('avaliar-dapagliflozina')
    expect(r.conduct).toContain('complete')
  })
})
