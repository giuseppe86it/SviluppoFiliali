import type { Inspection } from '../types'

function filled(v:any){return v!==undefined&&v!==null&&v!==''}

export function rapidCompleteness(i:Inspection){
  const d=i.data||{}, g=d.general||{}, w=d.warehouse||{}, y=d.yard||{}, a=d.access||{}, o=d.offices||{}, ws=d.workshop||{}, wash=d.wash||{}, fuel=d.fuel||{}, s=d.systems||{}
  const mainPort=(w.ports||[])[0]||{}, mainAccess=(a.accesses||[])[0]||{}
  const values=[
    i.address,
    g.availabilityType,
    w.coveredArea,y.yardArea,o.officeArea,w.underBeamHeight,w.maxHeight,mainPort.width,mainPort.height,
    a.semiAccess,a.heavyAccess,y.truckManeuver,mainAccess.width,
    y.vehicleStorage,y.largeVehicles,y.yardSurfaceState,y.fenced,y.overheadPowerLines,
    w.internalMovement,w.columnInterference,w.floorState,w.roofState,
    ws.liveAssessment,o.reception,o.officeAdequacy,wash.liveAssessment,fuel.liveAssessment,
    s.threePhase,s.waterConnection,s.sewer,s.fireSafety,
    i.judgment
  ]
  const done=values.filter(filled).length
  return Math.round(done/values.length*100)
}

export function rapidStatusLabel(i:Inspection){
  if(i.data?.rapid?.liveCompletedAt)return 'Live ✓ completo'
  const c=rapidCompleteness(i)
  return c?`Live ${c}%`:'Live da compilare'
}
