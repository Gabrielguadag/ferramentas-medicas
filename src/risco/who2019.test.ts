import data from './who2019.cells.json'
import { MG_DL_PER_MMOL, whoCell, whoHearts, whoRiskContinuous } from './who2019'

describe('OMS 2019 / HEARTS (América Latina Tropical)', () => {
  it('reproduz as 2.100 células da calculadora HEARTS/OPAS', () => {
    expect(data.cells.length).toBe(2100)
    const wrong: number[][] = []
    for (const c of data.cells) {
      const [lab, male, smoker, dm, a, s, x, pct] = c as [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
      ]
      const got = whoCell(lab ? 'lab' : 'nonlab', male ? 'M' : 'F', smoker === 1, dm === 1, a, s, x)
      if (got !== pct) wrong.push([...c, got])
    }
    expect(wrong).toEqual([])
  })

  it('cálculo contínuo bate com a implementação de referência', () => {
    for (const c of data.continuous) {
      const x =
        c.model === 'lab' ? (c as { chol_mmol_L: number }).chol_mmol_L : (c as { bmi: number }).bmi
      const r = whoRiskContinuous(
        c.model as 'lab' | 'nonlab',
        c.sex === 'male' ? 'M' : 'F',
        c.age,
        c.sbp,
        c.smoker,
        x,
        Boolean((c as { diabetes?: boolean }).diabetes),
      )
      expect(r).toBeCloseTo(c.risk, 6)
    }
  })

  it('consulta por faixas como a calculadora', () => {
    const r = whoHearts({
      model: 'lab',
      age: 62,
      sex: 'M',
      smoker: true,
      sbp: 145,
      diabetes: true,
      totalCholMgDl: 5.5 * MG_DL_PER_MMOL,
    })
    expect(r?.pct).toBe(whoCell('lab', 'M', true, true, 5, 3, 3))
    expect(
      whoHearts({ model: 'lab', age: 50, sex: 'F', smoker: false, sbp: 120, totalCholMgDl: null }),
    ).toBeNull()
  })
})
