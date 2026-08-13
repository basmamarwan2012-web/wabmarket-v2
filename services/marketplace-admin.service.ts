import type {
  AdminMarketplaceDomainDetail,
  AdminMarketplaceDomainSummary,
  GenerateAdminMarketplaceBrandingInput,
  PublishAdminMarketplaceInput,
  SaveAdminMarketplacePreparationInput,
  UnpublishAdminMarketplaceInput,
} from '@/lib/marketplace/admin.types'

interface ApiSuccess<T> {
  readonly success: true
  readonly data: T
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  const payload = (await response.json()) as
    | ApiSuccess<T>
    | { success: false; error: { code: string; message: string } }
  if (!response.ok || !payload.success)
    throw new Error(
      !payload.success && payload.error.code === 'PERSISTENCE_VERSION_CONFLICT'
        ? 'This record changed. Reload the page and try again.'
        : !payload.success
          ? payload.error.message
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
