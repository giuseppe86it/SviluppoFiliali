import { jsPDF } from 'jspdf'
import { db } from '../db'
import { evaluateInspection, deriveConfiguration } from '../evaluation'
import { sections } from '../sections'
import type { Inspection, Zone } from '../types'
import { nearestBranch } from './geo'
import { rapidCompleteness } from './rapid'

function money(v:any){const n=Number(v);return Number.isFinite(n)&&n>0?new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n):'—'}
function txt(v:any){if(Array.isArray(v))return v.length?v.join(', '):'—';if(v==null||v==='')return'—';if(typeof v==='object')return JSON.stringify(v);return String(v)}
async function dataUrl(blob:Blob){return new Promise<string>((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result));r.onerror=()=>rej(r.error);r.readAsDataURL(blob)})}
function fit(doc:jsPDF,text:string,max:number){return doc.splitTextToSize(text,max) as string[]}
function safeDate(v:string){try{return new Date(v).toLocaleDateString('it-IT')}catch{return v||'—'}}

/** Scheda tecnica sintetica A4, una pagina. */
export async function generateReportPdf(inspection:Inspection, zone?:Zone) {
  const ev=evaluateInspection(inspection); const cfg=deriveConfiguration(inspection); const d=inspection.data||{}
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true})
  const W=297,H=210,m=8; const teal=[15,118,110] as [number,number,number]
  doc.setFillColor(...teal);doc.rect(0,0,W,18,'F');doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(17);doc.text('SVILUPPO FILIALI',m,11.5)
  doc.setFontSize(9);doc.setFont('helvetica','normal');doc.text(`Zona: ${zone?.name||'—'}   |   Sopralluogo: ${inspection.date||'—'}`,W-m,11.5,{align:'right'})
  doc.setTextColor(25);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(inspection.name||inspection.address||'Capannone',m,26)
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text(fit(doc,inspection.address||'Indirizzo da completare',180),m,31)

  const general=d.general||{}, warehouse=d.warehouse||{}, yard=d.yard||{}, access=d.access||{}, location=d.location||{}
  let y=40
  const box=(x:number,w:number,title:string,rows:Array<[string,string]>)=>{const bh=8+rows.length*6;doc.setDrawColor(220);doc.roundedRect(x,y,w,bh,2,2);doc.setFillColor(242,247,246);doc.roundedRect(x,y,w,7,2,2,'F');doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.text(title,x+3,y+4.8);doc.setTextColor(35);doc.setFont('helvetica','normal');doc.setFontSize(7.5);rows.forEach((r,i)=>{doc.setFont('helvetica','bold');doc.text(r[0],x+3,y+12+i*6);doc.setFont('helvetica','normal');doc.text(r[1],x+w-3,y+12+i*6,{align:'right'})});return bh}
  const b1=box(m,62,'IMMOBILE',[["Superficie coperta",`${txt(warehouse.coveredArea||general.declaredCoveredArea)} m²`],["Piazzale",`${txt(yard.yardArea||general.declaredYardArea)} m²`],["Piazzale utilizzabile",`${txt(yard.usableYardArea)} m²`],["Altezza sotto trave",`${txt(warehouse.underBeamHeight)} m`]])
  const b2=box(m+66,66,'DATI ECONOMICI',[["Operazione",txt(general.availabilityType)],["Canone",money(general.rent)],["Prezzo",money(general.salePrice)],["Disponibilità",txt(general.propertyAvailability)]])
  const branches=await db.branches.toArray();const nb=nearestBranch(inspection.lat,inspection.lng,branches)
  const b3=box(m+136,72,'POSIZIONE / ACCESSIBILITÀ',[["Accesso bilici",txt(access.semiAccess)],["Mezzi pesanti",txt(access.heavyAccess)],["Manovra bilici",txt(yard.truckManeuver)],["Visibilità",txt(location.visibility)],["Filiale Mollo più vicina",nb?`${nb.branch.name} · ${nb.distanceKm.toFixed(1)} km`:'Da configurare']])
  const scoreX=m+212, scoreW=69; doc.setDrawColor(220);doc.roundedRect(scoreX,y,scoreW,Math.max(b1,b2,b3),2,2);doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.text('VALUTAZIONE',scoreX+3,y+5);doc.setFontSize(25);doc.text(`${ev.score}/100`,scoreX+3,y+19);doc.setFontSize(10);doc.text(ev.classification.toUpperCase(),scoreX+3,y+27);doc.setTextColor(50);doc.setFontSize(8);doc.setFont('helvetica','normal');doc.text(`Completezza: ${ev.completeness}%`,scoreX+3,y+34);doc.text(`Giudizio: ${inspection.judgment||'—'}`,scoreX+3,y+40);if(ev.blockingIssues.length){doc.setTextColor(180,35,35);doc.setFont('helvetica','bold');doc.text('CRITICITÀ BLOCCANTE',scoreX+3,y+48)}

  y += Math.max(b1,b2,b3)+6
  doc.setDrawColor(220);doc.roundedRect(m,y,180,45,2,2);doc.setFillColor(242,247,246);doc.roundedRect(m,y,180,7,2,2,'F');doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.text('CONFIGURAZIONE MOLLO',m+3,y+5)
  const configRows=[['Piazzale',cfg.operationalYard],['Deposito mezzi',cfg.vehicleStorage],['Area officina',cfg.workshop],['Reception',cfg.reception],['Uffici',cfg.offices],['Lavaggio',cfg.wash],['Rifornimento',cfg.fuel]]
  doc.setTextColor(35);doc.setFontSize(7.5);configRows.forEach((r,i)=>{const col=i<4?0:1,row=i<4?i:i-4,x=m+4+col*88,yy=y+13+row*8;doc.setFont('helvetica','bold');doc.text(r[0],x,yy);doc.setFont('helvetica','normal');doc.text(r[1],x+82,yy,{align:'right'})})
  doc.roundedRect(m+184,y,97,45,2,2);doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.text('PUNTI DI FORZA / CRITICITÀ',m+187,y+5);doc.setFontSize(7);doc.setTextColor(35);doc.setFont('helvetica','normal');let yy=y+12;ev.strengths.slice(0,3).forEach(s=>{doc.text(`+ ${s}`,m+187,yy);yy+=6});[...ev.blockingIssues,...ev.issues].slice(0,3).forEach(s=>{doc.text(`• ${s}`,m+187,yy);yy+=6})

  y+=51
  const photos=(await db.photos.where('inspectionId').equals(inspection.id).toArray()).filter(p=>p.includeInReport).slice(0,4)
  if(!photos.length){const main=(await db.photos.where('inspectionId').equals(inspection.id).toArray()).filter(p=>p.isMain).slice(0,1);photos.push(...main)}
  const photoW=44,photoH=33,gap=3;for(let i=0;i<Math.min(4,photos.length);i++){try{const p=photos[i],src=p.editedBlob||p.previewBlob||p.blob,du=await dataUrl(src),fmt=src.type.includes('png')?'PNG':'JPEG';doc.addImage(du,fmt,m+i*(photoW+gap),y,photoW,photoH,undefined,'FAST')}catch{}}
  const noteX=m+4*(photoW+gap)+3, noteW=W-m-noteX;doc.setDrawColor(220);doc.roundedRect(noteX,y,noteW,33,2,2);doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.text('CONSIDERAZIONI FINALI',noteX+3,y+5);doc.setTextColor(40);doc.setFont('helvetica','normal');doc.setFontSize(7.3);const note=String(d.evaluation?.finalNotes||d.configuration?.configurationNotes||'');doc.text(fit(doc,note||'—',noteW-6).slice(0,5),noteX+3,y+11)
  doc.setTextColor(120);doc.setFontSize(6.5);doc.text(`Generato il ${new Date().toLocaleString('it-IT')} · Pagina 1/1`,W-m,H-4,{align:'right'})
  return doc.output('blob')
}

