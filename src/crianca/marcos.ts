// Marcos do desenvolvimento e Instrumento de Avaliação do Desenvolvimento Integral da Criança.
// Fonte: Caderneta da Criança (MS), 6ª ed., pág. 78 a 86. As faixas etárias de cada grupo de
// quatro marcos são as colunas coloridas das tabelas (pág. 81 a 85); o texto de "como pesquisar"
// é o da Caderneta, sem alteração de conteúdo.

export type Resposta = 'P' | 'A' | 'NV'

export interface Marco {
  id: string
  nome: string
  como: string
}

export interface FaixaMarcos {
  /** Idade em meses: de (inclusive) até (exclusive). */
  de: number
  ate: number
  marcos: Marco[]
}

export const FAIXAS: FaixaMarcos[] = [
  {
    de: 0,
    ate: 1,
    marcos: [
      {
        id: 'postura',
        nome: 'Postura: pernas e braços fletidos, cabeça lateralizada',
        como: 'Deite a criança em superfície plana, de costas, com a barriga para cima; observe se seus braços e pernas ficam flexionados e sua cabeça lateralizada.',
      },
      {
        id: 'observa-rosto',
        nome: 'Observa um rosto',
        como: 'Posicione seu rosto a aproximadamente 30 cm acima do rosto da criança. Observe se a criança olha para você, de forma evidente.',
      },
      {
        id: 'reage-som',
        nome: 'Reage ao som',
        como: 'Fique atrás da criança e bata palmas ou balance um chocalho a cerca de 30 cm de cada orelha da criança e observe se ela reage ao estímulo sonoro com movimentos nos olhos ou mudança da expressão facial.',
      },
      {
        id: 'eleva-cabeca',
        nome: 'Eleva a cabeça',
        como: 'Coloque a criança de bruços (barriga para baixo) e observe se ela levanta a cabeça, desencosta o queixo da superfície, sem virar para um dos lados.',
      },
    ],
  },
  {
    de: 1,
    ate: 2,
    marcos: [
      {
        id: 'sorri',
        nome: 'Sorri quando estimulada',
        como: 'Sorria e converse com a criança; não lhe faça cócegas ou toque sua face. Observe se ela responde com um sorriso.',
      },
      {
        id: 'abre-maos',
        nome: 'Abre as mãos',
        como: 'Observe se em alguns momentos a criança abre as mãos espontaneamente.',
      },
      {
        id: 'emite-sons',
        nome: 'Emite sons',
        como: 'Observe se a criança emite algum som, que não seja choro. Caso não seja observado pergunte ao acompanhante se faz em casa.',
      },
      {
        id: 'movimenta-membros',
        nome: 'Movimenta os membros',
        como: 'Observe se a criança movimenta ativamente os membros superiores e inferiores.',
      },
    ],
  },
  {
    de: 2,
    ate: 4,
    marcos: [
      {
        id: 'contato-social',
        nome: 'Responde ativamente ao contato social',
        como: 'Fique à frente do bebê e converse com ele. Observe se ele responde com sorriso e emissão de sons como se estivesse “conversando” com você. Pode pedir que a mãe o faça.',
      },
      {
        id: 'segura-objetos',
        nome: 'Segura objetos',
        como: 'Ofereça um objeto tocando no dorso da mão ou dedos da criança. Esta deverá abrir as mãos e segurar o objeto pelo menos por alguns segundos.',
      },
      {
        id: 'ri-alto',
        nome: 'Emite sons, ri alto',
        como: 'Fique à frente da criança e converse com ela. Observe se ela emite sons (gugu, eeee etc.), veja se ela ri emitindo sons (gargalhada).',
      },
      {
        id: 'apoia-antebracos',
        nome: 'Levanta a cabeça e apoia-se nos antebraços, de bruços',
        como: 'Coloque a criança de bruços, numa superfície firme. Chame sua atenção à frente com objetos ou seu rosto e observe se ela levanta a cabeça apoiando-se nos antebraços.',
      },
    ],
  },
  {
    de: 4,
    ate: 6,
    marcos: [
      {
        id: 'busca-objetos',
        nome: 'Busca ativa de objetos',
        como: 'Coloque um objeto ao alcance da criança (sobre a mesa ou na palma de sua mão) chamando sua atenção para ele. Observe se ela tenta alcançá-lo.',
      },
      {
        id: 'leva-boca',
        nome: 'Leva objetos à boca',
        como: 'Ofereça um objeto na mão da criança e observe se ela o leva à boca.',
      },
      {
        id: 'localiza-som',
        nome: 'Localiza o som',
        como: 'Faça um barulho suave (sino, chocalho etc.) próximo à orelha da criança e observe se ela vira a cabeça em direção ao objeto que produziu o som. Repita no lado oposto.',
      },
      {
        id: 'rola',
        nome: 'Muda de posição (rola)',
        como: 'Coloque a criança em superfície plana de barriga para cima. Incentive-a a virar para a posição de bruços.',
      },
    ],
  },
  {
    de: 6,
    ate: 9,
    marcos: [
      {
        id: 'esconde-achou',
        nome: 'Brinca de esconde-achou',
        como: 'Coloque-se à frente da criança e brinque de aparecer e desaparecer, atrás de um pano ou de outra pessoa. Observe se a criança faz movimentos para procurá-lo quando desaparece, como tentar puxar o pano ou olhar atrás da outra pessoa.',
      },
      {
        id: 'transfere',
        nome: 'Transfere objetos de uma mão para outra',
        como: 'Ofereça um objeto para que a criança segure. Observe se ela o transfere de uma mão para outra. Se não fizer, ofereça outro objeto e observe se ela transfere o primeiro para outra mão.',
      },
      {
        id: 'duplica-silabas',
        nome: 'Duplica sílabas',
        como: 'Observe se a criança fala “papá”, “dadá”, “mamã”. Se não o fizer, pergunte à mãe se o faz em casa.',
      },
      {
        id: 'senta',
        nome: 'Senta-se sem apoio',
        como: 'Coloque a criança numa superfície firme, ofereça-lhe um objeto para que ela segure e observe se ela fica sentada sem o apoio das mãos para equilibrar-se.',
      },
    ],
  },
  {
    de: 9,
    ate: 12,
    marcos: [
      {
        id: 'imita-gestos',
        nome: 'Imita gestos',
        como: 'Faça algum gesto conhecido pela criança como bater palmas ou dar tchau e observe se ela o imita. Caso ela não o faça, peça à mãe para estimulá-la.',
      },
      {
        id: 'pinca',
        nome: 'Faz pinça',
        como: 'Coloque próximo à criança um objeto pequeno ou uma bolinha de papel. Chame atenção da criança para que ela o pegue. Observe se ao pegá-lo ela usa o movimento de pinça, com qualquer parte do polegar associado ao indicador.',
      },
      {
        id: 'jargao',
        nome: 'Produz “jargão”',
        como: 'Observe se a criança produz uma conversação incompreensível consigo mesma, com você ou com a mãe (jargão). Caso não seja possível observar, pergunte se ela o faz em casa.',
      },
      {
        id: 'anda-apoio',
        nome: 'Anda com apoio',
        como: 'Observe se a criança consegue dar alguns passos com apoio.',
      },
    ],
  },
  {
    de: 12,
    ate: 15,
    marcos: [
      {
        id: 'mostra-quer',
        nome: 'Mostra o que quer',
        como: 'A criança indica o que quer sem que seja por meio do choro, podendo ser por meio de palavras ou sons, apontando ou estendendo a mão para alcançar. Considerar a informação do acompanhante.',
      },
      {
        id: 'blocos-caneca',
        nome: 'Coloca blocos na caneca',
        como: 'Coloque três blocos e a caneca sobre a mesa, em frente à criança. Estimule-a a colocar os blocos dentro da caneca, por meio de demonstração e fala. Observe se a criança consegue colocar pelo menos um bloco dentro da caneca e soltá-lo.',
      },
      {
        id: 'uma-palavra',
        nome: 'Diz uma palavra',
        como: 'Observe se durante o atendimento a criança diz pelo menos uma palavra que não seja nome de membros da família ou de animais de estimação. Considere a informação do acompanhante.',
      },
      {
        id: 'anda-sem-apoio',
        nome: 'Anda sem apoio',
        como: 'Observe se a criança já anda bem, com bom equilíbrio, sem se apoiar.',
      },
    ],
  },
  {
    de: 15,
    ate: 18,
    marcos: [
      {
        id: 'colher-garfo',
        nome: 'Usa colher ou garfo',
        como: 'A criança usa colher ou garfo, derramando pouco fora da boca. Considere a informação do acompanhante.',
      },
      {
        id: 'torre-2',
        nome: 'Constrói torre de 2 cubos',
        como: 'Observe se a criança consegue colocar um cubo sobre o outro sem que ele caia ao retirar sua mão.',
      },
      {
        id: 'tres-palavras',
        nome: 'Fala 3 palavras',
        como: 'Observe se durante o atendimento a criança diz três palavras que não sejam nome de membros da família ou de animais de estimação. Considere a informação do acompanhante.',
      },
      {
        id: 'anda-tras',
        nome: 'Anda para trás',
        como: 'Peça à criança para abrir uma porta ou gaveta e observe se ela dá dois passos para trás sem cair.',
      },
    ],
  },
  {
    de: 18,
    ate: 24,
    marcos: [
      {
        id: 'tira-roupa',
        nome: 'Tira roupa',
        como: 'Observe se a criança é capaz de remover alguma peça de roupa, tais como: sapatos que exijam esforço para sua remoção, casacos, calças ou camisetas. Considerar informação do acompanhante.',
      },
      {
        id: 'torre-3',
        nome: 'Constrói torre de 3 cubos',
        como: 'Observe se a criança consegue empilhar três cubos sem que eles caiam ao retirar sua mão.',
      },
      {
        id: 'aponta-figuras',
        nome: 'Aponta 2 figuras',
        como: 'Observe se a criança é capaz de apontar duas de um grupo de cinco figuras.',
      },
      {
        id: 'chuta-bola',
        nome: 'Chuta bola',
        como: 'Observe se a criança chuta a bola sem apoiar-se em objetos.',
      },
    ],
  },
  {
    de: 24,
    ate: 30,
    marcos: [
      {
        id: 'veste-supervisao',
        nome: 'Veste-se com supervisão',
        como: 'Pergunte aos cuidadores se a criança é capaz de vestir alguma peça de roupa tais como: calcinha, cueca, meias, sapatos, casaco etc.',
      },
      {
        id: 'torre-6',
        nome: 'Constrói torre de 6 cubos',
        como: 'Observe se a criança consegue empilhar seis cubos sem que eles caiam ao retirar sua mão.',
      },
      {
        id: 'frases-2',
        nome: 'Frases com 2 palavras',
        como: 'Observe se a criança combina pelo menos duas palavras formando uma frase com significado que indique uma ação, tais como: “quer água”, “quer papar”, “chuta bola”. Considere a informação do acompanhante.',
      },
      {
        id: 'pula-ambos',
        nome: 'Pula com ambos os pés',
        como: 'Observe se pula com os dois pés, atingindo o chão ao mesmo tempo, mas não necessariamente no mesmo lugar.',
      },
    ],
  },
  {
    de: 30,
    ate: 36,
    marcos: [
      {
        id: 'brinca-criancas',
        nome: 'Brinca com outras crianças',
        como: 'Pergunte ao acompanhante se a criança participa de brincadeiras com outras crianças de sua idade.',
      },
      {
        id: 'imita-linha',
        nome: 'Imita o desenho de uma linha',
        como: 'Observe, após demonstração, se a criança faz uma linha ou mais (no papel), de pelo menos 5 cm de comprimento.',
      },
      {
        id: 'reconhece-acoes',
        nome: 'Reconhece 2 ações',
        como: 'Observe se a criança aponta a figura de acordo com a ação, tais como: “quem mia?”, “quem late?”, “quem fala?”, “quem galopa?”.',
      },
      {
        id: 'arremessa',
        nome: 'Arremessa bola',
        como: 'Observe se a criança arremessa a bola acima do braço.',
      },
    ],
  },
  {
    de: 36,
    ate: 42,
    marcos: [
      {
        id: 'veste-camiseta',
        nome: 'Veste uma camiseta',
        como: 'Pergunte aos cuidadores se a criança é capaz de vestir sua camiseta e/ou casaco sem botão ou zíper, sem ajuda.',
      },
      {
        id: 'polegar',
        nome: 'Move o polegar com a mão fechada',
        como: 'Demonstre para a criança e observe se ela é capaz de mover o polegar para cima em sinal de “OK” ou “legal” ou “tudo bem”, com uma ou ambas as mãos.',
      },
      {
        id: 'adjetivos',
        nome: 'Compreende 2 adjetivos',
        como: 'Verifique se a criança é capaz de compreender dois adjetivos. Pergunte: “O que você faz quando está com fome?”, “O que você faz quando está com frio?”, “O que você faz quando está cansado?”. Verifique se suas respostas são coerentes, tais como: “Eu como”, “Eu visto casaco”, “Eu vou deitar” etc.',
      },
      {
        id: 'equilibra-1',
        nome: 'Equilibra-se em cada pé 1 segundo',
        como: 'Após demonstração, verifique se a criança consegue equilibrar-se em um pé só, sem apoiar-se em nenhum objeto, pelo menos um segundo, dando-lhe três tentativas. Repita com o outro pé.',
      },
    ],
  },
  {
    de: 42,
    ate: 48,
    marcos: [
      {
        id: 'emparelha-cores',
        nome: 'Emparelha cores',
        como: 'Observe se a criança é capaz de emparelhar objetos da mesma cor, por exemplo os cubos.',
      },
      {
        id: 'copia-circulo',
        nome: 'Copia círculos',
        como: 'Forneça à criança um lápis e uma folha de papel. Mostre-lhe a figura de um círculo e verifique se ela é capaz de desenhar qualquer forma de aproximação com um círculo, que esteja fechada ou quase fechada.',
      },
      {
        id: 'fala-clara',
        nome: 'Fala clara e compreensível',
        como: 'Durante a avaliação observe a inteligibilidade da fala da criança (articulação e verbalização de ideias em sequência).',
      },
      {
        id: 'pula-um-pe',
        nome: 'Pula em um pé só',
        como: 'Demonstre e verifique se a criança consegue pular em um pé só, duas ou mais vezes, sem apoiar-se em um objeto.',
      },
    ],
  },
  {
    de: 48,
    ate: 54,
    marcos: [
      {
        id: 'veste-sem-ajuda',
        nome: 'Veste-se sem ajuda',
        como: 'Pergunte aos cuidadores se a criança é capaz de se vestir, sem alguma ajuda.',
      },
      {
        id: 'copia-cruz',
        nome: 'Copia cruz',
        como: 'Forneça à criança um lápis e uma folha de papel. Mostre-lhe a figura de uma cruz e verifique se ela é capaz de desenhar duas linhas que se cruzem próximo ao seu ponto médio.',
      },
      {
        id: 'preposicoes',
        nome: 'Compreende 4 preposições',
        como: 'Dê à criança um bloco e peça: “Coloque o bloco em cima da mesa”, “Coloque o bloco embaixo da mesa”, “Coloque um bloco na minha frente”, “Coloque um bloco atrás de mim”. Observe se ela cumpre adequadamente os quatro comandos.',
      },
      {
        id: 'equilibra-3',
        nome: 'Equilibra-se em cada pé 3 segundos',
        como: 'Procedimento semelhante a “Equilibra-se em cada pé 1 segundo”, com o tempo de 3 segundos ou mais.',
      },
    ],
  },
  {
    de: 54,
    ate: 60,
    marcos: [
      {
        id: 'escova-dentes',
        nome: 'Escova dentes sem ajuda',
        como: 'Pergunte aos cuidadores se a criança é capaz de escovar os dentes, sem ajuda ou supervisão (durante algum tempo), inclusive na colocação da pasta de dentes, na escovação dos dentes posteriores e no uso do fio dental. Verifique se a criança recebeu treino para isso.',
      },
      {
        id: 'linha-comprida',
        nome: 'Aponta a linha mais comprida',
        como: 'Mostre para a criança uma ficha contendo o desenho de duas linhas paralelas em posição vertical. Verifique se ela é capaz de apontar a linha mais comprida, mesmo mudando a posição do papel. Em três tentativas, mudando a posição do papel, ela deve acertar as três, ou cinco em seis tentativas.',
      },
      {
        id: 'define-5',
        nome: 'Define 5 palavras',
        como: 'Verifique se a criança é capaz de definir cinco palavras. Faça perguntas do tipo “O que é uma bola?” ou “O que você sabe sobre o rio?”. Use palavras do seu contexto de vida. Terá que lhe responder cinco de sete palavras. A definição é aceitável quando inclui: 1) uso; 2) forma; 3) material do que é feito; 4) categoria geral. Ex.: Rio = tem peixe, água, pescar.',
      },
      {
        id: 'equilibra-5',
        nome: 'Equilibra-se em um pé 5 segundos',
        como: 'Procedimento semelhante a “Equilibra-se em cada pé 1 segundo”, com o tempo de 5 segundos ou mais.',
      },
    ],
  },
  {
    de: 60,
    ate: 66,
    marcos: [
      {
        id: 'faz-de-conta',
        nome: 'Brinca de fazer de conta com outras crianças',
        como: 'Pergunte aos cuidadores se a criança participa de brincadeiras de fazer de conta (ex.: casinha, escola), tanto no contexto familiar quanto no escolar.',
      },
      {
        id: 'desenha-pessoa',
        nome: 'Desenha pessoa com 6 partes',
        como: 'Forneça à criança um lápis e uma folha de papel (sem pauta). Peça a ela para que desenhe uma pessoa (menino, menina, mamãe, papai etc.). Certifique-se de que ela tenha terminado o desenho antes de pontuar o item do teste. As partes do corpo presentes em pares deverão ser consideradas como uma parte apenas (orelhas, olhos, braços, mãos, pernas e pés). Considere como certo somente se ambas as partes do par forem desenhadas.',
      },
      {
        id: 'analogia',
        nome: 'Faz analogia',
        como: 'Pergunte à criança, devagar e distintamente, uma questão de cada vez: “Se o cavalo é grande, o rato é…”, “Se o fogo é quente, o gelo é…”, “Se o Sol brilha durante o dia, a lua brilha durante…”. A criança deverá completar corretamente duas das três frases.',
      },
      {
        id: 'ponta-calcanhar',
        nome: 'Marcha ponta-calcanhar',
        como: 'Demonstre à criança como andar em linha reta, encostando a ponta de um pé no calcanhar do outro. Ande aproximadamente oito passos desta forma, e então peça para que a criança o imite. Se necessário, demonstre várias vezes (pode se facilitar a compreensão, comparando-se este andar com o “andar na corda bamba”). Até três tentativas são permitidas. Se a criança conseguir dar quatro ou mais passos em linha reta, com o calcanhar a, no máximo, 2,5 cm da ponta do pé, sem apoiar-se, terá alcançado este marco.',
      },
    ],
  },
  {
    de: 66,
    ate: 72,
    marcos: [
      {
        id: 'regras-jogos',
        nome: 'Aceita e segue regras nos jogos de mesa',
        como: 'Pergunte aos cuidadores se a criança é capaz de aceitar e seguir regras dos jogos de mesa.',
      },
      {
        id: 'copia-quadrado',
        nome: 'Copia um quadrado',
        como: 'Forneça à criança um lápis e uma folha de papel (sem pauta). Mostre a ela o desenho de um quadrado. Não nomear a figura nem mover seu dedo ou o lápis para demonstrar como desenhá-la. Peça para a criança “Faça um desenho como este!”. Podem ser fornecidas três tentativas. Se a criança for incapaz de copiar o quadrado da ficha, mostre a ela como fazê-lo, desenhando dois lados opostos (paralelos) e depois os outros dois lados opostos (em vez de desenhar o quadrado com um movimento contínuo). Três demonstrações e tentativas podem ser fornecidas.',
      },
      {
        id: 'define-7',
        nome: 'Define 7 palavras',
        como: 'Procedimento semelhante ao item “Define 5 palavras”. Agora deve definir 7 palavras.',
      },
      {
        id: 'equilibra-7',
        nome: 'Equilibra-se em cada pé por 7 segundos',
        como: 'Procedimento semelhante a “Equilibra-se em cada pé 1 segundo”, com o tempo de 7 segundos ou mais.',
      },
    ],
  },
]

