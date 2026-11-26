// Idade gestacional (IG) e data provável do parto (DPP).
//
// Fontes:
// - Ministério da Saúde. Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco
//   (2012), 5.5 (cálculo da IG: DUM certa; DUM incerta com período do mês → dias 5, 15 e 25),
//   5.6 (DPP = 280 dias a partir da DUM; regra de Näegele), 5.4.2 (pré-termo < 37 semanas;
//   pós-termo ≥ 42 semanas), 6.3.5 (gestação prolongada 40–42 semanas) e 5.3 (com 41 semanas,
//   encaminhar para avaliação do bem-estar fetal).
// - ACOG/AIUM/SMFM. Committee Opinion nº 700 — Methods for Estimating the Due Date (2017,
//   reafirmada em 2022): Tabela 1 (quando a ultrassonografia redata a gestação), trimestres
//   (1º até 13s6d; 2º 14s0d–27s6d; 3º a partir de 28s0d) e gestação por FIV (DPP = transferência
//   + 261 dias para embrião de 5 dias e + 263 dias para embrião de 3 dias).
//
// Toda datação vira uma "DUM equivalente" (o dia 0 da IG); IG e DPP saem dela.

import { type Dia, addMonths, fromYmd } from '../shared/datas'

export const DURACAO_GESTACAO = 280 // dias, a partir da DUM

export interface Ig {
  totalDias: number
  semanas: number
  dias: number
}

export function ig(totalDias: number): Ig {
  const semanas = Math.floor(totalDias / 7)
  return { totalDias, semanas, dias: totalDias - semanas * 7 }
}

export const igDias = (semanas: number, dias: number) => semanas * 7 + dias

/** "24s 3d" */
export function fmtIg(x: Ig): string {
  return `${x.semanas}s ${x.dias}d`
}

/** "24 semanas e 3 dias" */
export function fmtIgLongo(x: Ig): string {
  const s = `${x.semanas} ${x.semanas === 1 ? 'semana' : 'semanas'}`
  if (x.dias === 0) return s
  return `${s} e ${x.dias} ${x.dias === 1 ? 'dia' : 'dias'}`
}

// ---------- Datação: cada método devolve a DUM equivalente ----------

export type PeriodoMes = 'inicio' | 'meio' | 'fim'

/** DUM desconhecida, mas sabe-se o período do mês: início, meio ou fim → dias 5, 15 e 25 (MS). */
export function dumPorPeriodo(ano: number, mes: number, periodo: PeriodoMes): Dia {
  const dia = periodo === 'inicio' ? 5 : periodo === 'meio' ? 15 : 25
  return fromYmd(ano, mes, dia)
}

/** Ultrassonografia: data do exame e IG informada no laudo. */
export function dumPorUsg(exame: Dia, semanas: number, dias: number): Dia {
  return exame - igDias(semanas, dias)
}

export function dumPorDpp(dpp: Dia): Dia {
  return dpp - DURACAO_GESTACAO
}

/** FIV: no dia da transferência a IG é 2 semanas + a idade do embrião em dias (ACOG CO 700). */
export function dumPorTransferencia(transferencia: Dia, idadeEmbriao: number): Dia {
  return transferencia - (14 + idadeEmbriao)
}

// ---------- Resultados ----------

export const igEm = (dum: Dia, data: Dia): Ig => ig(data - dum)
export const dppDe = (dum: Dia): Dia => dum + DURACAO_GESTACAO
export const dataParaIg = (dum: Dia, semanas: number, dias: number): Dia =>
  dum + igDias(semanas, dias)

/**
 * Regra de Näegele como descrita pelo MS: soma 7 dias à DUM (os dias que passam do fim do mês
 * vão para o mês seguinte) e soma 9 meses (= subtrai 3 meses e passa para o ano seguinte).
 * Pode diferir alguns dias de DUM + 280; a DPP adotada aqui é a de 280 dias.
 */
export function dppNaegele(dum: Dia): Dia {
  return addMonths(dum + 7, 9)
}

export type Trimestre = 1 | 2 | 3

export function trimestre(totalDias: number): Trimestre {
  if (totalDias < igDias(14, 0)) return 1
  if (totalDias < igDias(28, 0)) return 2
  return 3
}

