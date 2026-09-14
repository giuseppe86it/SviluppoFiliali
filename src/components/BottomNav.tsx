export function BottomNav({active}:{active?:string}) {
  const nav=(hash:string)=>{location.hash=hash}
  return <nav className="bottom-nav">
    <button className={active==='home'?'active':''} onClick={()=>nav('#/home')}><span>⌂</span>Home</button>
    <button className={active==='archive'?'active':''} onClick={()=>nav('#/archive')}><span>▤</span>Archivio</button>
    <button className="nav-plus" onClick={()=>nav('#/new')}><span>＋</span></button>
    <button className={active==='map'?'active':''} onClick={()=>nav('#/map')}><span>⌖</span>Mappa</button>
    <button className={active==='more'?'active':''} onClick={()=>nav('#/more')}><span>•••</span>Altro</button>
  </nav>
}
