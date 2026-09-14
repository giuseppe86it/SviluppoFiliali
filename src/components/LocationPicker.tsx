import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

export function LocationPicker({lat,lng,onConfirm,onClose}:{lat?:number;lng?:number;onConfirm:(lat:number,lng:number)=>void;onClose:()=>void}){
  const ref=useRef<HTMLDivElement>(null);const [point,setPoint]=useState<[number,number]>([lat??45.4642,lng??9.19])
  useEffect(()=>{if(!ref.current)return;const map=L.map(ref.current).setView(point,lat!=null?16:7);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);let marker=L.circleMarker(point,{radius:10,color:'#0f766e',fillColor:'#14b8a6',fillOpacity:.8}).addTo(map);map.on('click',(e:L.LeafletMouseEvent)=>{const p:[number,number]=[e.latlng.lat,e.latlng.lng];setPoint(p);marker.setLatLng(e.latlng)});setTimeout(()=>map.invalidateSize(),50);return()=>{map.remove()}},[])
  return <div className="modal-backdrop"><div className="map-picker"><div className="card-heading"><div><h3>Seleziona posizione</h3><div className="muted small-text">Tocca la mappa sul punto corretto.</div></div><button className="icon-btn" onClick={onClose}>×</button></div><div ref={ref} className="picker-map"/><div className="coords">{point[0].toFixed(6)}, {point[1].toFixed(6)}</div><div className="modal-actions"><button className="btn secondary" onClick={onClose}>Annulla</button><button className="btn primary" onClick={()=>onConfirm(point[0],point[1])}>Conferma posizione</button></div></div></div>
}
