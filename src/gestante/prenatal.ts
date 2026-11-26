// Calendário de consultas, exames e vacinas do pré-natal de risco habitual.
//
// Fontes (Ministério da Saúde):
// - Caderneta Brasileira da Gestante (2026, Rede Alyne): 4.1.2 (início até a 12ª semana),
//   4.1.4 (mínimo de 7 consultas; programação mínima: mensal até 28 semanas, quinzenal de 28 a
//   36, semanal a partir de 36; ao menos 2 consultas puerperais, a 1ª na primeira semana após a
//   saída da maternidade e a 2ª em torno de 30 dias após o parto), 4.2.1 (exames de rotina por trimestre, no parto e com indicação
//   clínica) e 4.3 (vacinas).
// - Nota metodológica C3 — Cuidado na gestação e puerpério (SAPS/MS): 1ª consulta até a 12ª
//   semana; ≥ 7 consultas; dTpa a partir da 20ª semana; testes para sífilis, HIV e hepatites B
//   e C no 1º trimestre e para sífilis e HIV no 3º trimestre.

import { igDias } from './ig'

export type Periodo = 't1' | 't2' | 't3' | 'parto' | 'qualquer'

export const PERIODO_ROTULO: Record<Periodo, string> = {
  t1: '1º trimestre ou 1ª consulta',
  t2: '2º trimestre',
  t3: '3º trimestre',
  parto: 'No parto ou pós-parto imediato',
  qualquer: 'Em qualquer fase da gestação',
}

export interface Item {
  id: string
  tipo: 'exame' | 'vacina'
  nome: string
  periodo: Periodo
  /** Condição para indicar (texto curto, ex.: "se Rh negativo"). */
  condicao?: string
  /** Janela em dias de IG, inclusiva; `ate` null = até o parto. Padrão: a do período. */
  janela?: { de: number; ate: number | null }
  /** Texto da janela como está na fonte (ex.: "idealmente entre 7 e 12 semanas"). */
  quando?: string
  /** Rotina do MS que o município não oferece: vai para o fim da lista, com esta descrição. */
  semOferta?: string
}

const T1 = { de: 0, ate: igDias(13, 6) }
const T2 = { de: igDias(14, 0), ate: igDias(27, 6) }
const T3 = { de: igDias(28, 0), ate: null }

export function janelaDe(i: Item): { de: number; ate: number | null } | null {
  if (i.janela) return i.janela
  if (i.periodo === 't1') return T1
  if (i.periodo === 't2') return T2
  if (i.periodo === 't3') return T3
  if (i.periodo === 'qualquer') return { de: 0, ate: null }
  return null // parto
}

const RH = 'se Rh negativo'
const RH_NEG = 'se Rh negativo e Coombs negativo no 1º trimestre'
const TOXO = 'se IgG não reagente: suscetível'
const MALARIA = 'em região endêmica'

