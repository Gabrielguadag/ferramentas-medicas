// Introdução alimentar: o que oferecer em cada idade, conforme o leite que a criança recebe.
// Fonte única: Ministério da Saúde, Guia alimentar para crianças brasileiras menores de 2 anos
// (2019; 1ª ed. revisada, 2022). As páginas citadas são as da edição revisada.

export type Leite = 'materno' | 'formula' | 'vaca'

export const LEITES: { value: Leite; label: string }[] = [
  { value: 'materno', label: 'Leite materno' },
  { value: 'formula', label: 'Fórmula infantil' },
  { value: 'vaca', label: 'Leite de vaca integral' },
]

/**
 * Leite de vaca integral antes de 12 meses (decisão do usuário, 2026-11-25): o padrão é a SBP,
 * que não recomenda leite de vaca integral no primeiro ano (sem leite materno, fórmula infantil).
 * O esquema do Guia do MS, que o admite quando não há acesso à fórmula (e no lugar da fórmula a
 * partir de 9 meses), aparece como alternativa não indicada em condições gerais.
 */
export const ROTULO_ALTERNATIVA_MS = 'alternativa do MS, não indicada em condições gerais'

export const LEITE_VACA_NAO_INDICADO =
  'Alternativa do MS, não indicada em condições gerais. Padrão (SBP): o leite de vaca integral (líquido ou em pó) não deve ser consumido no primeiro ano de vida; sem leite materno, usar fórmula infantil até 1 ano.'

export function leiteVacaNaoIndicado(meses: number): boolean {
  return meses < 12
}

/** Composto lácteo (Guia, pág. 144: "Parece fórmula infantil ou leite de vaca integral, mas não é"). */
export const COMPOSTO_LACTEO =
  'Composto lácteo: não é leite em pó nem fórmula infantil, e sim uma mistura de leite com outros ingredientes, muitas vezes incluindo açúcar. Não oferecer antes dos 2 anos.'

export interface Refeicao {
  nome: string
  oferta: string
}

export interface Plano {
  titulo: string
  pagina: string
  /** Vazio antes do início de outros alimentos. */
  refeicoes: Refeicao[]
  notas: string[]
}

export const PRATO =
  'Prato com 1 alimento do grupo dos cereais ou raízes e tubérculos, 1 do grupo dos feijões, 1 ou mais do grupo dos legumes e verduras e 1 do grupo das carnes e ovos. Junto à refeição, pode ser dado um pedaço pequeno de fruta.'

const AVISO_QTD =
  'A quantidade é só uma referência e não deve ser seguida de forma rígida: respeite os sinais de fome e saciedade.'

/** Quantidade aproximada no almoço e no jantar, em colheres de sopa no total. */
export function colheres(meses: number): string | null {
  if (meses < 4) return null
  if (meses < 7) return '2 a 3 colheres de sopa'
  if (meses < 9) return '3 a 4 colheres de sopa'
  if (meses < 12) return '4 a 5 colheres de sopa'
  if (meses < 24) return '5 a 6 colheres de sopa'
  return null
}

const refeicao = (meses: number): string => {
  const q = colheres(meses)
  return q ? `${PRATO} Quantidade aproximada: ${q} no total.` : PRATO
}

const CAFE_1_2 = (leite: string) =>
  `${leite} e fruta; ou ${leite} e cereal (pães caseiros ou processados, aveia, cuscuz de milho) ou raízes e tubérculos (aipim/macaxeira, batata-doce, inhame)`

/** Plano do dia conforme o leite e a idade em meses completos. */
export function plano(leite: Leite, meses: number): Plano {
  if (meses >= 24) {
    return {
      titulo: 'A partir de 2 anos',
      pagina: 'pág. 130 a 133',
      refeicoes: [],
      notas: [
        'Os horários das refeições podem ser os mesmos da família. Nenhum alimento ou bebida, exceto água, nos intervalos.',
        'Legumes e verduras no prato no almoço e no jantar, mesmo que a criança os recuse; estimular sem pressionar nem forçar.',
        'O aleitamento materno pode ser mantido de acordo com a vontade da mãe e da criança.',
        'A partir dos 2 anos, a referência passa a ser o Guia Alimentar para a População Brasileira.',
      ],
    }
  }
  if (leite === 'materno') return planoMaterno(meses)
  if (leite === 'formula') return planoFormula(meses)
  return planoVaca(meses)
}