export const IDADE_MAXIMA_MESES = 72

/** Índice da faixa em FAIXAS para a idade em meses completos; null fora de 0 a 71 meses. */
export function faixaDe(meses: number): number | null {
  const i = FAIXAS.findIndex((f) => meses >= f.de && meses < f.ate)
  return i < 0 ? null : i
}

const fmtMeses = (m: number) => {
  if (m === 0) return 'nascimento'
  if (m % 12 === 0) return `${m / 12} ${m === 12 ? 'ano' : 'anos'}`
  if (m > 12 && m % 6 === 0) return `${Math.floor(m / 12)} ${m < 24 ? 'ano' : 'anos'} e meio`
  return `${m} ${m === 1 ? 'mês' : 'meses'}`
}

/** "4 a 6 meses", "1 ano e meio a 2 anos", "do nascimento a 1 mês". */
export function rotuloFaixa(f: FaixaMarcos): string {
  if (f.de === 0) return 'do nascimento a 1 mês'
  if (f.ate <= 24) return `${f.de} a ${f.ate} meses`
  return `${fmtMeses(f.de)} a ${fmtMeses(f.ate)}`
}

/** Fatores de risco (Caderneta, pág. 78: "Vigilância do Desenvolvimento Infantil"). */
export const FATORES_RISCO = [
  {
    id: 'ambiental',
    texto:
      'Riscos ambientais: violência doméstica, depressão materna, drogas ou alcoolismo entre os moradores da casa, suspeita de abuso sexual etc.',
  },
  { id: 'infeccao', texto: 'Infecções durante a gestação (STORCH + Zika)' },
  { id: 'prenatal', texto: 'Pré-natal não realizado ou incompleto' },
  { id: 'gestacao', texto: 'Problemas na gestação, no parto ou no nascimento' },
  { id: 'prematuridade', texto: 'Prematuridade (< 37 semanas)' },
  { id: 'peso', texto: 'Peso ao nascer abaixo de 2.500 g' },
  { id: 'ictericia', texto: 'Icterícia grave' },
  { id: 'hospitalizacao', texto: 'Hospitalização no período neonatal' },
  {
    id: 'doencas',
    texto: 'Doenças graves como meningite, traumatismo craniano e convulsões',
  },
  { id: 'parentesco', texto: 'Parentesco entre os pais' },
] as const

