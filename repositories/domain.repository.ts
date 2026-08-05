import 'server-only'

import { createHash } from 'node:crypto'
import {
  FieldPath,
  FieldValue,
  Timestamp,
  type DocumentData,
  type DocumentReference,
  type Query,
} from 'firebase-admin/firestore'

import { adminDb } from '@/firebase/admin'
import { actorProfileRepository } from '@/repositories/actor-profile.repository'
import { toActorDisplay, type ActorSnapshot } from '@/lib/domains/actor'
import {
  decodeDomainCursor,
  encodeDomainCursor,
  getQueryFingerprint,
} from '@/lib/domains/cursor'
import { DomainError } from '@/lib/domains/errors'
import {
  apiFieldToPersistenceField,
  mapDomainCreateToFirestore,
  mapDomainFromFirestore,
  mapDomainPatchToFirestore,
} from '@/lib/domains/mapper'
import { normalizeDomainName } from '@/lib/domains/normalization'
import { validateOperatorPatch } from '@/lib/domains/permissions'
import type { UserRole } from '@/lib/auth/roles'
import type {
  DomainAuditRecord,
  DomainEventType,
  DomainListQuery,
  DomainListResult,
  DomainSort,
} from '@/types/domain-api'
import type { Domain } from '@/types/domain'
import type {
  DomainCreateInput,
  DomainPatchInput,
} from '@/lib/domains/validation'

const sortFields: Record<DomainSort, string> = {
  createdAt: 'created_at',
  expirationDate: 'expiration_date',
  flipScore: 'flipscore',
  purchasePrice: 'purchase_price',
  askingPrice: 'asking_price',
}

function reservationId(normalizedName: string) {
  return createHash('sha256').update(normalizedName).digest('hex')
}

function serializeCursorValue(value: unknown): string | number | null {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string' || typeof value === 'number' || value === null)
    return value
  return null
}

function deserializeCursorValue(
  sort: DomainSort,
  value: string | number | null
) {
  if (
    (sort === 'createdAt' || sort === 'expirationDate') &&
    typeof value === 'string'
  ) {
    return Timestamp.fromDate(new Date(value))
  }
  return value
}

function auditData(
  id: string,
  domainId: string,
  eventType: DomainEventType,
  actorUid: string,
  actor: ActorSnapshot,
  description: string,
  changedFields: string[],
  timestamp: Timestamp
) {
  return {
    id,
    domain_id: domainId,
    event_type: eventType,
    actor_uid: actorUid,
    actor_name: actor.name,
    actor_email: actor.email,
    description,
    changed_fields: changedFields,
    created_at: timestamp,
  }
}

export class DomainRepository {
  private userRef(uid: string) {
    return adminDb.collection('users').doc(uid)
  }

  private domains(uid: string) {
    return this.userRef(uid).collection('owned_domains')
  }

  private reservation(uid: string, normalizedName: string) {
    return this.userRef(uid)
      .collection('domain_name_reservations')
      .doc(reservationId(normalizedName))
  }

  async findDuplicate(uid: string, normalizedName: string, exceptId?: string) {
    const [canonical, legacy] = await Promise.all([
      this.domains(uid)
        .where('normalized_domain_name', '==', normalizedName)
        .limit(2)
        .get(),
      this.domains(uid)
        .where('domainName', '==', normalizedName)
        .limit(2)
        .get(),
    ])
    return [...canonical.docs, ...legacy.docs].some(
      (doc) => doc.id !== exceptId
    )
  }

  async list(uid: string, input: DomainListQuery): Promise<DomainListResult> {
    const queryWithoutCursor = { ...input, cursor: undefined }
    const fingerprint = getQueryFingerprint(queryWithoutCursor)
    const sortField = sortFields[input.sort]
    let query: Query<DocumentData> = this.domains(uid).where(
      'is_deleted',
      '==',
      input.deleted === 'deleted'
    )

    if (input.status) query = query.where('status', '==', input.status)
    if (input.registrar) query = query.where('registrar', '==', input.registrar)
    if (input.search)
      query = query.where('search_prefixes', 'array-contains', input.search)

    query = query
      .orderBy(sortField, input.order)
      .orderBy(FieldPath.documentId(), input.order)

    if (input.cursor) {
      let cursor
      try {
        cursor = decodeDomainCursor(input.cursor, fingerprint)
      } catch {
        throw new DomainError(
          'INVALID_CURSOR',
          'The pagination cursor is invalid or does not match this query.',
          400
        )
      }
      query = query.startAfter(
        deserializeCursorValue(input.sort, cursor.lastValue),
        cursor.lastId
      )
    }

    const snapshot = await query.limit(input.pageSize + 1).get()
    const hasNextPage = snapshot.docs.length > input.pageSize
    const pageDocs = snapshot.docs.slice(0, input.pageSize)
    const last = pageDocs.at(-1)

    return {
      items: pageDocs.map((doc) => mapDomainFromFirestore(doc.id, doc.data())),
      hasNextPage,
      pageSize: input.pageSize,
      nextCursor:
        hasNextPage && last
          ? encodeDomainCursor({
              version: 1,
              fingerprint,
              lastValue: serializeCursorValue(last.get(sortField)),
              lastId: last.id,
            })
          : null,
    }
  }

