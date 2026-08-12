import 'server-only'

import type { AuthenticatedSession } from '@/lib/auth/session'

const trustedIdentity = Symbol('trusted-persistence-identity')
const trustedAccount = Symbol('trusted-persistence-account')

export type PersistenceIdentityContext = Readonly<{
  firebaseUid: string
  email: string | null
  [trustedIdentity]: true
}>

export type PersistenceAccountContext = Readonly<{
  accountId: string
  firebaseUid: string
  [trustedAccount]: true
}>

/** Create only after verifySession() has returned an authenticated session. */
export const createPersistenceIdentityContext = (
  session: AuthenticatedSession
): PersistenceIdentityContext => {
  if (!session.uid) throw new Error('A verified identity is required.')

  return Object.freeze({
    firebaseUid: session.uid,
    email: session.email,
    [trustedIdentity]: true as const,
  })
}

export const createPersistenceAccountContext = (
  identity: PersistenceIdentityContext,
  account: Readonly<{ id: string; firebaseUid: string }>
): PersistenceAccountContext => {
  if (!account.id || account.firebaseUid !== identity.firebaseUid)
    throw new Error('The persistence account does not match the identity.')

  return Object.freeze({
    accountId: account.id,
    firebaseUid: identity.firebaseUid,
    [trustedAccount]: true as const,
  })
}
