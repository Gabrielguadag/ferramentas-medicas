import { type ReactNode, createContext, useContext, useMemo, useState } from 'react'
import { NumberField, RadioGroup, SelectField } from '../shared/NumberField'
import { type Profile, PROFILE_OPTIONS } from './rules/metas'
import type { DiabetesType } from './sources'

// Dados do paciente digitados uma vez e usados por todas as seções. Só em memória.

export interface Patient {
  age: number | null
  sex: 'M' | 'F'
  weight: number | null
  height: number | null
  type: DiabetesType
  profile: Profile
}

interface Ctx {
  /** Dados válidos usados nos cálculos (valor fora da faixa vira null). */
  patient: Patient
  /** Como foi digitado (para os campos). */
  raw: Patient
  set: <K extends keyof Patient>(key: K, value: Patient[K]) => void
  bmi: number | null
  /** Campos com valor fora da faixa plausível (não entram nos cálculos). */
  invalid: string[]
}

/** Faixas plausíveis; fora delas o valor não entra no cálculo. A idade é em anos completos. */
const LIMITS = {
  age: { min: 0, max: 120, label: 'idade (0 a 120 anos)' },
  weight: { min: 2, max: 300, label: 'peso (2 a 300 kg)' },
  height: { min: 40, max: 250, label: 'altura (40 a 250 cm)' },
} as const

function valid(v: number | null, k: keyof typeof LIMITS): boolean {
  return v === null || (v >= LIMITS[k].min && v <= LIMITS[k].max)
}

const PatientContext = createContext<Ctx | null>(null)

export function PatientProvider(props: { children: ReactNode }) {
  const [raw, setPatient] = useState<Patient>({
    age: null,
    sex: 'M',
    weight: null,
    height: null,
    type: 'DM2',
    profile: 'adulto',
  })
  const value = useMemo<Ctx>(() => {
    const invalid = (['age', 'weight', 'height'] as const)
      .filter((k) => !valid(raw[k], k))
      .map((k) => LIMITS[k].label)
    const patient: Patient = {
      ...raw,
      age: valid(raw.age, 'age') && raw.age !== null ? Math.floor(raw.age) : null,
      weight: valid(raw.weight, 'weight') ? raw.weight : null,
      height: valid(raw.height, 'height') ? raw.height : null,
    }
    const h = patient.height
    const bmi =
      patient.weight && h && h > 0
        ? Math.round((patient.weight / ((h / 100) * (h / 100))) * 10) / 10
        : null
    return {
      patient,
      raw,
      invalid,
      bmi,
      set: (key, v) => setPatient((p) => ({ ...p, [key]: v })),
    }
  }, [raw])
  return <PatientContext.Provider value={value}>{props.children}</PatientContext.Provider>
}

export function usePatient(): Ctx {
  const c = useContext(PatientContext)
  if (!c) throw new Error('PatientProvider ausente')
  return c
}

export function PatientBar() {
  const { patient, raw, set, bmi, invalid } = usePatient()
  const elderly = patient.age !== null && patient.age >= 60 && !patient.profile.startsWith('idoso')
  return (
    <section className="patient card" aria-label="Dados do paciente">
      <div className="patient-head">
        <h2>Paciente</h2>
        <span className="hint">Usado em todas as seções. Nada é guardado.</span>
      </div>
      <div className="fields patient-fields">
        <NumberField
          label="Idade"
          unit="anos"
          value={raw.age}
          onChange={(v) => set('age', v)}
          step={1}
          min={0}
          max={120}
        />
        <RadioGroup
          legend="Sexo"
          value={patient.sex}
          options={[
            { value: 'M', label: 'Masc.' },
            { value: 'F', label: 'Fem.' },
          ]}
          onChange={(v) => set('sex', v)}
        />
        <NumberField
          label="Peso"
          unit="kg"
          value={raw.weight}
          onChange={(v) => set('weight', v)}
          min={0}
          max={400}
        />
        <NumberField
          label="Altura"
          unit="cm"
          value={raw.height}
          onChange={(v) => set('height', v)}
          min={0}
          max={250}
          hint={bmi ? `IMC ${String(bmi).replace('.', ',')} kg/m²` : undefined}
        />
        <RadioGroup
          legend="Diabetes"
          value={patient.type}
          options={[
            { value: 'DM2', label: 'DM2' },
            { value: 'DM1', label: 'DM1' },
          ]}
          onChange={(v) => set('type', v)}
        />
        <SelectField
          label="Perfil (metas)"
          value={patient.profile}
          options={PROFILE_OPTIONS}
          onChange={(v) => set('profile', v)}
        />
      </div>
      {invalid.length ? (
        <p className="hint-inline">
          Fora da faixa esperada, não usado nos cálculos: {invalid.join(', ')}.
        </p>
      ) : null}
      {elderly ? (
        <p className="hint-inline">
          60 anos ou mais: escolha o perfil de idoso (saudável, comprometido ou muito comprometido)
          para ajustar as metas.
        </p>
      ) : null}
    </section>
  )
}
