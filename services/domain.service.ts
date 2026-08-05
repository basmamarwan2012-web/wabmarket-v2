import type {
  ApiErrorBody,
  ApiSuccess,
  DomainDetailResult,
  DomainListQuery,
  DomainListResult,
  DomainMutationResult,
} from '@/types/domain-api'
import type { Domain } from '@/types/domain'
import type {
  DomainCreateInput,
  DomainPatchInput,
} from '@/lib/domains/validation'

async function domainRequest<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  const body = (await response.json()) as ApiSuccess<T> | ApiErrorBody
  if (!response.ok || !body.success) {
    throw new Error(
      body.success ? 'Domain request failed.' : body.error.message
    )
  }
  return body.data
}

function listSearchParams(query: Partial<DomainListQuery>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return params.toString()
}

export const domainService = {
  list(query: Partial<DomainListQuery>, signal?: AbortSignal) {
    return domainRequest<DomainListResult>(
      `/api/domains?${listSearchParams(query)}`,
      { signal, cache: 'no-store' }
    )
  },
  get(domainId: string, includeDeleted = false) {
    const suffix = includeDeleted ? '?deleted=deleted' : ''
    return domainRequest<DomainDetailResult>(
      `/api/domains/${encodeURIComponent(domainId)}${suffix}`
    )
  },
  create(input: DomainCreateInput) {
    return domainRequest<Domain>('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  },
  update(domainId: string, input: DomainPatchInput) {
    return domainRequest<Domain>(
      `/api/domains/${encodeURIComponent(domainId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }
    )
  },
  moveToTrash(domainId: string) {
    return domainRequest<DomainMutationResult>(
      `/api/domains/${encodeURIComponent(domainId)}`,
      {
        method: 'DELETE',
      }
    )
  },
  restore(domainId: string) {
    return domainRequest<DomainMutationResult>(
      `/api/domains/${encodeURIComponent(domainId)}/restore`,
      { method: 'POST' }
    )
  },
}