/** Lista nacional: Caderneta Brasileira da Gestante 2026, 4.2.1 e 4.3. */
export const ITENS_MS: readonly Item[] = [
  // 1º trimestre ou 1ª consulta
  { id: 't1-trgrav', tipo: 'exame', periodo: 't1', nome: 'Teste rápido de gravidez' },
  { id: 't1-hemo', tipo: 'exame', periodo: 't1', nome: 'Hemograma (hemoglobina e hematócrito)' },
  { id: 't1-abo', tipo: 'exame', periodo: 't1', nome: 'Tipagem sanguínea (ABO e fator Rh)' },
  { id: 't1-coombs', tipo: 'exame', periodo: 't1', nome: 'Coombs indireto', condicao: RH },
  { id: 't1-eletro', tipo: 'exame', periodo: 't1', nome: 'Eletroforese de hemoglobina' },
  {
    id: 't1-gj',
    tipo: 'exame',
    periodo: 't1',
    nome: 'Glicemia em jejum',
    quando: 'na 1ª consulta com mais de 24 semanas, fazer o TOTG 75 g no lugar',
  },
  { id: 't1-sifilis', tipo: 'exame', periodo: 't1', nome: 'Sífilis (teste rápido ou VDRL/RPR)' },
  { id: 't1-hiv', tipo: 'exame', periodo: 't1', nome: 'HIV (teste rápido ou anti-HIV I e II)' },
  { id: 't1-hbv', tipo: 'exame', periodo: 't1', nome: 'Hepatite B (teste rápido ou HBsAg)' },
  { id: 't1-hcv', tipo: 'exame', periodo: 't1', nome: 'Hepatite C (teste rápido ou anti-HCV)' },
  { id: 't1-toxo', tipo: 'exame', periodo: 't1', nome: 'Toxoplasmose (IgG e IgM)' },
  { id: 't1-htlv', tipo: 'exame', periodo: 't1', nome: 'HTLV' },
  {
    id: 't1-urina',
    tipo: 'exame',
    periodo: 't1',
    nome: 'Urina tipo I e urocultura com antibiograma',
  },
  {
    id: 't1-chagas',
    tipo: 'exame',
    periodo: 't1',
    nome: 'Doença de Chagas (teste rápido e IgG)',
    condicao: 'em casos suspeitos',
  },
  { id: 't1-malaria', tipo: 'exame', periodo: 't1', nome: 'Malária', condicao: MALARIA },
  {
    id: 't1-usg',
    tipo: 'exame',
    periodo: 't1',
    nome: 'Ultrassonografia obstétrica',
    janela: { de: igDias(7, 0), ate: igDias(12, 6) },
    quando: 'idealmente entre 7 e 12 semanas',
  },
  // 2º trimestre
  {
    id: 't2-totg',
    tipo: 'exame',
    periodo: 't2',
    nome: 'TOTG 75 g',
    janela: { de: igDias(24, 0), ate: igDias(28, 6) },
    quando: 'preferencialmente entre 24 e 28 semanas',
  },
  { id: 't2-coombs', tipo: 'exame', periodo: 't2', nome: 'Coombs indireto', condicao: RH_NEG },
  { id: 't2-malaria', tipo: 'exame', periodo: 't2', nome: 'Malária', condicao: MALARIA },
  { id: 't2-toxo', tipo: 'exame', periodo: 't2', nome: 'Toxoplasmose', condicao: TOXO },
  // 3º trimestre
  { id: 't3-hemo', tipo: 'exame', periodo: 't3', nome: 'Hemograma (hemoglobina e hematócrito)' },
  { id: 't3-gj', tipo: 'exame', periodo: 't3', nome: 'Glicemia em jejum' },
  { id: 't3-coombs', tipo: 'exame', periodo: 't3', nome: 'Coombs indireto', condicao: RH_NEG },
  { id: 't3-sifilis', tipo: 'exame', periodo: 't3', nome: 'Sífilis (teste rápido ou VDRL/RPR)' },
  { id: 't3-hiv', tipo: 'exame', periodo: 't3', nome: 'HIV (teste rápido ou anti-HIV I e II)' },
  { id: 't3-toxo', tipo: 'exame', periodo: 't3', nome: 'Toxoplasmose', condicao: TOXO },
  { id: 't3-malaria', tipo: 'exame', periodo: 't3', nome: 'Malária', condicao: MALARIA },
  {
    id: 't3-urina',
    tipo: 'exame',
    periodo: 't3',
    nome: 'Urina tipo I e urocultura com antibiograma',
  },
  // Parto
  { id: 'p-hiv', tipo: 'exame', periodo: 'parto', nome: 'Teste rápido para HIV' },
  { id: 'p-sifilis', tipo: 'exame', periodo: 'parto', nome: 'Sífilis (teste rápido ou VDRL/RPR)' },
  {
    id: 'p-hbv',
    tipo: 'exame',
    periodo: 'parto',
    nome: 'Teste rápido para hepatite B',
    condicao: 'se não feito no pré-natal',
  },
  {
    id: 'p-hcv',
    tipo: 'exame',
    periodo: 'parto',
    nome: 'Teste rápido para hepatite C',
    condicao: 'se não feito no pré-natal',
  },
  // Vacinas
  {
    id: 'v-dtpa',
    tipo: 'vacina',
    periodo: 'qualquer',
    nome: 'dTpa',
    janela: { de: igDias(20, 0), ate: null },
    quando:
      'a partir da 20ª semana, em toda gestação; se não tomar na gestação, até 45 dias após o parto',
  },
  {
    id: 'v-vsr',
    tipo: 'vacina',
    periodo: 'qualquer',
    nome: 'VSR (vírus sincicial respiratório)',
    janela: { de: igDias(28, 0), ate: null },
    quando: 'a partir da 28ª semana, o mais cedo possível; dose única em cada gestação',
  },
  {
    id: 'v-hbv',
    tipo: 'vacina',
    periodo: 'qualquer',
    nome: 'Hepatite B',
    condicao: 'se esquema incompleto',
    quando: 'iniciar ou completar as 3 doses; se não der tempo, concluir até 45 dias após o parto',
  },
  {
    id: 'v-dt',
    tipo: 'vacina',
    periodo: 'qualquer',
    nome: 'dT',
    condicao: 'se menos de 2 doses anteriores de vacina com tétano',
    quando:
      'nenhuma dose anterior: 2 doses de dT + 1 de dTpa; 1 dose anterior: 1 de dT + 1 de dTpa. Intervalo de 60 dias (mínimo 30); a dTpa a partir da 20ª semana (se ela chega com 20 semanas ou mais, a dTpa é a 1ª dose)',
  },
  {
    id: 'v-flu',
    tipo: 'vacina',
    periodo: 'qualquer',
    nome: 'Influenza',
    quando: '1 dose por temporada; se não tomar, até 45 dias após o parto',
  },
  {
    id: 'v-covid',
    tipo: 'vacina',
    periodo: 'qualquer',
    nome: 'Covid-19',
    quando: '1 dose em cada gestação, 6 meses ou mais após a última dose',
  },
]

