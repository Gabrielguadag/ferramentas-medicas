import type { ReactNode } from 'react'

export type Tone = 'neutral' | 'ok' | 'warn' | 'danger' | 'info'

/** Resultado em destaque: número grande + o que fazer. */
export function Result(props: {
  label: string
  value: ReactNode
  unit?: string | undefined
  tone?: Tone | undefined
  children?: ReactNode
}) {
  return (
    <div className={`result tone-${props.tone ?? 'neutral'}`} aria-live="polite">
      <span className="result-label">{props.label}</span>
      <span className="result-value">
        {props.value}
        {props.unit ? <span className="result-unit"> {props.unit}</span> : null}
      </span>
      {props.children ? <div className="result-text">{props.children}</div> : null}
    </div>
  )
}

export function Results(props: { children: ReactNode }) {
  return <div className="result-grid">{props.children}</div>
}

export function Alert(props: { tone: Tone; title?: string; children: ReactNode }) {
  return (
    <div
      className={`alert tone-${props.tone}`}
      role={props.tone === 'danger' ? 'alert' : undefined}
    >
      {props.title ? <strong>{props.title} </strong> : null}
      {props.children}
    </div>
  )
}

/** "Como foi calculado" e fonte, recolhido por padrão. */
export function Details(props: { summary?: string; children: ReactNode }) {
  return (
    <details className="more">
      <summary>{props.summary ?? 'Como foi calculado e fonte'}</summary>
      <div className="more-body">{props.children}</div>
    </details>
  )
}

export function Src(props: { href?: string; children: ReactNode }) {
  return (
    <p className="source">
      Fonte:{' '}
      {props.href ? (
        <a href={props.href} rel="noreferrer noopener" target="_blank">
          {props.children}
        </a>
      ) : (
        props.children
      )}
    </p>
  )
}

export function Card(props: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="card">
      <h3>{props.title}</h3>
      {props.subtitle ? <p className="card-sub">{props.subtitle}</p> : null}
      {props.children}
    </div>
  )
}

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function Check(props: {
  label: ReactNode
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <span>{props.label}</span>
    </label>
  )
}
