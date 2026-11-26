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
  patient: Patient
  set: <K extends keyof Patient>(key: K, value: Patient[K]) => void
  bmi: number | null
}

const PatientContext = createContext<Ctx | null>(null)

export function PatientProvider(props: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient>({
    age: null,
    sex: 'M',
    weight: null,
    height: null,
    type: 'DM2',
    profile: 'adulto',
  })
  const value = useMemo<Ctx>(() => {
    const h = patient.height
    const bmi =
      patient.weight && h && h > 0
        ? Math.round((patient.weight / ((h / 100) * (h / 100))) * 10) / 10
        : null
    return {
      patient,
      bmi,
      set: (key, v) => setPatient((p) => ({ ...p, [key]: v })),
    }
  }, [patient])
  return <PatientContext.Provider value={value}>{props.children}</PatientContext.Provider>
}

export function usePatient(): Ctx {
  const c = useContext(PatientContext)
  if (!c) throw new Error('PatientProvider ausente')
  return c
}

export function PatientBar() {
  const { patient, set, bmi } = usePatient()
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
          value={patient.age}
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
          value={patient.weight}
          onChange={(v) => set('weight', v)}
          min={0}
          max={400}
        />
        <NumberField
          label="Altura"
          unit="cm"
          value={patient.height}
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
      {elderly ? (
        <p className="hint-inline">
          60 anos ou mais: escolha o perfil de idoso (saudável, comprometido ou muito comprometido)
          para ajustar as metas.
        </p>
      ) : null}
    </section>
  )
}
