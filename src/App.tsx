import { useEffect, useState } from 'react'
import { HomePage } from './pages/HomePage'
import { NewInspectionPage } from './pages/NewInspectionPage'
import { InspectionPage } from './pages/InspectionPage'
import { ArchivePage, TrashPage } from './pages/ArchivePage'
import { MapPage } from './pages/MapPage'
import { BackupPage } from './pages/BackupPage'
import { SettingsPage } from './pages/SettingsPage'
import { SharePage } from './pages/SharePage'
import { AboutPage, MorePage } from './pages/MorePage'
import { getPinHash, hashPin } from './services/security'

function useHash(){const[hash,setHash]=useState(location.hash||'#/home');useEffect(()=>{const f=()=>setHash(location.hash||'#/home');window.addEventListener('hashchange',f);if(!location.hash)location.hash='#/home';return()=>window.removeEventListener('hashchange',f)},[]);return hash}

function LockScreen({onUnlock}:{onUnlock:()=>void}){const[pin,setPin]=useState('');const[error,setError]=useState('');const unlock=async()=>{if(await hashPin(pin)===getPinHash()){sessionStorage.setItem('sf-unlocked','1');onUnlock()}else{setError('PIN non corretto');setPin('')}};return <div className="lock-screen"><div className="lock-card"><div className="app-mark">SF</div><h1>Sviluppo Filiali</h1><p>Inserisci il PIN per accedere ai dati locali.</p><input autoFocus type="password" inputMode="numeric" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&unlock()} placeholder="PIN"/>{error&&<div className="error-text">{error}</div>}<button className="btn primary wide big" onClick={unlock}>Sblocca</button></div></div>}

export default function App(){const hash=useHash();useEffect(()=>{navigator.storage?.persist?.().catch(()=>{})},[]);const[unlocked,setUnlocked]=useState(()=>!getPinHash()||sessionStorage.getItem('sf-unlocked')==='1');if(!unlocked)return <LockScreen onUnlock={()=>setUnlocked(true)}/>;const clean=hash.slice(2).split('?')[0];const parts=clean.split('/').filter(Boolean);const route=parts[0]||'home';if(route==='home')return <HomePage/>;if(route==='new')return <NewInspectionPage/>;if(route==='inspection')return <InspectionPage id={parts[1]} sectionId={parts[2]||'general'}/>;if(route==='archive')return <ArchivePage/>;if(route==='trash')return <TrashPage/>;if(route==='map')return <MapPage/>;if(route==='backup')return <BackupPage/>;if(route==='settings')return <SettingsPage/>;if(route==='share')return <SharePage id={parts[1]}/>;if(route==='more')return <MorePage/>;if(route==='about')return <AboutPage/>;return <HomePage/>}
