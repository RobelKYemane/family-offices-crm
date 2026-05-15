import rawData from './family-offices.json'
import contactsData from './contacts.json'
import fundsData from './funds.json'
import lpPositionsData from './lp-positions.json'
import diData from './direct-investments.json'

export type Confidence = 'rumored' | 'confirmed' | 'public'
export type FOStatus = 'active' | 'dormant' | 'unknown'
export type FundStatus = 'raising' | 'closed' | 'evergreen' | 'fully-deployed'

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

export interface Fund {
  id: string
  name: string
  gpFirm: string
  vintageYear: number | null
  targetSizeUsd: number | null
  geographyFocus: string[]
  sectorFocus: string[]
  status: FundStatus
  sourceUrls: string[]
  notes: string
  confidence: Confidence
}

export interface LPPosition {
  id: string
  familyOfficeId: string
  fundId: string
  commitmentAmountUsd: number | null
  commitmentDate: string | null
  notes: string
  sourceUrls: string[]
  confidence: Confidence
}

export interface DirectInvestment {
  id: string
  familyOfficeId: string
  companyName: string
  sector: string | null
  stage: string | null
  checkSizeUsd: number | null
  roundSizeUsd: number | null
  dealDate: string | null
  notes: string
  sourceUrls: string[]
  confidence: Confidence
}

// Typed cast — shape is guaranteed by the Python conversion script
export const familyOffices: FamilyOffice[] = rawData as FamilyOffice[]

export const contacts: Contact[] = contactsData as Contact[]

export const funds: Fund[] = fundsData as Fund[]

export const lpPositions: LPPosition[] = lpPositionsData as LPPosition[]

export const directInvestments: DirectInvestment[] = diData as DirectInvestment[]