export type Situacao =
  'antes-dum' | 'em-curso' | 'termo' | 'prolongada' | 'prolongada-41' | 'pos-termo' | 'implausivel'

/** Situação na data (MS): termo ≥ 37s; prolongada 40–42s; com 41s, avaliar bem-estar fetal; pós-termo ≥ 42s. */
export function situacao(totalDias: number): Situacao {
  if (totalDias < 0) return 'antes-dum'
  if (totalDias > igDias(44, 0)) return 'implausivel'
  if (totalDias >= igDias(42, 0)) return 'pos-termo'
  if (totalDias >= igDias(41, 0)) return 'prolongada-41'
  if (totalDias >= igDias(40, 0)) return 'prolongada'
  if (totalDias >= igDias(37, 0)) return 'termo'
  return 'em-curso'
}

// ---------- DUM × ultrassonografia (ACOG CO 700, Tabela 1) ----------

export interface FaixaRedatacao {
  /** IG pela DUM no dia do exame, em dias (limites inclusivos). */
  de: number
  ate: number
  faixa: string
  medida: string
  /** Redata quando a diferença é MAIOR que este número de dias. */
  limite: number
}

export const TABELA_REDATACAO: readonly FaixaRedatacao[] = [
  { de: 0, ate: igDias(8, 6), faixa: 'até 8s 6d', medida: 'CCN', limite: 5 },
  { de: igDias(9, 0), ate: igDias(13, 6), faixa: '9s 0d a 13s 6d', medida: 'CCN', limite: 7 },
  {
    de: igDias(14, 0),
    ate: igDias(15, 6),
    faixa: '14s 0d a 15s 6d',
    medida: 'DBP, CC, CA, CF',
    limite: 7,
  },
  {
    de: igDias(16, 0),
    ate: igDias(21, 6),
    faixa: '16s 0d a 21s 6d',
    medida: 'DBP, CC, CA, CF',
    limite: 10,
  },
  {
    de: igDias(22, 0),
    ate: igDias(27, 6),
    faixa: '22s 0d a 27s 6d',
    medida: 'DBP, CC, CA, CF',
    limite: 14,
  },
  {
    de: igDias(28, 0),
    ate: Number.POSITIVE_INFINITY,
    faixa: '28s 0d em diante',
    medida: 'DBP, CC, CA, CF',
    limite: 21,
  },
]

export interface Comparacao {
  igDumNoExame: Ig
  igUsgNoExame: Ig
  /** USG − DUM, em dias (positivo: feto maior que o esperado pela DUM). */
  diferenca: number
  faixa: FaixaRedatacao
  redatar: boolean
  terceiroTrimestre: boolean
}

/** null quando o exame é anterior à DUM informada. */
export function compararDumUsg(
  dum: Dia,
  exame: Dia,
  usgSemanas: number,
  usgDias: number,
): Comparacao | null {
  const pelaDum = exame - dum
  if (pelaDum < 0) return null
  const faixa = TABELA_REDATACAO.find((f) => pelaDum >= f.de && pelaDum <= f.ate)
  if (!faixa) return null
  const pelaUsg = igDias(usgSemanas, usgDias)
  const diferenca = pelaUsg - pelaDum
  return {
    igDumNoExame: ig(pelaDum),
    igUsgNoExame: ig(pelaUsg),
    diferenca,
    faixa,
    redatar: Math.abs(diferenca) > faixa.limite,
    terceiroTrimestre: pelaDum >= igDias(28, 0),
  }
}

// ---------- Marcos da gestação ----------

export interface Marco {
  semanas: number
  rotulo: string
}

export const MARCOS: readonly Marco[] = [
  { semanas: 14, rotulo: 'Início do 2º trimestre' },
  { semanas: 28, rotulo: 'Início do 3º trimestre' },
  { semanas: 37, rotulo: 'Termo (fim do pré-termo)' },
  { semanas: 40, rotulo: 'Data provável do parto' },
  { semanas: 41, rotulo: 'Encaminhar para avaliação do bem-estar fetal' },
  { semanas: 42, rotulo: 'Pós-termo' },
]