function planoMaterno(meses: number): Plano {
  if (meses < 6) {
    return {
      titulo: 'Até 6 meses: aleitamento materno exclusivo',
      pagina: 'pág. 135 a 139 e 220',
      refeicoes: [],
      notas: [
        'Somente leite materno, em livre demanda, sem água, chá ou qualquer outro alimento.',
        'Outros alimentos a partir dos 6 meses.',
        'Se a mãe precisar se ausentar, ela pode retirar e armazenar o leite, que é oferecido em copo, xícara ou colher, e não em mamadeira.',
        'Se a criança já recebe outro leite além do materno, o início dos outros alimentos depende da quantidade de cada um: orientação individual do profissional de saúde.',
      ],
    }
  }
  if (meses < 7) {
    return {
      titulo: 'Aos 6 meses',
      pagina: 'pág. 113 a 117',
      refeicoes: [
        { nome: 'Café da manhã', oferta: 'leite materno' },
        { nome: 'Lanche da manhã', oferta: 'fruta e leite materno' },
        { nome: 'Almoço', oferta: refeicao(meses) },
        { nome: 'Lanche da tarde', oferta: 'fruta e leite materno' },
        { nome: 'Jantar', oferta: 'leite materno' },
        { nome: 'Antes de dormir', oferta: 'leite materno' },
      ],
      notas: [
        'Começar com 3 refeições: almoço (ou jantar) e 2 lanches; ou almoço, jantar e 1 lanche. Não há regra sobre qual refeição iniciar primeiro. Ao completar 7 meses, a criança já deve receber as 3 refeições.',
        'O leite materno continua até 2 anos ou mais; não é preciso leite de vaca nem fórmula. Os novos alimentos complementam o leite materno e não o substituem.',
        'Começar com cerca de 1 colher de sobremesa de um alimento de cada grupo, podendo chegar a 3 colheres de sopa no total.',
        AVISO_QTD,
      ],
    }
  }
  if (meses < 9) {
    return {
      titulo: 'Entre 7 e 8 meses',
      pagina: 'pág. 118 a 120',
      refeicoes: [
        { nome: 'Café da manhã', oferta: 'leite materno' },
        { nome: 'Lanche da manhã', oferta: 'fruta e leite materno' },
        { nome: 'Almoço', oferta: refeicao(meses) },
        { nome: 'Lanche da tarde', oferta: 'fruta e leite materno' },
        { nome: 'Jantar', oferta: refeicao(meses) },
        { nome: 'Antes de dormir', oferta: 'leite materno' },
      ],
      notas: [
        'Passar a 4 refeições: almoço, jantar e 2 lanches com fruta.',
        'O leite materno continua conforme a vontade da criança, sem substituir o almoço e o jantar.',
        AVISO_QTD,
      ],
    }
  }
  if (meses < 12) {
    return {
      titulo: 'Entre 9 e 11 meses',
      pagina: 'pág. 121 a 123',
      refeicoes: [
        { nome: 'Café da manhã', oferta: 'leite materno' },
        { nome: 'Lanche da manhã', oferta: 'fruta e leite materno' },
        { nome: 'Almoço', oferta: refeicao(meses) },
        { nome: 'Lanche da tarde', oferta: 'fruta e leite materno' },
        { nome: 'Jantar', oferta: refeicao(meses) },
        { nome: 'Antes de dormir', oferta: 'leite materno' },
      ],
      notas: [
        'As refeições continuam as mesmas: almoço, jantar e 2 lanches com fruta. Leite materno quando a criança quiser.',
        AVISO_QTD,
      ],
    }
  }
  return {
    titulo: 'Entre 1 e 2 anos',
    pagina: 'pág. 124 a 128 e 220',
    refeicoes: [
      { nome: 'Café da manhã', oferta: CAFE_1_2('leite materno') },
      { nome: 'Lanche da manhã', oferta: 'fruta e leite materno' },
      { nome: 'Almoço', oferta: refeicao(meses) },
      { nome: 'Lanche da tarde', oferta: CAFE_1_2('leite materno') },
      { nome: 'Jantar', oferta: refeicao(meses) },
      { nome: 'Antes de dormir', oferta: 'leite materno' },
    ],
    notas: [
      'Além do leite materno: café da manhã, lanche da manhã, almoço, lanche da tarde e jantar. Ao completar 1 ano, a criança já deve fazer as principais refeições com a comida da família.',
      'Não é preciso substituir o leite materno por leite de vaca ou fórmula.',
      AVISO_QTD,
    ],
  }
}

