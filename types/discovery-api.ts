import type { Discovery, DiscoveryStatus } from './discovery'

export interface DiscoveryListQuery {
  order: 'desc'
  pageSize: number
  cursor?: string
}

export interface DiscoveryListResult {
  items: Discovery[]
  nextCursor: string | null
  hasNextPage: boolean
  pageSize: number
}

export interface DiscoveryTransitionInput {
  status: Extract<DiscoveryStatus, 'processing' | 'completed' | 'failed'>
}

export interface DiscoveryApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface DiscoveryApiError {
  success: false
  error: {
    code: string
    message: string
    issues?: Record<string, string[]>
  }
}
