import { QUADRO_1, caminhoGlargina, fmtFaixa, porPeso } from './inicioGlargina'

describe('caminhoGlargina', () => {
  it('DM2 adulto segue o PCDT; DM2 < 18 ou perfil criança fica fora', () => {
    expect(caminhoGlargina(75, 'DM2', 'adulto')).toBe('dm2')
    expect(caminhoGlargina(50, 'DM2', 'adulto')).toBe('dm2')
    expect(caminhoGlargina(16, 'DM2', 'adulto')).toBe('fora')
    expect(caminhoGlargina(40, 'DM2', 'crianca')).toBe('fora')
  })

  it('DM1 de 2 a 17 anos usa o Quadro 1 da NT 169', () => {
    expect(caminhoGlargina(2, 'DM1', 'crianca')).toBe('dm1-crianca')
    expect(caminhoGlargina(17, 'DM1', 'crianca')).toBe('dm1-crianca')
  })

  it('DM1 adulto (18 anos ou mais) fica fora; menos de 2 anos não é coberto; sem idade', () => {
    expect(caminhoGlargina(18, 'DM1', 'adulto')).toBe('dm1-adulto')
    expect(caminhoGlargina(75, 'DM1', 'adulto')).toBe('dm1-adulto')
    expect(caminhoGlargina(1, 'DM1', 'crianca')).toBe('dm1-nao-coberto')
    expect(caminhoGlargina(null, 'DM1', 'adulto')).toBe('sem-idade')
  })
})

describe('Quadro 1 da NT 169', () => {
  it('valores da NT (UI/kg/dia)', () => {
    expect(QUADRO_1['pre-pubere'].dtdi).toEqual({ min: 0.5, max: 0.8 })
    expect(QUADRO_1['pre-pubere'].basal).toEqual({ min: 0.2, max: 0.4 })
    expect(QUADRO_1.pubere.dtdi).toEqual({ min: 0.8, max: 2.0 })
    expect(QUADRO_1.pubere.basal).toEqual({ min: 0.4, max: 1.0 })
  })

  it('pré-púbere de 30 kg: DTDI 15–24 UI/dia, basal 6–12 UI/dia', () => {
    expect(fmtFaixa(porPeso(QUADRO_1['pre-pubere'].dtdi, 30)!)).toBe('15–24')
    expect(fmtFaixa(porPeso(QUADRO_1['pre-pubere'].basal, 30)!)).toBe('6–12')
  })

  it('faixa aberta ("abaixo de") formata com "<"', () => {
    expect(fmtFaixa({ min: null, max: 15 })).toBe('< 15')
  })

  it('sem peso, não calcula', () => {
    expect(porPeso(QUADRO_1.pubere.basal, null)).toBeNull()
  })

  it('formata a faixa por kg com casas decimais', () => {
    expect(fmtFaixa(QUADRO_1.pubere.basal, 1)).toBe('0,4–1,0')
  })
})