function planoFormula(meses: number): Plano {
  if (meses < 6) {
    return {
      titulo: 'Até 6 meses: fórmula infantil',
      pagina: 'pág. 139 e 142 a 147',
      refeicoes: [],
      notas: [
        'Seguir as quantidades de pó e água do rótulo (ou as indicadas pelo profissional): menos pó prejudica o ganho de peso; mais pó leva a ganho excessivo.',
        'A criança que recebe só fórmula infantil, bem preparada, não precisa de água.',
        'Novos alimentos, inclusive a água, a partir dos 6 meses.',
        'Preparo: água tratada fervida por 5 minutos; misturar o pó em até 15 minutos depois da fervura, nunca com a água fervendo; não aquecer no micro-ondas.',
        COMPOSTO_LACTEO,
      ],
    }
  }
  if (meses < 7) {
    return {
      titulo: 'Aos 6 meses, com fórmula infantil',
      pagina: 'pág. 147 e 148',
      refeicoes: [
        { nome: 'Café da manhã', oferta: 'fórmula infantil' },
        { nome: 'Lanche da manhã', oferta: 'fruta' },
        { nome: 'Almoço', oferta: refeicao(meses) },
        { nome: 'Lanche da tarde', oferta: 'fórmula infantil e fruta' },
        { nome: 'Entre o lanche e a ceia', oferta: 'fórmula infantil' },
        { nome: 'Ceia', oferta: 'fórmula infantil' },
      ],
      notas: ['Água também a partir dos 6 meses, ao longo do dia.', AVISO_QTD],
    }
  }
  if (meses < 9) {
    return {
      titulo: 'Entre 7 e 8 meses, com fórmula infantil',
      pagina: 'pág. 149',
      refeicoes: [
        { nome: 'Café da manhã', oferta: 'fórmula infantil' },
        { nome: 'Lanche da manhã', oferta: 'fruta' },
        { nome: 'Almoço', oferta: refeicao(meses) },
        { nome: 'Lanche da tarde', oferta: 'fórmula infantil e fruta' },
        { nome: 'Jantar', oferta: 'igual ao almoço' },
        { nome: 'Ceia', oferta: 'fórmula infantil' },
      ],
      notas: [AVISO_QTD],
    }
  }
  if (meses < 12) {
    return {
      titulo: 'Entre 9 e 11 meses, com fórmula infantil',
      pagina: 'pág. 147 e 150',
      refeicoes: [
        { nome: 'Café da manhã', oferta: 'fórmula infantil' },
        { nome: 'Lanche da manhã', oferta: 'fruta' },
        { nome: 'Almoço', oferta: refeicao(meses) },
        { nome: 'Lanche da tarde', oferta: 'fórmula infantil e fruta' },
        { nome: 'Jantar', oferta: 'igual ao almoço' },
        { nome: 'Ceia', oferta: 'fórmula infantil' },
      ],
      notas: [
        'Padrão (SBP): manter a fórmula infantil até 1 ano. O Guia do MS permite trocá-la pelo leite de vaca integral a partir dos 9 meses: alternativa não indicada em condições gerais.',
        AVISO_QTD,
      ],
    }
  }
  return {
    titulo: 'Entre 1 e 2 anos, sem leite materno',
    pagina: 'pág. 151',
    refeicoes: [
      { nome: 'Café da manhã', oferta: CAFE_1_2('leite de vaca integral') },
      { nome: 'Lanche da manhã', oferta: 'fruta' },
      { nome: 'Almoço', oferta: refeicao(meses) },
      { nome: 'Lanche da tarde', oferta: CAFE_1_2('leite de vaca integral') },
      { nome: 'Jantar', oferta: 'igual ao almoço' },
      { nome: 'Ceia', oferta: 'leite de vaca integral' },
    ],
    notas: [AVISO_QTD],
  }
}

