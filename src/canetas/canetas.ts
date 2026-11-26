// Canetas de semaglutida vendidas no Brasil: dose por contagem de cliques, rendimento da caneta e
// esquema de início pela bula. Regras e fontes em docs/canetas-glp1.md.
//
// Cliques de referência (do 0 até a dose marcada ou cheia):
// - caneta da Novo de 1,34 mg/mL: 19 até 0,25 mg, 37 até 0,5 mg e 74 até 1 mg (FDA, DMEPA 2017);
// - Ozivy, Semavy e Semaclique (1 mg, 3 mL): 74 até 1 mg (decisão clínica, mesmo valor da Novo);
// - Wegovy/Poviztra 0,25 mg (0,68 mg/mL): 37; 1,7 mg e 2,4 mg: 75 (dose de 0,75 mL).

import type { BulaId } from './sources'

export type Linha = 'dm2' | 'peso'

export interface Marca {
  /** Dose marcada no contador, em mg. */
  mg: number
  /** Cliques do 0 até essa marca. */
  cliques: number
}

export interface Apresentacao {
  id: string
  /** Rótulo curto da apresentação, ex. "1 mg (3 mL)". */
  rotulo: string
  mgPorMl: number
  volumeMl: number
  /** Marcas de dose do contador, em ordem crescente. A última é a dose máxima da caneta. */
  marcas: readonly Marca[]
  /** Quantidade nominal de semaglutida da caneta (mg). */
  mgTotal: number
  /** Agulhas que vêm na caixa (bula). */
  agulhasNaCaixa: number
}

export interface Produto {
  id: string
  nome: string
  fabricante: string
  linha: Linha
  /** Validade depois da primeira aplicação, em dias (bula). */
  validadeDias: number
  bula: BulaId
  /** Agulha indicada na bula para a caneta. */
  agulha: string
  apresentacoes: readonly Apresentacao[]
}

const NOVO_DM2: readonly Apresentacao[] = [
  {
    id: '025-05',
    rotulo: '0,25 / 0,5 mg (1,5 mL)',
    mgPorMl: 1.34,
    volumeMl: 1.5,
    marcas: [
      { mg: 0.25, cliques: 19 },
      { mg: 0.5, cliques: 37 },
    ],
    mgTotal: 2,
    agulhasNaCaixa: 6,
  },
  {
    id: '1',
    rotulo: '1 mg (3 mL)',
    mgPorMl: 1.34,
    volumeMl: 3,
    marcas: [{ mg: 1, cliques: 74 }],
    mgTotal: 4,
    agulhasNaCaixa: 4,
  },
]

const SIMILAR_1MG: readonly Apresentacao[] = [
  {
    id: '1',
    rotulo: '1 mg (3 mL)',
    mgPorMl: 1.34,
    volumeMl: 3,
    marcas: [{ mg: 1, cliques: 74 }],
    mgTotal: 4,
    agulhasNaCaixa: 4,
  },
]

const WEGOVY: readonly Apresentacao[] = [
  {
    id: '025',
    rotulo: '0,25 mg (0,68 mg/mL, 1,5 mL)',
    mgPorMl: 0.68,
    volumeMl: 1.5,
    marcas: [{ mg: 0.25, cliques: 37 }],
    mgTotal: 1,
    agulhasNaCaixa: 4,
  },
  {
    id: '05',
    rotulo: '0,5 mg (1,34 mg/mL, 1,5 mL)',
    mgPorMl: 1.34,
    volumeMl: 1.5,
    marcas: [{ mg: 0.5, cliques: 37 }],
    mgTotal: 2,
    agulhasNaCaixa: 4,
  },
  {
    id: '1',
    rotulo: '1 mg (1,34 mg/mL, 3 mL)',
    mgPorMl: 1.34,
    volumeMl: 3,
    marcas: [{ mg: 1, cliques: 74 }],
    mgTotal: 4,
    agulhasNaCaixa: 4,
  },
  {
    id: '17',
    rotulo: '1,7 mg (2,27 mg/mL, 3 mL)',
    mgPorMl: 2.27,
    volumeMl: 3,
    marcas: [{ mg: 1.7, cliques: 75 }],
    mgTotal: 6.8,
    agulhasNaCaixa: 4,
  },
  {
    id: '24',
    rotulo: '2,4 mg (3,2 mg/mL, 3 mL)',
    mgPorMl: 3.2,
    volumeMl: 3,
    marcas: [{ mg: 2.4, cliques: 75 }],
    mgTotal: 9.6,
    agulhasNaCaixa: 4,
  },
]

