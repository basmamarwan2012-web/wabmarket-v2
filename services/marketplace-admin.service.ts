import type {
  AdminMarketplaceDomainDetail,
  AdminMarketplaceDomainSummary,
  GenerateAdminMarketplaceBrandingInput,
  PrepareAdminMarketplaceDomainInput,
  PrepareAdminMarketplaceDomainResult,
  PublishAdminMarketplaceInput,
  SaveAdminMarketplacePreparationInput,
  UnpublishAdminMarketplaceInput,
} from '@/lib/marketplace/admin.types'

interface ApiSuccess<T> {
  readonly success: true
  readonly data: T
}

const SAFE_CLIENT_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  PREPARE_DOMAIN_ASKING_PRICE_INVALID:
    'Asking price is required and must be positive.',
  PREPARE_DOMAIN_CURRENCY_INVALID: 'Currency must be a valid three-letter code.',
  PREPARE_DOMAIN_SALES_URL_INVALID:
    'External sales URL must be a valid HTTPS URL.',
  PREPARE_DOMAIN_DESCRIPTION_INVALID: 'Description is invalid.',
  PREPARE_DOMAIN_LOGO_GENERATION_FAILED: 'Logo generation failed.',
  PREPARE_DOMAIN_FAVICON_GENERATION_FAILED: 'Favicon generation failed.',
  PREPARE_DOMAIN_OPEN_GRAPH_GENERATION_FAILED:
    'Open Graph image generation failed.',
  PREPARE_DOMAIN_ASSET_STORAGE_NOT_CONFIGURED:
    'Asset storage is not configured.',
  PREPARE_DOMAIN_DATABASE_UNAVAILABLE: 'Database request failed. Try again.',
  PREPARE_DOMAIN_VERSION_CONFLICT:
    'Preparation was updated elsewhere. Reload and try again.',
  PREPARE_DOMAIN_SELECTED_ASSET_INVALID: 'Selected asset is invalid.',
  PREPARE_DOMAIN_ASSET_CLEANUP_FAILED: 'Asset cleanup failed safely.',
  PERSISTENCE_VERSION_CONFLICT:
    'Preparation was updated elsewhere. Reload and try again.',
  ASSET_STORAGE_UNAVAILABLE: 'Asset storage is not configured.',
  ASSET_COMPENSATION_FAILED: 'Asset cleanup failed safely.',
})

const validationMessage = (issues: unknown) => {
  if (!issues || typeof issues !== 'object') return null
  const fields = issues as Readonly<Record<string, unknown>>
  if (fields.askingPrice) return 'Asking price is required and must be positive.'
  if (fields.currency) return 'Currency must be a valid three-letter code.'
  if (fields.externalSalesUrl)
    return 'External sales URL must be a valid HTTPS URL.'
  if (fields.manualDescription) return 'Description is invalid.'
  return null
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  const payload = (await response.json()) as
    | ApiSuccess<T>
    | { success: false; error: { code: string; message: string; issues?: unknown } }
  if (!response.ok || !payload.success)
    throw new Error(
      !payload.success
        ? SAFE_CLIENT_MESSAGES[payload.error.code] ??
            (payload.error.code === 'VALIDATION_ERROR'
              ? validationMessage(payload.error.issues)
              : null) ??
            payload.error.message
        : 'The marketplace operation failed.'
    )
  return payload.data
}

const endpoint = (hostname: string) =>
  `/api/admin/marketplace/domains/${encodeURIComponent(hostname)}`

export const marketplaceAdminService = Object.freeze({
  list: () => request<readonly AdminMarketplaceDomainSummary[]>('/api/admin/marketplace'),
  get: (hostname: string) => request<AdminMarketplaceDomainDetail>(endpoint(hostname)),
  save: (hostname: string, input: SaveAdminMarketplacePreparationInput) =>
    request(endpoint(hostname), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  prepare: (
    hostname: string,
    input: PrepareAdminMarketplaceDomainInput
  ) =>
    request<PrepareAdminMarketplaceDomainResult>(`${endpoint(hostname)}/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  publish: (hostname: string, input: PublishAdminMarketplaceInput) =>
    request(`${endpoint(hostname)}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  unpublish: (hostname: string, input: UnpublishAdminMarketplaceInput) =>
    request(`${endpoint(hostname)}/unpublish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  uploadAsset: (hostname: string, kind: string, file: File) => {
    const body = new FormData()
    body.set('kind', kind)
    body.set('file', file)
    return request(`${endpoint(hostname)}/assets`, { method: 'POST', body })
  },
  deleteAsset: (hostname: string, assetId: string) =>
    request(`${endpoint(hostname)}/assets/${encodeURIComponent(assetId)}`, {
      method: 'DELETE',
    }),
  generateAssets: (hostname: string, input: GenerateAdminMarketplaceBrandingInput) =>
    request(`${endpoint(hostname)}/assets/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
    }),
})
