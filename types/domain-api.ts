import type { Domain, DomainStatus } from './domain'

export type DomainSort =
  'createdAt' | 'expirationDate' | 'flipScore' | 'purchasePrice' | 'askingPrice'

export type SortOrder = 'asc' | 'desc'
export type DeletionMode = 'active' | 'deleted'

export interface DomainListQuery {
  search?: string
  status?: DomainStatus
  registrar?: string
  deleted: DeletionMode
  sort: DomainSort
  order: SortOrder
  pageSize: number
  cursor?: string
}

export interface DomainListResult {
  items: Domain[]
  nextCursor: string | null
  hasNextPage: boolean
  pageSize: number
}

export interface DomainMutationResult {
  id: string
  isDeleted: boolean
}

export interface DomainDetailResult {
  domain: Domain
  createdByActor: ActorDisplay
  updatedByActor: ActorDisplay
  activities: DomainAuditRecord[]
  timeline: DomainAuditRecord[]
}

export interface ActorDisplay {
  uid: string
  name: string | null
  email: string | null
  label: string
}

export interface DomainAuditRecord {
  id: string
  domainId: string
  eventType: DomainEventType
  actorUid: string
  actorName: string | null
  actorEmail: string | null
  actor: ActorDisplay
  description: string
  changedFields: string[]
  createdAt: string
}

export type DomainEventType =
  | 'domain_created'
  | 'domain_updated'
  | 'domain_archived'
  | 'domain_deleted'
  | 'domain_restored'
  | 'domain_status_changed'

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorBody {
  success: false
  error: {
    code: string
    message: string
    issues?: Record<string, string[]>
  }
}
