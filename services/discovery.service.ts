import type {
  DiscoveryApiError,
  DiscoveryApiSuccess,
  DiscoveryListQuery,
  DiscoveryListResult,
  DiscoveryTransitionInput,
} from '@/types/discovery-api'
import type { Discovery } from '@/types/discovery'
import type { DiscoveryCreateInput } from '@/lib/discoveries/validation'

async function discoveryRequest<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: 'no-store' })
  const body = (await response.json()) as
    DiscoveryApiSuccess<T> | DiscoveryApiError
  if (!response.ok || !body.success) {
    throw new Error(
      body.success ? 'Discovery request failed.' : body.error.message
    )
  }
  return body.data
}

function listQuery(input: Partial<DiscoveryListQuery>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) params.set(key, String(value))
  }
  return params.toString()
}

export const discoveryService = {
  list(input: Partial<DiscoveryListQuery>, signal?: AbortSignal) {
    return discoveryRequest<DiscoveryListResult>(
      `/api/discoveries?${listQuery(input)}`,
      { signal }
    )
  },
  get(discoveryId: string) {
    return discoveryRequest<Discovery>(
      `/api/discoveries/${encodeURIComponent(discoveryId)}`
    )
  },
  create(input: DiscoveryCreateInput) {
    return discoveryRequest<Discovery>('/api/discoveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  },
  transition(discoveryId: string, input: DiscoveryTransitionInput) {
    return discoveryRequest<Discovery>(
      `/api/discoveries/${encodeURIComponent(discoveryId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }
    )
  },
  cancel(discoveryId: string) {
    return discoveryRequest<Discovery>(
      `/api/discoveries/${encodeURIComponent(discoveryId)}`,
      { method: 'DELETE' }
    )
  },
}
