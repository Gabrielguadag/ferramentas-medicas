import {
  avisoLeiteVaca,
  colheres,
  cuidados,
  etapa,
  inicioPrematuro,
  plano,
  suplementacao,
} from './alimentacao'

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

  it('sal: não adicionar até 12 meses (SBP); com moderação depois', () => {
    const t = (m: number) =>
      cuidados(m)
        .map((c) => c.texto)
        .join(' ')
    expect(t(11)).toContain('Não adicionar sal nas papas e refeições até 1 ano')
    expect(t(12)).toContain('Sal com moderação')
    expect(t(12)).not.toContain('Não adicionar sal')
  })

  it('suplementação de rotina (SBP): vitamina D e ferro, com limites de idade', () => {
    const t = (m: number) =>
      suplementacao(m)
        .map((c) => c.texto)
        .join(' ')
    expect(t(0)).toContain('400 UI por dia, da 1ª semana de vida até 12 meses')
    expect(t(11)).toContain('400 UI')
    expect(t(12)).toContain('600 UI por dia dos 12 aos 24 meses')
    expect(t(23)).toContain('600 UI')
    expect(t(5)).toContain('1 mg/kg por dia')
    expect(t(5)).toContain('6 meses (180 dias)')
    expect(suplementacao(24)).toEqual([])
  })

  it('preparo da fórmula: água bem quente (70 °C), mesmo se filtrada ou mineral', () => {
    const n = plano('formula', 3).notas.join(' ')
    expect(n).toContain('mesmo se for filtrada ou mineral')
    expect(n).toContain('cerca de 70 °C')
    expect(n).toContain('descartar a sobra')
  })

  it('ultraprocessados: só iogurtes adoçados ou com sabor', () => {
    const t = cuidados(8)
      .map((c) => c.texto)
      .join(' ')
    expect(t).toContain('iogurtes adoçados ou com sabor')
    expect(t).not.toContain('biscoitos, iogurtes, ')
  })

  it('suplementação: prematuro só mostra o esquema próprio, sem doses', () => {
    const t = suplementacao(5, 'materno', true)
    expect(t).toHaveLength(1)
    expect(t[0]?.texto).toContain('esquema próprio')
    expect(t[0]?.texto).not.toContain('UI')
  })

  it('suplementação: ferro aos 90 dias sem aleitamento exclusivo; NutriSUS; fórmula e vitamina D', () => {
    const j = (m: number, l: 'materno' | 'formula' | 'vaca') =>
      suplementacao(m, l)
        .map((c) => c.texto)
        .join(' ')
    expect(j(7, 'formula')).toContain('a partir dos 3 meses (90 dias)')
    expect(j(7, 'materno')).toContain('Apgar')
    expect(j(5, 'materno')).not.toContain('NutriSUS')
    expect(j(6, 'materno')).toContain('NutriSUS')
    expect(j(3, 'formula')).toContain('1.000 mL')
    expect(j(3, 'materno')).not.toContain('1.000 mL')
  })

  it('farinhas instantâneas: com ou sem açúcar', () => {
    const t = cuidados(8)
      .map((c) => c.texto)
      .join(' ')
    expect(t).toContain('farinhas instantâneas para mingau (com ou sem açúcar)')
  })

  it('antes de 6 meses: só os cuidados que cabem à idade', () => {
    const t = cuidados(2)
      .map((c) => c.texto)
      .join(' ')
    expect(t).toContain('Mel')
    expect(t).toContain('Leite de vaca integral')
    expect(t).not.toContain('Amendoim')
    expect(t).not.toContain('Carnes e ovos')
    expect(t).not.toContain('sal')
  })

  it('prematuro: início dos outros alimentos (>= 6 meses cronológicos e >= 4 corrigidos)', () => {
    expect(inicioPrematuro(6, 3).iniciou).toBe(false)
    expect(inicioPrematuro(6, null).iniciou).toBe(false)
    expect(inicioPrematuro(5, 4).iniciou).toBe(false)
    expect(inicioPrematuro(6, 4).iniciou).toBe(true)
    expect(inicioPrematuro(8, 5)).toEqual({ iniciou: true, mostrarAviso: true })
    expect(inicioPrematuro(12, 6).mostrarAviso).toBe(false)
  })

  it('fórmula aos 12 meses: avisa a troca pelo leite de vaca', () => {
    expect(plano('formula', 12).notas.join(' ')).toContain('A partir de 1 ano')
  })
})
