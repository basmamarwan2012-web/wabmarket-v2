import type { DomainStatus } from './domain'

export interface DomainPersistence {
  id: string
  domain_name: string
  normalized_domain_name: string
  registrar: string | null
  keyword: string | null
  city: string | null
  state: string | null
  country: string | null
  purchase_price: number
  estimated_price: number
  asking_price: number
  flipscore: number
  status: DomainStatus
  purchase_date: unknown | null
  expiration_date: unknown | null
  renewal_date: unknown | null
  auto_renew: boolean
  nameservers: string[]
  afternic_checkout_link: string | null
  landing_page_url: string | null
  description: string | null
  is_deleted: boolean
  deleted_at: unknown | null
  deleted_by: string | null
  created_at: unknown
  updated_at: unknown
  created_by: string
  updated_by: string
  search_prefixes: string[]
}
