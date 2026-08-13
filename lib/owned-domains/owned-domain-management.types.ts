import type { OwnedDomainDeleteBlockReason } from './owned-domain.repository'

export interface CreateOwnedDomainCommand {
  readonly hostname: string
  readonly ownershipConfirmed: true
}

export interface CreateOwnedDomainResult {
  readonly hostname: string
  readonly created: true
  readonly ownershipConfirmed: true
}

export interface DeleteOwnedDomainCommand {
  readonly hostname: string
}

export interface DeleteOwnedDomainResult {
  readonly hostname: string
  readonly deleted: true
}

export type OwnedDomainDeletionEligibility =
  | Readonly<{ allowed: true; reason: null }>
  | Readonly<{ allowed: false; reason: OwnedDomainDeleteBlockReason }>

