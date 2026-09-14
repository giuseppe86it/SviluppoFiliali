import type { Inspection } from './types'

const defaultSectionWeights = { access:20, yard:20, warehouse:15, configuration:20, location:15, offices:5, systemsPlanning:5 }
const defaultThresholds = { excellent:85, good:70, evaluable:55, critical:40 }
const defaultBlocking = { heavyAccess:true, useCompatible:true, rentalCompatible:true, storageCompatible:true, configuration:true, overheadPowerLines:false, workshop:false, wash:false, fuel:false }
type SectionKey = keyof typeof defaultSectionWeights
type RuntimeConfig = {
  weights: Record<SectionKey, number>
  thresholds: typeof defaultThresholds
  blocking: typeof defaultBlocking
}
function parseStored<T>(key:string):Partial<T>{try{return JSON.parse(localStorage.getItem(key)||'{}') as Partial<T>}catch{return {}}}
function runtimeConfig():RuntimeConfig{
  return {
    weights: { ...defaultSectionWeights, ...parseStored<Record<SectionKey,number>>('sf-weights') },
    thresholds: { ...defaultThresholds, ...parseStored<typeof defaultThresholds>('sf-thresholds') },
    blocking: { ...defaultBlocking, ...parseStored<typeof defaultBlocking>('sf-blocking') }
  }
}

const maps: Record<string, Record<string, number>> = {
  accessScale: { Agevole: 100, Possibile: 75, Difficoltoso: 35, 'Non possibile': 0 },
  passingScale: { Agevole: 100, Possibile: 75, Difficoltoso: 40, 'Non possibile': 20 },
  yesNo: { 'Sì': 100, 'No': 0 },
  yesPartialNo: { 'Sì': 100, Parzialmente: 60, 'No': 0 },
  goodState: { Buono: 100, Sufficiente: 75, 'Da sistemare': 45, Critico: 10 },
  visibility: { Ottima: 100, Buona: 80, Sufficiente: 60, Scarsa: 25 },
  highMediumLow: { Alta: 100, Media: 70, Bassa: 35 },
  potential: { Alto: 100, Medio: 70, Basso: 35 },
  context: { Consolidato: 100, 'In sviluppo': 85, Isolato: 40 },
  areaType: { Industriale: 100, Artigianale: 90, Mista: 70, Commerciale: 60, Altro: 50 },
  adequate: { Adeguati: 100, Realizzabili: 70, 'Presenti ma insufficienti': 40, Assenti: 20 },
  officeAdequacy: { 'Sì': 100, 'Con modifiche': 70, 'No': 20 },
  reception: { Presente: 100, Realizzabile: 75, 'Non realizzabile': 20 },
  systemsState: { Buono: 100, Sufficiente: 70, Critico: 25 },
  available: { Presente: 100, Presenti: 100, Adeguata: 100, Disponibile: 100, Assente: 0, Assenti: 0, Insufficiente: 25, 'Non disponibile': 25 },
  yardLighting: { Adeguata: 100, Parziale: 65, Assente: 20 },
  roof: { Buono: 100, Critico: 20 },
  movement: { Agevole: 100, Possibile: 75, Difficoltosa: 35, Critica: 10 },
  workshopResult: { Facile: 100, 'Possibile con modifiche': 75, Critica: 30, 'Non realizzabile': 0 },
  configResult: { Idoneo: 100, Idonea: 100, Idonei: 100, Parziale: 60, 'Da adattare': 70, 'Con modifiche': 75, Critica: 30, Critico: 30, Critici: 30, 'Non idoneo': 0, 'Non idonea': 0, 'Non idonei': 0, 'Non realizzabile': 0, Realizzabile: 100 },
  planning: { 'Sì': 100, 'No': 0 }
}

type Item = { value: any; weight: number; map?: Record<string, number>; score?: number }

function isUnknown(v: any) {
  return v == null || v === '' || v === 'Da verificare' || v === 'Da richiedere' || v === 'Non disponibile'
}

function itemScore(item: Item) {
  if (item.score != null) return item.score
  if (isUnknown(item.value)) return null
  return item.map?.[String(item.value)] ?? null
}

function weighted(items: Item[]) {
  let total = 0
  let weight = 0
  for (const item of items) {
    const score = itemScore(item)
    if (score == null) continue
    total += score * item.weight
    weight += item.weight
  }
  return weight ? total / weight : null
}

function val(data: Record<string, any>, section: string, key: string) {
  return data?.[section]?.[key]
}

