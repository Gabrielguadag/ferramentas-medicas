import {
  type Apresentacao,
  agulhasAComprar,
  ESQUEMA,
  PRODUTOS,
  cliquesNominais,
  contarCliques,
  dosesTabela,
  fmtMg,
  produto,
  rendimento,
} from './canetas'

function ap(prod: string, id: string): Apresentacao {
  const a = produto(prod)?.apresentacoes.find((x) => x.id === id)
  if (!a) throw new Error(`${prod}/${id} não existe`)
  return a
}

const cliques = (a: Apresentacao, mg: number) => {
  const c = contarCliques(a, mg)
  if (c.tipo !== 'ok') throw new Error(c.motivo)
  return c.opcoes.map((o) => o.cliques)
}

describe('dados das canetas', () => {
  it('conteúdo nominal confere com concentração × volume (bula)', () => {
    for (const p of PRODUTOS) {
      for (const a of p.apresentacoes) {
        expect(Math.abs(a.mgPorMl * a.volumeMl - a.mgTotal)).toBeLessThan(0.03)
      }
    }
  })

  it('marcas em ordem crescente e cliques crescentes', () => {
    for (const p of PRODUTOS) {
      for (const a of p.apresentacoes) {
        for (let i = 1; i < a.marcas.length; i++) {
          expect(a.marcas[i]!.mg).toBeGreaterThan(a.marcas[i - 1]!.mg)
          expect(a.marcas[i]!.cliques).toBeGreaterThan(a.marcas[i - 1]!.cliques)
        }
      }
    }
  })

  it('validade em uso: 6 semanas (Novo, Semavy) e 8 semanas (Ozivy, Semaclique)', () => {
    expect(produto('ozempic')?.validadeDias).toBe(42)
    expect(produto('wegovy')?.validadeDias).toBe(42)
    expect(produto('semavy')?.validadeDias).toBe(42)
    expect(produto('ozivy')?.validadeDias).toBe(56)
    expect(produto('semaclique')?.validadeDias).toBe(56)
  })
})

describe('contarCliques', () => {
  it('caneta de 1 mg (74 cliques): 0,25 → 18 ou 19; 0,5 → 37; 0,75 → 55 ou 56; 1 mg é marca', () => {
    const a = ap('ozempic', '1')
    expect(cliques(a, 0.25)).toEqual([18, 19])
    expect(cliques(a, 0.5)).toEqual([37])
    expect(cliques(a, 0.75)).toEqual([55, 56])
    const um = contarCliques(a, 1)
    expect(um.tipo === 'ok' && um.marcada).toBe(true)
    expect(cliques(a, 1)).toEqual([74])
  })

  it('similares de 1 mg usam a mesma referência de 74 cliques', () => {
    for (const id of ['ozivy', 'semavy', 'semaclique']) {
      expect(cliques(ap(id, '1'), 0.5)).toEqual([37])
    }
  })

  it('caneta de 0,25/0,5 mg: marcas da FDA (19 e 37) e intermediária proporcional a 0,5', () => {
    const a = ap('ozempic', '025-05')
    expect(cliques(a, 0.25)).toEqual([19])
    expect(cliques(a, 0.5)).toEqual([37])
    expect(cliques(a, 0.375)).toEqual([28]) // 27,75
  })

  it('Wegovy 2,4 mg (75 cliques)', () => {
    const a = ap('wegovy', '24')
    expect(cliques(a, 0.25)).toEqual([8]) // 7,81
    expect(cliques(a, 0.5)).toEqual([16]) // 15,63
    expect(cliques(a, 1)).toEqual([31]) // 31,25
    expect(cliques(a, 1.7)).toEqual([53]) // 53,13
    expect(cliques(a, 2)).toEqual([62, 63]) // 62,5
    expect(cliques(a, 2.4)).toEqual([75])
  })

  it('Wegovy 1,7 mg (75 cliques): 1 mg → 44', () => {
    expect(cliques(ap('wegovy', '17'), 1)).toEqual([44]) // 44,1
  })

  it('a dose de cada opção é cliques × mg por clique', () => {
    const c = contarCliques(ap('ozempic', '1'), 0.25)
    expect(c.tipo).toBe('ok')
    if (c.tipo === 'ok') {
      expect(c.opcoes[0]!.mg).toBeCloseTo(18 / 74, 6)
      expect(c.opcoes[1]!.mg).toBeCloseTo(19 / 74, 6)
    }
  })

  it('recusa dose zero, acima da caneta ou menor que 1 clique', () => {
    const a = ap('ozempic', '1')
    expect(contarCliques(a, 0).tipo).toBe('invalida')
    expect(contarCliques(a, 1.2).tipo).toBe('invalida')
    expect(contarCliques(a, 0.005).tipo).toBe('invalida')
    expect(contarCliques(ap('wegovy', '17'), 2.4).tipo).toBe('invalida')
  })
})