function planoVaca(meses: number): Plano {
  if (meses < 4) {
    return {
      titulo: 'Antes de 4 meses: leite de vaca modificado em casa',
      pagina: 'pág. 138, 139 e 142 a 146',
      refeicoes: [],
      notas: [
        'A primeira alternativa para a criança não amamentada é a fórmula infantil.',
        'Antes dos 4 meses, o leite de vaca integral não pode ser oferecido sem diluição: é modificado em casa conforme a orientação do profissional de saúde.',
        'A criança alimentada com leite de vaca modificado precisa de suplementação de vitaminas e minerais, com orientação do profissional.',
        'Oferecer água nos intervalos, em copo, xícara ou colher.',
        'Leite desnatado ou semidesnatado não serve para menores de 2 anos.',
      ],
    }
  }
  if (meses < 5) {
    return {
      titulo: 'Aos 4 meses, com leite de vaca',
      pagina: 'pág. 152 e 153',
      refeicoes: [
        { nome: 'Café da manhã', oferta: 'leite de vaca integral' },
        { nome: 'Lanche da manhã', oferta: 'fruta' },
        { nome: 'Almoço', oferta: refeicao(meses) },
        { nome: 'Lanche da tarde', oferta: 'leite de vaca integral e fruta' },
        { nome: 'Jantar', oferta: 'leite de vaca integral' },
        { nome: 'Ceia', oferta: 'leite de vaca integral' },
      ],
      notas: [
        'Com leite de vaca, os novos alimentos podem começar aos 4 meses, para evitar deficiências nutricionais. A partir dessa idade, o leite integral não é mais diluído e o leite em pó segue o rótulo.',
        'Começar se a criança estiver pronta: senta, com a cabeça firme; tem coordenação entre olhos, mãos e boca; mastiga e engole sem engasgar. Na dúvida, ou se não aceitar a comida amassada, avaliar com o profissional.',
        'Fruta de manhã e à tarde e o almoço (ou o jantar), com os alimentos amassados, e água nos intervalos.',
        AVISO_QTD,
      ],
    }
  }
  if (meses < 12) {
    return {
      titulo: 'Entre 5 e 11 meses, com leite de vaca',
      pagina: 'pág. 152 e 154',
      refeicoes: [
        { nome: 'Café da manhã', oferta: 'leite de vaca integral' },
        { nome: 'Lanche da manhã', oferta: 'fruta' },
        { nome: 'Almoço', oferta: refeicao(meses) },
        { nome: 'Lanche da tarde', oferta: 'leite de vaca integral e fruta' },
        { nome: 'Jantar', oferta: 'igual ao almoço' },
        { nome: 'Ceia', oferta: 'leite de vaca integral' },
      ],
      notas: [
        'Fruta de manhã e à tarde, almoço, jantar e água nos intervalos. Nos outros horários, leite de vaca integral.',
        'No máximo 500 mL de leite por dia: mais do que isso traz risco, como a anemia.',
        AVISO_QTD,
      ],
    }
  }
  return {
    titulo: 'Entre 1 e 2 anos, com leite de vaca',
    pagina: 'pág. 155',
    refeicoes: [
      { nome: 'Café da manhã', oferta: CAFE_1_2('leite de vaca integral') },
      { nome: 'Lanche da manhã', oferta: 'fruta' },
      { nome: 'Almoço', oferta: refeicao(meses) },
      { nome: 'Lanche da tarde', oferta: CAFE_1_2('leite de vaca integral') },
      { nome: 'Jantar', oferta: 'igual ao almoço' },
      { nome: 'Ceia', oferta: 'leite de vaca integral' },
    ],
    notas: [AVISO_QTD],
  }
}

export interface Etapa {
  titulo: string
  pagina: string
  desenvolvimento: string[]
  fome: string
  saciedade: string
  como: string[]
}

