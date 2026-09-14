import { useEffect, useState } from 'react'
import { db, nowIso, uid } from '../db'
import type { PhotoRecord } from '../types'
import { PhotoAnnotator } from './PhotoAnnotator'

interface Props { inspectionId: string; category: string; limit?: number; onChanged?: () => void }
export function PhotoManager({ inspectionId, category, limit = 5, onChanged }: Props) {
  const [photos,setPhotos]=useState<PhotoRecord[]>([]); const [edit,setEdit]=useState<PhotoRecord|null>(null)
  const load=async()=>setPhotos(await db.photos.where({inspectionId,category}).sortBy('createdAt'))
  useEffect(()=>{load()},[inspectionId,category])
  const add=async(files:FileList|null)=>{ if(!files) return; const remaining=limit-photos.length; for(const f of Array.from(files).slice(0,remaining)){const previewBlob=await optimizeImage(f);await db.photos.add({id:uid(),inspectionId,category,blob:f,previewBlob,createdAt:nowIso()})} await load();onChanged?.() }
  const patch=async(id:string,p:Partial<PhotoRecord>)=>{ if(p.isMain) { const all=await db.photos.where('inspectionId').equals(inspectionId).toArray(); await Promise.all(all.filter(x=>x.isMain).map(x=>db.photos.update(x.id,{isMain:false}))) } await db.photos.update(id,p);await load();onChanged?.() }
  const remove=async(id:string)=>{if(confirm('Eliminare questa foto?')){await db.photos.delete(id);await load();onChanged?.()}}
  return <section className="card"><div className="card-heading"><div><h3>Foto {category}</h3><div className="muted">{photos.length}/{limit}</div></div></div>
    <div className="photo-grid">{photos.map(p=>{const url=URL.createObjectURL(p.editedBlob||p.previewBlob||p.blob);return <div className="photo-tile" key={p.id}>
      <img src={url} onLoad={()=>URL.revokeObjectURL(url)}/><div className="photo-badges">{p.isMain&&<span>★ principale</span>}{p.includeInReport&&<span>★ report</span>}</div>
      <div className="photo-actions"><button onClick={()=>setEdit(p)}>Annota</button><button onClick={()=>patch(p.id,{includeInReport:!p.includeInReport})}>Report</button><button onClick={()=>patch(p.id,{isMain:true})}>Principale</button><button className="danger" onClick={()=>remove(p.id)}>×</button></div>
    </div>})}</div>
    {photos.length<limit&&<div className="photo-buttons"><label className="btn primary file-btn">Scatta foto<input hidden type="file" accept="image/*" capture="environment" onChange={e=>add(e.target.files)}/></label><label className="btn secondary file-btn">Carica<input hidden type="file" accept="image/*" multiple onChange={e=>add(e.target.files)}/></label></div>}
    {edit&&<PhotoAnnotator blob={edit.editedBlob||edit.previewBlob||edit.blob} onClose={()=>setEdit(null)} onSave={async b=>{await patch(edit.id,{editedBlob:b});setEdit(null)}}/>}
  </section>
}

async function optimizeImage(file:Blob):Promise<Blob>{try{const url=URL.createObjectURL(file);const img=new Image();await new Promise<void>((res,rej)=>{img.onload=()=>res();img.onerror=()=>rej();img.src=url});const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);const ctx=c.getContext('2d');if(!ctx){URL.revokeObjectURL(url);return file}ctx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);return await new Promise<Blob>(resolve=>c.toBlob(b=>resolve(b||file),'image/jpeg',.82))}catch{return file}}
