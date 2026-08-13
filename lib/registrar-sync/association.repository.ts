import type { PersistenceAccountContext } from '@/lib/persistence/context'
import type { RegistrarDomainStatus } from './types'

export const REGISTRAR_ASSOCIATION_SYNC_STATES = Object.freeze([
  'SEEN',
  'MISSING',
] as const)

export type RegistrarAssociationSyncState =
  (typeof REGISTRAR_ASSOCIATION_SYNC_STATES)[number]

export interface StoredOwnedDomainRegistrarAssociation {
  readonly id: string
  readonly ownedDomainId: string
  readonly providerIdentifier: string
  readonly providerDomainIdentifier: string | null
  readonly registrarStatus: RegistrarDomainStatus
  readonly expiresAt: string | null
  readonly autoRenew: boolean | null
  readonly firstSeenAt: string
  readonly lastSeenAt: string
  readonly lastSyncedAt: string
  readonly syncState: RegistrarAssociationSyncState
  readonly provenanceReference: string
  readonly version: number
}

export interface ObserveOwnedDomainRegistrarAssociationInput {
  readonly ownedDomainId: string
  readonly providerIdentifier: string
  readonly providerDomainIdentifier: string | null
  readonly registrarStatus: RegistrarDomainStatus
  readonly expiresAt: string | null
  readonly autoRenew: boolean | null
  readonly observedAt: string
  readonly provenanceReference: string
}

export interface MarkMissingRegistrarAssociationsInput {
  readonly providerIdentifier: string
  readonly seenOwnedDomainIds: readonly string[]
  readonly syncedAt: string
}

export interface OwnedDomainRegistrarAssociationRepository {
  listForOwnedDomain(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ): Promise<readonly StoredOwnedDomainRegistrarAssociation[]>
  observe(
    context: PersistenceAccountContext,
    input: ObserveOwnedDomainRegistrarAssociationInput
  ): Promise<StoredOwnedDomainRegistrarAssociation>
  /**
   * Complete inventories only. MISSING records provider absence and must never
   * be interpreted as revoked ownership or trigger destructive domain actions.
   */
  markMissingAfterCompleteSync(
    context: PersistenceAccountContext,
    input: MarkMissingRegistrarAssociationsInput
  ): Promise<number>
}
