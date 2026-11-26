import { fromYmd } from '../shared/datas'
import { aniversarioDeMeses, correcao, fmtIdade, idadeEm, mesesCompletos } from './idade'

const d = fromYmd

describe('idade da criança', () => {
  it('meses completos no dia do "mesversário"', () => {
    expect(mesesCompletos(d(2026, 1, 15), d(2026, 2, 14))).toBe(0)
    expect(mesesCompletos(d(2026, 1, 15), d(2026, 2, 15))).toBe(1)
    expect(mesesCompletos(d(2025, 6, 10), d(2026, 6, 10))).toBe(12)
    expect(mesesCompletos(d(2026, 3, 1), d(2026, 2, 1))).toBe(-1)
  })

  it('nascido no dia 31: completa o mês no último dia dos meses curtos', () => {
    expect(aniversarioDeMeses(d(2026, 1, 31), 1)).toBe(d(2026, 2, 28))
    expect(mesesCompletos(d(2026, 1, 31), d(2026, 2, 27))).toBe(0)
    expect(mesesCompletos(d(2026, 1, 31), d(2026, 2, 28))).toBe(1)
    expect(mesesCompletos(d(2026, 1, 31), d(2026, 3, 30))).toBe(1)
    expect(mesesCompletos(d(2026, 1, 31), d(2026, 3, 31))).toBe(2)
    expect(aniversarioDeMeses(d(2023, 12, 31), 2)).toBe(d(2024, 2, 29))
  })

  it('formata a idade', () => {
    expect(fmtIdade(idadeEm(d(2026, 1, 1), d(2026, 1, 13))!)).toBe('12 dias')
    expect(fmtIdade(idadeEm(d(2026, 1, 1), d(2026, 2, 1))!)).toBe('1 mês')
    expect(fmtIdade(idadeEm(d(2026, 1, 10), d(2026, 5, 13))!)).toBe('4 meses e 3 dias')
    expect(fmtIdade(idadeEm(d(2024, 1, 10), d(2026, 6, 13))!)).toBe('2 anos e 5 meses')
    expect(fmtIdade(idadeEm(d(2023, 1, 10), d(2026, 1, 10))!)).toBe('3 anos')
    expect(idadeEm(d(2026, 2, 1), d(2026, 1, 1))).toBeNull()
  })

  it('idade corrigida: exemplo da Caderneta (faltaram 2 meses, 6 meses de vida → 4 meses)', () => {
    // Nasceu com 31s 4d: faltaram 59 dias para 40 semanas (jan. e fev. de 2026).
    const nasc = d(2026, 1, 1)
    const c = correcao(nasc, d(2026, 7, 1), 31 * 7 + 4)!
    expect(c.termo).toBe(d(2026, 3, 1))
    expect(mesesCompletos(nasc, d(2026, 7, 1))).toBe(6)
    expect(c.idade?.meses).toBe(4)
    expect(c.vale).toBe(true)
    expect(c.corrigirAteMeses).toBe(24)
  })

  it('idade corrigida: só < 37 semanas; até 2 anos (3 anos se < 28 semanas)', () => {
    const nasc = d(2024, 1, 1)
    expect(correcao(nasc, d(2024, 6, 1), 37 * 7)).toBeNull()
    expect(correcao(nasc, d(2024, 6, 1), 36 * 7 + 6)).not.toBeNull()
    expect(correcao(nasc, d(2025, 12, 31), 32 * 7)!.vale).toBe(true)
    expect(correcao(nasc, d(2026, 1, 1), 32 * 7)!.vale).toBe(false)
    expect(correcao(nasc, d(2026, 1, 1), 27 * 7)!.vale).toBe(true)
    expect(correcao(nasc, d(2027, 1, 1), 27 * 7)!.vale).toBe(false)
    // antes das 40 semanas corrigidas
    expect(correcao(nasc, d(2024, 1, 20), 30 * 7)!.idade).toBeNull()
  })
})
