// Estratificações de risco cardiovascular por critérios das diretrizes brasileiras:
//   SBC 2025 — Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose (Rached et al.,
//     Arq Bras Cardiol 2025;122(9):e20250640): Tab. 4.1–4.8, Fig. 4.1, Tab. 5.1;
//   SBD 2026 — Diretriz da Sociedade Brasileira de Diabetes, "Manejo do risco cardiovascular:
//     dislipidemia" (Quadros 1–6);
//   PCDT DM2 2026 — item 5.5.

import { type RiskInputs, hasAscvdEvent, renalGrid } from './inputs'
import { type PreventResult } from './prevent'

export type Category =
  'baixo' | 'intermediario' | 'alto' | 'muito-alto' | 'extremo' | 'individual' | 'indeterminado'

export const CATEGORY_LABEL: Record<Category, string> = {
  baixo: 'Baixo',
  intermediario: 'Intermediário',
  alto: 'Alto',
  'muito-alto': 'Muito alto',
  extremo: 'Extremo',
  individual: 'Avaliação individualizada',
  indeterminado: 'Indeterminado',
}

export interface Target {
  ldl: string
  nonHdl: string
  apoB?: string
  reduction?: string
  statin?: string
}

export interface ScaleResult {
  category: Category
  /** Por que chegou à categoria (critérios que dispararam). */
  reasons: string[]
  /** O que falta para concluir ou observações. */
  notes: string[]
  target: Target | null
  applicable: boolean
}

const na = (msg: string): ScaleResult => ({
  category: 'indeterminado',
  reasons: [],
  notes: [msg],
  target: null,
  applicable: false,
})

// ---------------------------------------------------------------------------------------------
// Estratificadores do diabetes (comuns à SBC e à SBD, com as diferenças de cada uma)

function lpaHigh50(i: RiskInputs): boolean {
  return (i.lpaMgDl !== null && i.lpaMgDl >= 50) || (i.lpaNmolL !== null && i.lpaNmolL >= 125)
}
function lpaOver180(i: RiskInputs): boolean {
  return (i.lpaMgDl !== null && i.lpaMgDl > 180) || (i.lpaNmolL !== null && i.lpaNmolL > 390)
}

interface Strat {
  ear: string[]
  emar: string[]
}

/** SBC 2025, Tab. 4.6 (EAR), 4.7 (renal) e 4.8 (EMAR-1). */
function sbcDiabetesStrat(i: RiskInputs): Strat {
  const ear: string[] = []
  const emar: string[] = []
  if (i.dmType === 'DM2' && i.dmYears !== null && i.dmYears > 10) ear.push('DM2 há mais de 10 anos')
  if (i.prematureCadFamily) ear.push('História familiar de DAC prematura')
  if (i.metabolicSyndrome) ear.push('Síndrome metabólica (IDF)')
  if (i.hypertension) ear.push('Hipertensão arterial')
  if (i.smoker) ear.push('Tabagismo ativo')
  if (i.neuropathy === 'incipiente') ear.push('Neuropatia autonômica cardiovascular incipiente')
  if (i.retinopathy === 'np-leve') ear.push('Retinopatia não proliferativa leve')
  const renal = renalGrid(i.egfr, i.uacr)
  if (renal === 'alto') ear.push('Doença renal de risco alto (TFG × albuminúria)')
  if (i.cac !== null && i.cac >= 10 && i.cac <= 300)
    ear.push(`Escore de cálcio ${i.cac} UA (10–300)`)
  if (i.carotidPlaque) ear.push('Placa carotídea < 50%')
  if (i.coronaryCtPlaque) ear.push('Placa < 50% na angiotomografia coronária')
  if (i.aaa) ear.push('Aneurisma de aorta abdominal')

  if (ear.length >= 3) emar.push(`${ear.length} estratificadores de alto risco`)
  if (i.dmType === 'DM1' && i.dmYears !== null && i.dmYears > 20 && i.dmDiagnosedAfter18)
    emar.push('DM1 há mais de 20 anos, diagnosticado após os 18 anos')
  if (i.stenosisOver50) emar.push('Estenose > 50% em qualquer território')
  if (renal === 'muito-alto') emar.push('Doença renal de risco muito alto (TFG × albuminúria)')
  if ((i.totalChol !== null && i.totalChol > 310) || (i.ldl !== null && i.ldl > 190))
    emar.push('Hipercolesterolemia grave (CT > 310 ou LDL > 190 mg/dL)')
  if (i.neuropathy === 'instalada') emar.push('Neuropatia autonômica cardiovascular instalada')
  if (i.retinopathy === 'moderada-grave')
    emar.push('Retinopatia moderada-grave, proliferativa ou em progressão')
  return { ear, emar }
}

