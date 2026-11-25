import { useEffect, useMemo, useRef, useState } from 'react'
import { type Reading, type Target, type Unit, formatGlucose, readingLabel } from './analysis'

// Gráfico de pontos (uma série) ao longo do período ou sobreposto por hora do dia.
// Cor = estado em relação ao alvo, sempre acompanhada de forma (▼ abaixo, ● alvo, ▲ acima)
// e de legenda; a tabela de medições é a visão alternativa acessível.

type Mode = 'timeline' | 'day'
type Zone = 'low' | 'in' | 'high'

const H = 300
const M = { top: 16, right: 16, bottom: 34, left: 44 }

function zoneOf(r: Reading, t: Target): Zone {
  if (r.flag === 'LO') return 'low'
  if (r.flag === 'HI') return 'high'
  const v = r.mgdl ?? 0
  return v < t.low ? 'low' : v > t.high ? 'high' : 'in'
}

const ZONE_LABEL: Record<Zone, string> = {
  low: 'Abaixo do alvo',
  in: 'No alvo',
  high: 'Acima do alvo',
}

function Mark({ zone, x, y }: { zone: Zone; x: number; y: number }) {
  const fill = `var(--g-${zone})`
  if (zone === 'in')
    return <circle cx={x} cy={y} r={4.5} fill={fill} stroke="var(--surface)" strokeWidth={2} />
  const s = 6
  const pts =
    zone === 'low'
      ? `${x - s},${y - s * 0.7} ${x + s},${y - s * 0.7} ${x},${y + s * 0.9}`
      : `${x - s},${y + s * 0.7} ${x + s},${y + s * 0.7} ${x},${y - s * 0.9}`
  return (
    <polygon
      points={pts}
      fill={fill}
      stroke="var(--surface)"
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

export function ZoneKey({ zone }: { zone: Zone }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <Mark zone={zone} x={7} y={7} />
    </svg>
  )
}

export function GlucoseChart(props: { readings: readonly Reading[]; target: Target; unit: Unit }) {
  const [mode, setMode] = useState<Mode>('timeline')
  const [width, setWidth] = useState(860)
  const [hover, setHover] = useState<{ r: Reading; x: number; y: number } | null>(null)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w && w > 200) setWidth(Math.round(w))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const points = useMemo(
    () =>
      props.readings.filter(
        (r) => !r.isControl && r.minutes !== null && (r.mgdl !== null || r.flag),
      ),
    [props.readings],
  )

  const innerW = width - M.left - M.right
  const innerH = H - M.top - M.bottom
  const maxVal = Math.max(300, ...points.map((r) => r.mgdl ?? 0), props.target.high + 40)
  const yMax = Math.min(600, Math.ceil(maxVal / 50) * 50)
  const y = (v: number) => M.top + innerH - (Math.min(v, yMax) / yMax) * innerH

  const minutes = points.map((r) => r.minutes ?? 0)
  const dayStart = minutes.length ? Math.floor(Math.min(...minutes) / 1440) * 1440 : 0
  const dayEnd = minutes.length ? (Math.floor(Math.max(...minutes) / 1440) + 1) * 1440 : 1440
  const x =
    mode === 'timeline'
      ? (m: number) => M.left + ((m - dayStart) / (dayEnd - dayStart)) * innerW
      : (m: number) => M.left + ((m % 1440) / 1440) * innerW

  const yTicks: number[] = []
  const stepY = yMax > 400 ? 100 : 50
  for (let v = 0; v <= yMax; v += stepY) yTicks.push(v)

  const xTicks: { pos: number; label: string }[] = []
  if (mode === 'day') {
    for (let h = 0; h <= 24; h += 3)
      xTicks.push({ pos: M.left + (h / 24) * innerW, label: `${h}h` })
  } else {
    const nDays = (dayEnd - dayStart) / 1440
    const every = nDays <= 10 ? 1 : nDays <= 31 ? 7 : 14
    for (let d = 0; d <= nDays; d += every) {
      const date = new Date((dayStart + d * 1440) * 60_000)
      xTicks.push({
        pos: M.left + (d / nDays) * innerW,
        label: `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
      })
    }
  }

  const counts = { low: 0, in: 0, high: 0 }
  for (const r of points) counts[zoneOf(r, props.target)]++

  const yOf = (r: Reading) =>
    r.flag === 'HI' ? M.top + 2 : r.flag === 'LO' ? M.top + innerH - 2 : y(r.mgdl ?? 0)
  const summary = `Gráfico de ${points.length} glicemias: ${counts.low} abaixo, ${counts.in} no alvo e ${counts.high} acima do alvo de ${formatGlucose(props.target.low, props.unit)} a ${formatGlucose(props.target.high, props.unit)} ${props.unit}. Os valores estão na tabela de medições.`

  return (
    <div>
      <div className="actions no-print" role="group" aria-label="Eixo horizontal do gráfico">
        <button
          type="button"
          className="secondary"
          aria-pressed={mode === 'timeline'}
          onClick={() => setMode('timeline')}
        >
          Ao longo do período
        </button>
        <button
          type="button"
          className="secondary"
          aria-pressed={mode === 'day'}
          onClick={() => setMode('day')}
        >
          Por hora do dia
        </button>
      </div>
      <div
        ref={wrap}
        style={{ position: 'relative', marginTop: 8 }}
        onPointerLeave={() => setHover(null)}
      >
        <svg
          width={width}
          height={H}
          role="img"
          aria-label={summary}
          style={{ display: 'block', maxWidth: '100%' }}
        >
          <rect
            x={M.left}
            width={innerW}
            y={y(props.target.high)}
            height={Math.max(0, y(props.target.low) - y(props.target.high))}
            fill="var(--g-band)"
          />
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={M.left}
                x2={M.left + innerW}
                y1={y(v)}
                y2={y(v)}
                stroke="var(--grid)"
                strokeWidth={1}
              />
              <text x={M.left - 6} y={y(v) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">
                {formatGlucose(v, props.unit)}
              </text>
            </g>
          ))}
          <line
            x1={M.left}
            x2={M.left + innerW}
            y1={y(0)}
            y2={y(0)}
            stroke="var(--axis)"
            strokeWidth={1}
          />
          {xTicks.map((t) => (
            <text
              key={t.pos}
              x={t.pos}
              y={H - 12}
              textAnchor="middle"
              fontSize={11}
              fill="var(--muted)"
            >
              {t.label}
            </text>
          ))}
          <text
            x={M.left + 4}
            y={y(props.target.high) + 13}
            textAnchor="start"
            fontSize={11}
            fill="var(--ink-2)"
          >
            alvo {formatGlucose(props.target.low, props.unit)}–
            {formatGlucose(props.target.high, props.unit)}
          </text>
          {points.map((r) => {
            const px = x(r.minutes ?? 0)
            const py = yOf(r)
            return (
              <g key={`${r.index}`} aria-hidden="true">
                <Mark zone={zoneOf(r, props.target)} x={px} y={py} />
                <circle
                  cx={px}
                  cy={py}
                  r={12}
                  fill="transparent"
                  onPointerEnter={() => setHover({ r, x: px, y: py })}
                />
              </g>
            )
          })}
        </svg>
        {hover ? (
          <div
            role="tooltip"
            style={{
              position: 'absolute',
              left: Math.min(hover.x + 12, width - 170),
              top: Math.max(0, hover.y - 56),
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '6px 10px',
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            <strong style={{ fontSize: 15 }}>
              {readingLabel(hover.r, props.unit)} {hover.r.flag ? '' : props.unit}
            </strong>
            <div style={{ color: 'var(--ink-2)' }}>
              {hover.r.timeKey.slice(0, 10).split('-').reverse().join('/')}{' '}
              {hover.r.timeKey.slice(11, 16)}
            </div>
            <div style={{ color: 'var(--ink-2)' }}>{ZONE_LABEL[zoneOf(hover.r, props.target)]}</div>
          </div>
        ) : null}
      </div>
      <div
        className="actions"
        style={{ gap: 16, fontSize: 14, color: 'var(--ink-2)', marginTop: 4 }}
      >
        {(['low', 'in', 'high'] as const).map((z) => (
          <span key={z} className="badge" style={{ fontWeight: 400 }}>
            <ZoneKey zone={z} /> {ZONE_LABEL[z]} ({counts[z]})
          </span>
        ))}
        <span>HI/LO aparecem na borda superior/inferior.</span>
      </div>
    </div>
  )
}

/** Barra segmentada (alta) com a distribuição abaixo / no alvo / acima. */
export function RangeBar(props: { below: number; inRange: number; above: number }) {
  const parts = [
    { zone: 'low' as const, v: props.below },
    { zone: 'in' as const, v: props.inRange },
    { zone: 'high' as const, v: props.above },
  ].filter((p) => p.v > 0)
  const label = `Distribuição: ${props.below.toFixed(0)}% abaixo, ${props.inRange.toFixed(0)}% no alvo, ${props.above.toFixed(0)}% acima.`
  return (
    <div
      role="img"
      aria-label={label}
      style={{ display: 'flex', gap: 2, height: 28, margin: '8px 0' }}
    >
      {parts.map((p) => (
        <div
          key={p.zone}
          title={`${ZONE_LABEL[p.zone]}: ${p.v.toFixed(0)}%`}
          style={{
            flex: `${p.v} 0 0`,
            background: `var(--g-${p.zone})`,
            borderRadius: 4,
            color: p.zone === 'high' ? '#0b0b0b' : '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 6,
            whiteSpace: 'nowrap',
          }}
        >
          {p.v >= 12 ? `${p.v.toFixed(0)}%` : ''}
        </div>
      ))}
    </div>
  )
}