export const PRODUTOS: readonly Produto[] = [
  {
    id: 'ozempic',
    nome: 'Ozempic',
    fabricante: 'Novo Nordisk',
    linha: 'dm2',
    validadeDias: 42,
    bula: 'ozempic',
    agulha: 'NovoFine® ou NovoFine® Plus (o tipo que vem na caixa), de até 8 mm',
    apresentacoes: NOVO_DM2,
  },
  {
    id: 'extensior',
    nome: 'Extensior',
    fabricante: 'Novo Nordisk',
    linha: 'dm2',
    validadeDias: 42,
    bula: 'extensior',
    agulha: 'NovoFine® ou NovoFine® Plus (o tipo que vem na caixa), de até 8 mm',
    apresentacoes: NOVO_DM2,
  },
  {
    id: 'ozivy',
    nome: 'Ozivy',
    fabricante: 'EMS',
    linha: 'dm2',
    validadeDias: 56,
    bula: 'ozivy',
    agulha: 'Ultra-Fine 0,23 mm (32G) × 4 mm (a que vem na caixa); a bula aceita até 8 mm',
    apresentacoes: SIMILAR_1MG,
  },
  {
    id: 'semavy',
    nome: 'Semavy',
    fabricante: 'Hypera',
    linha: 'dm2',
    validadeDias: 42,
    bula: 'semavy',
    agulha: 'BD Ultra-Fine™ (a que vem na caixa); a bula aceita até 8 mm',
    apresentacoes: SIMILAR_1MG,
  },
  {
    id: 'semaclique',
    nome: 'Semaclique',
    fabricante: 'Germed',
    linha: 'dm2',
    validadeDias: 56,
    bula: 'semaclique',
    agulha: 'Ultra-Fine 0,23 mm (32G) × 4 mm (a que vem na caixa); a bula aceita até 8 mm',
    apresentacoes: SIMILAR_1MG,
  },
  {
    id: 'wegovy',
    nome: 'Wegovy',
    fabricante: 'Novo Nordisk',
    linha: 'peso',
    validadeDias: 42,
    bula: 'wegovy',
    agulha: 'NovoFine® ou NovoFine® Plus (o tipo que vem na caixa), de até 8 mm',
    apresentacoes: WEGOVY,
  },
  {
    id: 'poviztra',
    nome: 'Poviztra',
    fabricante: 'Novo Nordisk',
    linha: 'peso',
    validadeDias: 42,
    bula: 'poviztra',
    agulha: 'NovoFine® ou NovoFine® Plus (o tipo que vem na caixa), de até 8 mm',
    apresentacoes: WEGOVY,
  },
]

export const LINHA_ROTULO: Record<Linha, string> = {
  dm2: 'Diabetes tipo 2 (adultos)',
  peso: 'Controle de peso (adultos e adolescentes a partir de 12 anos)',
}

export function produto(id: string): Produto | undefined {
  return PRODUTOS.find((p) => p.id === id)
}

/** Dose máxima que o seletor da caneta permite (a última marca). */
export const doseMaxima = (a: Apresentacao) => (a.marcas[a.marcas.length - 1] as Marca).mg

/** Marca de referência para a conta proporcional: a maior dose marcada. */
const referencia = (a: Apresentacao) => a.marcas[a.marcas.length - 1] as Marca

/** mg de semaglutida por clique, pela marca de referência. */
export const mgPorClique = (a: Apresentacao) => referencia(a).mg / referencia(a).cliques

/** Cliques que a caneta rende pelo conteúdo nominal (sem o excesso reservado ao teste de fluxo). */
export const cliquesNominais = (a: Apresentacao) =>
  Math.round((a.mgTotal / referencia(a).mg) * referencia(a).cliques)

export interface Opcao {
  cliques: number
  /** Dose que esses cliques entregam, em mg. */
  mg: number
}

export type Contagem =
  | { tipo: 'invalida'; motivo: string }
  | {
      tipo: 'ok'
      /** A dose é uma marca do contador: não é preciso contar. */
      marcada: boolean
      /** Valor exato da conta proporcional (cliques). */
      exato: number
      /** Uma opção, ou duas quando a conta cai perto do meio entre dois cliques. */
      opcoes: readonly Opcao[]
    }

const EPS = 1e-9

/**
 * Cliques para a dose desejada. Se a dose é uma marca do contador, vale a marca. Senão, conta
 * proporcional à maior marca: cliques = dose ÷ dose da marca × cliques da marca. Quando a parte
 * fracionária fica entre 0,4 e 0,6, mostra os dois cliques vizinhos com a dose de cada um.
 */
