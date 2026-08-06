import 'server-only'

import { FieldPath, Timestamp } from 'firebase-admin/firestore'

import { adminDb } from '@/firebase/admin'
import { actorProfileRepository } from './actor-profile.repository'
import {
  decodeDiscoveryCursor,
  encodeDiscoveryCursor,
  getDiscoveryQueryFingerprint,
} from '@/lib/discoveries/cursor'
import { DiscoveryError } from '@/lib/discoveries/errors'
import {
  transitionDiscovery,
  type DiscoveryEventType,
} from '@/lib/discoveries/lifecycle'
import {
  mapDiscoveryCreateToFirestore,
  mapDiscoveryFromFirestore,
} from '@/lib/discoveries/mapper'
import type { DiscoveryCreateInput } from '@/lib/discoveries/validation'
import type { DiscoveryStatus } from '@/types/discovery'
import type { DiscoveryListQuery } from '@/types/discovery-api'

export class DiscoveryRepository {
  private user(uid: string) {
    return adminDb.collection('users').doc(uid)
  }

  private discoveries(uid: string) {
    return this.user(uid).collection('discoveries')
  }

  private writeAudit(
    transaction: FirebaseFirestore.Transaction,
    uid: string,
    discoveryId: string,
    eventType: DiscoveryEventType,
    actorUid: string,
    actor: { name: string | null; email: string | null },
    description: string,
    changedFields: string[],
    timestamp: Timestamp
  ) {
    const user = this.user(uid)
    const activity = user.collection('activities').doc()
    const timeline = user.collection('timelines').doc()
    const log = user.collection('logs').doc()
    const base = {
      discovery_id: discoveryId,
      event_type: eventType,
      actor_uid: actorUid,
      actor_name: actor.name,
      actor_email: actor.email,
      description,
      changed_fields: changedFields,
      created_at: timestamp,
    }
    transaction.create(activity, { ...base, id: activity.id })
    transaction.create(timeline, { ...base, id: timeline.id })
    transaction.create(log, {
      ...base,
      id: log.id,
      level: 'info',
      service: 'discovery',
      message: description,
    })
  }

  async list(uid: string, input: DiscoveryListQuery) {
    const queryWithoutCursor = { ...input, cursor: undefined }
    const fingerprint = getDiscoveryQueryFingerprint(uid, queryWithoutCursor)
    let query = this.discoveries(uid)
      .orderBy('created_at', 'desc' as const)
      .orderBy(FieldPath.documentId(), 'desc')

    if (input.cursor) {
      let cursor
      try {
        cursor = decodeDiscoveryCursor(input.cursor, fingerprint)
      } catch {
        throw new DiscoveryError(
          'INVALID_CURSOR',
          'The pagination cursor is invalid or does not match this query.',
          400
        )
      }
      query = query.startAfter(
        Timestamp.fromDate(new Date(cursor.createdAt)),
        cursor.lastId
      )
    }

    const snapshot = await query.limit(input.pageSize + 1).get()
    const hasNextPage = snapshot.docs.length > input.pageSize
    const page = snapshot.docs.slice(0, input.pageSize)
    const last = page.at(-1)
    return {
      items: page.map((doc) => mapDiscoveryFromFirestore(doc.id, doc.data())),
      hasNextPage,
      pageSize: input.pageSize,
      nextCursor:
        hasNextPage && last
          ? encodeDiscoveryCursor({
              version: 1,
              fingerprint,
              createdAt: (last.get('created_at') as Timestamp)
                .toDate()
                .toISOString(),
              lastId: last.id,
            })
          : null,
    }
  }

  async get(uid: string, discoveryId: string) {
    const snapshot = await this.discoveries(uid).doc(discoveryId).get()
    return snapshot.exists
      ? mapDiscoveryFromFirestore(snapshot.id, snapshot.data()!)
      : null
  }

  async create(
    uid: string,
    actorUid: string,
    actorEmail: string | null,
    input: DiscoveryCreateInput
  ) {
    const discoveryRef = this.discoveries(uid).doc()
    const timestamp = Timestamp.now()
    const persisted = mapDiscoveryCreateToFirestore(
      discoveryRef.id,
      input,
      actorUid,
      timestamp
    )
    await adminDb.runTransaction(async (transaction) => {
      const actorSnapshot = await transaction.get(
        actorProfileRepository.ref(uid)
      )
      const actor = actorProfileRepository.fromSnapshot(
        uid,
        actorSnapshot,
        actorEmail
      )
      transaction.create(discoveryRef, persisted)
      this.writeAudit(
        transaction,
        uid,
        discoveryRef.id,
        'discovery_created',
        actorUid,
        actor,
        `Created discovery job for ${input.keyword}.`,
        ['status', 'progress'],
        timestamp
      )
    })
    return mapDiscoveryFromFirestore(discoveryRef.id, persisted)
  }

  async transition(
    uid: string,
    actorUid: string,
    actorEmail: string | null,
    discoveryId: string,
    requested: Exclude<DiscoveryStatus, 'queued'>
  ) {
    const discoveryRef = this.discoveries(uid).doc(discoveryId)
    return adminDb.runTransaction(async (transaction) => {
      const [snapshot, actorSnapshot] = await Promise.all([
        transaction.get(discoveryRef),
        transaction.get(actorProfileRepository.ref(uid)),
      ])
      if (!snapshot.exists)
        throw new DiscoveryError(
          'DISCOVERY_NOT_FOUND',
          'Discovery job not found.',
          404
        )

      const current = mapDiscoveryFromFirestore(snapshot.id, snapshot.data()!)
      const timestamp = Timestamp.now()
      const transition = transitionDiscovery(
        {
          status: current.status,
          progress: current.progress,
          startedAt: current.startedAt
            ? Timestamp.fromDate(new Date(current.startedAt))
            : null,
          completedAt: current.completedAt
            ? Timestamp.fromDate(new Date(current.completedAt))
            : null,
          error: current.error,
        },
        requested,
        timestamp
      )
      const patch = {
        status: transition.status,
        progress: transition.progress,
        error: transition.error,
        started_at: transition.startedAt,
        completed_at: transition.completedAt,
        updated_at: timestamp,
        updated_by: actorUid,
      }
      const actor = actorProfileRepository.fromSnapshot(
        uid,
        actorSnapshot,
        actorEmail
      )
      transaction.update(discoveryRef, patch)
      this.writeAudit(
        transaction,
        uid,
        discoveryId,
        transition.eventType,
        actorUid,
        actor,
        transition.description,
        transition.changedFields,
        timestamp
      )
      return mapDiscoveryFromFirestore(discoveryId, {
        ...snapshot.data()!,
        ...patch,
      })
    })
  }
}

export const discoveryRepository = new DiscoveryRepository()