export function deriveConfiguration(inspection: Inspection) {
  const d = inspection.data || {}
  const yardStorage = val(d, 'yard', 'vehicleStorage')
  const truckManeuver = val(d, 'yard', 'truckManeuver')
  const workshopPossible = val(d, 'workshop', 'workshopPossible')
  const washPossible = val(d, 'wash', 'washPossible')
  const fuelPossible = val(d, 'fuel', 'fuelPossible')
  const reception = val(d, 'offices', 'reception')
  const officeAdequacy = val(d, 'offices', 'officeAdequacy')
  const customerParking = val(d, 'access', 'customerParking')
  const employeeParking = val(d, 'access', 'employeeParking')
  const systemsState = val(d, 'systems', 'systemsState')
  const useCompatible = val(d, 'planning', 'useCompatible')
  const rentalCompatible = val(d, 'planning', 'rentalCompatible')

  const result = {
    vehicleStorage: yardStorage === 'Sì' ? 'Idoneo' : yardStorage === 'Parzialmente' ? 'Parziale' : yardStorage === 'No' ? 'Non idoneo' : 'Da verificare',
    operationalYard: truckManeuver === 'Agevole' ? 'Idoneo' : truckManeuver === 'Possibile' ? 'Parziale' : ['Difficoltosa','Non possibile'].includes(truckManeuver) ? 'Non idoneo' : 'Da verificare',
    workshop: workshopPossible === 'Sì' ? inferWorkshop(d) : workshopPossible === 'No' ? 'Non realizzabile' : 'Da verificare',
    reception: reception === 'Presente' ? 'Idonea' : reception === 'Realizzabile' ? 'Da adattare' : reception === 'Non realizzabile' ? 'Critica' : 'Da verificare',
    offices: officeAdequacy === 'Sì' ? 'Idonei' : officeAdequacy === 'Con modifiche' ? 'Da adattare' : officeAdequacy === 'No' ? 'Critici' : 'Da verificare',
    wash: washPossible === 'Sì' ? inferWash(d) : washPossible === 'No' ? 'Non realizzabile' : 'Da verificare',
    fuel: fuelPossible === 'Sì' ? inferFuel(d) : fuelPossible === 'No' ? 'Non realizzabile' : 'Da verificare',
    parking: parkingSummary(customerParking, employeeParking),
    systems: systemsState === 'Buono' ? 'Adeguati' : systemsState === 'Sufficiente' ? 'Da integrare' : systemsState === 'Critico' ? 'Critici' : 'Da verificare',
    planning: useCompatible === 'No' || rentalCompatible === 'No' ? 'Critica' : useCompatible === 'Sì' && rentalCompatible === 'Sì' ? 'Compatibile' : 'Da verificare'
  }

  const critical = Object.values(result).filter(v => ['Non idoneo','Non realizzabile','Critica','Critici'].includes(v)).length
  const unknown = Object.values(result).filter(v => v === 'Da verificare').length
  const overall = critical >= 2 ? 'Non idonea' : critical === 1 ? 'Critica' : unknown >= 4 ? 'Da verificare' : Object.values(result).some(v => ['Parziale','Da adattare','Da integrare','Possibile con modifiche'].includes(v)) ? 'Idonea con modifiche' : 'Idonea'
  return { ...result, overall }
}

function inferWorkshop(d: Record<string, any>) {
  const lift = val(d, 'workshop', 'liftPossible')
  const space = val(d, 'workshop', 'workshopSpace')
  const entry = val(d, 'workshop', 'workshopVehicleEntry')
  if (lift === 'No' || space === 'No' || entry === 'Non possibile') return 'Critica'
  if (lift === 'Sì' && space === 'Sì' && entry === 'Agevole') return 'Facile'
  return 'Possibile con modifiche'
}
function inferWash(d: Record<string, any>) {
  const access = val(d, 'wash', 'washAccess')
  const water = val(d, 'wash', 'washWater')
  const drain = val(d, 'wash', 'washDrain')
  if (access === 'Non possibile') return 'Critica'
  if (access === 'Agevole' && water === 'Sì' && drain === 'Sì') return 'Realizzabile'
  return 'Con modifiche'
}
function inferFuel(d: Record<string, any>) {
  const tanker = val(d, 'fuel', 'tankerAccess')
  const interference = val(d, 'fuel', 'fuelInterference')
  if (tanker === 'Non possibile' || interference === 'Critica') return 'Critica'
  if (tanker === 'Agevole' && interference === 'Nessuna') return 'Realizzabile'
  return 'Con modifiche'
}
function parkingSummary(a: any, b: any) {
  if (a === 'Adeguati' && b === 'Adeguati') return 'Adeguati'
  if (a === 'Assenti' || b === 'Assenti') return 'Insufficienti'
  if (!a || !b) return 'Da verificare'
  return 'Da integrare'
}