/** Report rapido, una pagina A4, pensato per invio immediato dal sopralluogo. */
export async function generateRapidReportPdf(inspection:Inspection,zone?:Zone){
  const d=inspection.data||{},g=d.general||{},w=d.warehouse||{},y=d.yard||{},a=d.access||{},o=d.offices||{},ws=d.workshop||{},wash=d.wash||{},fuel=d.fuel||{},s=d.systems||{},r=d.rapid||{}
  const ports=w.ports||[],accesses=a.accesses||[]
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});const W=297,H=210,m=9,teal=[15,118,110] as [number,number,number]
  doc.setFillColor(...teal);doc.rect(0,0,W,19,'F');doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text('SOPRALLUOGO RAPIDO',m,12);doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.text(`${zone?.name||'Zona'} · ${safeDate(inspection.date)}`,W-m,12,{align:'right'})
  doc.setTextColor(25);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(inspection.name||inspection.address||'Capannone',m,27);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text(fit(doc,inspection.address||'—',180),m,32)
  doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.text(`Completezza live ${rapidCompleteness(inspection)}%`,W-m,27,{align:'right'});doc.setTextColor(50);doc.setFont('helvetica','normal');doc.text(`Prima impressione: ${inspection.judgment||'—'}`,W-m,32,{align:'right'})
  let yy=41
  const mini=(x:number,wid:number,title:string,rows:Array<[string,string]>)=>{doc.setDrawColor(218);doc.roundedRect(x,yy,wid,52,2,2);doc.setFillColor(242,247,246);doc.roundedRect(x,yy,wid,7,2,2,'F');doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.text(title,x+3,yy+5);doc.setTextColor(35);doc.setFontSize(7);rows.forEach((v,i)=>{doc.setFont('helvetica','bold');doc.text(v[0],x+3,yy+12+i*6.1);doc.setFont('helvetica','normal');const lines=fit(doc,v[1],wid/2-4);doc.text(lines.slice(0,1),x+wid-3,yy+12+i*6.1,{align:'right'})})}
  mini(m,67,'ECONOMIA / MISURE',[["Operazione",txt(g.availabilityType)],["Canone",money(g.rent)],["Prezzo",money(g.salePrice)],["Coperto",`${txt(w.coveredArea)} m²`],["Piazzale",`${txt(y.yardArea)} m²`],["Uffici",`${txt(o.officeArea)} m²`],["Sotto trave",`${txt(w.underBeamHeight)} m`]])
  mini(m+70,67,'ACCESSO / CAPANNONE',[["Bilici",txt(a.semiAccess)],["Mezzi pesanti",txt(a.heavyAccess)],["Manovra",txt(y.truckManeuver)],["Accesso",`${txt(accesses[0]?.width)} × ${txt(accesses[0]?.height)} m`],["Portone",`${txt(ports[0]?.width)} × ${txt(ports[0]?.height)} m`],["Mov. interna",txt(w.internalMovement)],["Pavimento",txt(w.floorState)]])
  mini(m+140,67,'CONFIGURAZIONE / IMPIANTI',[["Officina",txt(ws.liveAssessment||ws.workshopPossible)],["Lavaggio",txt(wash.liveAssessment||wash.washPossible)],["Rifornimento",txt(fuel.liveAssessment||fuel.fuelPossible)],["Reception",txt(o.reception)],["Uffici",txt(o.officeAdequacy)],["Trifase",txt(s.threePhase)],["Acqua / scarichi",`${txt(s.waterConnection)} / ${txt(s.sewer)}`]])
  mini(m+210,78,'PIAZZALE / CRITICITÀ',[["Deposito mezzi",txt(y.vehicleStorage)],["Mezzi grandi",txt(y.largeVehicles)],["Recinzione",txt(y.fenced)],["Cavi aerei",txt(y.overheadPowerLines)],["Criticità",txt(r.criticalities)],["Nota",txt(r.criticalityNotes)],["Disponibilità",txt(g.propertyAvailability)]])
  yy=99
  doc.setDrawColor(218);doc.roundedRect(m,yy,139,36,2,2);doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.text('NOTE SOPRALLUOGO',m+3,yy+5);doc.setTextColor(35);doc.setFont('helvetica','normal');doc.setFontSize(7.3);doc.text(fit(doc,String(r.liveNotes||'—'),133).slice(0,8),m+3,yy+11)
  doc.roundedRect(m+143,yy,145,36,2,2);doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.text('SINTESI LIVE',m+146,yy+5);doc.setTextColor(35);doc.setFont('helvetica','normal');doc.text(fit(doc,[`Piazzale: ${txt(y.yardSurfaceState)} · Capannone: ${txt(w.roofState)}`,`Antincendio: ${txt(s.fireSafety)}`,a.accessNotes?`Viabilità: ${a.accessNotes}`:''].filter(Boolean).join('\n'),139).slice(0,8),m+146,yy+11)
  yy=141
  const all=await db.photos.where('inspectionId').equals(inspection.id).toArray();const priority=['Esterno','Piazzale','Capannone','Criticità','Uffici e servizi','Altro'];const chosen:any[]=[];for(const c of priority){const p=all.find(x=>x.category===c&&x.includeInReport)||all.find(x=>x.category===c);if(p&&!chosen.some(q=>q.id===p.id))chosen.push(p);if(chosen.length===4)break}for(const p of all.filter(x=>x.includeInReport)){if(chosen.length>=4)break;if(!chosen.some(q=>q.id===p.id))chosen.push(p)}
  const pw=66,ph=49,gap=4;for(let i=0;i<Math.min(4,chosen.length);i++){try{const src=chosen[i].editedBlob||chosen[i].previewBlob||chosen[i].blob,du=await dataUrl(src),fmt=src.type.includes('png')?'PNG':'JPEG';doc.addImage(du,fmt,m+i*(pw+gap),yy,pw,ph,undefined,'FAST')}catch{}}
  if(!chosen.length){doc.setTextColor(120);doc.setFontSize(9);doc.text('Nessuna foto disponibile per il report rapido.',m,yy+10)}
  doc.setTextColor(120);doc.setFontSize(6.5);doc.text(`Report preliminare · Generato il ${new Date().toLocaleString('it-IT')} · Pagina 1/1`,W-m,H-4,{align:'right'})
  return doc.output('blob')
}