// ---------- Protocolo do município ----------
//
// A Caderneta 2026 diz que a solicitação "pode seguir protocolos locais". O município do usuário
// (informado por ele em 2026-11-25) não oferece HTLV, eletroforese de hemoglobina, Chagas e
// malária, e faz duas ultrassonografias obstétricas: 1º trimestre de 11 a 13 semanas e 2º
// trimestre de 20 a 24 semanas (no lugar da única "idealmente entre 7 e 12 semanas" do MS).
// HTLV e eletroforese são rotina do MS para todas as gestantes: ficam na lista, no fim, com a
// descrição de que o município não oferece. Chagas e malária (só em casos suspeitos ou região
// endêmica) saem. Toxoplasmose só no 1º e no 3º trimestre (sai a do 2º). Os exames do parto
// saem (não são usados pela equipe). Entra a cultura para estreptococo do grupo B de 35 a 37
// semanas, que não está na lista do MS. O teste rápido de gravidez sai porque, no pré-natal, já foi feito.

export const PROTOCOLO_LOCAL = {
  remover: [
    't1-trgrav',
    't1-chagas',
    't2-toxo',
    // exames do parto: não são usados pela equipe
    'p-hiv',
    'p-sifilis',
    'p-hbv',
    'p-hcv',
    't1-malaria',
    't2-malaria',
    't3-malaria',
  ] as readonly string[],
  semOferta: ['t1-htlv', 't1-eletro'] as readonly string[],
  semOfertaTexto: 'rotina do MS para todas as gestantes, mas não disponível na rede do município',
  ultrassons: [
    {
      id: 't1-usg',
      tipo: 'exame',
      periodo: 't1',
      nome: 'Ultrassonografia obstétrica de 1º trimestre',
      janela: { de: igDias(11, 0), ate: igDias(13, 6) },
      quando: 'de 11 a 13 semanas',
    },
    {
      id: 't2-usg',
      tipo: 'exame',
      periodo: 't2',
      nome: 'Ultrassonografia obstétrica de 2º trimestre',
      janela: { de: igDias(20, 0), ate: igDias(24, 6) },
      quando: 'de 20 a 24 semanas',
    },
  ] as readonly Item[],
  /** Itens do município que não estão na lista do MS, inseridos depois do item indicado. */
  extras: [
    {
      depoisDe: 't3-urina',
      item: {
        id: 't3-gbs',
        tipo: 'exame',
        periodo: 't3',
        nome: 'Cultura para estreptococo do grupo B (swab vaginal e retal)',
        janela: { de: igDias(35, 0), ate: igDias(37, 0) },
        quando: 'de 35s 0d a 37s 0d',
      } as Item,
    },
  ],
  resumo: 'Lista ajustada ao protocolo do município.',
}

function aplicarProtocolo(base: readonly Item[]): Item[] {
  const usg = new Map(PROTOCOLO_LOCAL.ultrassons.map((u) => [u.id, u]))
  const out: Item[] = []
  for (const i of base) {
    if (PROTOCOLO_LOCAL.remover.includes(i.id)) continue
    if (PROTOCOLO_LOCAL.semOferta.includes(i.id)) {
      out.push({ ...i, semOferta: PROTOCOLO_LOCAL.semOfertaTexto })
      continue
    }
    out.push(usg.get(i.id) ?? i)
    usg.delete(i.id)
    for (const e of PROTOCOLO_LOCAL.extras) if (e.depoisDe === i.id) out.push(e.item)
    // USG de 2º trimestre logo depois do TOTG
    if (i.id === 't2-totg') {
      const t2 = usg.get('t2-usg')
      if (t2) {
        out.push(t2)
        usg.delete('t2-usg')
      }
    }
  }
  // Rotina sem oferta local vai para o fim (a ordenação é estável).
  return out.sort((a, b) => Number(Boolean(a.semOferta)) - Number(Boolean(b.semOferta)))
}

