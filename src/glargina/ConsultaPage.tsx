import { useState } from 'react'
import { RiscoSection } from '../risco/RiscoSection'
import { PatientBar, PatientProvider } from './patient'
import {
  InicioGlarginaSection,
  InicioNphSection,
  MetasSection,
  MigracaoSection,
  PrandialSection,
  TitulacaoSection,
  TratamentoSection,
} from './sections'

const SECTIONS = [
  {
    id: 'migracao',
    label: 'Migração para glargina',
    hint: 'Elegibilidade, dose e receita',
    Component: MigracaoSection,
  },
  {
    id: 'nph',
    label: 'Início da NPH',
    hint: 'Dose inicial e 2ª dose',
    Component: InicioNphSection,
  },
  {
    id: 'glargina',
    label: 'Início da glargina',
    hint: 'Sem insulina prévia',
    Component: InicioGlarginaSection,
  },
  {
    id: 'titulacao',
    label: 'Titulação da basal',
    hint: 'Pelos jejuns de 3 dias',
    Component: TitulacaoSection,
  },
  {
    id: 'prandial',
    label: 'Insulina prandial',
    hint: 'Início e correção',
    Component: PrandialSection,
  },
  {
    id: 'metas',
    label: 'Metas glicêmicas',
    hint: 'HbA1c, jejum, pós-prandial',
    Component: MetasSection,
  },
  {
    id: 'tratamento',
    label: 'Tratamento do DM2',
    hint: 'Fluxograma do PCDT',
    Component: TratamentoSection,
  },
  {
    id: 'risco',
    label: 'Risco cardiovascular',
    hint: 'Escalas e metas de LDL',
    Component: RiscoSection,
  },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export function ConsultaPage() {
  const [current, setCurrent] = useState<SectionId>('migracao')
  return (
    <PatientProvider>
      <PatientBar />
      <div className="layout">
        <nav className="side" aria-label="Seções">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-current={current === s.id ? 'page' : undefined}
              onClick={() => setCurrent(s.id)}
            >
              <span className="side-label">{s.label}</span>
              <span className="side-hint">{s.hint}</span>
            </button>
          ))}
        </nav>
        <div>
          {SECTIONS.map(({ id, label, Component }) => (
            // Todas ficam montadas para não perder o que foi digitado ao trocar de seção.
            <section key={id} hidden={current !== id} aria-label={label}>
              <h2 className="section-title">{label}</h2>
              <Component />
            </section>
          ))}
        </div>
      </div>
    </PatientProvider>
  )
}