export type FatorRisco = (typeof FATORES_RISCO)[number]['id']

export const ALTERACOES_FENOTIPICAS = [
  'fenda palpebral oblíqua',
  'olhos afastados',
  'implantação baixa de orelhas',
  'lábio leporino',
  'fenda palatina',
  'pescoço curto e/ou largo',
  'prega palmar única',
  'quinto dedo da mão curto e recurvado',
]

export type Classe = 'provavel-atraso' | 'alerta' | 'adequado'

export type Avaliacao =
  | { classe: Classe; motivos: string[] }
  /** Falta marcar algum marco (P ou A) para poder classificar. */
  | { classe: 'incompleta'; falta: 'faixa' | 'anterior' }

export interface DadosAvaliacao {
  /** Índice da faixa da criança em FAIXAS. */
  faixa: number
  respostas: Partial<Record<string, Resposta>>
  /** Perímetro cefálico < -2 escores Z ou > +2 escores Z. */
  pcAlterado: boolean
  /** Três ou mais alterações fenotípicas. */
  fenotipicas3: boolean
  fatoresRisco: number
}

const resp = (r: DadosAvaliacao['respostas'], id: string): Resposta => r[id] ?? 'NV'

/**
 * Classificação do Instrumento de Avaliação do Desenvolvimento Integral da Criança
 * (Caderneta, pág. 79 e 80):
 *
 * - Provável atraso: PC < -2 ou > +2 escores Z; ou 3 ou mais alterações fenotípicas; ou
 *   ausência de 1 ou mais marcos da faixa etária anterior (na faixa de 0 a 1 mês, basta a
 *   ausência de 1 ou mais marcos da própria faixa).
 * - Alerta: ausência de 1 ou mais marcos da própria faixa (de 1 mês a 6 anos); ou todos
 *   presentes, mas com 1 ou mais fatores de risco.
 * - Adequado: todos os marcos da faixa presentes (e nenhum fator de risco).
 *
 * Os marcos da faixa anterior só são pedidos quando falta algum da faixa atual ("Caso ainda não
 * tenha alcançado algum marco da faixa etária dela: vá para a faixa etária anterior").
 */
