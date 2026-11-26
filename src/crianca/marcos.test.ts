import { FAIXAS, type Resposta, classificar, faixaDe, rotuloFaixa } from './marcos'

const todos = (fi: number, r: Resposta) =>
  Object.fromEntries((FAIXAS[fi]?.marcos ?? []).map((m) => [m.id, r]))

const base = { pcAlterado: false, fenotipicas3: false, fatoresRisco: 0 }

describe('marcos do desenvolvimento (Caderneta da Criança, 6ª ed.)', () => {
  it('17 faixas contíguas de 0 a 72 meses, 4 marcos cada, ids únicos', () => {
    expect(FAIXAS).toHaveLength(17)
    FAIXAS.forEach((f, i) => {
      expect(f.marcos).toHaveLength(4)
      if (i > 0) expect(f.de).toBe(FAIXAS[i - 1]?.ate)
    })
    expect(FAIXAS[0]?.de).toBe(0)
    expect(FAIXAS.at(-1)?.ate).toBe(72)
    const ids = FAIXAS.flatMap((f) => f.marcos.map((m) => m.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('faixas das colunas coloridas da Caderneta', () => {
    const limites = FAIXAS.map((f) => `${f.de}-${f.ate}`)
    expect(limites).toEqual([
      '0-1',
      '1-2',
      '2-4',
      '4-6',
      '6-9',
      '9-12',
      '12-15',
      '15-18',
      '18-24',
      '24-30',
      '30-36',
      '36-42',
      '42-48',
      '48-54',
      '54-60',
      '60-66',
      '66-72',
    ])
    expect(FAIXAS[faixaDe(5)!]?.marcos.map((m) => m.nome)).toContain('Muda de posição (rola)')
    expect(FAIXAS[faixaDe(14)!]?.marcos.map((m) => m.nome)).toContain('Anda sem apoio')
    expect(faixaDe(72)).toBeNull()
    expect(faixaDe(0)).toBe(0)
  })

  it('rótulos das faixas', () => {
    expect(rotuloFaixa(FAIXAS[0]!)).toBe('do nascimento a 1 mês')
    expect(rotuloFaixa(FAIXAS[3]!)).toBe('4 a 6 meses')
    expect(rotuloFaixa(FAIXAS[8]!)).toBe('18 a 24 meses')
    expect(rotuloFaixa(FAIXAS[9]!)).toBe('2 anos a 2 anos e meio')
    expect(rotuloFaixa(FAIXAS[11]!)).toBe('3 anos a 3 anos e meio')
  })

  it('adequado: todos presentes, sem fator de risco', () => {
    expect(classificar({ ...base, faixa: 5, respostas: todos(5, 'P') }).classe).toBe('adequado')
  })

  it('alerta: todos presentes com fator de risco', () => {
    const av = classificar({ ...base, faixa: 5, respostas: todos(5, 'P'), fatoresRisco: 1 })
    expect(av.classe).toBe('alerta')
  })

  it('falta marco da faixa: pede a faixa anterior; anterior completa → alerta; anterior com falta → provável atraso', () => {
    const r = { ...todos(5, 'P'), pinca: 'A' as Resposta }
    expect(classificar({ ...base, faixa: 5, respostas: r })).toEqual({
      classe: 'incompleta',
      falta: 'anterior',
    })
    expect(classificar({ ...base, faixa: 5, respostas: { ...r, ...todos(4, 'P') } }).classe).toBe(
      'alerta',
    )
    const ant = { ...r, ...todos(4, 'P'), senta: 'A' as Resposta }
    const av = classificar({ ...base, faixa: 5, respostas: ant })
    expect(av.classe).toBe('provavel-atraso')
  })

  it('faixa de 0 a 1 mês: ausência na própria faixa já é provável atraso', () => {
    const r = { ...todos(0, 'P'), 'reage-som': 'A' as Resposta }
    expect(classificar({ ...base, faixa: 0, respostas: r }).classe).toBe('provavel-atraso')
  })

  it('PC fora de ±2 escores Z ou 3+ alterações fenotípicas: provável atraso, mesmo sem marcar marcos', () => {
    expect(classificar({ ...base, faixa: 3, respostas: {}, pcAlterado: true }).classe).toBe(
      'provavel-atraso',
    )
    expect(
      classificar({ ...base, faixa: 3, respostas: todos(3, 'P'), fenotipicas3: true }).classe,
    ).toBe('provavel-atraso')
  })

  it('incompleta enquanto houver marco não verificado na faixa', () => {
    const r = { ...todos(7, 'P'), 'anda-tras': 'NV' as Resposta }
    expect(classificar({ ...base, faixa: 7, respostas: r })).toEqual({
      classe: 'incompleta',
      falta: 'faixa',
    })
  })
})
