import JSZip from 'jszip'
import { db } from '../db'
import type { DocumentRecord, PhotoRecord } from '../types'

const MAGIC='SFBK1'
async function deriveKey(password:string,salt:Uint8Array<ArrayBuffer>){const passwordBytes=new TextEncoder().encode(password) as Uint8Array<ArrayBuffer>;const base=await crypto.subtle.importKey('raw',passwordBytes,'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:180000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function encryptBlob(blob:Blob,password:string){const salt=crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>,iv=crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>,key=await deriveKey(password,salt),plain=await blob.arrayBuffer(),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain);return new Blob([MAGIC,salt.buffer,iv.buffer,cipher],{type:'application/octet-stream'})}
async function decryptBlob(blob:Blob,password:string){const magic=await blob.slice(0,5).text();if(magic!==MAGIC)return blob;if(!password)throw new Error('PASSWORD_REQUIRED');const salt=new Uint8Array(await blob.slice(5,21).arrayBuffer()) as Uint8Array<ArrayBuffer>,iv=new Uint8Array(await blob.slice(21,33).arrayBuffer()) as Uint8Array<ArrayBuffer>,cipher=await blob.slice(33).arrayBuffer(),key=await deriveKey(password,salt);try{const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,cipher);return new Blob([plain],{type:'application/zip'})}catch{throw new Error('Password backup non corretta o file danneggiato')}}

export async function createBackup(zoneId?: string,password?:string) {
  const zip=new JSZip()
  const inspections=zoneId?await db.inspections.where('zoneId').equals(zoneId).toArray():await db.inspections.toArray()
  const ids=new Set(inspections.map(i=>i.id))
  const zones=zoneId?(await db.zones.toArray()).filter(z=>z.id===zoneId):await db.zones.toArray()
  const photos=(await db.photos.toArray()).filter(p=>ids.has(p.inspectionId))
  const documents=(await db.documents.toArray()).filter(d=>ids.has(d.inspectionId))
  const branches=await db.branches.toArray(); const settings=await db.settings.toArray()
  const photoMeta:any[]=[]; const docMeta:any[]=[]
  for(const p of photos){const ext=(p.blob.type.split('/')[1]||'jpg').replace('jpeg','jpg'); const file=`photos/${p.id}.${ext}`;zip.file(file,p.blob);let previewFile:string|undefined;if(p.previewBlob){previewFile=`photos/${p.id}-preview.jpg`;zip.file(previewFile,p.previewBlob)}let editedFile:string|undefined;if(p.editedBlob){editedFile=`photos/${p.id}-edited.jpg`;zip.file(editedFile,p.editedBlob)}photoMeta.push({...p,blob:undefined,previewBlob:undefined,editedBlob:undefined,file,previewFile,editedFile,blobType:p.blob.type,previewType:p.previewBlob?.type,editedType:p.editedBlob?.type})}
  for(const d of documents){const safe=d.name.replace(/[^a-zA-Z0-9._-]/g,'_');const file=`documents/${d.id}-${safe}`;zip.file(file,d.blob);docMeta.push({...d,blob:undefined,file})}
  zip.file('manifest.json',JSON.stringify({version:1,createdAt:new Date().toISOString(),zoneId:zoneId||null,encrypted:!!password,counts:{zones:zones.length,inspections:inspections.length,photos:photos.length,documents:documents.length}},null,2))
  zip.file('data.json',JSON.stringify({zones,inspections,photos:photoMeta,documents:docMeta,branches,settings},null,2))
  const raw=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}})
  return password?encryptBlob(raw,password):raw
}

