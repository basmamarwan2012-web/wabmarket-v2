export type LeadStatus =
  'new' | 'contacted' | 'replied' | 'negotiating' | 'converted' | 'closed'

export interface Lead {
  id: string

  domainId: string

  companyName: string

  ownerName?: string

  website?: string

  email: string

  phone?: string

  facebookUrl?: string

  linkedinUrl?: string

  instagramUrl?: string

  contactPage?: string

  status: LeadStatus

  createdAt: Date

  updatedAt: Date
}