export function classificar(d: DadosAvaliacao): Avaliacao {
  const atual = FAIXAS[d.faixa]
  if (!atual) throw new RangeError(`faixa inválida: ${d.faixa}`)
  const motivos: string[] = []
  if (d.pcAlterado) motivos.push('Perímetro cefálico < -2 ou > +2 escores Z.')
  if (d.fenotipicas3) motivos.push('Três ou mais alterações fenotípicas.')

  const r = atual.marcos.map((m) => resp(d.respostas, m.id))
  const ausentesAtual = atual.marcos.filter((m) => resp(d.respostas, m.id) === 'A')

  if (r.includes('NV')) {
    return motivos.length
      ? { classe: 'provavel-atraso', motivos }
      : { classe: 'incompleta', falta: 'faixa' }
  }

  if (ausentesAtual.length) {
    const nomes = ausentesAtual.map((m) => m.nome).join('; ')
    if (d.faixa === 0) {
      motivos.push(`Ausência de marco(s) da faixa de 0 a 1 mês: ${nomes}.`)
      return { classe: 'provavel-atraso', motivos }
    }
    const anterior = FAIXAS[d.faixa - 1] as FaixaMarcos
    const ra = anterior.marcos.map((m) => resp(d.respostas, m.id))
    const ausentesAnt = anterior.marcos.filter((m) => resp(d.respostas, m.id) === 'A')
    if (ausentesAnt.length) {
      motivos.push(
        `Ausência de marco(s) da faixa anterior (${rotuloFaixa(anterior)}): ${ausentesAnt.map((m) => m.nome).join('; ')}.`,
      )
      return { classe: 'provavel-atraso', motivos }
    }
    if (motivos.length) return { classe: 'provavel-atraso', motivos }
    if (ra.includes('NV')) return { classe: 'incompleta', falta: 'anterior' }
    return {
      classe: 'alerta',
      motivos: [`Ausência de marco(s) da faixa atual: ${nomes}.`],
    }
  }

  if (motivos.length) return { classe: 'provavel-atraso', motivos }
  if (d.fatoresRisco > 0) {
    return {
      classe: 'alerta',
      motivos: [
        `Todos os marcos da faixa presentes, mas com ${d.fatoresRisco} ${d.fatoresRisco === 1 ? 'fator' : 'fatores'} de risco.`,
      ],
    }
  }
  return {
    classe: 'adequado',
    motivos: ['Todos os marcos da faixa presentes, sem fatores de risco.'],
  }
}

