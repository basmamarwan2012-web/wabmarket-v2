export const OPPORTUNITY_STATUSES = [
  'new',
  'qualified',
  'rejected',
  'converted',
] as const

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number]

export interface Opportunity {
  id: string
  discoveryId: string
  domain: string
  website: string | null
  keyword: string
  city: string
  country: string
  status: OpportunityStatus
  score: number
  createdAt: string
  updatedAt: string
}