  async get(uid: string, domainId: string) {
    const snapshot = await this.domains(uid).doc(domainId).get()
    return snapshot.exists
      ? mapDomainFromFirestore(snapshot.id, snapshot.data()!)
      : null
  }

  async getDetail(
    uid: string,
    domainId: string,
    fallbackEmail: string | null,
    auditLimit = 50
  ) {
    const [domain, activities, timeline, ownerProfile] = await Promise.all([
      this.get(uid, domainId),
      this.userRef(uid)
        .collection('activities')
        .where('domain_id', '==', domainId)
        .orderBy('created_at', 'desc')
        .limit(auditLimit)
        .get(),
      this.userRef(uid)
        .collection('timelines')
        .where('domain_id', '==', domainId)
        .orderBy('created_at', 'desc')
        .limit(auditLimit)
        .get(),
      actorProfileRepository.getTenantOwner(uid, fallbackEmail),
    ])
    if (!domain) return null
    const mapAudit = (
      doc: FirebaseFirestore.QueryDocumentSnapshot
    ): DomainAuditRecord => {
      const actorUid = String(doc.get('actor_uid'))
      const actorName = doc.get('actor_name') as string | null | undefined
      const actorEmail = doc.get('actor_email') as string | null | undefined
      return {
        id: doc.id,
        domainId: String(doc.get('domain_id')),
        eventType: doc.get('event_type') as DomainEventType,
        actorUid,
        actorName: actorName ?? null,
        actorEmail: actorEmail ?? null,
        actor: toActorDisplay(
          actorUid,
          { name: actorName, email: actorEmail },
          uid,
          ownerProfile
        ),
        description: String(doc.get('description')),
        changedFields: Array.isArray(doc.get('changed_fields'))
          ? doc.get('changed_fields')
          : [],
        createdAt: serializeCursorValue(doc.get('created_at')) as string,
      }
    }
    return {
      domain,
      createdByActor: toActorDisplay(domain.createdBy, {}, uid, ownerProfile),
      updatedByActor: toActorDisplay(domain.updatedBy, {}, uid, ownerProfile),
      activities: activities.docs.map(mapAudit),
      timeline: timeline.docs.map(mapAudit),
    }
  }

  private writeAudit(
    transaction: FirebaseFirestore.Transaction,
    uid: string,
    domainId: string,
    eventType: DomainEventType,
    actorUid: string,
    actor: ActorSnapshot,
    description: string,
    changedFields: string[],
    timestamp: Timestamp
  ) {
    const user = this.userRef(uid)
    const activityRef = user.collection('activities').doc()
    const timelineRef = user.collection('timelines').doc()
    const logRef = user.collection('logs').doc()
    const base = auditData(
      activityRef.id,
      domainId,
      eventType,
      actorUid,
      actor,
      description,
      changedFields,
      timestamp
    )
    transaction.create(activityRef, base)
    transaction.create(timelineRef, { ...base, id: timelineRef.id })
    transaction.create(logRef, {
      ...base,
      id: logRef.id,
      level: 'info',
      service: 'owned-domains',
      message: description,
    })
  }

  private async readAnalytics(
    transaction: FirebaseFirestore.Transaction,
    ref: DocumentReference<DocumentData>
  ) {
    const snapshot = await transaction.get(ref)
    const data = snapshot.data() ?? {}
    const value = data.total_domains ?? data.totalDomains ?? 0
    return typeof value === 'number' && Number.isFinite(value) ? value : 0
  }