export function contarCliques(a: Apresentacao, doseMg: number): Contagem {
  if (!(doseMg > 0)) return { tipo: 'invalida', motivo: 'Informe uma dose maior que zero.' }
  const max = doseMaxima(a)
  if (doseMg > max + EPS) {
    return {
      tipo: 'invalida',
      motivo: `Esta caneta vai até ${fmtMg(max)} mg por aplicação.`,
    }
  }
  const marca = a.marcas.find((m) => Math.abs(m.mg - doseMg) < EPS)
  const passo = mgPorClique(a)
  if (marca) {
    return {
      tipo: 'ok',
      marcada: true,
      exato: marca.cliques,
      opcoes: [{ cliques: marca.cliques, mg: marca.mg }],
    }
  }
  const exato = doseMg / passo
  if (exato < 1 - EPS) {
    return {
      tipo: 'invalida',
      motivo: `A menor dose nesta caneta é 1 clique (${fmtMg(passo, 3)} mg).`,
    }
  }
  const baixo = Math.floor(exato + EPS)
  const frac = exato - baixo
  const opcao = (c: number): Opcao => ({ cliques: c, mg: c * passo })
  const opcoes =
    frac >= 0.4 - EPS && frac <= 0.6 + EPS
      ? [opcao(baixo), opcao(baixo + 1)]
      : [opcao(Math.round(exato))]
  return { tipo: 'ok', marcada: false, exato, opcoes }
}

export interface Rendimento {
  /** Aplicações que o conteúdo nominal permite com esse número de cliques. */
  peloConteudo: number
  /** Aplicações semanais dentro da validade depois de aberta. */
  pelaValidade: number
  /** O menor dos dois. */
  aplicacoes: number
  limite: 'conteudo' | 'validade'
}

/** Quantas aplicações semanais uma caneta rende com `cliques` por aplicação. */
export function rendimento(p: Produto, a: Apresentacao, cliques: number): Rendimento {
  const peloConteudo = Math.floor(cliquesNominais(a) / cliques)
  const pelaValidade = Math.floor(p.validadeDias / 7)
  return {
    peloConteudo,
    pelaValidade,
    aplicacoes: Math.min(peloConteudo, pelaValidade),
    limite: pelaValidade < peloConteudo ? 'validade' : 'conteudo',
  }
}

/** Agulhas a comprar além das da caixa, para usar a caneta inteira (uma agulha nova por aplicação). */
export const agulhasAComprar = (a: Apresentacao, aplicacoes: number) =>
  Math.max(0, aplicacoes - a.agulhasNaCaixa)

/** Doses de referência para a tabela de cliques da caneta. */
export function dosesTabela(a: Apresentacao): number[] {
  const max = doseMaxima(a)
  const base =
    max <= 1
      ? [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
      : [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.7, 2, 2.4]
  return base.filter((d) => d <= max + EPS && d / mgPorClique(a) >= 1)
}

// ---------------------------------------------------------------------------------------------
// Esquema de início pela bula.

export interface Etapa {
  /** Semana inicial (1 = semana da primeira aplicação). */
  semanaInicio: number
  /** Semana final, ou null para "em diante" (manutenção). */
  semanaFim: number | null
  doseMg: number
  nota: string
}

export const ESQUEMA: Record<Linha, readonly Etapa[]> = {
  // Bula Ozempic, item 8 (igual nas bulas de Extensior, Ozivy, Semavy e Semaclique).
  dm2: [
    {
      semanaInicio: 1,
      semanaFim: 4,
      doseMg: 0.25,
      nota: 'Dose inicial; não é dose de manutenção.',
    },
    { semanaInicio: 5, semanaFim: 8, doseMg: 0.5, nota: 'Após 4 semanas.' },
    {
      semanaInicio: 9,
      semanaFim: null,
      doseMg: 1,
      nota: 'Após pelo menos 4 semanas com 0,5 mg, se precisar de mais controle glicêmico. Doses acima de 1 mg não são recomendadas.',
    },
  ],
  // Bula Wegovy, Tabela 16.
  peso: [
    { semanaInicio: 1, semanaFim: 4, doseMg: 0.25, nota: '' },
    { semanaInicio: 5, semanaFim: 8, doseMg: 0.5, nota: '' },
    { semanaInicio: 9, semanaFim: 12, doseMg: 1, nota: '' },
    { semanaInicio: 13, semanaFim: 16, doseMg: 1.7, nota: '' },
    {
      semanaInicio: 17,
      semanaFim: null,
      doseMg: 2.4,
      nota: 'Dose de manutenção. Se não tolerar 2,4 mg, pode reduzir para 1,7 mg.',
    },
  ],
}

export function fmtMg(mg: number, digits?: number): string {
  const d = digits ?? (Math.abs(mg * 100 - Math.round(mg * 100)) < 1e-6 ? 2 : 3)
  return mg
    .toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: d })
    .replace(/^-0$/, '0')
}