/** SBD 2026, Quadros 2 (EAR), 3 (renal) e 4 (EMAR-1). */
function sbdDiabetesStrat(i: RiskInputs): Strat {
  const ear: string[] = []
  const emar: string[] = []
  if (i.dmType === 'DM2' && i.dmYears !== null && i.dmYears > 10) ear.push('DM2 há mais de 10 anos')
  if (i.prematureCadFamily) ear.push('História familiar de DAC prematura')
  if (i.metabolicSyndrome) ear.push('Síndrome metabólica (IDF)')
  if (i.hypertension) ear.push('Hipertensão arterial')
  if (i.smoker) ear.push('Tabagismo ativo')
  if (i.neuropathy === 'incipiente') ear.push('Neuropatia autonômica incipiente (1 teste alterado)')
  if (i.retinopathy === 'np-leve') ear.push('Retinopatia não proliferativa leve')
  if (i.ldl !== null && i.ldl > 190) ear.push('LDL > 190 mg/dL')
  const renal = renalGrid(i.egfr, i.uacr)
  if (renal === 'alto') ear.push('Estratificador renal (TFGe 30–59 ou TFGe > 45 com RAC 30–300)')
  if (i.carotidPlaque) ear.push('Placa carotídea (EIM > 1,5 mm)')
  if (i.coronaryCtPlaque) ear.push('Placa na angiotomografia coronária')
  if (i.abnormalAbi) ear.push('Índice tornozelo-braquial alterado')
  if (i.aaa) ear.push('Aneurisma de aorta abdominal')
  if (i.cac !== null && i.cac > 10) ear.push(`Escore de cálcio ${i.cac} UA (> 10)`)
  if (lpaHigh50(i)) ear.push('Lp(a) ≥ 50 mg/dL ou ≥ 125 nmol/L')
  if (i.ntProBnp !== null && i.ntProBnp >= ((i.age ?? 0) >= 60 ? 190 : 125))
    ear.push(`NT-proBNP ≥ ${(i.age ?? 0) >= 60 ? 190 : 125} pg/mL`)

  if (ear.length >= 3) emar.push(`${ear.length} estratificadores de alto risco`)
  if (i.dmType === 'DM1' && i.dmYears !== null && i.dmYears > 20 && i.dmDiagnosedAfter18)
    emar.push('DM1 há mais de 20 anos, diagnosticado após os 18 anos')
  if (i.stenosisOver50) emar.push('Estenose > 50% em qualquer território')
  if (i.familialHypercholesterolemia) emar.push('Hipercolesterolemia familiar confirmada')
  if (i.neuropathy === 'instalada') emar.push('Neuropatia autonômica grave (2 testes alterados)')
  if (i.retinopathy === 'moderada-grave')
    emar.push('Retinopatia moderada-grave, proliferativa ou em progressão')
  if (renal === 'muito-alto') emar.push('Estratificador renal de muito alto risco')
  return { ear, emar }
}

function eventReasons(i: RiskInputs): string[] {
  const r: string[] = []
  if (i.recentAcs) r.push('Síndrome coronária aguda nos últimos 12 meses')
  if (i.priorMi) r.push('IAM prévio ou angina estável')
  if (i.ischemicStroke) r.push('AVC isquêmico ou AIT')
  if (i.revascularization) r.push('Revascularização arterial')
  if (i.pad) r.push('Doença arterial periférica sintomática ou amputação')
  return r
}

// ---------------------------------------------------------------------------------------------
// SBC 2025

export const SBC_TARGETS: Record<
  'baixo' | 'intermediario' | 'alto' | 'muito-alto' | 'extremo',
  Target
