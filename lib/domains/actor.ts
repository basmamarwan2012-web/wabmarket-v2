import type { ActorDisplay } from '@/types/domain-api'

export interface ActorSnapshot {
  uid: string
  name: string | null
  email: string | null
}

export function shortenUid(uid: string) {
  if (uid.length <= 12) return uid
  return `${uid.slice(0, 6)}…${uid.slice(-4)}`
}

export function toActorDisplay(
  actorUid: string,
  snapshot: { name?: string | null; email?: string | null },
  tenantUid: string,
  tenantOwner: ActorSnapshot
): ActorDisplay {
  const owner = actorUid === tenantUid ? tenantOwner : null
  const name = snapshot.name ?? owner?.name ?? null
  const email = snapshot.email ?? owner?.email ?? null
  return {
    uid: actorUid,
    name,
    email,
    label: name ?? email ?? shortenUid(actorUid),
  }
}
