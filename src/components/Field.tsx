import type React from 'react'
import type { FieldDef } from '../types'

interface Props {
  field: FieldDef
  values: Record<string, any>
  onChange: (key: string, value: any) => void
}

export function Field({ field, values, onChange }: Props) {
  if (field.showWhen && !field.showWhen.in.includes(values[field.showWhen.field])) return null
  const value = values[field.key] ?? ''

  if (field.type === 'choice') {
    return (
      <div className="field-block">
        <label>{field.label}</label>
        <div className="chips">
          {field.options?.map(option => (
            <button key={option} type="button" className={`chip ${value === option ? 'selected' : ''}`} onClick={() => onChange(field.key, option)}>
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const common = {
    value,
    placeholder: field.placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field.key, field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)
  }

  return (
    <div className="field-block">
      <label htmlFor={field.key}>{field.label}</label>
      <div className="input-with-unit">
        {field.type === 'textarea' ? (
          <textarea id={field.key} rows={4} {...common} />
        ) : (
          <input id={field.key} type={field.type === 'number' ? 'number' : field.type} inputMode={field.type === 'number' ? 'decimal' : undefined} step={field.type === 'number' ? 'any' : undefined} {...common} />
        )}
        {field.unit && <span className="unit">{field.unit}</span>}
      </div>
    </div>
  )
}
