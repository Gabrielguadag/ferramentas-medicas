// Códigos do IEEE 11073-20601 / 10101 / 10417 usados aqui. Os de APDU, ação, evento e atributo
// conferem com dois drivers que funcionam com aparelhos reais (Tidepool Uploader, BSD-2, e
// emogenet/accuchek, domínio público). Os códigos de métrica de glicose (partição SCADA) vêm do
// IEEE 11073-10417 e ainda precisam ser confirmados com um aparelho real (ver docs/accu-chek.md).

export const APDU = {
  AARQ: 0xe200,
  AARE: 0xe300,
  RLRQ: 0xe400,
  RLRE: 0xe500,
  ABRT: 0xe600,
  PRST: 0xe700,
} as const

export const DATA_APDU = {
  ROIV_EVENT_REPORT: 0x0100,
  ROIV_CONFIRMED_EVENT_REPORT: 0x0101,
  ROIV_GET: 0x0103,
  ROIV_SET: 0x0104,
  ROIV_CONFIRMED_SET: 0x0105,
  ROIV_ACTION: 0x0106,
  ROIV_CONFIRMED_ACTION: 0x0107,
  RORS_CONFIRMED_EVENT_REPORT: 0x0201,
  RORS_GET: 0x0203,
  RORS_CONFIRMED_SET: 0x0205,
  RORS_CONFIRMED_ACTION: 0x0207,
  ROER: 0x0300,
  RORJ: 0x0400,
} as const

export const EVENT = {
  MDC_NOTI_CONFIG: 0x0d1c,
  MDC_NOTI_SCAN_REPORT_FIXED: 0x0d1d,
  MDC_NOTI_SEGMENT_DATA: 0x0d21,
} as const

export const ACTION = {
  MDC_ACT_SEG_GET_INFO: 0x0c0d,
  MDC_ACT_SEG_SET_TIME: 0x0c17,
  MDC_ACT_SEG_TRIG_XFER: 0x0c1c,
  MDC_ACT_SEG_GET_ID_LIST: 0x0c1e,
} as const

export const OBJ_CLASS = {
  MDC_MOC_VMO_METRIC: 4,
  MDC_MOC_VMO_METRIC_ENUM: 5,
  MDC_MOC_VMO_METRIC_NU: 6,
  MDC_MOC_VMS_MDS_SIMP: 37,
  MDC_MOC_VMO_PMSTORE: 61,
  MDC_MOC_PM_SEGMENT: 62,
} as const

export const ATTR = {
  MDC_ATTR_ID_HANDLE: 2337,
  MDC_ATTR_ID_MODEL: 2344,
  MDC_ATTR_ID_PROD_SPECN: 2349,
  MDC_ATTR_ID_TYPE: 2351,
  MDC_ATTR_METRIC_STORE_USAGE_CNT: 2372,
  MDC_ATTR_MSMT_STAT: 2375,
  MDC_ATTR_NU_VAL_OBS: 2384,
  MDC_ATTR_NUM_SEG: 2385,
  MDC_ATTR_OP_STAT: 2387,
  MDC_ATTR_SEG_USAGE_CNT: 2427,
  MDC_ATTR_SYS_ID: 2436,
  MDC_ATTR_TIME_ABS: 2439,
  MDC_ATTR_TIME_STAMP_ABS: 2448,
  MDC_ATTR_UNIT_CODE: 2454,
  MDC_ATTR_DEV_CONFIG_ID: 2628,
  MDC_ATTR_ENUM_OBS_VAL_SIMP_OID: 2633,
  MDC_ATTR_NU_VAL_OBS_BASIC: 2636,
  MDC_ATTR_PM_STORE_CAPAB: 2637,
  MDC_ATTR_PM_SEG_MAP: 2638,
  MDC_ATTR_NU_VAL_OBS_SIMP: 2646,
  MDC_ATTR_ENUM_OBS_VAL_SIMP_BIT_STR: 2661,
  MDC_ATTR_ENUM_OBS_VAL_BASIC_BIT_STR: 2662,
} as const

