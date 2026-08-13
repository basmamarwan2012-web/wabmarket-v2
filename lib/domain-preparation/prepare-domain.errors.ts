export const PREPARE_DOMAIN_ERROR_CODES = Object.freeze([
  'PREPARE_DOMAIN_HOSTNAME_INVALID',
  'PREPARE_DOMAIN_OWNERSHIP_REQUIRED',
  'PREPARE_DOMAIN_ASKING_PRICE_INVALID',
  'PREPARE_DOMAIN_CURRENCY_INVALID',
  'PREPARE_DOMAIN_SALES_URL_INVALID',
  'PREPARE_DOMAIN_DESCRIPTION_INVALID',
  'PREPARE_DOMAIN_SELECTED_ASSET_INVALID',
  'PREPARE_DOMAIN_LOGO_GENERATION_FAILED',
  'PREPARE_DOMAIN_FAVICON_GENERATION_FAILED',
  'PREPARE_DOMAIN_OPEN_GRAPH_GENERATION_FAILED',
  'PREPARE_DOMAIN_ASSET_STORAGE_NOT_CONFIGURED',
  'PREPARE_DOMAIN_DATABASE_UNAVAILABLE',
  'PREPARE_DOMAIN_VERSION_CONFLICT',
  'PREPARE_DOMAIN_ASSET_CLEANUP_FAILED',
  'PREPARE_DOMAIN_FAILED',
] as const)

export type PrepareDomainErrorCode =
  (typeof PREPARE_DOMAIN_ERROR_CODES)[number]

const MESSAGES: Readonly<Record<PrepareDomainErrorCode, string>> = Object.freeze({
  PREPARE_DOMAIN_HOSTNAME_INVALID: 'The domain hostname is invalid.',
  PREPARE_DOMAIN_OWNERSHIP_REQUIRED:
    'Domain ownership must be confirmed before preparation.',
  PREPARE_DOMAIN_ASKING_PRICE_INVALID: 'Asking price is required and must be positive.',
  PREPARE_DOMAIN_CURRENCY_INVALID: 'Currency must be a valid three-letter code.',
  PREPARE_DOMAIN_SALES_URL_INVALID:
    'External sales URL must be a valid HTTPS URL.',
  PREPARE_DOMAIN_DESCRIPTION_INVALID: 'Description is invalid.',
  PREPARE_DOMAIN_SELECTED_ASSET_INVALID: 'Selected asset is invalid.',
  PREPARE_DOMAIN_LOGO_GENERATION_FAILED: 'Logo generation failed.',
  PREPARE_DOMAIN_FAVICON_GENERATION_FAILED: 'Favicon generation failed.',
  PREPARE_DOMAIN_OPEN_GRAPH_GENERATION_FAILED:
    'Open Graph image generation failed.',
  PREPARE_DOMAIN_ASSET_STORAGE_NOT_CONFIGURED:
    'Asset storage is not configured.',
  PREPARE_DOMAIN_DATABASE_UNAVAILABLE: 'Database request failed. Try again.',
  PREPARE_DOMAIN_VERSION_CONFLICT:
    'Preparation was updated elsewhere. Reload and try again.',
  PREPARE_DOMAIN_ASSET_CLEANUP_FAILED: 'Asset cleanup failed safely.',
  PREPARE_DOMAIN_FAILED: 'Domain preparation failed.',
})

export class PrepareDomainError extends Error {
  constructor(readonly code: PrepareDomainErrorCode) {
    super(MESSAGES[code])
    this.name = 'PrepareDomainError'
  }
}

