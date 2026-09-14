import { useEffect, useState } from 'react'
import { db, nowIso, uid } from '../db'
import type { DocumentRecord, Inspection } from '../types'
import { documentCategories } from '../sections'

export function DocumentManager({ inspection, onInspectionChange }:{inspection:Inspection;onInspectionChange:(i:Inspection)=>void}) {
  const [docs,setDocs]=useState<DocumentRecord[]>([]); const [category,setCategory]=useState(documentCategories[0])
  const load=async()=>setDocs(await db.documents.where('inspectionId').equals(inspection.id).sortBy('createdAt'))
  useEffect(()=>{load()},[inspection.id])
  const add=async(files:FileList|null)=>{if(!files)return;for(const f of Array.from(files)){await db.documents.add({id:uid(),inspectionId:inspection.id,category,name:f.name,blob:f,mimeType:f.type||'application/octet-stream',createdAt:nowIso()})}await load();syncPlanning(category)}
  const syncPlanning=(cat:string)=>{const map:Record<string,string>={'Agibilità':'docAgibility','Planimetria':'docPlan','Documentazione urbanistica':'docPlanning','Documentazione antincendio / CPI':'docFire','Documentazione impianti':'docSystems','APE':'docApe'};if(map[cat]){const next={...inspection,data:{...inspection.data,planning:{...(inspection.data.planning||{}),[map[cat]]:'Disponibile'}}};onInspectionChange(next)}}
  const open=(d:DocumentRecord)=>{const u=URL.createObjectURL(d.blob);window.open(u,'_blank');setTimeout(()=>URL.revokeObjectURL(u),60000)}
  return <div className="stack">
    <section className="card"><h3>Annuncio immobiliare</h3><div className="field-block"><label>URL annuncio</label><div className="input-action"><input type="url" value={inspection.data.general?.listingUrl||''} onChange={e=>onInspectionChange({...inspection,data:{...inspection.data,general:{...(inspection.data.general||{}),listingUrl:e.target.value}}})}/><button className="btn secondary" disabled={!inspection.data.general?.listingUrl} onClick={()=>window.open(inspection.data.general.listingUrl,'_blank')}>Apri</button></div></div></section>
    <section className="card"><div className="card-heading"><div><h3>Aggiungi documento</h3></div></div><div className="field-block"><label>Categoria</label><select value={category} onChange={e=>setCategory(e.target.value)}>{documentCategories.map(c=><option key={c}>{c}</option>)}</select></div><div className="photo-buttons"><label className="btn primary file-btn">Carica file<input hidden type="file" multiple onChange={e=>add(e.target.files)}/></label><label className="btn secondary file-btn">Scatta documento<input hidden type="file" accept="image/*" capture="environment" multiple onChange={e=>add(e.target.files)}/></label></div></section>
    <section className="card"><h3>Documenti ({docs.length})</h3><div className="list-stack">{docs.map(d=><div className="list-row" key={d.id}><div><strong>{d.name}</strong><div className="muted small-text">{d.category} · {(d.blob.size/1024/1024).toFixed(1)} MB</div></div><div className="row-actions"><button className="icon-btn" onClick={()=>open(d)}>↗</button><button className="icon-btn danger" onClick={async()=>{if(confirm('Eliminare il documento?')){await db.documents.delete(d.id);await load()}}}>×</button></div></div>)}{!docs.length&&<div className="empty-inline">Nessun documento caricato.</div>}</div></section>
  </div>
}