function scoreAccess(d: Record<string, any>) {
  return weighted([
    { value: val(d,'access','semiAccess'), weight: 30, map: maps.accessScale },
    { value: val(d,'access','heavyAccess'), weight: 25, map: maps.accessScale },
    { value: val(d,'access','twoHeavyPassing'), weight: 15, map: maps.passingScale },
    { value: val(d,'access','easyEntry'), weight: 8, map: { 'Sì':100, Parzialmente:60, 'No':20 } },
    { value: val(d,'access','easyExit'), weight: 7, map: { 'Sì':100, Parzialmente:60, 'No':20 } },
    { value: val(d,'access','heavyTrafficLimits'), weight: 10, map: { 'No':100, 'Sì':20 } },
    { value: val(d,'access','customerParking'), weight: 3, map: maps.adequate },
    { value: val(d,'access','employeeParking'), weight: 2, map: maps.adequate }
  ])
}
function scoreYard(d: Record<string, any>) {
  return weighted([
    { value: val(d,'yard','vehicleStorage'), weight: 25, map: maps.yesPartialNo },
    { value: val(d,'yard','truckManeuver'), weight: 25, map: { Agevole:100, Possibile:75, Difficoltosa:35, 'Non possibile':0 } },
    { value: val(d,'yard','heavyManeuver'), weight: 15, map: { Agevole:100, Possibile:75, Difficoltosa:35, 'Non possibile':0 } },
    { value: val(d,'yard','yardSurfaceState'), weight: 10, map: maps.goodState },
    { value: val(d,'yard','organizedStorage'), weight: 15, map: maps.yesNo },
    { value: val(d,'yard','largeVehicles'), weight: 5, map: maps.yesNo },
    { value: val(d,'yard','siteClosable'), weight: 3, map: maps.yesNo },
    { value: val(d,'yard','yardLighting'), weight: 2, map: maps.yardLighting }
  ])
}
function scoreWarehouse(d: Record<string, any>) {
  const ports: any[] = d?.warehouse?.ports || []
  const portScores = ports.map(p => p.vehicleSuitable === 'Sì' ? 100 : p.vehicleSuitable === 'No' ? 0 : null).filter(v => v != null) as number[]
  const portScore = portScores.length ? portScores.reduce((a,b)=>a+b,0)/portScores.length : null
  const height = Number(val(d,'warehouse','underBeamHeight'))
  const heightScore = height ? (height >= 6 ? 100 : height >= 4.5 ? 75 : height >= 3.5 ? 45 : 20) : null
  return weighted([
    { value: val(d,'warehouse','internalMovement'), weight: 25, map: maps.movement },
    { value: 'ports', weight: 25, score: portScore ?? undefined },
    { value: 'height', weight: 15, score: heightScore ?? undefined },
    { value: val(d,'warehouse','columnInterference'), weight: 15, map: { 'No':100, Parzialmente:60, 'Sì':25 } },
    { value: val(d,'warehouse','floorState'), weight: 10, map: maps.goodState },
    { value: val(d,'warehouse','roofState'), weight: 10, map: maps.roof }
  ])
}
function scoreConfiguration(inspection: Inspection) {
  const c = deriveConfiguration(inspection)
  return weighted([
    { value: c.operationalYard, weight: 20, map: maps.configResult },
    { value: c.vehicleStorage, weight: 20, map: maps.configResult },
    { value: c.workshop, weight: 20, map: maps.configResult },
    { value: c.wash, weight: 10, map: maps.configResult },
    { value: c.fuel, weight: 10, map: maps.configResult },
    { value: c.reception, weight: 7.5, map: maps.configResult },
    { value: c.offices, weight: 7.5, map: maps.configResult },
    { value: c.parking, weight: 5, map: { Adeguati:100, 'Da integrare':60, Insufficienti:20 } }
  ])
}
function scoreLocation(d: Record<string, any>) {
  const linksScore = averageKnown([
    distanceScore(val(d,'location','mainRoadDistance'), 2, 8),
    distanceScore(val(d,'location','motorwayDistance'), 8, 25),
    distanceScore(val(d,'location','tollboothDistance'), 8, 25)
  ])
  return weighted([
    { value: val(d,'location','commercialPotential'), weight: 25, map: maps.potential },
    { value: val(d,'location','targetActivities'), weight: 20, map: maps.highMediumLow },
    { value: 'links', weight: 20, score: linksScore ?? undefined },
    { value: val(d,'location','visibility'), weight: 15, map: maps.visibility },
    { value: val(d,'location','areaContext'), weight: 10, map: maps.context },
    { value: val(d,'location','roadFront'), weight: 5, map: { 'Sì':100, Parziale:65, 'No':30 } },
    { value: val(d,'location','visibleSign'), weight: 5, map: maps.yesNo }
  ])
}
function distanceScore(v: any, good: number, poor: number) {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return null
  if (n <= good) return 100
  if (n >= poor) return 35
  return 100 - ((n - good) / (poor - good)) * 65
}
function averageKnown(values: Array<number|null>) {
  const known = values.filter((v): v is number => v != null)
  return known.length ? known.reduce((a,b)=>a+b,0)/known.length : null
}
function scoreOffices(d: Record<string, any>) {
  return weighted([
    { value: val(d,'offices','officeAdequacy'), weight: 30, map: maps.officeAdequacy },
    { value: val(d,'offices','reception'), weight: 25, map: maps.reception },
    { value: val(d,'offices','bathroomState'), weight: 15, map: maps.goodState },
    { value: val(d,'offices','lockerRoom'), weight: 8, map: { Presente:100, Realizzabile:70, Assente:30 } },
    { value: val(d,'offices','showers'), weight: 7, map: { Presenti:100, Realizzabili:70, Assenti:30 } },
    { value: val(d,'offices','officeState'), weight: 10, map: maps.goodState },
    { value: val(d,'offices','officeClimate'), weight: 5, map: { Adeguato:100, 'Presente ma da migliorare':65, Assente:25 } }
  ])
}
function scoreSystemsPlanning(d: Record<string, any>) {
  const planning = weighted([
    { value: val(d,'planning','useCompatible'), weight: 30, map: maps.planning },
    { value: val(d,'planning','rentalCompatible'), weight: 25, map: maps.planning },
    { value: val(d,'planning','storageCompatible'), weight: 20, map: maps.planning },
    { value: val(d,'planning','maintenanceCompatible'), weight: 10, map: maps.planning },
    { value: val(d,'planning','washAuthorizable'), weight: 5, map: maps.planning },
    { value: val(d,'planning','fuelAuthorizable'), weight: 5, map: maps.planning },
    { value: val(d,'planning','signageAllowed'), weight: 5, map: maps.planning }
  ])
  const systems = weighted([
    { value: val(d,'systems','electrical'), weight: 20, map: maps.available },
    { value: val(d,'systems','threePhase'), weight: 15, map: maps.available },
    { value: val(d,'systems','waterConnection'), weight: 15, map: maps.available },
    { value: val(d,'systems','sewer'), weight: 10, map: maps.available },
    { value: val(d,'systems','fireSafety'), weight: 20, map: maps.available },
    { value: val(d,'systems','officeHeatingCooling'), weight: 8, map: maps.available },
    { value: val(d,'systems','internet'), weight: 5, map: maps.available },
    { value: val(d,'systems','internalLighting'), weight: 7, map: { Adeguata:100, 'Da migliorare':65, Insufficiente:25 } }
  ])
  return weighted([
    { value: 'planning', weight: 70, score: planning ?? undefined },
    { value: 'systems', weight: 30, score: systems ?? undefined }
  ])
}