  async create(
    uid: string,
    actorUid: string,
    actorEmail: string | null,
    input: DomainCreateInput
  ) {
    const normalized = normalizeDomainName(input.domainName)
    if (await this.findDuplicate(uid, normalized)) {
      throw new DomainError(
        'DOMAIN_DUPLICATE',
        'This domain already exists.',
        409
      )
    }
    const domainRef = this.domains(uid).doc()
    const reservationRef = this.reservation(uid, normalized)
    const analyticsRef = this.userRef(uid).collection('analytics').doc('global')
    const timestamp = Timestamp.now()
    const persisted = mapDomainCreateToFirestore(
      domainRef.id,
      input,
      actorUid,
      timestamp
    )

    await adminDb.runTransaction(async (transaction) => {
      const [reservation, analyticsTotal, actorProfile] = await Promise.all([
        transaction.get(reservationRef),
        this.readAnalytics(transaction, analyticsRef),
        transaction.get(actorProfileRepository.ref(uid)),
      ])
      if (reservation.exists) {
        throw new DomainError(
          'DOMAIN_DUPLICATE',
          'This domain name is reserved.',
          409
        )
      }
      const actor = actorProfileRepository.fromSnapshot(
        uid,
        actorProfile,
        actorEmail
      )
      transaction.create(domainRef, persisted)
      transaction.create(reservationRef, {
        id: reservationRef.id,
        normalized_domain_name: normalized,
        domain_id: domainRef.id,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      })
      transaction.set(
        analyticsRef,
        {
          total_domains: Math.max(0, analyticsTotal) + 1,
          updated_at: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
      this.writeAudit(
        transaction,
        uid,
        domainRef.id,
        'domain_created',
        actorUid,
        actor,
        `Created ${normalized}.`,
        [],
        timestamp
      )
    })
    return mapDomainFromFirestore(
      domainRef.id,
      persisted as unknown as DocumentData
    )
  }

  async update(
    uid: string,
    actorUid: string,
    actorEmail: string | null,
    role: UserRole,
    domainId: string,
    input: DomainPatchInput
  ) {
    const domainRef = this.domains(uid).doc(domainId)
    const requestedNormalized = input.domainName
      ? normalizeDomainName(input.domainName)
      : null
    if (
      requestedNormalized &&
      (await this.findDuplicate(uid, requestedNormalized, domainId))
    ) {
      throw new DomainError(
        'DOMAIN_DUPLICATE',
        'This domain already exists.',
        409
      )
    }

    return adminDb.runTransaction(async (transaction) => {
      const [snapshot, actorProfile] = await Promise.all([
        transaction.get(domainRef),
        transaction.get(actorProfileRepository.ref(uid)),
      ])
      if (
        !snapshot.exists ||
        Boolean(snapshot.get('is_deleted') ?? snapshot.get('isDeleted'))
      ) {
        throw new DomainError('DOMAIN_NOT_FOUND', 'Domain not found.', 404)
      }
      const transactionalDomain = mapDomainFromFirestore(
        snapshot.id,
        snapshot.data()!
      )
      const nextNormalized =
        requestedNormalized ?? transactionalDomain.normalizedDomainName
      const oldReservation = this.reservation(
        uid,
        transactionalDomain.normalizedDomainName
      )
      const newReservation = this.reservation(uid, nextNormalized)
      const reservation = await transaction.get(newReservation)
      const actor = actorProfileRepository.fromSnapshot(
        uid,
        actorProfile,
        actorEmail
      )
      if (role === 'operator') {
        const operatorError = validateOperatorPatch(
          transactionalDomain.status,
          input
        )
        if (operatorError)
          throw new DomainError('DOMAIN_FORBIDDEN', operatorError, 403)
      }
      if (reservation.exists && reservation.get('domain_id') !== domainId) {
        throw new DomainError(
          'DOMAIN_DUPLICATE',
          'This domain name is reserved.',
          409
        )
      }
      const changedFields = Object.keys(input)
      const timestamp = Timestamp.now()
      const patchData = {
        ...mapDomainPatchToFirestore(input),
        updated_at: timestamp,
        updated_by: actorUid,
      }
      transaction.update(domainRef, {
        ...patchData,
      })
      if (nextNormalized !== transactionalDomain.normalizedDomainName) {
        transaction.delete(oldReservation)
        transaction.set(newReservation, {
          id: newReservation.id,
          normalized_domain_name: nextNormalized,
          domain_id: domainId,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp(),
        })
      }
      const statusChanged =
        input.status && input.status !== transactionalDomain.status
      const eventType: DomainEventType = statusChanged
        ? input.status === 'archived'
          ? 'domain_archived'
          : 'domain_status_changed'
        : 'domain_updated'
      this.writeAudit(
        transaction,
        uid,
        domainId,
        eventType,
        actorUid,
        actor,
        `Updated ${nextNormalized}.`,
        changedFields.map(apiFieldToPersistenceField),
        timestamp
      )
      return mapDomainFromFirestore(domainId, {
        ...snapshot.data()!,
        ...patchData,
      })
    })
  }

  async moveToTrash(
    uid: string,
    actorUid: string,
    actorEmail: string | null,
    domainId: string
  ) {
    const domainRef = this.domains(uid).doc(domainId)
    const analyticsRef = this.userRef(uid).collection('analytics').doc('global')
    return adminDb.runTransaction(async (transaction) => {
      const [domain, analyticsTotal, actorProfile] = await Promise.all([
        transaction.get(domainRef),
        this.readAnalytics(transaction, analyticsRef),
        transaction.get(actorProfileRepository.ref(uid)),
      ])
      if (!domain.exists)
        throw new DomainError('DOMAIN_NOT_FOUND', 'Domain not found.', 404)
      if (Boolean(domain.get('is_deleted') ?? domain.get('isDeleted'))) {
        throw new DomainError(
          'DOMAIN_ALREADY_DELETED',
          'Domain is already in trash.',
          409
        )
      }
      const actor = actorProfileRepository.fromSnapshot(
        uid,
        actorProfile,
        actorEmail
      )
      const timestamp = Timestamp.now()
      transaction.update(domainRef, {
        is_deleted: true,
        deleted_at: timestamp,
        deleted_by: actorUid,
        updated_at: timestamp,
        updated_by: actorUid,
      })
      transaction.set(
        analyticsRef,
        {
          total_domains: Math.max(0, analyticsTotal - 1),
          updated_at: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
      this.writeAudit(
        transaction,
        uid,
        domainId,
        'domain_deleted',
        actorUid,
        actor,
        'Moved domain to trash.',
        ['is_deleted'],
        timestamp
      )
      return { id: domainId, isDeleted: true }
    })
  }

  async restore(
    uid: string,
    actorUid: string,
    actorEmail: string | null,
    domainId: string
  ) {
    const domainRef = this.domains(uid).doc(domainId)
    const analyticsRef = this.userRef(uid).collection('analytics').doc('global')
    return adminDb.runTransaction(async (transaction) => {
      const [domain, actorProfile] = await Promise.all([
        transaction.get(domainRef),
        transaction.get(actorProfileRepository.ref(uid)),
      ])
      if (!domain.exists)
        throw new DomainError('DOMAIN_NOT_FOUND', 'Domain not found.', 404)
      const mapped = mapDomainFromFirestore(domain.id, domain.data()!)
      if (!mapped.isDeleted)
        throw new DomainError(
          'DOMAIN_NOT_DELETED',
          'Domain is not in trash.',
          409
        )
      const reservationRef = this.reservation(uid, mapped.normalizedDomainName)
      const [reservation, analyticsTotal] = await Promise.all([
        transaction.get(reservationRef),
        this.readAnalytics(transaction, analyticsRef),
      ])
      const actor = actorProfileRepository.fromSnapshot(
        uid,
        actorProfile,
        actorEmail
      )
      const timestamp = Timestamp.now()
      if (reservation.exists && reservation.get('domain_id') !== domainId) {
        throw new DomainError(
          'DOMAIN_DUPLICATE',
          'The domain name is reserved by another record.',
          409
        )
      }
      transaction.update(domainRef, {
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
        updated_at: timestamp,
        updated_by: actorUid,
      })
      if (!reservation.exists) {
        transaction.create(reservationRef, {
          id: reservationRef.id,
          normalized_domain_name: mapped.normalizedDomainName,
          domain_id: domainId,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp(),
        })
      }
      transaction.set(
        analyticsRef,
        {
          total_domains: Math.max(0, analyticsTotal) + 1,
          updated_at: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
      this.writeAudit(
        transaction,
        uid,
        domainId,
        'domain_restored',
        actorUid,
        actor,
        'Restored domain from trash.',
        ['is_deleted'],
        timestamp
      )
      return { id: domainId, isDeleted: false }
    })
  }
}

export const domainRepository = new DomainRepository()