export const CONDUTA: Record<Classe, { titulo: string; conduta: string[] }> = {
  'provavel-atraso': {
    titulo: 'Provável atraso no desenvolvimento',
    conduta: [
      'Acionar as equipes multiprofissionais e/ou a rede de atenção especializada para avaliação do desenvolvimento.',
    ],
  },
  alerta: {
    titulo: 'Alerta para o desenvolvimento',
    conduta: [
      'Orientar a mãe/cuidador sobre a estimulação da criança.',
      'Marcar consulta de retorno em 30 dias.',
      'Informar a mãe/cuidador sobre os sinais de alerta para retornar antes de 30 dias.',
    ],
  },
  adequado: {
    titulo: 'Desenvolvimento adequado',
    conduta: [
      'Elogiar a mãe/cuidador.',
      'Orientar a mãe/cuidador para que continue estimulando a criança.',
      'Retornar para acompanhamento conforme a rotina do serviço de saúde.',
      'Informar a mãe/cuidador sobre os sinais de alerta para retornar antes.',
    ],
  },
}

/** Sinais de alerta (Caderneta, pág. 53 e 54). */
export const SINAIS_ALERTA = [
  'Não busca interação, não reage ou se irrita ao contato com as pessoas e com o ambiente.',
  'Não responde ao olhar, aos sons, à conversa e ao toque quando é amamentada, alimentada, colocada no colo ou acariciada.',
  'Demonstra maior interesse por objetos do que por pessoas.',
  'Habitualmente fica isolada e não se interessa em brincar com outras crianças.',
  'Tem dificuldade na fala e em atender aos comandos.',
  'Faz gestos e movimentos repetitivos.',
  'Tem dificuldades para virar de bruços, sustentar a cabeça, engatinhar e andar. Demora mais tempo que as outras crianças para fazer essas ações.',
  'Tem dificuldade para memorizar e realizar uma tarefa até o fim.',
  'Tem dificuldade para aprender e solucionar problemas práticos relacionados às atividades da vida diária.',
  'Tem dificuldade com o sono ou com a alimentação.',
  'Tem sensibilidade exacerbada a determinados ruídos de motores de eletrodomésticos, furadeiras e fogos de artifício.',
  'Não aceita o toque, não responde quando alguém fala seu nome e apresenta baixa frequência de sorriso e reciprocidade social.',
  'Apresenta muita agressividade.',
  'Apresenta intensa agitação, impulsividade e falta de atenção.',
  'Desafia com frequência e tem dificuldade de seguir as regras.',
]
