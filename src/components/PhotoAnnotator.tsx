import { useEffect, useRef, useState } from 'react'
import type React from 'react'

interface Props { blob: Blob; onSave: (blob: Blob) => void; onClose: () => void }
type Tool = 'draw'|'highlight'|'line'|'circle'|'text'

export function PhotoAnnotator({ blob, onSave, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('draw')
  const [start, setStart] = useState<{x:number,y:number}|null>(null)
  const [drawing, setDrawing] = useState(false)
  const baseRef = useRef<ImageData | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!; const ctx = canvas.getContext('2d')!
    const img = new Image(); const url = URL.createObjectURL(blob)
    img.onload = () => {
      const maxW = Math.min(window.innerWidth - 40, 1000)
      const scale = Math.min(1, maxW / img.width)
      canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale)
      ctx.drawImage(img,0,0,canvas.width,canvas.height)
      baseRef.current = ctx.getImageData(0,0,canvas.width,canvas.height)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [blob])

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect(); return { x:(e.clientX-r.left)*(canvasRef.current!.width/r.width), y:(e.clientY-r.top)*(canvasRef.current!.height/r.height) }
  }
  const down = (e: React.PointerEvent) => {
    const p=pos(e); setStart(p); setDrawing(true)
    if (tool==='text') {
      const text = prompt('Testo da inserire')
      if (text) { const ctx=canvasRef.current!.getContext('2d')!; ctx.font='bold 24px sans-serif'; ctx.fillStyle='#ef4444'; ctx.fillText(text,p.x,p.y); baseRef.current=ctx.getImageData(0,0,canvasRef.current!.width,canvasRef.current!.height) }
      setDrawing(false)
    }
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing || !start || tool==='text') return
    const p=pos(e), ctx=canvasRef.current!.getContext('2d')!
    if (tool==='draw' || tool==='highlight') {
      ctx.strokeStyle=tool==='highlight'?'rgba(250,204,21,.45)':'#ef4444'; ctx.lineWidth=tool==='highlight'?18:5; ctx.lineCap='round'
      ctx.beginPath(); ctx.moveTo(start.x,start.y); ctx.lineTo(p.x,p.y); ctx.stroke(); setStart(p)
    } else if (baseRef.current) {
      ctx.putImageData(baseRef.current,0,0); ctx.strokeStyle='#ef4444'; ctx.lineWidth=5
      ctx.beginPath()
      if (tool==='line') { ctx.moveTo(start.x,start.y); ctx.lineTo(p.x,p.y) }
      if (tool==='circle') { const rx=Math.abs(p.x-start.x)/2, ry=Math.abs(p.y-start.y)/2; ctx.ellipse((start.x+p.x)/2,(start.y+p.y)/2,rx,ry,0,0,Math.PI*2) }
      ctx.stroke()
    }
  }
  const up = () => { if (!drawing) return; setDrawing(false); const ctx=canvasRef.current!.getContext('2d')!; baseRef.current=ctx.getImageData(0,0,canvasRef.current!.width,canvasRef.current!.height) }
  const save = () => canvasRef.current!.toBlob(b => b && onSave(b), 'image/jpeg', .9)
  const reset = () => { const img=new Image(); const url=URL.createObjectURL(blob); img.onload=()=>{ const c=canvasRef.current!,ctx=c.getContext('2d')!; ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);baseRef.current=ctx.getImageData(0,0,c.width,c.height);URL.revokeObjectURL(url)};img.src=url }
  return <div className="modal-backdrop dark"><div className="annotator">
    <div className="annotator-toolbar">
      {(['draw','highlight','line','circle','text'] as Tool[]).map(t=><button key={t} className={`chip ${tool===t?'selected':''}`} onClick={()=>setTool(t)}>{({draw:'Disegna',highlight:'Evidenzia',line:'Freccia/linea',circle:'Cerchio',text:'Testo'} as any)[t]}</button>)}
      <button className="btn ghost small" onClick={reset}>Ripristina</button>
    </div>
    <canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}/>
    <div className="modal-actions"><button className="btn secondary" onClick={onClose}>Annulla</button><button className="btn primary" onClick={save}>Salva modifica</button></div>
  </div></div>
}