/** Report completo multipagina: riporta tutti i campi delle 15 schede. */
export async function generateFullReportPdf(inspection:Inspection,zone?:Zone){
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});const W=210,H=297,m=13,teal=[15,118,110] as [number,number,number];let y=0,page=1
  const header=()=>{doc.setFillColor(...teal);doc.rect(0,0,W,18,'F');doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(14);doc.text('SVILUPPO FILIALI · REPORT COMPLETO',m,11.5);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.text(`${zone?.name||'Zona'} · ${safeDate(inspection.date)}`,W-m,11.5,{align:'right'});y=25}
  const footer=()=>{doc.setTextColor(130);doc.setFontSize(6.5);doc.text(`Generato ${new Date().toLocaleString('it-IT')} · Pagina ${page}`,W-m,H-5,{align:'right'})}
  const next=(need=12)=>{if(y+need>H-13){footer();doc.addPage();page++;header()}}
  const sectionTitle=(title:string)=>{next(14);doc.setFillColor(235,247,245);doc.roundedRect(m,y,W-2*m,9,2,2,'F');doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.setFontSize(10.5);doc.text(title,m+3,y+6);y+=13}
  const cardTitle=(title:string)=>{next(9);doc.setTextColor(45);doc.setFont('helvetica','bold');doc.setFontSize(8.2);doc.text(title,m,y+4);y+=7}
  const kv=(label:string,value:any)=>{const val=txt(value);const lines=fit(doc,val,94);const h=Math.max(5,lines.length*4);next(h+2);doc.setFontSize(7.2);doc.setTextColor(90);doc.setFont('helvetica','normal');doc.text(label,m,y+3.5);doc.setTextColor(25);doc.setFont('helvetica','normal');doc.text(lines,m+82,y+3.5);doc.setDrawColor(239);doc.line(m,y+h,W-m,y+h);y+=h+1.5}
  const list=(title:string,items:any[])=>{if(!items?.length)return;cardTitle(title);items.forEach((item:any,idx:number)=>{kv(`${idx+1}`,Object.entries(item).map(([k,v])=>`${k}: ${txt(v)}`).join(' · '))})}
  header();doc.setTextColor(20);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text(inspection.name||inspection.address||'Capannone',m,y);y+=7;doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.text(fit(doc,inspection.address||'—',W-2*m),m,y);y+=9;kv('Zona',zone?.name);kv('Data sopralluogo',safeDate(inspection.date));kv('Comune / Provincia',[inspection.municipality,inspection.province].filter(Boolean).join(' · '));kv('Coordinate',inspection.lat!=null?`${inspection.lat}, ${inspection.lng}`:'—')
  for(const s of sections){sectionTitle(`${sections.indexOf(s)+1}. ${s.title}`);const values=inspection.data?.[s.id]||{};for(const c of s.cards){cardTitle(c.title);for(const f of c.fields)kv(f.label,values[f.key])}
    if(s.id==='warehouse'){list('Portoni',values.ports);list('Misure aggiuntive',values.measurements)}
    if(s.id==='yard')list('Misure aggiuntive',values.measurements)
    if(s.id==='access'){list('Accessi e cancelli',values.accesses);list('Misure aggiuntive',values.measurements)}
    if(['offices','workshop','wash','fuel'].includes(s.id))list('Misure aggiuntive',values.measurements)
    if(s.id==='systems')list('Dati aggiuntivi',values.extraData)
    if(s.id==='planning')list('Verifiche da approfondire',values.checks)
    if(s.id==='location'){list('Competitor',values.competitors);list('Dati aggiuntivi',values.extraData)}
    if(s.id==='configuration'){const cfg=deriveConfiguration(inspection);Object.entries(cfg).forEach(([k,v])=>kv(k,v))}
    if(s.id==='photos'){const photos=await db.photos.where('inspectionId').equals(inspection.id).toArray();const counts=Object.entries(photos.reduce((a:any,p)=>{a[p.category]=(a[p.category]||0)+1;return a},{}));counts.forEach(([k,v])=>kv(k,`${v} foto`))}
    if(s.id==='documents'){const docs=await db.documents.where('inspectionId').equals(inspection.id).toArray();docs.forEach((x,n)=>kv(`Documento ${n+1}`,`${x.category} · ${x.name}${x.documentDate?' · '+x.documentDate:''}`))}
    if(s.id==='evaluation'){const ev=evaluateInspection(inspection);kv('Punteggio',`${ev.score}/100`);kv('Classificazione',ev.classification);kv('Completezza',`${ev.completeness}%`);kv('Giudizio personale',inspection.judgment);kv('Criticità bloccanti',ev.blockingIssues);kv('Punti di forza',ev.strengths);kv('Criticità',ev.issues);kv('Considerazioni finali',inspection.data?.evaluation?.finalNotes)}
  }
  const rapid=inspection.data?.rapid||{};sectionTitle('Appendice · Sopralluogo rapido');kv('Completezza live',`${rapidCompleteness(inspection)}%`);kv('Note live',rapid.liveNotes);kv('Criticità live',rapid.criticalities);kv('Nota criticità',rapid.criticalityNotes)
  const photos=(await db.photos.where('inspectionId').equals(inspection.id).toArray()).filter(p=>p.includeInReport).slice(0,6);if(photos.length){sectionTitle('Appendice fotografica');for(let i=0;i<photos.length;i++){next(63);try{const src=photos[i].editedBlob||photos[i].previewBlob||photos[i].blob,du=await dataUrl(src),fmt=src.type.includes('png')?'PNG':'JPEG';doc.addImage(du,fmt,m,y,80,58,undefined,'FAST');doc.setTextColor(70);doc.setFontSize(7);doc.text(photos[i].category,m+84,y+6);if(photos[i].note)doc.text(fit(doc,photos[i].note||'',95).slice(0,8),m+84,y+12);y+=63}catch{}}}
  footer();return doc.output('blob')
}