> = {
  baixo: { ldl: '< 115', nonHdl: '< 145', apoB: '< 100', reduction: '≥ 30%' },
  intermediario: { ldl: '< 100', nonHdl: '< 130', apoB: '< 90', reduction: '≥ 30%' },
  alto: { ldl: '< 70', nonHdl: '< 100', apoB: '< 70', reduction: '≥ 50%' },
  'muito-alto': { ldl: '< 50', nonHdl: '< 80', apoB: '< 55', reduction: '≥ 50%' },
  extremo: { ldl: '< 40', nonHdl: '< 70', apoB: '< 45', reduction: '≥ 50%' },
}

function sbcResult(
  category: keyof typeof SBC_TARGETS,
  reasons: string[],
  notes: string[] = [],
): ScaleResult {
  const extra =
    category === 'baixo'
      ? [
          'No risco baixo, fármaco só com LDL-c persistentemente ≥ 145 mg/dL apesar do estilo de vida.',
        ]
      : []
  return {
    category,
    reasons,
    notes: [...notes, ...extra],
    target: SBC_TARGETS[category],
    applicable: true,
  }
}

/** Condições de alto risco para o risco extremo (Tab. 4.2). */
function extremeConditions(i: RiskInputs): string[] {
  const c: string[] = []
  if (i.age !== null && i.age >= 65) c.push('Idade ≥ 65 anos')
  if (i.familialHypercholesterolemia) c.push('Hipercolesterolemia familiar')
  if (i.revascularization) c.push('Revascularização miocárdica ou ICP')
  if (i.diabetes) c.push('Diabetes')
  if (i.hypertension) c.push('Hipertensão arterial')
  if (i.egfr !== null && i.egfr >= 15 && i.egfr < 60) c.push('DRC (TFGe 15–59)')
  if (i.smoker) c.push('Tabagismo atual')
  if (i.ldlHighDespiteMaxTherapy) c.push('LDL ≥ 100 apesar de estatina máxima + ezetimiba')
  if (i.eventUnder2Years) c.push('Evento agudo há menos de 2 anos')
  return c
}

