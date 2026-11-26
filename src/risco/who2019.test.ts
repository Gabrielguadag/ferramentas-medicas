import data from './who2019.cells.json'
import {
  MG_DL_PER_MMOL,
  cholBand,
  whoCell,
  whoHearts,
  whoProblems,
  whoRiskContinuous,
} from './who2019'

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

  it('cortes de colesterol em mg/dL iguais ao aplicativo HEARTS/OPAS (bordas)', () => {
    const got = [154, 155, 192, 193, 231, 232, 269, 270].map(cholBand)
    expect(got).toEqual([1, 2, 2, 3, 3, 4, 4, 5])
    for (const [mg, band] of [
      [193, 3],
      [232, 4],
      [270, 5],
    ] as const) {
      const r = whoHearts({
        model: 'lab',
        age: 50,
        sex: 'M',
        smoker: false,
        sbp: 130,
        diabetes: false,
        totalCholMgDl: mg,
      })
      expect(r?.pct).toBe(whoCell('lab', 'M', false, false, 3, 2, band))
    }
  })

  it('fora das faixas da calculadora oficial (PA 90–200, colesterol 140–300) não calcula', () => {
    const base = { model: 'lab', age: 50, sex: 'M', smoker: false, diabetes: false } as const
    expect(whoHearts({ ...base, sbp: 89, totalCholMgDl: 200 })).toBeNull()
    expect(whoHearts({ ...base, sbp: 201, totalCholMgDl: 200 })).toBeNull()
    expect(whoHearts({ ...base, sbp: 130, totalCholMgDl: 139 })).toBeNull()
    expect(whoHearts({ ...base, sbp: 130, totalCholMgDl: 301 })).toBeNull()
    expect(whoHearts({ ...base, sbp: 90, totalCholMgDl: 140 })).not.toBeNull()
    expect(whoHearts({ ...base, sbp: 200, totalCholMgDl: 300 })).not.toBeNull()
    expect(whoProblems('lab', 130, 5.2)[0]).toContain('confira a unidade')
    expect(whoProblems('nonlab', 130, 5.2)).toEqual([])
  })
})
