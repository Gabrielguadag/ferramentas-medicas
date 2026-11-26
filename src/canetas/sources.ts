// Fontes da área Canetas GLP-1 (citadas na tela e em docs/canetas-glp1.md).

const NN = 'https://www.novonordisk.com.br/content/dam/nncorp/br/pt/pdfs/bulas'

export const FDA_DMEPA_2017 = {
  titulo:
    'FDA. NDA 209637 (Ozempic), Other Review(s), revisão de erros de medicação (DMEPA), 2017, Reference ID 4185013, pág. 51 do PDF: 19 cliques até 0,25 mg, 37 até 0,5 mg e 74 até 1 mg na caneta de 1,34 mg/mL',
  url: 'https://www.accessdata.fda.gov/drugsatfda_docs/nda/2017/209637Orig1s000OtherR.pdf',
}

export const BULA = {
  ozempic: {
    titulo: 'Bula profissional Ozempic (Novo Nordisk): posologia, dose esquecida e validade em uso',
    url: `${NN}/hcp/hcpn/Ozempic_3_mL_1.0mg_Bula_Profissional.pdf`,
  },
  extensior: {
    titulo: 'Bula profissional Extensior (Novo Nordisk)',
    url: `${NN}/hcp/Bula_Profissional_Extensior_3_ml.pdf`,
  },
  wegovy: {
    titulo:
      'Bula profissional Wegovy (Novo Nordisk): apresentações, Tabela 16 (escalonamento), dose esquecida e validade em uso',
    url: `${NN}/hcp/Wegovy_Bula_Profissional.pdf`,
  },
  poviztra: {
    titulo: 'Bula profissional Poviztra (Novo Nordisk)',
    url: `${NN}/hcp/Poviztra_Bula_Profissional.pdf`,
  },
  ozivy: {
    titulo: 'Bula Ozivy (EMS)',
    url: 'https://bulas-ecommerce.s3.sa-east-1.amazonaws.com/ozivy.bula_46739bbe-50f9-47dc-b126-4c1de23c1699.pdf',
  },
  semavy: {
    titulo: 'Bula Semavy (Hypera)',
    url: 'https://bulas-ecommerce.s3.sa-east-1.amazonaws.com/semavy_4c585aa3-f30d-41f3-8324-83a0396c55e5.pdf',
  },
  semaclique: {
    titulo: 'Bula Semaclique (Germed)',
    url: 'https://www.sara.com.br/bula-do-paciente-semaclique-134mg-ml-com-1-caneta-aplicadora-com-3ml-solucao-4-agulhas-descartave/7896004823775/pdf',
  },
} as const

export type BulaId = keyof typeof BULA
