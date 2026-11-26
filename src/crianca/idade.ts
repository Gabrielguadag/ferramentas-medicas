// Idade da criança em meses completos e idade corrigida do prematuro.
// Regra da idade corrigida: Caderneta da Criança (MS, 6ª ed.), pág. 19, 79 e 88.

import { type Dia, fromYmd, ymd } from '../shared/datas'

const ultimoDiaDoMes = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()

/**
 * Data em que a criança completa `meses` meses. Se o dia do nascimento não existe no mês
 * (ex.: nasceu em 31/01), vale o último dia do mês (28 ou 29/02).
 */
export function aniversarioDeMeses(nasc: Dia, meses: number): Dia {
  const { y, m, d } = ymd(nasc)
  const total = m - 1 + meses
  const ano = y + Math.floor(total / 12)
  const mes = (((total % 12) + 12) % 12) + 1
  return fromYmd(ano, mes, Math.min(d, ultimoDiaDoMes(ano, mes)))
}

/** Meses completos entre o nascimento e a data; -1 se a data é anterior ao nascimento. */
export function mesesCompletos(nasc: Dia, ref: Dia): number {
  if (ref < nasc) return -1
  const a = ymd(nasc)
  const b = ymd(ref)
  let meses = (b.y - a.y) * 12 + (b.m - a.m)
  if (aniversarioDeMeses(nasc, meses) > ref) meses--
  return meses
}

export interface Idade {
  /** Dias de vida. */
  dias: number
  /** Meses completos. */
  meses: number
  /** Dias além dos meses completos. */
  diasResto: number
}

export function idadeEm(nasc: Dia, ref: Dia): Idade | null {
  if (ref < nasc) return null
  const meses = mesesCompletos(nasc, ref)
  return { dias: ref - nasc, meses, diasResto: ref - aniversarioDeMeses(nasc, meses) }
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

/** "12 dias", "4 meses e 3 dias", "17 meses e 3 dias" (até 23 meses), "2 anos e 5 meses", "2 anos". */
export function fmtIdade(i: Idade): string {
  if (i.meses === 0) return plural(i.dias, 'dia', 'dias')
  if (i.meses < 24) {
    const base = plural(i.meses, 'mês', 'meses')
    return i.diasResto ? `${base} e ${plural(i.diasResto, 'dia', 'dias')}` : base
  }
  const anos = Math.floor(i.meses / 12)
  const resto = i.meses % 12
  const base = plural(anos, 'ano', 'anos')
  return resto ? `${base} e ${plural(resto, 'mês', 'meses')}` : base
}

export const TERMO_DIAS = 280
export const PREMATURO_ATE = 37 * 7 // < 37 semanas

export interface Correcao {
  /** Data equivalente ao nascimento com 40 semanas (nascimento + o que faltou para o termo). */
  termo: Dia
  /** Idade corrigida na data; null se a data é anterior às 40 semanas corrigidas. */
  idade: Idade | null
  /** Corrigir até esta idade cronológica, em meses (exclusive). */
  corrigirAteMeses: 24 | 36
  /** A correção ainda vale nesta data. */
  vale: boolean
}

/**
 * Idade corrigida: diminuir da idade o tempo que faltou para 40 semanas. Vale até 2 anos de
 * idade cronológica, ou até 3 anos se nasceu com menos de 28 semanas. Só para prematuros
 * (< 37 semanas); para os demais, null.
 */
export function correcao(nasc: Dia, ref: Dia, igNascDias: number): Correcao | null {
  if (igNascDias >= PREMATURO_ATE || igNascDias <= 0) return null
  const termo = nasc + (TERMO_DIAS - igNascDias)
  const corrigirAteMeses = igNascDias < 28 * 7 ? 36 : 24
  const cron = mesesCompletos(nasc, ref)
  return {
    termo,
    idade: idadeEm(termo, ref),
    corrigirAteMeses,
    vale: cron >= 0 && cron < corrigirAteMeses,
  }
}