function completeness(inspection: Inspection) {
  const values: any[] = []
  const walk = (obj: any) => {
    if (!obj || typeof obj !== 'object' || obj instanceof Blob) return
    if (Array.isArray(obj)) { obj.forEach(walk); return }
    Object.entries(obj).forEach(([k,v]) => {
      if (['measurements','ports','accesses','competitors','extraData','checks'].includes(k)) return
      if (v !== undefined) values.push(v)
    })
  }
  walk(inspection.data)
  if (!values.length) return 0
  let sum = 0
  values.forEach(v => {
    if (v === '' || v == null) sum += 0
    else if (v === 'Da verificare' || v === 'Da richiedere') sum += 0.5
    else sum += 1
  })
  return Math.round((sum / values.length) * 100)
}

export function evaluateInspection(inspection: Inspection) {
  const d = inspection.data || {}
  const sections = {
    access: scoreAccess(d),
    yard: scoreYard(d),
    warehouse: scoreWarehouse(d),
    configuration: scoreConfiguration(inspection),
    location: scoreLocation(d),
    offices: scoreOffices(d),
    systemsPlanning: scoreSystemsPlanning(d)
  }
  let total = 0
  let usedWeight = 0
  const cfgRuntime = runtimeConfig()
  for (const key of Object.keys(cfgRuntime.weights) as SectionKey[]) {
    const weight = cfgRuntime.weights[key]
    const sectionScore = sections[key]
    if (sectionScore == null) continue
    total += sectionScore * weight
    usedWeight += weight
  }
  let score = usedWeight ? total / usedWeight : 0
  const overhead = val(d,'yard','overheadPowerLines')
  if (overhead === 'Sì') score -= 5
  score = Math.max(0, Math.min(100, Math.round(score)))

  const blockingIssues: string[] = []
  const bc = cfgRuntime.blocking
  if (bc.heavyAccess && val(d,'access','heavyAccess') === 'Non possibile') blockingIssues.push('Accesso mezzi pesanti non possibile')
  if (bc.useCompatible && val(d,'planning','useCompatible') === 'No') blockingIssues.push("Destinazione d'uso incompatibile")
  if (bc.rentalCompatible && val(d,'planning','rentalCompatible') === 'No') blockingIssues.push('Attività di noleggio non compatibile')
  if (bc.storageCompatible && val(d,'planning','storageCompatible') === 'No') blockingIssues.push('Deposito mezzi sul piazzale non compatibile')
  if (bc.configuration && deriveConfiguration(inspection).overall === 'Non idonea') blockingIssues.push('Configurazione filiale non idonea')
  if (bc.overheadPowerLines && val(d,'yard','overheadPowerLines') === 'Sì') blockingIssues.push('Cavi elettrici aerei presenti')
  if (bc.workshop && val(d,'workshop','workshopPossible') === 'No') blockingIssues.push('Area officina non realizzabile')
  if (bc.wash && val(d,'wash','washPossible') === 'No') blockingIssues.push('Area lavaggio non realizzabile')
  if (bc.fuel && val(d,'fuel','fuelPossible') === 'No') blockingIssues.push('Area rifornimento non realizzabile')

  const strengths = collectStrengths(inspection)
  const issues = collectIssues(inspection)
  return {
    score,
    completeness: completeness(inspection),
    classification: score >= cfgRuntime.thresholds.excellent ? 'Ottimo' : score >= cfgRuntime.thresholds.good ? 'Buono' : score >= cfgRuntime.thresholds.evaluable ? 'Valutabile' : score >= cfgRuntime.thresholds.critical ? 'Critico' : 'Non idoneo',
    blockingIssues,
    strengths,
    issues,
    sectionScores: sections,
    configuration: deriveConfiguration(inspection)
  }
}

