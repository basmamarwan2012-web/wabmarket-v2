import type { Timestamp } from 'firebase-admin/firestore'
import type { DiscoveryProgress, DiscoveryStatus } from './discovery'

export interface DiscoveryPersistence {
  id: string
  keyword: string
  city: string
  state: string | null
  country: string
  language: string | null
  max_results: number
  status: DiscoveryStatus
  progress: DiscoveryProgress
  results_count: number
  error: string | null
  started_at: Timestamp | null
  completed_at: Timestamp | null
  created_at: Timestamp
  updated_at: Timestamp
  created_by: string
  updated_by: string
}
