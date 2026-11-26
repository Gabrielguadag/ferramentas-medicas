import { useState } from 'react'
import { DateField } from '../shared/DateField'
import { NumberField } from '../shared/NumberField'
import { type Dia, fmtData, hojeIso, parseIso } from '../shared/datas'
import { Alert, Card, Result, Results } from '../shared/ui'
import { AlimentacaoSection } from './AlimentacaoView'
import { MarcosSection } from './MarcosView'
import { type Correcao, type Idade, correcao, fmtIdade, idadeEm } from './idade'

/** O que os módulos recebem da criança (tudo calculado; nada fica guardado). */
export interface DadosCrianca {
  /** Idade cronológica na data da consulta; null se faltam datas ou são inválidas. */
  idade: Idade | null
  /** Correção para prematuros (< 37 semanas); null se a IG não foi informada ou ≥ 37 semanas. */
  correcao: Correcao | null
  /** IG ao nascer em dias, se informada. */
  igNascDias: number | null
}

const MODULOS = [
  {
    id: 'alimentacao',
    label: 'Introdução alimentar',
    hint: 'O que oferecer em cada idade',
    Component: AlimentacaoSection,
  },
  {
    id: 'marcos',
    label: 'Marcos do desenvolvimento',
    hint: 'Avaliação e classificação',
    Component: MarcosSection,
  },
] as const

type ModuloId = (typeof MODULOS)[number]['id']

const okIg = (s: number | null, d: number | null) =>
  s !== null &&
  Number.isInteger(s) &&
  s >= 22 &&
  s <= 44 &&
  (d === null || (Number.isInteger(d) && d >= 0 && d <= 6))

export function CriancaPage() {
  const hoje = hojeIso()
  const [current, setCurrent] = useState<ModuloId>('alimentacao')
  const [nasc, setNasc] = useState('')
  const [ref, setRef] = useState(hoje)
  const [igS, setIgS] = useState<number | null>(null)
  const [igD, setIgD] = useState<number | null>(null)

  const nascDia = parseIso(nasc)
  const refDia = parseIso(ref)
  const idade = nascDia !== null && refDia !== null ? idadeEm(nascDia, refDia) : null
  const igNascDias = okIg(igS, igD) ? (igS as number) * 7 + (igD ?? 0) : null
  const corr =
    nascDia !== null && refDia !== null && igNascDias !== null
      ? correcao(nascDia, refDia, igNascDias)
      : null
  const dados: DadosCrianca = { idade, correcao: corr, igNascDias }

  return (
    <div className="layout">
      <nav className="side" aria-label="Módulos da criança">
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
        <Card title="Dados da criança" subtitle="Valem para os dois módulos.">
          <div className="fields">
            <DateField label="Data de nascimento" value={nasc} onChange={setNasc} />
            <DateField label="Data da consulta" value={ref} onChange={setRef} />
            <div className="field field-action">
              <button
                type="button"
                className="secondary"
                onClick={() => setRef(hoje)}
                disabled={ref === hoje}
              >
                Hoje
              </button>
            </div>
          </div>
          <div className="fields">
            <NumberField
              label="IG ao nascer: semanas"
              value={igS}
              onChange={setIgS}
              min={22}
              max={44}
              step={1}
              hint="Opcional; para prematuros"
            />
            <NumberField
              label="IG ao nascer: dias"
              value={igD}
              onChange={setIgD}
              min={0}
              max={6}
              step={1}
              hint="0 a 6"
            />
          </div>
          <IdadeResumo
            nascDia={nascDia}
            refDia={refDia}
            idade={idade}
            corr={corr}
            igInvalida={igS !== null && igNascDias === null}
          />
        </Card>

        {MODULOS.map(({ id, label, Component }) => (
          // Os módulos ficam montados para não perder o que foi marcado ao trocar.
          <section key={id} hidden={current !== id} aria-label={label}>
            <h2 className="section-title">{label}</h2>
            <Component dados={dados} />
          </section>
        ))}
      </div>
    </div>
  )
}

function IdadeResumo(props: {
  nascDia: Dia | null
  refDia: Dia | null
  idade: Idade | null
  corr: Correcao | null
  igInvalida: boolean
}) {
  const { nascDia, refDia, idade, corr } = props
  if (nascDia === null || refDia === null) {
    return <p className="empty">Preencha a data de nascimento.</p>
  }
  if (!idade) {
    return <Alert tone="warn">A data da consulta é anterior ao nascimento. Confira as datas.</Alert>
  }
  return (
    <>
      {props.igInvalida ? (
        <Alert tone="warn">IG ao nascer fora do intervalo (22 a 44 semanas, 0 a 6 dias).</Alert>
      ) : null}
      <Results>
        <Result label={`Idade em ${fmtData(refDia)}`} value={fmtIdade(idade)} tone="info">
          {idade.dias} dias de vida
        </Result>
        {corr ? (
          <Result
            label="Idade corrigida"
            value={corr.idade ? fmtIdade(corr.idade) : 'antes do termo'}
            tone={corr.vale ? 'info' : 'neutral'}
          >
            {corr.vale
              ? `Usada nos marcos do desenvolvimento (até ${corr.corrigirAteMeses / 12} anos de idade cronológica). 40 semanas corrigidas em ${fmtData(corr.termo)}.`
              : `Não se corrige mais: já passou de ${corr.corrigirAteMeses / 12} anos de idade cronológica.`}
          </Result>
        ) : null}
      </Results>
    </>
  )
}
