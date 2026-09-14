export type InspectionStatus = 'draft' | 'completed'
export type Judgment = 'Molto interessante' | 'Interessante' | 'Da approfondire' | 'Poco interessante' | 'Non idoneo' | ''

export interface Zone {
  id: string
  name: string
  region?: string
  provinces?: string[]
  note?: string
  createdAt: string
  updatedAt: string
}

export interface Inspection {
  id: string
  zoneId: string
  status: InspectionStatus
  createdAt: string
  updatedAt: string
  date: string
  name: string
  address: string
  municipality: string
  province: string
  postalCode: string
  lat?: number
  lng?: number
  data: Record<string, any>
  score?: number
  completeness?: number
  classification?: string
  judgment?: Judgment
  blockingIssues?: string[]
  deletedAt?: string
  strengths?: string[]
  issues?: string[]
}

export interface PhotoRecord {
  id: string
  inspectionId: string
  category: string
  blob: Blob
  previewBlob?: Blob
  editedBlob?: Blob
  title?: string
  note?: string
  isMain?: boolean
  includeInReport?: boolean
  createdAt: string
}

export interface DocumentRecord {
  id: string
  inspectionId: string
  category: string
  name: string
  blob: Blob
  mimeType: string
  documentDate?: string
  note?: string
  createdAt: string
}

export interface Branch {
  id: string
  name: string
  municipality: string
  province?: string
  address: string
  lat: number
  lng: number
}

export interface AppSetting {
  key: string
  value: any
}

export interface ShareLog {
  id: string
  inspectionId: string
  type: string
  createdAt: string
}

export type FieldType = 'text' | 'number' | 'textarea' | 'choice' | 'date' | 'email' | 'tel' | 'url'

export interface ShowWhen {
  field: string
  in: any[]
}

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  unit?: string
  options?: string[]
  placeholder?: string
  required?: boolean
  showWhen?: ShowWhen
}

export interface CardDef {
  title: string
  description?: string
  fields: FieldDef[]
}

export interface SectionDef {
  id: string
  title: string
  shortTitle: string
  cards: CardDef[]
  photoCategory?: string
  measurements?: boolean
  special?: 'general' | 'warehouse' | 'access' | 'systems' | 'planning' | 'location' | 'configuration' | 'photos' | 'documents' | 'evaluation'
}
