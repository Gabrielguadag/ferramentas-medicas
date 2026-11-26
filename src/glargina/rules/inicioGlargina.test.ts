import { QUADRO_1, QUADRO_2, caminhoGlargina, fmtFaixa, porPeso } from './inicioGlargina'

describe('caminhoGlargina', () => {
  it('DM2 adulto segue o PCDT; DM2 < 18 ou perfil criança fica fora', () => {
    expect(caminhoGlargina(75, 'DM2', 'adulto')).toBe('dm2')
    expect(caminhoGlargina(50, 'DM2', 'adulto')).toBe('dm2')
    expect(caminhoGlargina(16, 'DM2', 'adulto')).toBe('fora')
    expect(caminhoGlargina(40, 'DM2', 'crianca')).toBe('fora')
  })

  it('DM1 elegível à NT 169: 2 a 17 anos (Quadro 1) e 70 anos ou mais (Quadro 2)', () => {
    expect(caminhoGlargina(2, 'DM1', 'crianca')).toBe('dm1-crianca')
    expect(caminhoGlargina(17, 'DM1', 'crianca')).toBe('dm1-crianca')
    expect(caminhoGlargina(70, 'DM1', 'adulto')).toBe('dm1-adulto')
  })

  it('DM1 fora da NT 169: menos de 2 e 18 a 69 anos; sem idade', () => {
    expect(caminhoGlargina(1, 'DM1', 'crianca')).toBe('dm1-nao-coberto')
    expect(caminhoGlargina(18, 'DM1', 'adulto')).toBe('dm1-nao-coberto')
    expect(caminhoGlargina(69, 'DM1', 'adulto')).toBe('dm1-nao-coberto')
    expect(caminhoGlargina(null, 'DM1', 'adulto')).toBe('sem-idade')
  })
})

describe('Quadros 1 e 2 da NT 169', () => {
  it('valores da NT (UI/kg/dia)', () => {
    expect(QUADRO_1['pre-pubere'].dtdi).toEqual({ min: 0.5, max: 0.8 })
    expect(QUADRO_1['pre-pubere'].basal).toEqual({ min: 0.2, max: 0.4 })
    expect(QUADRO_1.pubere.dtdi).toEqual({ min: 0.8, max: 2.0 })
    expect(QUADRO_1.pubere.basal).toEqual({ min: 0.4, max: 1.0 })
    expect(QUADRO_2.recente.basal).toEqual({ min: null, max: 0.25 })
    expect(QUADRO_2['apos-cad'].basal).toEqual({ min: 0.3, max: 0.5 })
  })

  it('pré-púbere de 30 kg: DTDI 15–24 UI/dia, basal 6–12 UI/dia', () => {
    expect(fmtFaixa(porPeso(QUADRO_1['pre-pubere'].dtdi, 30)!)).toBe('15–24')
    expect(fmtFaixa(porPeso(QUADRO_1['pre-pubere'].basal, 30)!)).toBe('6–12')
  })

  it('adulto com diagnóstico recente, 60 kg: basal < 15 UI/dia', () => {
    expect(fmtFaixa(porPeso(QUADRO_2.recente.basal, 60)!)).toBe('< 15')
  })

  it('sem peso, não calcula', () => {
    expect(porPeso(QUADRO_1.pubere.basal, null)).toBeNull()
  })

  it('formata a faixa por kg com casas decimais', () => {
    expect(fmtFaixa(QUADRO_1.pubere.basal, 1)).toBe('0,4–1,0')
  })
})
