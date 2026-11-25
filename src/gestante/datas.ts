// Datas de calendário como número de dias desde 1970-01-01 (UTC), para somar e subtrair dias
// sem erro de fuso ou horário de verão. A interface troca datas no formato ISO (AAAA-MM-DD),
// que é o valor de <input type="date">.

const MS_DIA = 86_400_000

export type Dia = number

/** "AAAA-MM-DD" → dia; null se vazio ou inválido (ex.: 2026-02-30). */
export function parseIso(iso: string): Dia | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const t = Date.UTC(y, mo - 1, d)
  const back = new Date(t)
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) {
    return null
  }
  return Math.round(t / MS_DIA)
}

export function fromYmd(y: number, month: number, d: number): Dia {
  return Math.round(Date.UTC(y, month - 1, d) / MS_DIA)
}

function parts(dia: Dia) {
  const dt = new Date(dia * MS_DIA)
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), wd: dt.getUTCDay() }
}

const p2 = (n: number) => String(n).padStart(2, '0')

export function toIso(dia: Dia): string {
  const { y, m, d } = parts(dia)
  return `${String(y).padStart(4, '0')}-${p2(m)}-${p2(d)}`
}

const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

/** dd/mm/aaaa */
export function fmtData(dia: Dia): string {
  const { y, m, d } = parts(dia)
  return `${p2(d)}/${p2(m)}/${y}`
}

export function diaDaSemana(dia: Dia): string {
  return SEMANA[parts(dia).wd] ?? ''
}

/** Data de hoje no fuso do navegador. */
export function hojeIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`
}

/** Soma meses de calendário mantendo o dia; dia que não existe no mês passa para o seguinte. */
export function addMonths(dia: Dia, months: number): Dia {
  const { y, m, d } = parts(dia)
  return Math.round(Date.UTC(y, m - 1 + months, d) / MS_DIA)
}
