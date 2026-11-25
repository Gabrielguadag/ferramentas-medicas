import { useId } from 'react'

/** Campo numérico controlado. `value` null = vazio. Aceita vírgula decimal. */
export function NumberField(props: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  unit?: string
  hint?: string | undefined
  min?: number
  max?: number
  step?: number
}) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div className="field">
      <label htmlFor={id}>
        {props.label}
        {props.unit ? ` (${props.unit})` : ''}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={props.value ?? ''}
        min={props.min}
        max={props.max}
        step={props.step ?? 'any'}
        aria-describedby={props.hint ? hintId : undefined}
        onChange={(e) => {
          const raw = e.target.value.replace(',', '.').trim()
          if (raw === '') return props.onChange(null)
          const n = Number(raw)
          props.onChange(Number.isFinite(n) ? n : null)
        }}
      />
      {props.hint ? (
        <span id={hintId} className="hint">
          {props.hint}
        </span>
      ) : null}
    </div>
  )
}

export function RadioGroup<T extends string>(props: {
  legend: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (v: T) => void
  column?: boolean
}) {
  const name = useId()
  return (
    <fieldset className="field">
      <legend>{props.legend}</legend>
      <div className={props.column ? 'choices column' : 'choices'}>
        {props.options.map((o) => (
          <label key={o.value}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={props.value === o.value}
              onChange={() => props.onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function SelectField<T extends string>(props: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{props.label}</label>
      <select id={id} value={props.value} onChange={(e) => props.onChange(e.target.value as T)}>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