export function sbc2025(i: RiskInputs, prev: PreventResult | null): ScaleResult {
  // 1. Evento aterosclerótico prévio → extremo ou muito alto (Fig. 4.1).
  if (hasAscvdEvent(i)) {
    const cond = extremeConditions(i)
    const ev = eventReasons(i)
    if (i.multipleEvents || cond.length >= 2) {
      return sbcResult('extremo', [
        ...ev,
        i.multipleEvents
          ? 'Múltiplos eventos maiores'
          : `${cond.length} condições de alto risco: ${cond.join('; ')}`,
      ])
    }
    return sbcResult(
      'muito-alto',
      ev,
      cond.length
        ? [`Condição de alto risco: ${cond.join('; ')} (com mais uma, seria extremo).`]
        : [],
    )
  }
  // 2. Doença aterosclerótica significativa ou CAC > 300.
  if (i.stenosisOver50) return sbcResult('muito-alto', ['Obstrução arterial ≥ 50%'])
  if (i.cac !== null && i.cac > 300)
    return sbcResult('muito-alto', [`Escore de cálcio ${i.cac} UA (> 300)`])
  if (i.familialHypercholesterolemia && i.cac !== null && i.cac > 100)
    return sbcResult('muito-alto', ['Hipercolesterolemia familiar com CAC > 100 UA'])

  // 3. Diabetes: estratificação própria (Tab. 4.5).
  if (i.diabetes) {
    const { ear, emar } = sbcDiabetesStrat(i)
    if (emar.length)
      return sbcResult('muito-alto', emar, ear.length ? [`EAR: ${ear.join('; ')}`] : [])
    if (ear.length) return sbcResult('alto', ear)
    if (i.dmType === 'DM1' && (i.dmYears === null || i.dmYears < 20)) {
      return {
        category: 'indeterminado',
        reasons: [],
        notes: [
          'DM1 com menos de 20 anos de doença e sem estratificadores: a diretriz indica a calculadora Steno Type 1 Risk Engine.',
        ],
        target: null,
        applicable: true,
      }
    }
    if (i.age === null) return { ...na('Informe a idade.'), applicable: true }
    const old = i.sex === 'M' ? i.age >= 50 : i.age >= 56
    return old
      ? sbcResult('alto', [
          `Diabetes, ${i.sex === 'M' ? 'homem ≥ 50' : 'mulher ≥ 56'} anos, sem estratificadores`,
        ])
      : sbcResult('intermediario', [
          `Diabetes, ${i.sex === 'M' ? 'homem < 50' : 'mulher < 56'} anos, sem estratificadores`,
        ])
  }

  // 4. Sem diabetes: aterosclerose subclínica, LDL ≥ 190, Lp(a) > 180 → alto.
  const high: string[] = []
  if (i.carotidPlaque) high.push('Placa carotídea < 50%')
  if (i.cac !== null && i.cac > 100) high.push(`Escore de cálcio ${i.cac} UA (> 100)`)
  if (i.cacAbove75thPercentile) high.push('Escore de cálcio acima do percentil 75')
  if (i.coronaryCtPlaque) high.push('Placa < 50% na angiotomografia coronária')
  if (i.aaa) high.push('Aneurisma de aorta abdominal')
  if (i.ldl !== null && i.ldl >= 190) high.push('LDL-c ≥ 190 mg/dL')
  if (lpaOver180(i)) high.push('Lp(a) > 180 mg/dL (> 390 nmol/L)')
  if (high.length) return sbcResult('alto', high)

  // 5. PREVENT (ASCVD em 10 anos) + agravantes.
  const aggr = [...i.aggravators]
  if (lpaHigh50(i)) aggr.push('Lp(a) ≥ 50 mg/dL ou ≥ 125 nmol/L')
  const ldl160 = i.ldl !== null && i.ldl >= 160 && i.ldl <= 189
  if (!prev) {
    if (ldl160)
      return sbcResult(
        'intermediario',
        ['LDL-c 160–189 mg/dL'],
        ['Sem PREVENT (dados incompletos ou idade fora de 30–79 anos).'],
      )
    return {
      category: 'indeterminado',
      reasons: [],
      notes: [
        i.age !== null && (i.age < 30 || i.age > 79)
          ? 'O PREVENT vale de 30 a 79 anos; fora dessa faixa, a diretriz usa os agravantes para reclassificar.'
          : 'Preencha os dados do PREVENT (colesterol total, HDL, PA sistólica, TFGe) para concluir.',
        ...(aggr.length ? [`Agravantes presentes: ${aggr.join('; ')}`] : []),
      ],
      target: null,
      applicable: true,
    }
  }
  const pct = prev.tenYear.ascvd * 100
  const pctTxt = `PREVENT ASCVD 10 anos ${pct.toFixed(1).replace('.', ',')}%`
  if (pct >= 20) return sbcResult('alto', [`${pctTxt} (≥ 20%)`])
  if (pct >= 5) {
    return aggr.length
      ? sbcResult('alto', [`${pctTxt} (5 a < 20%)`, `Agravante: ${aggr.join('; ')}`])
      : sbcResult('intermediario', [`${pctTxt} (5 a < 20%), sem agravantes`])
  }
  if (ldl160) return sbcResult('intermediario', [`${pctTxt} (< 5%)`, 'LDL-c 160–189 mg/dL'])
  if (aggr.length)
    return sbcResult('intermediario', [`${pctTxt} (< 5%)`, `Agravante: ${aggr.join('; ')}`])
  return sbcResult('baixo', [`${pctTxt} (< 5%), sem agravantes`])
}

// ---------------------------------------------------------------------------------------------
// SBD 2026 (só para quem tem diabetes)

export const SBD_TARGETS: Record<'baixo' | 'intermediario' | 'alto' | 'muito-alto', Target> = {
  baixo: { ldl: '< 100', nonHdl: '< 130', statin: 'Estatina de moderada potência (opcional)' },
  intermediario: {
    ldl: '< 100',
    nonHdl: '< 130',
    reduction: '≥ 30%',
    statin: 'Estatina de moderada potência (recomendada)',
  },
  alto: { ldl: '< 70', nonHdl: '< 100', reduction: '≥ 50%', statin: 'Estatina de alta potência' },
  'muito-alto': {
    ldl: '< 50',
    nonHdl: '< 80',
    reduction: '≥ 50%',
    statin: 'Estatina de alta potência; ezetimiba e/ou iPCSK9 se a meta não for atingida',
  },
}