/** ProdSpecEntry.spec-type */
export const PROD_SPEC = {
  UNSPECIFIED: 0,
  SERIAL_NUMBER: 1,
  PART_NUMBER: 2,
  HW_REVISION: 3,
  SW_REVISION: 4,
  FW_REVISION: 5,
  PROTOCOL_REVISION: 6,
} as const

/** Unidades (MDC_DIM_*). */
export const UNIT = {
  MG_PER_DL: 2130,
  MMOL_PER_L: 4722,
} as const

/** Tipos de métrica de glicose (partição 2, SCADA). A confirmar com aparelho real. */
export const GLUCOSE_METRIC: Record<number, string> = {
  29112: 'sangue capilar total',
  29116: 'plasma capilar',
  29120: 'sangue venoso total',
  29124: 'plasma venoso',
  29128: 'sangue arterial total',
  29132: 'plasma arterial',
  29136: 'solução de controle',
  29140: 'fluido intersticial',
}
export const METRIC_GLU_CONTROL = 29136

/** Cabeçalho da entrada de segmento (SegmEntryHeader). */
export const SEG_ENTRY_HEADER = {
  ABSOLUTE_TIME: 0x8000, // AbsoluteTime, 8 bytes
  RELATIVE_TIME: 0x4000, // RelativeTime, 4 bytes
  HIRES_RELATIVE_TIME: 0x2000, // HighResRelativeTime, 8 bytes
} as const

/** SegmEvtStatus */
export const SEG_EVT_STATUS = {
  FIRST_ENTRY: 0x8000,
  LAST_ENTRY: 0x4000,
  AGENT_ABORT: 0x0800,
  MANAGER_CONFIRM: 0x0080,
  MANAGER_ABORT: 0x0008,
} as const

/** TrigSegmXferRsp */
export const TRIG_XFER_RSP: Record<number, string> = {
  0: 'transferência aceita',
  1: 'segmento inexistente',
  2: 'aparelho ocupado, tente de novo',
  3: 'segmento vazio',
  512: 'falha ao ler o segmento',
}

/** MeasurementStatus (BITS-16) — significado padrão; o uso pela Roche não está documentado. */
export const MSMT_STATUS_BITS: ReadonlyArray<readonly [number, string]> = [
  [0x8000, 'inválida'],
  [0x4000, 'questionável'],
  [0x2000, 'não disponível'],
  [0x1000, 'calibração em curso'],
  [0x0800, 'dado de teste'],
  [0x0400, 'dado de demonstração'],
  [0x0080, 'validada'],
  [0x0040, 'indicação precoce'],
  [0x0020, 'medição em curso'],
]

/** Modelos Roche por código de modelo (lista do Tidepool Uploader, models.js). */
export const ROCHE_MODELS: ReadonlyArray<readonly [string, readonly number[]]> = [
  ['Accu-Chek Aviva Connect', [483, 484, 497, 498, 499, 500, 502, 685]],
  ['Accu-Chek Performa Connect', [479, 501, 503, 765]],
  ['Accu-Chek Guide', [921, 922, 923, 925, 926, 929, 930, 932]],
  ['Accu-Chek Guide Me', [897, 898, 901, 902, 903, 904, 905]],
  ['Accu-Chek Instant (1 botão)', [958, 959, 960, 961, 963, 964, 965]],
  ['Accu-Chek Instant (2 botões)', [972, 973, 975, 976, 977, 978, 979, 980]],
  ['Accu-Chek Instant S', [966, 967, 968, 969, 970, 971]],
  ['ReliOn Platinum', [982]],
]

export function rocheModelName(code: number): string | null {
  for (const [name, codes] of ROCHE_MODELS) if (codes.includes(code)) return name
  return null
}

export const ROCHE_VENDOR_ID = 0x173a
export const USB_CLASS_PHDC = 0x0f
