import rawData from './family-offices.json'
import contactsData from './contacts.json'

export type Confidence = 'rumored' | 'confirmed' | 'public'
export type FOStatus = 'active' | 'dormant' | 'unknown'

export interface Contact {
  id: string
  familyOfficeId: string
  name: string
  role: string
  seniority: 'principal' | 'executive' | 'investment_team' | 'advisor'
  linkedinUrl: string | null
  email: string | null
  notes: string
  sourceUrls: string[]
  confidence: Confidence
}

export interface FamilyOffice {
  id: string
  name: string
  family: string
  country: string
  city: string
  estAumUsd: number | null
  status: FOStatus
  tags: string[]
  lastContactedAt: string | null
  lpActivityNotes: string
  directInvestNotes: string
  sourceUrls: string[]
  confidence: Confidence
  lastKnownActivityYear: number | null
}

// Typed cast — shape is guaranteed by the Python conversion script
export const familyOffices: FamilyOffice[] = rawData as FamilyOffice[]

export const contacts: Contact[] = contactsData as Contact[]