export async function inspectBackup(file: Blob,password?:string) {
  const decrypted=await decryptBlob(file,password||'')
  const zip=await JSZip.loadAsync(decrypted); const manifestFile=zip.file('manifest.json'); const dataFile=zip.file('data.json')
  if(!manifestFile||!dataFile) throw new Error('Backup non valido: manifest o dati mancanti')
  const manifest=JSON.parse(await manifestFile.async('text')); const data=JSON.parse(await dataFile.async('text'))
  for(const p of data.photos||[]){if(!zip.file(p.file))throw new Error(`Backup incompleto: foto ${p.id} mancante`);if(p.previewFile&&!zip.file(p.previewFile))throw new Error(`Backup incompleto: anteprima foto ${p.id} mancante`);if(p.editedFile&&!zip.file(p.editedFile))throw new Error(`Backup incompleto: foto modificata ${p.id} mancante`)}
  for(const d of data.documents||[]){if(!zip.file(d.file))throw new Error(`Backup incompleto: documento ${d.id} mancante`)}
  return {zip,manifest,data}
}

export async function restoreBackup(file: Blob, mode:'merge'|'replace', password?:string, conflictPolicy:'current'|'backup'|'both'='current') {
  const {zip,data}=await inspectBackup(file,password)
  if(mode==='replace') await db.transaction('rw',[db.zones,db.inspections,db.photos,db.documents,db.branches,db.settings],async()=>{await Promise.all([db.zones.clear(),db.inspections.clear(),db.photos.clear(),db.documents.clear(),db.branches.clear(),db.settings.clear()])})
  const idMap=new Map<string,string|null>()
  for(const i of data.inspections||[]){
    const existing=mode==='merge'?await db.inspections.get(i.id):undefined
    if(!existing){idMap.set(i.id,i.id);await db.inspections.put(i);continue}
    if(conflictPolicy==='current'){idMap.set(i.id,null);continue}
    if(conflictPolicy==='backup'){idMap.set(i.id,i.id);await db.transaction('rw',[db.photos,db.documents,db.inspections],async()=>{await db.photos.where('inspectionId').equals(i.id).delete();await db.documents.where('inspectionId').equals(i.id).delete();await db.inspections.put(i)});continue}
    const newId=crypto.randomUUID();idMap.set(i.id,newId);await db.inspections.put({...i,id:newId,name:`${i.name||'Sopralluogo'} (backup)`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})
  }
  const existingZoneIds=new Set((await db.zones.toArray()).map(z=>z.id));for(const z of data.zones||[]){if(!existingZoneIds.has(z.id)||mode==='replace')await db.zones.put(z)}
  const photos:PhotoRecord[]=[];for(const p of data.photos||[]){const target=idMap.get(p.inspectionId);if(!target)continue;const zf=zip.file(p.file);if(!zf)continue;const blob=await zf.async('blob');let previewBlob:Blob|undefined;if(p.previewFile){const pf=zip.file(p.previewFile);if(pf)previewBlob=await pf.async('blob')}let editedBlob:Blob|undefined;if(p.editedFile){const ef=zip.file(p.editedFile);if(ef)editedBlob=await ef.async('blob')}photos.push({...p,id:target===p.inspectionId?p.id:crypto.randomUUID(),inspectionId:target,blob:new Blob([blob],{type:p.blobType||blob.type}),previewBlob:previewBlob?new Blob([previewBlob],{type:p.previewType||previewBlob.type}):undefined,editedBlob:editedBlob?new Blob([editedBlob],{type:p.editedType||editedBlob.type}):undefined,file:undefined,previewFile:undefined,editedFile:undefined})}
  const documents:DocumentRecord[]=[];for(const d of data.documents||[]){const target=idMap.get(d.inspectionId);if(!target)continue;const zf=zip.file(d.file);if(!zf)continue;const blob=await zf.async('blob');documents.push({...d,id:target===d.inspectionId?d.id:crypto.randomUUID(),inspectionId:target,blob:new Blob([blob],{type:d.mimeType||blob.type}),file:undefined})}
  if(photos.length)await db.photos.bulkPut(photos);if(documents.length)await db.documents.bulkPut(documents)
  if(data.branches?.length)await db.branches.bulkPut(data.branches);if(data.settings?.length)await db.settings.bulkPut(data.settings)
}

export function downloadBlob(blob:Blob,filename:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