describe('rendimento', () => {
  it('cliques nominais: 4 doses da marca de referência', () => {
    expect(cliquesNominais(ap('ozempic', '1'))).toBe(296)
    expect(cliquesNominais(ap('ozempic', '025-05'))).toBe(148)
    expect(cliquesNominais(ap('wegovy', '24'))).toBe(300)
  })

  it('0,25 mg na caneta de 1 mg: a validade limita (6 na Novo, 8 no Ozivy)', () => {
    const r = rendimento(produto('ozempic')!, ap('ozempic', '1'), 19)
    expect(r).toEqual({ peloConteudo: 15, pelaValidade: 6, aplicacoes: 6, limite: 'validade' })
    expect(rendimento(produto('ozivy')!, ap('ozivy', '1'), 19).aplicacoes).toBe(8)
  })

  it('dose cheia: o conteúdo limita (4 aplicações)', () => {
    const r = rendimento(produto('wegovy')!, ap('wegovy', '24'), 75)
    expect(r.aplicacoes).toBe(4)
    expect(r.limite).toBe('conteudo')
  })
})

describe('agulhas', () => {
  it('agulhas na caixa (bula): 6 na caneta de 1,5 mL do Ozempic, 4 nas demais', () => {
    expect(ap('ozempic', '025-05').agulhasNaCaixa).toBe(6)
    expect(ap('ozempic', '1').agulhasNaCaixa).toBe(4)
    expect(ap('ozivy', '1').agulhasNaCaixa).toBe(4)
    expect(ap('wegovy', '24').agulhasNaCaixa).toBe(4)
  })

  it('comprar = aplicações além das agulhas da caixa', () => {
    expect(agulhasAComprar(ap('ozivy', '1'), 8)).toBe(4)
    expect(agulhasAComprar(ap('ozempic', '1'), 6)).toBe(2)
    expect(agulhasAComprar(ap('ozempic', '1'), 4)).toBe(0)
  })

  it('cada marca tem o tipo de agulha da bula', () => {
    expect(produto('ozivy')?.agulha).toMatch(/Ultra-Fine 0,23 mm \(32G\) × 4 mm/)
    expect(produto('semavy')?.agulha).toMatch(/BD Ultra-Fine/)
    expect(produto('wegovy')?.agulha).toMatch(/NovoFine/)
  })
})

describe('tabela e esquema', () => {
  it('doses da tabela respeitam o máximo da caneta', () => {
    expect(dosesTabela(ap('ozempic', '1'))).toEqual([
      0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1,
    ])
    expect(dosesTabela(ap('wegovy', '17'))).toEqual([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.7])
    expect(dosesTabela(ap('wegovy', '025'))).toEqual([0.125, 0.25])
  })

  it('esquemas da bula: DM2 até 1 mg; peso até 2,4 mg em 16 semanas', () => {
    expect(ESQUEMA.dm2.map((e) => e.doseMg)).toEqual([0.25, 0.5, 1])
    expect(ESQUEMA.peso.map((e) => e.doseMg)).toEqual([0.25, 0.5, 1, 1.7, 2.4])
    expect(ESQUEMA.peso[4]!.semanaInicio).toBe(17)
  })

  it('fmtMg', () => {
    expect(fmtMg(0.25)).toBe('0,25')
    expect(fmtMg(0.125)).toBe('0,125')
    expect(fmtMg(1)).toBe('1')
    expect(fmtMg(18 / 74, 3)).toBe('0,243')
  })
})
