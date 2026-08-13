import type { OwnedDomainDeleteBlockReason } from './owned-domain.repository'

export const OWNED_DOMAIN_MANAGEMENT_ERROR_CODES = Object.freeze([
  'DOMAIN_HOSTNAME_INVALID',
  'DOMAIN_OWNERSHIP_CONFIRMATION_REQUIRED',
  'DOMAIN_ALREADY_EXISTS',
  'DOMAIN_HAS_PREPARATION',
  'DOMAIN_HAS_ASSETS',
  'DOMAIN_IS_PUBLISHED',
  'DOMAIN_DELETE_NOT_ALLOWED',
  'DOMAIN_MANAGEMENT_UNAVAILABLE',
] as const)

export type OwnedDomainManagementErrorCode =
  (typeof OWNED_DOMAIN_MANAGEMENT_ERROR_CODES)[number]

const MESSAGES: Readonly<Record<OwnedDomainManagementErrorCode, string>> =
  Object.freeze({
    DOMAIN_HOSTNAME_INVALID: 'Enter a valid domain hostname.',
    DOMAIN_OWNERSHIP_CONFIRMATION_REQUIRED:
      'Confirm that you own this domain before adding it.',
    DOMAIN_ALREADY_EXISTS: 'This owned domain already exists.',
    DOMAIN_HAS_PREPARATION:
      'Delete is blocked because this domain has a saved preparation.',
    DOMAIN_HAS_ASSETS:
      'Delete is blocked because this domain has stored assets.',
    DOMAIN_IS_PUBLISHED:
      'Delete is blocked because this domain is published.',
    DOMAIN_DELETE_NOT_ALLOWED:
      'Delete is blocked because this domain has retained records.',
    DOMAIN_MANAGEMENT_UNAVAILABLE:
      'Owned-domain storage is unavailable. Try again.',
  })

export class OwnedDomainManagementError extends Error {
  constructor(readonly code: OwnedDomainManagementErrorCode) {
    super(MESSAGES[code])
    this.name = 'OwnedDomainManagementError'
  }
}

export const deletionBlockError = (reason: OwnedDomainDeleteBlockReason) =>
  new OwnedDomainManagementError(reason)

