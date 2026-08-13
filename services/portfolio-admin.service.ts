import type {
  AdminPortfolioDomainSummary,
  AdminPortfolioRegistrarSyncReport,
  CreateAdminPortfolioDomainInput,
  CreateAdminPortfolioDomainResult,
  DeleteAdminPortfolioDomainResult,
} from '@/lib/portfolio/admin.types'

interface ApiSuccess<T> {
  readonly success: true
  readonly data: T
}

const SAFE_CLIENT_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  DOMAIN_HOSTNAME_INVALID: 'Enter a valid domain hostname.',
  DOMAIN_OWNERSHIP_CONFIRMATION_REQUIRED:
    'Confirm that you own this domain before adding it.',
  DOMAIN_ALREADY_EXISTS: 'This owned domain already exists.',
  DOMAIN_HAS_PREPARATION:
    'Delete is blocked because this domain has a saved preparation.',
  DOMAIN_HAS_ASSETS: 'Delete is blocked because this domain has stored assets.',
  DOMAIN_IS_PUBLISHED: 'Delete is blocked because this domain is published.',
  DOMAIN_DELETE_NOT_ALLOWED:
    'Delete is blocked because this domain has retained records.',
  DOMAIN_MANAGEMENT_UNAVAILABLE:
    'Owned-domain storage is unavailable. Try again.',
})

const validationMessage = (issues: unknown) => {
  if (!issues || typeof issues !== 'object') return null
  const fields = issues as Readonly<Record<string, unknown>>
  if (fields.hostname) return 'Enter a valid domain hostname.'
  if (fields.ownershipConfirmed)
    return 'Confirm that you own this domain before adding it.'
  return null
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  const payload = (await response.json()) as
    | ApiSuccess<T>
    | {
        success: false
        error: { code: string; message: string; issues?: unknown }
      }
  if (!response.ok || !payload.success)
    throw new Error(
      !payload.success
        ? SAFE_CLIENT_MESSAGES[payload.error.code] ??
            (payload.error.code === 'VALIDATION_ERROR'
              ? validationMessage(payload.error.issues)
              : null) ??
            payload.error.message
        : 'The portfolio operation failed.'
    )
  return payload.data
}

const portfolioEndpoint = '/api/admin/portfolio'

export const portfolioAdminService = Object.freeze({
  list: () =>
    request<readonly AdminPortfolioDomainSummary[]>(portfolioEndpoint),
  createOwnedDomain: (input: CreateAdminPortfolioDomainInput) =>
    request<CreateAdminPortfolioDomainResult>(portfolioEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  deleteOwnedDomain: (hostname: string) =>
    request<DeleteAdminPortfolioDomainResult>(
      `${portfolioEndpoint}/domains/${encodeURIComponent(hostname)}`,
      { method: 'DELETE' }
    ),
  syncDynadotOwnedDomains: () =>
    request<AdminPortfolioRegistrarSyncReport>(
      `${portfolioEndpoint}/registrars/dynadot/sync`,
      { method: 'POST' }
    ),
})