/** Desenvolvimento, sinais de fome e saciedade e como oferecer (vale para qualquer leite). */
export function etapa(meses: number): Etapa | null {
  if (meses < 6 || meses >= 24) return null
  if (meses < 7) {
    return {
      titulo: 'Aos 6 meses',
      pagina: 'pág. 113 a 116',
      desenvolvimento: [
        'Senta com pouco ou nenhum apoio.',
        'Diminui o movimento de empurrar os alimentos para fora da boca com a língua.',
        'Mastiga.',
        'Surgem os primeiros dentes.',
      ],
      fome: 'chora e se inclina para a frente quando a colher está próxima, segura a mão de quem oferece a comida e abre a boca.',
      saciedade:
        'vira a cabeça ou o corpo, perde o interesse, empurra a mão de quem oferece, fecha a boca, parece angustiada ou chora.',
      como: [
        'Alimentos separados no prato e bem amassados com garfo; nunca liquidificados nem peneirados.',
        'Carnes bem cozidas, em pedaços pequenos (picadas ou desfiadas). Frutas e legumes crus podem ser raspados ou amassados.',
        'Se a comida estiver seca, um pouco do caldo do cozimento dos legumes, feijões ou carnes.',
        'Se recusar um alimento, oferecer de novo depois de alguns dias, junto com alimentos de que já gosta, ou mudar a forma de preparo.',
        'Deixar a criança usar as mãos ou uma colher do tamanho adequado; manter contato visual.',
      ],
    }
  }
  if (meses < 9) {
    return {
      titulo: 'Entre 7 e 8 meses',
      pagina: 'pág. 118 e 119',
      desenvolvimento: [
        'Senta sem apoio.',
        'Pega alimentos e leva à boca.',
        'Surgem novos dentes.',
      ],
      fome: 'inclina-se para a colher ou o alimento, pega ou aponta para a comida.',
      saciedade:
        'come mais devagar, fecha a boca ou empurra o alimento; fica com a comida parada na boca sem engolir.',
      como: [
        'Alimentos menos amassados do que antes, ou bem picados, conforme a aceitação.',
        'Alimentos lado a lado no prato.',
        'Alguns alimentos macios em pedaços grandes, para a criança pegar com as mãos e tentar comer sozinha.',
        'Uma colher pequena para a criança; se preferir as mãos, não há problema.',
      ],
    }
  }
  if (meses < 12) {
    return {
      titulo: 'Entre 9 e 11 meses',
      pagina: 'pág. 121 e 122',
      desenvolvimento: [
        'Engatinha ou anda com apoio.',
        'Faz movimento de pinça para segurar pequenos objetos.',
        'Pode comer de forma independente, mas ainda precisa de ajuda.',
        'Dá dentadas e mastiga os alimentos mais duros.',
      ],
      fome: 'aponta ou pega os alimentos, fica excitada quando vê o alimento.',
      saciedade:
        'come mais devagar, fecha a boca ou empurra o alimento; fica com a comida parada na boca sem engolir.',
      como: [
        'Alimentos picados, na mesma consistência da comida da família; carnes desfiadas.',
        'Encorajar a criança a pegar os alimentos com a mão (movimento de pinça) e a cortar com os dentes da frente.',
      ],
    }
  }
  return {
    titulo: 'Entre 1 e 2 anos',
    pagina: 'pág. 124 a 126',
    desenvolvimento: [
      'Anda com algum ou nenhum auxílio.',
      'Come com colher e segura o alimento com as mãos.',
      'Segura o copo com as duas mãos.',
      'Mastiga melhor; os dentes molares começam a aparecer.',
    ],
    fome: 'combina palavras e gestos para pedir alimentos, leva quem cuida até onde estão os alimentos, aponta para eles.',
    saciedade:
      'balança a cabeça, diz que não quer, sai da mesa, brinca com o alimento, joga-o longe.',
    como: [
      'Pedaços maiores, na mesma consistência da comida da família.',
      'Estimular a criança a comer sozinha e continuar ampliando a variedade.',
      'Local tranquilo, sem distrair com televisão, celular ou outros aparelhos.',
      'É comum recusar alimentos de que gostava: a aceitação melhora com a oferta repetida ou mudando o preparo.',
    ],
  }
}

export interface Cuidado {
  texto: string
  pagina: string
}

