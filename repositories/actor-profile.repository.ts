import 'server-only'

import type { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore'

import { adminDb } from '@/firebase/admin'
import type { ActorSnapshot } from '@/lib/domains/actor'

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export class ActorProfileRepository {
  ref(tenantUid: string) {
    return adminDb.collection('users').doc(tenantUid)
  }

  fromSnapshot(
    tenantUid: string,
    snapshot: DocumentSnapshot<DocumentData>,
    fallbackEmail: string | null = null
  ): ActorSnapshot {
    const data = snapshot.data() ?? {}
    const firstName = text(data.firstName ?? data.first_name)
    const lastName = text(data.lastName ?? data.last_name)
    const composedName = [firstName, lastName].filter(Boolean).join(' ') || null
    return {
      uid: tenantUid,
      name: text(data.name) ?? composedName,
      email: text(data.email) ?? fallbackEmail,
    }
  }

  async getTenantOwner(tenantUid: string, fallbackEmail: string | null = null) {
    const snapshot = await this.ref(tenantUid).get()
    return this.fromSnapshot(tenantUid, snapshot, fallbackEmail)
  }
}

export const actorProfileRepository = new ActorProfileRepository()
