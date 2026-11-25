import { useId } from 'react'

/** Campo de data controlado. `value` em ISO (AAAA-MM-DD, ou AAAA-MM com kind="month"); '' = vazio. */
export function DateField(props: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string | undefined
  kind?: 'date' | 'month'
}) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div className="field">
      <label htmlFor={id}>{props.label}</label>
      <input
        id={id}
        type={props.kind ?? 'date'}
        value={props.value}
        aria-describedby={props.hint ? hintId : undefined}
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.hint ? (
        <span id={hintId} className="hint">
          {props.hint}
        </span>
      ) : null}
    </div>
  )
}
