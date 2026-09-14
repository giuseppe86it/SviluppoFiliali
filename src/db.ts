import Dexie, { type Table } from 'dexie'
import type { AppSetting, Branch, DocumentRecord, Inspection, PhotoRecord, ShareLog, Zone } from './types'

export class SviluppoFilialiDB extends Dexie {
  zones!: Table<Zone, string>
  inspections!: Table<Inspection, string>
  photos!: Table<PhotoRecord, string>
  documents!: Table<DocumentRecord, string>
  branches!: Table<Branch, string>
  settings!: Table<AppSetting, string>
  shares!: Table<ShareLog, string>

  constructor() {
    super('SviluppoFilialiDB')
    this.version(1).stores({
      zones: 'id, name, createdAt, updatedAt',
      inspections: 'id, zoneId, status, date, municipality, province, createdAt, updatedAt, score, judgment',
      photos: 'id, inspectionId, category, createdAt, isMain, includeInReport',
      documents: 'id, inspectionId, category, createdAt',
      branches: 'id, name, municipality, province',
      settings: 'key',
      shares: 'id, inspectionId, createdAt'
    })
  }
}

export const db = new SviluppoFilialiDB()

export const uid = () => crypto.randomUUID()
export const nowIso = () => new Date().toISOString()

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key)
  return row ? (row.value as T) : fallback
}

export async function setSetting(key: string, value: any) {
  await db.settings.put({ key, value })
}
