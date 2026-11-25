import vectors from './prevent.vectors.json'
import {
  type Horizon,
  type Model,
  type Outcome,
  preventRisk,
  roundHalfUp3,
  selectModel,
} from './prevent'

interface Inp {
  age: number
  sbp: number
  bp_tx: boolean | number
  total_c: number
  hdl_c: number
  statin: boolean | number
  dm: boolean | number
  smoking: boolean | number
  egfr: number
  bmi: number
  hba1c?: number | null
  uacr?: number | null
}

const toInput = (x: Inp, sex: 'M' | 'F') => ({
  age: x.age,
  sex,
  totalChol: x.total_c,
  hdl: x.hdl_c,
  sbp: x.sbp,
  bpTx: Boolean(x.bp_tx),
  statin: Boolean(x.statin),
  diabetes: Boolean(x.dm),
  smoker: Boolean(x.smoking),
  egfr: x.egfr,
  bmi: x.bmi,
  hba1c: x.hba1c ?? null,
  uacr: x.uacr ?? null,
})

const OUTCOMES: Outcome[] = ['total_cvd', 'ascvd', 'heart_failure']

describe('PREVENT reproduz os casos de teste do pacote de referência', () => {
  it('casos exatos (3 casas)', () => {
    expect(vectors.partial.length).toBeGreaterThan(0)
    for (const c of vectors.partial) {
      const i = toInput(c.inputs as Inp, c.sex === 'female' ? 'F' : 'M')
      const h = `${c.horizon_years}yr` as Horizon
      for (const o of OUTCOMES) {
        const got = roundHalfUp3(preventRisk(i, o, h, c.model as Model))
        expect({ case: c.name, h, o, got }).toEqual({
          case: c.name,
          h,
          o,
          got: (c.expected as Record<string, number>)[o],
        })
      }
    }
  })

  it('snapshots (percentual, 1 casa) e seleção automática do modelo', () => {
    expect(vectors.snapshots.length).toBeGreaterThan(0)
    for (const c of vectors.snapshots) {
      // "column" é "female"/"male" ou, quando time = "both", "female_10yr"/"male_30yr".
      const [sexCol, colHorizon] = c.column.split('_')
      const horizon = (c.time === 'both' ? colHorizon : c.time) as Horizon
      const i = toInput(c.inputs as Inp, sexCol === 'female' ? 'F' : 'M')
      expect(selectModel(i)).toBe(c.model)
      for (const o of OUTCOMES) {
        const pct = Math.round(preventRisk(i, o, horizon) * 1000) / 10
        expect({ call: c.call, o, pct }).toEqual({
          call: c.call,
          o,
          pct: (c.expected_pct as Record<string, number>)[o],
        })
      }
    }
  })
})