/** O que não oferecer e cuidados de segurança, conforme a idade em meses completos. */
export function cuidados(meses: number): Cuidado[] {
  const c: Cuidado[] = []
  if (meses < 24) {
    c.push(
      {
        texto:
          'Açúcar de qualquer tipo (branco, mascavo, cristal, demerara, de coco, rapadura, melado, xarope de milho), nem preparações com açúcar (bolos, biscoitos, doces, geleias): não oferecer até 2 anos.',
        pagina: 'pág. 104 e 222',
      },
      {
        texto:
          'Mel: não oferecer até 2 anos. Além do açúcar, há risco de botulismo, maior antes de 1 ano.',
        pagina: 'pág. 104',
      },
      {
        texto: 'Adoçantes: não usar até 2 anos.',
        pagina: 'pág. 71 e 222',
      },
    )
  }
  c.push({
    texto:
      'Alimentos ultraprocessados (refrigerantes, achocolatados, farinhas instantâneas com açúcar, bolos prontos, biscoitos, iogurtes, sucos de caixinha, entre outros): não oferecer.',
    pagina: 'pág. 104 e 223',
  })
  if (meses < 12) {
    c.push({
      texto:
        'Sucos de fruta, mesmo naturais: não oferecer antes de 1 ano. Para matar a sede, água.',
      pagina: 'pág. 85',
    })
  } else if (meses < 36) {
    c.push({
      texto:
        'Sucos não são necessários; se oferecer, no máximo cerca de 120 mL por dia, natural e sem açúcar, junto a uma refeição (de preferência um lanche).',
      pagina: 'pág. 85 e 132',
    })
  }
  c.push({
    texto:
      'Água de coco, chás, refrescos e refrigerantes não substituem a água, que entra desde o início dos outros alimentos.',
    pagina: 'pág. 100 e 221',
  })
  if (meses < 24) {
    c.push(
      {
        texto:
          'Café, mate, chá preto ou verde, chocolate e refrigerante de cola (cafeína): não recomendados antes de 2 anos.',
        pagina: 'pág. 87',
      },
      {
        texto:
          'Leite desnatado ou semidesnatado: não serve para menores de 2 anos (tem pouca gordura, importante para o desenvolvimento neurológico).',
        pagina: 'pág. 143',
      },
      { texto: COMPOSTO_LACTEO, pagina: 'pág. 144' },
      {
        texto: 'Pipoca: não oferecer antes de 2 anos (risco de engasgo e sufocamento).',
        pagina: 'pág. 78',
      },
    )
  }
  if (leiteVacaNaoIndicado(meses)) {
    c.push({
      texto:
        'Leite de vaca integral (líquido ou em pó) como bebida ou refeição antes de 1 ano: não indicado em condições gerais (SBP). O Guia do MS o admite como alternativa quando não há acesso à fórmula. Leite e derivados podem entrar como ingredientes de receitas caseiras a partir dos 6 meses.',
      pagina: 'SBP, pág. 24 e 58; Guia, pág. 162',
    })
  }
  c.push(
    {
      texto:
        'Amendoim, castanhas e nozes: nunca inteiros (engasgo); só triturados ou bem picados, sem cobertura de sal ou açúcar.',
      pagina: 'pág. 88',
    },
    {
      texto:
        'Frutas pequenas ou com caroço (uva, acerola): retirar as sementes e cortar em 2 a 4 pedaços.',
      pagina: 'pág. 84',
    },
    {
      texto:
        'Carnes e ovos sempre bem cozidos, nunca malpassados ou crus; no peixe, retirar todas as espinhas. Carne de porco, peixe e clara de ovo são liberados desde os 6 meses.',
      pagina: 'pág. 86',
    },
    {
      texto:
        'Sal no mínimo necessário; temperos naturais. Não usar temperos prontos (cubo, sachê, pó ou líquido).',
      pagina: 'pág. 103',
    },
    {
      texto:
        'Mamadeira e chuquinha: evitar; líquidos em copo. Prejudicam a regulação do apetite e a mastigação, a deglutição e a fala, e podem levar ao desmame.',
      pagina: 'pág. 105 e 106',
    },
  )
  if (meses < 24) {
    c.push({
      texto:
        'Televisão, celular, computador e tablet: crianças menores de 2 anos não devem usá-los, nem durante as refeições.',
      pagina: 'pág. 97 e 226',
    })
  }
  return c
}

/** Doze passos para uma alimentação saudável (pág. 219 a 227). */
export const DOZE_PASSOS = [
  'Amamentar até 2 anos ou mais, oferecendo somente o leite materno até 6 meses.',
  'Oferecer alimentos in natura ou minimamente processados, além do leite materno, a partir dos 6 meses.',
  'Oferecer água própria para o consumo à criança em vez de sucos, refrigerantes e outras bebidas açucaradas.',
  'Oferecer a comida amassada quando a criança começar a comer outros alimentos além do leite materno.',
  'Não oferecer açúcar nem preparações ou produtos que contenham açúcar à criança até 2 anos de idade.',
  'Não oferecer alimentos ultraprocessados para a criança.',
  'Cozinhar a mesma comida para a criança e para a família.',
  'Zelar para que a hora da alimentação da criança seja um momento de experiências positivas, aprendizado e afeto junto da família.',
  'Prestar atenção aos sinais de fome e saciedade da criança e conversar com ela durante a refeição.',
  'Cuidar da higiene em todas as etapas da alimentação da criança e da família.',
  'Oferecer à criança alimentação adequada e saudável também fora de casa.',
  'Proteger a criança da publicidade de alimentos.',
]
