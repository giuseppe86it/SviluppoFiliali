import type { Branch } from '../types'

export interface ReverseGeoResult {
  address: string
  municipality: string
  province: string
  postalCode: string
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('GPS non disponibile'))
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 15000
    })
  })
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeoResult | null> {
  if (!navigator.onLine) return null
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1&accept-language=it`
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) return null
    const json = await response.json()
    const a = json.address || {}
    const road = a.road || a.pedestrian || a.industrial || a.suburb || ''
    const number = a.house_number || ''
    const municipality = a.city || a.town || a.village || a.municipality || a.county || ''
    const province = a.province || a.state_district || ''
    return {
      address: [road, number].filter(Boolean).join(' ') || json.display_name || '',
      municipality,
      province,
      postalCode: a.postcode || ''
    }
  } catch {
    return null
  }
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function nearestBranch(lat: number | undefined, lng: number | undefined, branches: Branch[]) {
  if (lat == null || lng == null || !branches.length) return null
  return branches
    .map(branch => ({ branch, distanceKm: haversineKm(lat, lng, branch.lat, branch.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0] ?? null
}

export function googleMapsUrl(lat?: number, lng?: number, address?: string) {
  if (lat != null && lng != null) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`
}