function collectStrengths(i: Inspection) {
  const d = i.data || {}; const out: string[] = []
  if (val(d,'yard','truckManeuver') === 'Agevole') out.push('Manovra bilici agevole')
  if (val(d,'yard','vehicleStorage') === 'Sì') out.push('Piazzale adatto al deposito mezzi')
  if (val(d,'access','semiAccess') === 'Agevole') out.push('Accesso bilici agevole')
  if (val(d,'workshop','workshopPossible') === 'Sì') out.push('Area officina ricavabile')
  if (val(d,'location','visibility') === 'Ottima' || val(d,'location','visibility') === 'Buona') out.push('Buona visibilità')
  if (val(d,'location','commercialPotential') === 'Alto') out.push('Potenziale commerciale elevato')
  return [...new Set(out)].slice(0,5)
}
function collectIssues(i: Inspection) {
  const d = i.data || {}; const out: string[] = []
  if (val(d,'yard','overheadPowerLines') === 'Sì') out.push('Cavi elettrici aerei presenti')
  if (val(d,'yard','truckManeuver') === 'Difficoltosa' || val(d,'yard','truckManeuver') === 'Non possibile') out.push('Manovra bilici critica')
  if (val(d,'access','semiAccess') === 'Difficoltoso' || val(d,'access','semiAccess') === 'Non possibile') out.push('Accesso bilici problematico')
  if (val(d,'offices','officeAdequacy') === 'No' || val(d,'offices','officeLayout') === 'Da riconfigurare') out.push('Uffici da riconfigurare')
  if (val(d,'wash','washPossible') === 'Da verificare') out.push('Area lavaggio da verificare')
  if (val(d,'fuel','fuelPossible') === 'Da verificare') out.push('Area rifornimento da verificare')
  return [...new Set(out)].slice(0,5)
}
