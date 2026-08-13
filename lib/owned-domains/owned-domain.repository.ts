import type { PersistenceAccountContext } from '@/lib/persistence/context'
import type { DomainStatus } from '@/types/domain'

export type OwnershipConfirmation =
  | Readonly<{
      confirmed: false
      confirmedAt: null
      confirmedByFirebaseUid: null
      evidenceReference: null
    }>
  | Readonly<{
      confirmed: true
      confirmedAt: string
      confirmedByFirebaseUid: string
      evidenceReference: string | null
    }>

export type OwnershipConfirmationInput =
  | Readonly<{
      confirmed: false
      confirmedAt: null
      evidenceReference: null
    }>
  | Readonly<{
      confirmed: true
      confirmedAt: string
      evidenceReference: string | null
    }>

export interface StoredOwnedDomain {
  readonly id: string
  readonly normalizedHostname: string
  readonly status: DomainStatus
  readonly ownership: OwnershipConfirmation
  readonly createdAt: string
  readonly updatedAt: string
}

export interface CreateOwnedDomainRecord {
  readonly id?: string
  readonly normalizedHostname: string
  readonly status: DomainStatus
  readonly ownership: OwnershipConfirmationInput
}

export const OWNED_DOMAIN_DELETE_BLOCK_REASONS = Object.freeze([
  'DOMAIN_HAS_PREPARATION',
  'DOMAIN_HAS_ASSETS',
  'DOMAIN_IS_PUBLISHED',
  'DOMAIN_DELETE_NOT_ALLOWED',
] as const)

export type OwnedDomainDeleteBlockReason =
  (typeof OWNED_DOMAIN_DELETE_BLOCK_REASONS)[number]

export type GuardedOwnedDomainDeleteResult =
  | Readonly<{ deleted: true; reason: null }>
  | Readonly<{ deleted: false; reason: OwnedDomainDeleteBlockReason }>

export interface OwnedDomainRepository {
  list(context: PersistenceAccountContext): Promise<readonly StoredOwnedDomain[]>
  create(
    context: PersistenceAccountContext,
    input: CreateOwnedDomainRecord
  ): Promise<StoredOwnedDomain>
  findById(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ): Promise<StoredOwnedDomain | null>
  findByHostname(
    context: PersistenceAccountContext,
    normalizedHostname: string
  ): Promise<StoredOwnedDomain | null>
  setOwnershipConfirmation(
    context: PersistenceAccountContext,
    ownedDomainId: string,
    ownership: OwnershipConfirmationInput
  ): Promise<StoredOwnedDomain>
  /**
   * Authoritative destructive guard. Implementations must check current
   * references and delete atomically so cascades can never remove retained
   * business data.
   */
  deleteIfUnreferenced(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ): Promise<GuardedOwnedDomainDeleteResult>
}
