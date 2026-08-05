export type DomainStatus =
  'opportunity' | 'active' | 'sold' | 'expired' | 'archived'

export interface Domain {
  id: string

  domainName: string

  registrar?: string

  keyword?: string

  city?: string

  state?: string

  country?: string

  purchasePrice?: number

  estimatedPrice?: number

  askingPrice?: number

  flipScore?: number

  purchaseDate?: Date

  expirationDate?: Date

  renewalDate?: Date

  autoRenew?: boolean

  nameservers?: string[]

  afternicCheckoutLink?: string

  landingPageUrl?: string

  description?: string

  status: DomainStatus

  createdAt: Date

  updatedAt: Date
}
