import { useState } from 'react'
import { uid } from '../db'

interface Col { key: string; label: string; type?: 'text'|'number'|'choice'; options?: string[]; unit?: string }
interface Props {
  title: string
  addLabel: string
  items: any[]
  columns: Col[]
  onChange: (items: any[]) => void
}

export function DynamicList({ title, addLabel, items = [], columns, onChange }: Props) {
  const [editing, setEditing] = useState<any | null>(null)
  const save = () => {
    if (!editing) return
    const exists = items.some(x => x.id === editing.id)
    onChange(exists ? items.map(x => x.id === editing.id ? editing : x) : [...items, editing])
    setEditing(null)
  }
  return (
    <section className="card">
      <div className="card-heading"><div><h3>{title}</h3></div><button className="btn ghost small" onClick={() => setEditing({ id: uid() })}>+ {addLabel}</button></div>
      <div className="list-stack">
        {items.map((item, index) => (
          <div className="list-row" key={item.id}>
            <div><strong>{item.name || item.label || `${title} ${index+1}`}</strong><div className="muted small-text">{columns.slice(1,4).map(c => item[c.key] ? `${c.label}: ${item[c.key]}${c.unit || ''}` : '').filter(Boolean).join(' · ')}</div></div>
            <div className="row-actions"><button className="icon-btn" onClick={() => setEditing({...item})}>✎</button><button className="icon-btn danger" onClick={() => onChange(items.filter(x => x.id !== item.id))}>×</button></div>
          </div>
        ))}
        {!items.length && <div className="empty-inline">Nessun elemento inserito.</div>}
      </div>
      {editing && <div className="modal-backdrop" onClick={() => setEditing(null)}><div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{addLabel}</h3>
        {columns.map(c => <div className="field-block" key={c.key}><label>{c.label}</label>
          {c.type === 'choice' ? <div className="chips">{c.options?.map(o => <button type="button" className={`chip ${editing[c.key]===o?'selected':''}`} key={o} onClick={() => setEditing({...editing,[c.key]:o})}>{o}</button>)}</div> :
            <div className="input-with-unit"><input type={c.type === 'number' ? 'number':'text'} step="any" value={editing[c.key] ?? ''} onChange={e => setEditing({...editing,[c.key]:c.type==='number'?(e.target.value===''?'':Number(e.target.value)):e.target.value})}/>{c.unit && <span className="unit">{c.unit}</span>}</div>}
        </div>)}
        <div className="modal-actions"><button className="btn secondary" onClick={() => setEditing(null)}>Annulla</button><button className="btn primary" onClick={save}>Salva</button></div>
      </div></div>}
    </section>
  )
}