/** Lista em uso: a do MS com o ajuste do município. */
export const ITENS: readonly Item[] = aplicarProtocolo(ITENS_MS)

/** Exames que dependem de indicação clínica (Caderneta 2026, 4.2.1). */
export const COM_INDICACAO: readonly string[] = [
  'Teste para tuberculose',
  'TSH (com indicação clínica ou protocolo local)',
  'Proteinúria (teste rápido)',
  'Clamídia e gonorreia',
  'Rastreamento do câncer do colo do útero (citopatológico ou teste molecular para HPV)',
  'Parasitológico de fezes',
  'Exame de secreção vaginal',
]

// ---------- Consultas ----------

export const INICIO_ATE = igDias(12, 6) // "até a 12ª semana"
export const MINIMO_CONSULTAS = 7

export interface Frequencia {
  texto: string
  intervaloDias: number
  faixa: string
}

/**
 * IG sugerida para a próxima consulta: o intervalo da frequência atual, sem passar da mudança de
 * frequência (28 e 36 semanas) e com no mínimo 1 semana. Escolha da interface, não da fonte.
 */
export function proximaConsulta(totalDias: number): number {
  const f = frequencia(totalDias)
  let alvo = totalDias + f.intervaloDias
  for (const limite of [igDias(28, 0), igDias(36, 0)]) {
    if (totalDias < limite && alvo > limite) alvo = limite
  }
  return Math.max(alvo, totalDias + 7)
}

/** Programação mínima de consultas (Caderneta 2026, 4.1.4). */
export function frequencia(totalDias: number): Frequencia {
  if (totalDias < igDias(28, 0))
    return { texto: 'mensal', intervaloDias: 28, faixa: 'até 28 semanas' }
  if (totalDias < igDias(36, 0))
    return { texto: 'quinzenal', intervaloDias: 14, faixa: 'da 28ª à 36ª semana' }
  return { texto: 'semanal', intervaloDias: 7, faixa: 'a partir da 36ª semana' }
}

// ---------- Situação de cada item numa IG ----------

export type Status = 'agora' | 'atrasado' | 'proximo'

export interface ItemNaIg {
  item: Item
  status: Status
  /** Dia de IG em que a janela abre (para "próximo"). */
  abreEm: number
}

/**
 * Classifica os itens para uma IG.
 * - agora: a janela está aberta;
 * - atrasado: a janela já fechou (conferir se foi feito);
 * - proximo: a janela ainda vai abrir.
 * Na 1ª consulta, os exames do 1º trimestre/1ª consulta entram em "agora" (a Caderneta os
 * lista para "1º trimestre ou 1ª consulta"), menos a ultrassonografia, que segue a sua janela;
 * com mais de 24 semanas, a glicemia de jejum é trocada pelo TOTG 75 g.
 */
function situar(totalDias: number, j: { de: number; ate: number | null }): Status {
  if (totalDias < j.de) return 'proximo'
  if (j.ate !== null && totalDias > j.ate) return 'atrasado'
  return 'agora'
}

export function situacaoItens(totalDias: number, primeiraConsulta: boolean): ItemNaIg[] {
  const out: ItemNaIg[] = []
  for (const item of ITENS) {
    const j = janelaDe(item)
    if (!j) continue
    let status: Status
    if (primeiraConsulta && item.periodo === 't1') {
      if (item.id === 't1-gj' && totalDias > igDias(24, 0)) continue
      // A ultrassonografia tem janela própria (medidas do 1º trimestre): segue a janela.
      if (item.id === 't1-usg') status = situar(totalDias, j)
      else status = 'agora'
    } else status = situar(totalDias, j)
    out.push({ item, status, abreEm: j.de })
  }
  if (primeiraConsulta && totalDias > igDias(24, 0)) {
    const totg = out.find((x) => x.item.id === 't2-totg')
    if (totg) totg.status = 'agora'
  }
  return out
}
