import { fmtData, fromYmd, hojeIso, parseIso, toIso } from './datas'
import {
  compararDumUsg,
  dataParaIg,
  dppDe,
  dppNaegele,
  dumPorDpp,
  dumPorPeriodo,
  dumPorTransferencia,
  dumPorUsg,
  fmtIg,
  fmtIgLongo,
  igEm,
  situacao,
  trimestre,
} from './ig'

const d = (iso: string) => {
  const v = parseIso(iso)
  if (v === null) throw new Error(iso)
  return v
}

describe('datas', () => {
  it('ISO ida e volta, rejeita data inexistente', () => {
    expect(toIso(d('2026-02-28'))).toBe('2026-02-28')
    expect(parseIso('2026-02-30')).toBeNull()
    expect(parseIso('')).toBeNull()
    expect(fmtData(d('2026-03-05'))).toBe('05/03/2026')
    expect(hojeIso(new Date(2026, 10, 25, 23, 59))).toBe('2026-11-25')
  })
})

describe('idade gestacional (MS, Caderno de Atenção Básica 32)', () => {
  it('DPP = DUM + 280 dias', () => {
    expect(toIso(dppDe(d('2026-01-01')))).toBe('2026-10-08')
    // atravessa ano bissexto
    expect(toIso(dppDe(d('2027-06-01')))).toBe('2028-03-07')
  })

  it('regra de Näegele reproduz os três exemplos do Caderno 32', () => {
    expect(toIso(dppNaegele(d('2004-09-13')))).toBe('2005-06-20')
    expect(toIso(dppNaegele(d('2004-02-10')))).toBe('2004-11-17')
    expect(toIso(dppNaegele(d('2004-01-27')))).toBe('2004-11-03')
  })

  it('IG pela DUM: dias / 7', () => {
    const dum = d('2026-01-01')
    expect(fmtIg(igEm(dum, d('2026-01-01')))).toBe('0s 0d')
    expect(fmtIg(igEm(dum, d('2026-06-20')))).toBe('24s 2d')
    expect(fmtIgLongo(igEm(dum, d('2026-01-08')))).toBe('1 semana')
    expect(fmtIgLongo(igEm(dum, d('2026-06-20')))).toBe('24 semanas e 2 dias')
    expect(igEm(dum, d('2025-12-25')).totalDias).toBe(-7)
  })

  it('DUM incerta: início, meio e fim do mês → dias 5, 15 e 25', () => {
    expect(toIso(dumPorPeriodo(2026, 3, 'inicio'))).toBe('2026-03-05')
    expect(toIso(dumPorPeriodo(2026, 3, 'meio'))).toBe('2026-03-15')
    expect(toIso(dumPorPeriodo(2026, 3, 'fim'))).toBe('2026-03-25')
  })

  it('USG, DPP e FIV viram a mesma DUM equivalente', () => {
    const dum = d('2026-01-01')
    // USG em 2026-02-26 (8s 0d pela DUM) com laudo de 8s 0d
    expect(dumPorUsg(d('2026-02-26'), 8, 0)).toBe(dum)
    expect(dumPorDpp(d('2026-10-08'))).toBe(dum)
    // FIV: embrião de 5 dias → DPP = transferência + 261; de 3 dias → + 263 (ACOG CO 700)
    const t = d('2026-03-10')
    expect(dppDe(dumPorTransferencia(t, 5)) - t).toBe(261)
    expect(dppDe(dumPorTransferencia(t, 3)) - t).toBe(263)
  })

  it('data em que completa uma IG', () => {
    expect(toIso(dataParaIg(d('2026-01-01'), 28, 0))).toBe('2026-07-16')
  })

  it('trimestres e situação', () => {
    expect(trimestre(13 * 7 + 6)).toBe(1)
    expect(trimestre(14 * 7)).toBe(2)
    expect(trimestre(27 * 7 + 6)).toBe(2)
    expect(trimestre(28 * 7)).toBe(3)
    expect(situacao(-1)).toBe('antes-dum')
    expect(situacao(36 * 7 + 6)).toBe('em-curso')
    expect(situacao(37 * 7)).toBe('termo')
    expect(situacao(40 * 7)).toBe('prolongada')
    expect(situacao(41 * 7)).toBe('prolongada-41')
    expect(situacao(42 * 7)).toBe('pos-termo')
    expect(situacao(44 * 7 + 1)).toBe('implausivel')
  })
})

describe('DUM × ultrassonografia (ACOG CO 700, Tabela 1)', () => {
  const dum = fromYmd(2026, 1, 1)
  // exame em que a IG pela DUM é exatamente `s` semanas
  const exame = (s: number) => dum + s * 7

  it.each([
    // [IG pela DUM no exame, limite]
    [8, 5],
    [9, 7],
    [13, 7],
    [14, 7],
    [15, 7],
    [16, 10],
    [21, 10],
    [22, 14],
    [27, 14],
    [28, 21],
    [36, 21],
  ])('com %i semanas pela DUM, redata quando a diferença passa de %i dias', (s, limite) => {
    const igusg = s * 7 + limite // exatamente no limite: não redata
    const igusg2 = s * 7 + limite + 1
    const r1 = compararDumUsg(dum, exame(s), Math.floor(igusg / 7), igusg % 7)
    const r2 = compararDumUsg(dum, exame(s), Math.floor(igusg2 / 7), igusg2 % 7)
    expect(r1?.faixa.limite).toBe(limite)
    expect(r1?.redatar).toBe(false)
    expect(r2?.redatar).toBe(true)
    // diferença para menos também conta
    const igusg3 = s * 7 - limite - 1
    expect(compararDumUsg(dum, exame(s), Math.floor(igusg3 / 7), igusg3 % 7)?.redatar).toBe(true)
  })

  it('limites da faixa: 8s 6d ainda é > 5 dias; 9s 0d já é > 7 dias', () => {
    expect(compararDumUsg(dum, dum + 62, 8, 6)?.faixa.limite).toBe(5)
    expect(compararDumUsg(dum, dum + 63, 9, 0)?.faixa.limite).toBe(7)
  })

  it('exame antes da DUM é inválido; 3º trimestre é sinalizado', () => {
    expect(compararDumUsg(dum, dum - 1, 8, 0)).toBeNull()
    expect(compararDumUsg(dum, exame(30), 30, 0)?.terceiroTrimestre).toBe(true)
  })
})
