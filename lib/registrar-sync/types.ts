import type { PersistenceAccountContext } from '@/lib/persistence/context'

export const REGISTRAR_DOMAIN_STATUSES = Object.freeze([
  'ACTIVE',
  'INACTIVE',
  'EXPIRED',
  'TRANSFER_AWAY',
  'UNKNOWN',
] as const)

export type RegistrarDomainStatus =
  (typeof REGISTRAR_DOMAIN_STATUSES)[number]

export interface RegistrarOwnedDomainFact {
  readonly normalizedHostname: string
  readonly providerIdentifier: string
  readonly providerDomainIdentifier: string | null
  readonly expiresAt: string | null
  readonly autoRenew: boolean | null
  readonly status: RegistrarDomainStatus
}

export interface RegistrarOwnedDomainPage {
  readonly domains: readonly RegistrarOwnedDomainFact[]
  readonly nextCursor: string | null
}

export interface RegistrarOwnedDomainListContext {
  readonly cursor?: string | null
  readonly signal?: AbortSignal
}

export interface RegistrarOwnedDomainSyncRequest {
  readonly mode: 'MANUAL'
  readonly signal?: AbortSignal
}

export interface RegistrarOwnedDomainSyncReport {
  readonly provider: string
  readonly fetchedCount: number
  readonly uniqueCount: number
  readonly createdCount: number
  readonly existingCount: number
  readonly skippedInvalidCount: number
  readonly duplicateCount: number
  readonly missingFromProviderCount: number | null
  readonly truncated: boolean
  readonly warningCode: 'REGISTRAR_SYNC_TRUNCATED' | null
  readonly domains: readonly string[]
}

export interface RegistrarOwnedDomainSyncInput {
  readonly context: PersistenceAccountContext
  readonly request: RegistrarOwnedDomainSyncRequest
}
