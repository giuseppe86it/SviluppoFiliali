import { jsPDF } from 'jspdf'
import { db } from '../db'
import { evaluateInspection, deriveConfiguration } from '../evaluation'
import type { Inspection, Zone } from '../types'
import { nearestBranch } from './geo'

function money(v:any){const n=Number(v);return Number.isFinite(n)&&n>0?new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n):'—'}
function txt(v:any){return v==null||v===''?'—':String(v)}
async function dataUrl(blob:Blob){return new Promise<string>((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result));r.onerror=()=>rej(r.error);r.readAsDataURL(blob)})}
function fit(doc:jsPDF,text:string,max:number){return doc.splitTextToSize(text,max) as string[]}

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
  doc.roundedRect(m+184,y,97,45,2,2);doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.text('PUNTI DI FORZA / CRITICITÀ',m+187,y+5);doc.setFontSize(7);doc.setTextColor(35);doc.setFont('helvetica','normal');let yy=y+12;ev.strengths.slice(0,3).forEach(s=>{doc.text(`+ ${s}`,m+187,yy);yy+=6});ev.issues.slice(0,3).forEach(s=>{doc.text(`• ${s}`,m+187,yy);yy+=6})

  y+=51
  const photos=(await db.photos.where('inspectionId').equals(inspection.id).toArray()).filter(p=>p.includeInReport).slice(0,4)
  if(!photos.length){const main=(await db.photos.where('inspectionId').equals(inspection.id).toArray()).filter(p=>p.isMain).slice(0,1);photos.push(...main)}
  const photoW=44,photoH=33,gap=3;for(let i=0;i<Math.min(4,photos.length);i++){try{const p=photos[i],src=p.editedBlob||p.previewBlob||p.blob,du=await dataUrl(src),fmt=src.type.includes('png')?'PNG':'JPEG';doc.addImage(du,fmt,m+i*(photoW+gap),y,photoW,photoH,undefined,'FAST')}catch{}}
  const noteX=m+4*(photoW+gap)+3, noteW=W-m-noteX;doc.setDrawColor(220);doc.roundedRect(noteX,y,noteW,33,2,2);doc.setTextColor(...teal);doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.text('CONSIDERAZIONI FINALI',noteX+3,y+5);doc.setTextColor(40);doc.setFont('helvetica','normal');doc.setFontSize(7.3);const note=String(d.evaluation?.finalNotes||d.configuration?.configurationNotes||'');doc.text(fit(doc,note||'—',noteW-6).slice(0,5),noteX+3,y+11)
  doc.setTextColor(120);doc.setFontSize(6.5);doc.text(`Generato il ${new Date().toLocaleString('it-IT')} · Pagina 1/1`,W-m,H-4,{align:'right'})
  return doc.output('blob')
}
