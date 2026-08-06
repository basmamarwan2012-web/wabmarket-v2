import { Timestamp } from 'firebase-admin/firestore'

import type { Discovery } from '@/types/discovery'
import type { DiscoveryPersistence } from '@/types/discovery-persistence'
import type { DiscoveryCreateInput } from './validation'

type RecordData = Record<string, unknown>

function nullableText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function iso(value: unknown, fallback: string | null = null) {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  )
    return (value.toDate() as Date).toISOString()
  return fallback
}

export function mapDiscoveryFromFirestore(
  id: string,
  source: object
): Discovery {
  const data = source as RecordData
  const createdAt = iso(data.created_at, new Date(0).toISOString())!
  return {
    id,
    keyword: String(data.keyword ?? ''),
    city: String(data.city ?? ''),
    state: nullableText(data.state),
    country: String(data.country ?? ''),
    language: nullableText(data.language),
    maxResults: Number(data.max_results ?? 0),
    status: (data.status as Discovery['status']) ?? 'queued',
    progress: Number(data.progress ?? 0) as Discovery['progress'],
    resultsCount: Number(data.results_count ?? 0),
    error: nullableText(data.error),
    startedAt: iso(data.started_at),
    completedAt: iso(data.completed_at),
    createdAt,
    updatedAt: iso(data.updated_at, createdAt)!,
    createdBy: String(data.created_by ?? ''),
    updatedBy: String(data.updated_by ?? ''),
  }
}

export function mapDiscoveryCreateToFirestore(
  id: string,
  input: DiscoveryCreateInput,
  actorUid: string,
  timestamp: Timestamp
): DiscoveryPersistence {
  return {
    id,
    keyword: input.keyword,
    city: input.city,
    state: input.state,
    country: input.country,
    language: input.language,
    max_results: input.maxResults,
    status: 'queued',
    progress: 0,
    results_count: 0,
    error: null,
    started_at: null,
    completed_at: null,
    created_at: timestamp,
    updated_at: timestamp,
    created_by: actorUid,
    updated_by: actorUid,
  }
}