const sbdResult = (
  category: keyof typeof SBD_TARGETS,
  reasons: string[],
  notes: string[] = [],
): ScaleResult => ({
  category,
  reasons,
  notes,
  target: SBD_TARGETS[category],
  applicable: true,
})

export function sbd2026(i: RiskInputs): ScaleResult {
  if (!i.diabetes) return na('A estratificação da SBD é só para pessoas com diabetes.')
  if (hasAscvdEvent(i)) return sbdResult('muito-alto', eventReasons(i))
  const { ear, emar } = sbdDiabetesStrat(i)
  if (emar.length)
    return sbdResult('muito-alto', emar, ear.length ? [`EAR: ${ear.join('; ')}`] : [])
  if (ear.length) return sbdResult('alto', ear)
  if (i.dmType === 'DM1' && (i.dmYears === null || i.dmYears < 20)) {
    return {
      category: 'indeterminado',
      reasons: [],
      notes: [
        'DM1 com menos de 20 anos de doença e sem estratificadores: usar a calculadora Steno Type 1 Risk Engine.',
      ],
      target: null,
      applicable: true,
    }
  }
  if (i.age === null) return { ...na('Informe a idade.'), applicable: true }
  const a = i.age
  if (i.sex === 'M') {
    if (a < 38) return sbdResult('baixo', ['Homem < 38 anos, sem estratificadores'])
    if (a < 50) return sbdResult('intermediario', ['Homem de 38 a 49 anos, sem estratificadores'])
    return sbdResult('alto', ['Homem ≥ 50 anos'])
  }
  if (a < 46) return sbdResult('baixo', ['Mulher < 46 anos, sem estratificadores'])
  if (a < 56) return sbdResult('intermediario', ['Mulher de 46 a 55 anos, sem estratificadores'])
  return sbdResult('alto', ['Mulher ≥ 56 anos'])
}

// ---------------------------------------------------------------------------------------------
// PCDT DM2 2026 (item 5.5)

export function pcdt2026(i: RiskInputs): ScaleResult {
  if (!i.diabetes)
    return na(
      'A regra do PCDT DM2 é para pessoas com DM2. Sem diabetes, use a calculadora OMS/HEARTS.',
    )
  if (i.dmType === 'DM1') {
    return {
      category: 'individual',
      reasons: ['DM1'],
      notes: ['Avaliar de forma individualizada, de preferência com a atenção especializada.'],
      target: null,
      applicable: true,
    }
  }
  if (i.age === null) return { ...na('Informe a idade.'), applicable: true }
  const dcv = i.priorMi || i.recentAcs || i.ischemicStroke || i.pad || i.revascularization
  if (i.age <= 39) {
    if (i.nephropathy || i.retinopathy !== 'nenhuma') {
      return {
        category: 'alto',
        reasons: ['≤ 39 anos com nefropatia ou retinopatia'],
        notes: [],
        target: null,
        applicable: true,
      }
    }
    return {
      category: 'individual',
      reasons: ['≤ 39 anos'],
      notes: [
        'Avaliação individualizada; autocuidado, alimentação, atividade física, cessar tabagismo e reduzir álcool.',
      ],
      target: null,
      applicable: true,
    }
  }
  if (i.age >= 75) {
    return {
      category: 'individual',
      reasons: ['≥ 75 anos'],
      notes: ['Avaliação individualizada.'],
      target: null,
      applicable: true,
    }
  }
  if (dcv)
    return {
      category: 'muito-alto',
      reasons: ['DM2 com doença coronariana, AVC ou doença arterial periférica'],
      notes: [],
      target: null,
      applicable: true,
    }
  return {
    category: 'alto',
    reasons: ['DM2 de 40 a 74 anos (o PCDT já classifica como alto risco)'],
    notes: [
      'A estratificação não altera a conduta para o DM2; apoia o tratamento da dislipidemia pelo PCDT específico. Reavaliar anualmente.',
    ],
    target: null,
    applicable: true,
  }
}
