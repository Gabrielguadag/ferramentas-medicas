import { igDias } from './ig'
import { ITENS, frequencia, proximaConsulta, situacaoItens } from './prenatal'

const st = (dias: number, primeira = false) =>
  Object.fromEntries(situacaoItens(dias, primeira).map((x) => [x.item.id, x.status]))

describe('pré-natal (Caderneta Brasileira da Gestante 2026)', () => {
  it('ids únicos', () => {
    expect(new Set(ITENS.map((i) => i.id)).size).toBe(ITENS.length)
  })

  it('frequência das consultas: mensal < 28s, quinzenal 28–36s, semanal ≥ 36s', () => {
    expect(frequencia(igDias(27, 6)).texto).toBe('mensal')
    expect(frequencia(igDias(28, 0)).texto).toBe('quinzenal')
    expect(frequencia(igDias(35, 6)).texto).toBe('quinzenal')
    expect(frequencia(igDias(36, 0)).texto).toBe('semanal')
  })

  it('10 semanas: exames do 1º trimestre agora; USG na janela; TOTG e dTpa depois', () => {
    const s = st(igDias(10, 0))
    expect(s['t1-hemo']).toBe('agora')
    expect(s['t1-hcv']).toBe('agora')
    expect(s['t1-usg']).toBe('agora')
    expect(s['t2-totg']).toBe('proximo')
    expect(s['t3-hiv']).toBe('proximo')
    expect(s['v-dtpa']).toBe('proximo')
    expect(s['v-flu']).toBe('agora')
  })

  it('USG ideal fecha depois de 12s 6d', () => {
    expect(st(igDias(12, 6))['t1-usg']).toBe('agora')
    expect(st(igDias(13, 0))['t1-usg']).toBe('atrasado')
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
    expect(s['t2-toxo']).toBe('atrasado')
    expect(s['p-hiv']).toBeUndefined() // parto não entra na lista por IG
  })

  it('1ª consulta tardia (30 semanas): exames da 1ª consulta agora, TOTG no lugar da glicemia', () => {
    const s = st(igDias(30, 0), true)
    expect(s['t1-hemo']).toBe('agora')
    expect(s['t1-usg']).toBe('agora')
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

  it('teste de gravidez não aparece como pendência', () => {
    expect(st(igDias(20, 0))['t1-trgrav']).toBeUndefined()
  })
})
