export const DISCOVERY_STATUSES = [
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled',
] as const

export type DiscoveryStatus = (typeof DISCOVERY_STATUSES)[number]
export type DiscoveryProgress = 0 | 25 | 50 | 75 | 100

export interface Discovery {
  id: string
  keyword: string
  city: string
  state: string | null
  country: string
  language: string | null
  maxResults: number
  status: DiscoveryStatus
  progress: DiscoveryProgress
  resultsCount: number
  error: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}
