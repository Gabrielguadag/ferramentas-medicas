import { avisoLeiteVaca, colheres, cuidados, etapa, plano } from './alimentacao'

const nomes = (leite: Parameters<typeof plano>[0], m: number) =>
  plano(leite, m).refeicoes.map((r) => r.nome)

describe('introdução alimentar (Guia alimentar para menores de 2 anos)', () => {
  it('leite materno: exclusivo até 6 meses, sem outras refeições', () => {
    const p = plano('materno', 5)
    expect(p.refeicoes).toHaveLength(0)
    expect(p.notas.join(' ')).toContain('sem água, chá ou qualquer outro alimento')
  })

  it('leite materno: 6 meses só almoço; 7 a 8 meses almoço e jantar', () => {
    const p6 = plano('materno', 6)
    expect(p6.refeicoes.find((r) => r.nome === 'Jantar')?.oferta).toBe('leite materno')
    expect(p6.refeicoes.find((r) => r.nome === 'Almoço')?.oferta).toContain('2 a 3 colheres')
    const p7 = plano('materno', 7)
    expect(p7.refeicoes.find((r) => r.nome === 'Jantar')?.oferta).toContain('3 a 4 colheres')
  })

  it('quantidades por idade', () => {
    expect(colheres(6)).toBe('2 a 3 colheres de sopa')
    expect(colheres(8)).toBe('3 a 4 colheres de sopa')
    expect(colheres(9)).toBe('4 a 5 colheres de sopa')
    expect(colheres(11)).toBe('4 a 5 colheres de sopa')
    expect(colheres(12)).toBe('5 a 6 colheres de sopa')
    expect(colheres(23)).toBe('5 a 6 colheres de sopa')
    expect(colheres(24)).toBeNull()
  })

  it('fórmula: novos alimentos aos 6 meses; fórmula até 1 ano (leite de vaca não indicado)', () => {
    expect(plano('formula', 5).refeicoes).toHaveLength(0)
    expect(nomes('formula', 6)).toContain('Entre o lanche e a ceia')
    expect(plano('formula', 8).refeicoes[0]?.oferta).toBe('fórmula infantil')
    expect(plano('formula', 9).refeicoes[0]?.oferta).toBe('fórmula infantil')
    expect(plano('formula', 9).notas.join(' ')).toContain(
      'alternativa não indicada em condições gerais',
    )
  })

  it('leite de vaca: modificado antes de 4 meses; alimentos a partir de 4; até 500 mL/dia', () => {
    expect(plano('vaca', 3).refeicoes).toHaveLength(0)
    expect(plano('vaca', 3).notas.join(' ')).toContain('não pode ser oferecido sem diluição')
    expect(plano('vaca', 4).refeicoes.find((r) => r.nome === 'Jantar')?.oferta).toBe(
      'leite de vaca integral',
    )
    expect(plano('vaca', 5).refeicoes.find((r) => r.nome === 'Jantar')?.oferta).toBe(
      'igual ao almoço',
    )
    expect(plano('vaca', 5).notas.join(' ')).toContain('500 mL')
    expect(plano('vaca', 10).refeicoes.find((r) => r.nome === 'Almoço')?.oferta).toContain(
      '4 a 5 colheres',
    )
  })

  it('leite de vaca: não recomendado antes de 6 meses; alternativa do MS não indicada de 6 a 11', () => {
    expect(avisoLeiteVaca(5)?.rotulo).toBe('não recomendado; só quando não há outra opção')
    expect(avisoLeiteVaca(6)?.rotulo).toBe('alternativa do MS, não indicada em condições gerais')
    expect(avisoLeiteVaca(11)?.rotulo).toBe('alternativa do MS, não indicada em condições gerais')
    expect(avisoLeiteVaca(12)).toBeNull()
    const t = (m: number) =>
      cuidados(m)
        .map((c) => c.texto)
        .join(' ')
    expect(t(3)).toContain('não recomendado antes dos 6 meses')
    expect(t(3)).not.toContain('não indicado em condições gerais')
    expect(t(6)).toContain('não indicado em condições gerais')
  })

  it('a partir de 2 anos: Guia para a População Brasileira', () => {
    expect(plano('materno', 24).notas.join(' ')).toContain('Guia Alimentar para a População')
    expect(etapa(24)).toBeNull()
    expect(etapa(5)).toBeNull()
    expect(etapa(10)?.titulo).toBe('Entre 9 e 11 meses')
  })

  it('cuidados mudam com a idade', () => {
    const t = (m: number) =>
      cuidados(m)
        .map((c) => c.texto)
        .join(' ')
    expect(t(8)).toContain('não oferecer antes de 1 ano')
    expect(t(8)).toContain('antes de 1 ano: não indicado em condições gerais')
    expect(t(11)).toContain('antes de 1 ano: não indicado em condições gerais')
    expect(t(13)).toContain('120 mL')
    expect(t(13)).not.toContain('antes de 1 ano: não indicado em condições gerais')
    expect(t(13)).toContain('Mel')
    expect(t(30)).not.toContain('Mel')
    expect(t(30)).toContain('ultraprocessados')
    expect(t(13)).toContain('Composto lácteo: não é leite em pó nem fórmula')
    expect(t(30)).not.toContain('Composto lácteo')
    expect(plano('formula', 3).notas.join(' ')).toContain(
      'Composto lácteo: não é leite em pó nem fórmula',
    )
    expect(t(40)).not.toContain('120 mL')
  })
})
