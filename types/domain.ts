export const DOMAIN_STATUSES = [
  'opportunity',
  'active',
  'sold',
  'expired',
  'archived',
] as const

export type DomainStatus = (typeof DOMAIN_STATUSES)[number]

export interface Domain {
  id: string
  domainName: string
  normalizedDomainName: string
  registrar: string | null
  keyword: string | null
  city: string | null
  state: string | null
  country: string | null
  purchasePrice: number
  estimatedPrice: number
  askingPrice: number
  flipScore: number
  status: DomainStatus
  purchaseDate: string | null
  expirationDate: string | null
  renewalDate: string | null
  autoRenew: boolean
  nameservers: string[]
  afternicCheckoutLink: string | null
  landingPageUrl: string | null
  description: string | null
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}
