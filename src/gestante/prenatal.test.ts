import { igDias } from './ig'
import { ITENS, ITENS_MS, frequencia, proximaConsulta, situacaoItens } from './prenatal'

const st = (dias: number, primeira = false) =>
  Object.fromEntries(situacaoItens(dias, primeira).map((x) => [x.item.id, x.status]))

describe('pré-natal (Caderneta Brasileira da Gestante 2026)', () => {
  it('dT: esquema conforme as doses anteriores (MS, página da dTpa)', () => {
    const dt = ITENS.find((i) => i.id === 'v-dt')
    expect(dt?.condicao).toBe('se menos de 2 doses anteriores de vacina com tétano')
    expect(dt?.quando).toContain('nenhuma dose anterior: 2 doses de dT + 1 de dTpa')
  })

  it('ids únicos', () => {
    expect(new Set(ITENS.map((i) => i.id)).size).toBe(ITENS.length)
  })

  it('frequência das consultas: mensal < 28s, quinzenal 28–36s, semanal ≥ 36s', () => {
    expect(frequencia(igDias(27, 6)).texto).toBe('mensal')
    expect(frequencia(igDias(28, 0)).texto).toBe('quinzenal')
    expect(frequencia(igDias(35, 6)).texto).toBe('quinzenal')
    expect(frequencia(igDias(36, 0)).texto).toBe('semanal')
  })

  it('protocolo do município: sem Chagas, malária e teste de gravidez', () => {
    const ids = ITENS.map((i) => i.id)
    for (const id of [
      't1-chagas',
      't1-malaria',
      't2-malaria',
      't3-malaria',
      't1-trgrav',
      't2-toxo',
      'p-hiv',
      'p-sifilis',
      'p-hbv',
      'p-hcv',
    ])
      expect(ids).not.toContain(id)
    // a lista nacional continua registrada
    expect(ITENS_MS.map((i) => i.id)).toContain('t1-htlv')
    expect(ITENS_MS.find((i) => i.id === 't1-usg')?.quando).toBe('idealmente entre 7 e 12 semanas')
  })

  it('HTLV e eletroforese ficam no fim da lista, descritas como sem oferta local', () => {
    const fim = ITENS.slice(-2)
    expect(fim.map((i) => i.id).sort()).toEqual(['t1-eletro', 't1-htlv'])
    expect(fim.every((i) => i.semOferta?.includes('não disponível'))).toBe(true)
    // e continuam aparecendo na IG
    const a = situacaoItens(igDias(10, 0), false).filter((x) => x.status === 'agora')
    expect(
      a
        .slice(-2)
        .map((x) => x.item.id)
        .sort(),
    ).toEqual(['t1-eletro', 't1-htlv'])
  })

  it('estreptococo do grupo B: 35s 0d a 37s 0d, depois da urina do 3º trimestre', () => {
    expect(st(igDias(34, 6))['t3-gbs']).toBe('proximo')
    expect(st(igDias(35, 0))['t3-gbs']).toBe('agora')
    expect(st(igDias(37, 0))['t3-gbs']).toBe('agora')
    expect(st(igDias(37, 1))['t3-gbs']).toBe('atrasado')
    expect(st(igDias(38, 0))['t3-gbs']).toBe('atrasado')
    const ids = ITENS.map((i) => i.id)
    expect(ids.indexOf('t3-gbs')).toBe(ids.indexOf('t3-urina') + 1)
    expect(ITENS_MS.map((i) => i.id)).not.toContain('t3-gbs')
  })

  it('USG do município: 1º trimestre 11s 0d a 13s 6d; 2º trimestre 20s 0d a 24s 6d', () => {
    expect(st(igDias(10, 6))['t1-usg']).toBe('proximo')
    expect(st(igDias(11, 0))['t1-usg']).toBe('agora')
    expect(st(igDias(13, 6))['t1-usg']).toBe('agora')
    expect(st(igDias(14, 0))['t1-usg']).toBe('atrasado')
    expect(st(igDias(19, 6))['t2-usg']).toBe('proximo')
    expect(st(igDias(20, 0))['t2-usg']).toBe('agora')
    expect(st(igDias(24, 6))['t2-usg']).toBe('agora')
    expect(st(igDias(25, 0))['t2-usg']).toBe('atrasado')
  })

  it('10 semanas: exames do 1º trimestre agora; USG, TOTG e dTpa depois', () => {
    const s = st(igDias(10, 0))
    expect(s['t1-hemo']).toBe('agora')
    expect(s['t1-hcv']).toBe('agora')
    expect(s['t1-usg']).toBe('proximo')
    expect(s['t2-totg']).toBe('proximo')
    expect(s['t3-hiv']).toBe('proximo')
    expect(s['v-dtpa']).toBe('proximo')
    expect(s['v-flu']).toBe('agora')
  })

  it('25 semanas: 1º trimestre já deveria ter sido feito; TOTG e dTpa agora', () => {
    const s = st(igDias(25, 0))
    expect(s['t1-hemo']).toBe('atrasado')
    expect(s['t2-totg']).toBe('agora')
    expect(s['t2-coombs']).toBe('agora')
    expect(s['v-dtpa']).toBe('agora')
    expect(s['v-vsr']).toBe('proximo')
  })

  it('TOTG: janela de 24s 0d a 28s 6d', () => {
    expect(st(igDias(23, 6))['t2-totg']).toBe('proximo')
    expect(st(igDias(28, 6))['t2-totg']).toBe('agora')
    expect(st(igDias(29, 0))['t2-totg']).toBe('atrasado')
  })

  it('30 semanas: 3º trimestre e VSR agora; 2º trimestre atrasado', () => {
    const s = st(igDias(30, 0))
    expect(s['t3-sifilis']).toBe('agora')
    expect(s['v-vsr']).toBe('agora')
    expect(s['t2-coombs']).toBe('atrasado')
    expect(s['t2-toxo']).toBeUndefined() // município: toxo só no 1º e no 3º trimestre
    expect(s['t3-toxo']).toBe('agora')
    expect(s['p-hiv']).toBeUndefined() // parto não entra na lista por IG
  })

  it('1ª consulta tardia (30 semanas): exames da 1ª consulta agora, TOTG no lugar da glicemia', () => {
    const s = st(igDias(30, 0), true)
    expect(s['t1-hemo']).toBe('agora')
    expect(s['t1-usg']).toBe('atrasado') // a USG segue a janela, mesmo na 1ª consulta
    expect(s['t1-gj']).toBeUndefined()
    expect(s['t2-totg']).toBe('agora')
    // 1ª consulta com 20 semanas: glicemia de jejum normal, TOTG ainda por vir
    const s20 = st(igDias(20, 0), true)
    expect(s20['t1-gj']).toBe('agora')
    expect(s20['t2-totg']).toBe('proximo')
  })

  it('próxima consulta não passa da mudança de frequência', () => {
    expect(proximaConsulta(igDias(10, 0))).toBe(igDias(14, 0))
    expect(proximaConsulta(igDias(27, 0))).toBe(igDias(28, 0))
    expect(proximaConsulta(igDias(27, 5))).toBe(igDias(28, 5)) // no mínimo 1 semana
    expect(proximaConsulta(igDias(30, 0))).toBe(igDias(32, 0))
    expect(proximaConsulta(igDias(35, 0))).toBe(igDias(36, 0))
    expect(proximaConsulta(igDias(37, 0))).toBe(igDias(38, 0))
  })
})
