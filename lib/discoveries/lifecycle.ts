import type { Timestamp } from 'firebase-admin/firestore'

import { DiscoveryError } from './errors'
import type { DiscoveryProgress, DiscoveryStatus } from '@/types/discovery'

export type DiscoveryEventType =
  | 'discovery_created'
  | 'discovery_processing'
  | 'discovery_progressed'
  | 'discovery_completed'
  | 'discovery_failed'
  | 'discovery_cancelled'

export interface DiscoveryLifecycleState {
  status: DiscoveryStatus
  progress: DiscoveryProgress
  startedAt: Timestamp | null
  completedAt: Timestamp | null
  error: string | null
}

export interface DiscoveryTransitionResult extends DiscoveryLifecycleState {
  eventType: Exclude<DiscoveryEventType, 'discovery_created'>
  changedFields: string[]
  description: string
}

function conflict(): never {
  throw new DiscoveryError(
    'DISCOVERY_INVALID_TRANSITION',
    'This discovery status transition is not allowed.',
    409
  )
}

export function transitionDiscovery(
  current: DiscoveryLifecycleState,
  requested: Exclude<DiscoveryStatus, 'queued'>,
  timestamp: Timestamp
): DiscoveryTransitionResult {
  if (['completed', 'failed', 'cancelled'].includes(current.status)) conflict()

  if (requested === 'cancelled') {
    return {
      ...current,
      status: 'cancelled',
      completedAt: timestamp,
      eventType: 'discovery_cancelled',
      changedFields: ['status', 'completed_at', 'updated_at', 'updated_by'],
      description: 'Discovery was cancelled.',
    }
  }

  if (requested === 'failed') {
    return {
      ...current,
      status: 'failed',
      error: 'Discovery was marked as failed manually.',
      completedAt: timestamp,
      eventType: 'discovery_failed',
      changedFields: [
        'status',
        'error',
        'completed_at',
        'updated_at',
        'updated_by',
      ],
      description: 'Discovery was marked as failed manually.',
    }
  }

  if (requested === 'completed') {
    if (current.status !== 'processing') conflict()
    return {
      ...current,
      status: 'completed',
      progress: 100,
      error: null,
      completedAt: timestamp,
      eventType: 'discovery_completed',
      changedFields: [
        'status',
        'progress',
        'completed_at',
        'updated_at',
        'updated_by',
      ],
      description: 'Discovery was completed.',
    }
  }

  if (current.status === 'queued') {
    return {
      ...current,
      status: 'processing',
      progress: 25,
      error: null,
      startedAt: timestamp,
      completedAt: null,
      eventType: 'discovery_processing',
      changedFields: [
        'status',
        'progress',
        'started_at',
        'updated_at',
        'updated_by',
      ],
      description: 'Discovery processing started.',
    }
  }

  const nextProgress =
    current.progress === 25 ? 50 : current.progress === 50 ? 75 : null
  if (current.status !== 'processing' || nextProgress === null) conflict()
  return {
    ...current,
    progress: nextProgress,
    eventType: 'discovery_progressed',
    changedFields: ['progress', 'updated_at', 'updated_by'],
    description: `Discovery progressed to ${nextProgress}%.`,
  }
}
