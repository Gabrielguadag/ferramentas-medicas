import { useState } from 'react'
import { IdadeGestacionalSection } from './IdadeGestacional'

const MODULOS = [
  {
    id: 'ig',
    label: 'Idade gestacional',
    hint: 'DUM, ultrassonografia, DPP ou FIV',
    Component: IdadeGestacionalSection,
  },
] as const

type ModuloId = (typeof MODULOS)[number]['id']

export function GestantePage() {
  const [current, setCurrent] = useState<ModuloId>('ig')
  return (
    <div className="layout">
      <nav className="side" aria-label="Módulos da gestante">
        {MODULOS.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-current={current === m.id ? 'page' : undefined}
            onClick={() => setCurrent(m.id)}
          >
            <span className="side-label">{m.label}</span>
            <span className="side-hint">{m.hint}</span>
          </button>
        ))}
      </nav>
      <div>
        {MODULOS.map(({ id, label, Component }) => (
          // Todos ficam montados para não perder o que foi digitado ao trocar de módulo.
          <section key={id} hidden={current !== id} aria-label={label}>
            <h2 className="section-title">{label}</h2>
            <Component />
          </section>
        ))}
      </div>
    </div>
  )
}
