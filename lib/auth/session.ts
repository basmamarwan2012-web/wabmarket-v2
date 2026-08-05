import 'server-only'

import { cookies } from 'next/headers'

import { adminAuth } from '@/firebase/admin'
import {
  SESSION_COOKIE_MAX_AGE_MS,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from '@/lib/auth/config'
import { isUserRole, type UserRole } from '@/lib/auth/roles'

export interface AuthenticatedSession {
  uid: string
  email: string | null
  role: UserRole
}

export async function createSessionCookie(idToken: string) {
  const decodedToken = await adminAuth.verifyIdToken(idToken)
  const authenticatedAt = decodedToken.auth_time * 1000

  if (Date.now() - authenticatedAt > 5 * 60 * 1000) {
    throw new Error('Recent authentication is required.')
  }

  if (!isUserRole(decodedToken.role)) {
    throw new Error('The account does not have an authorized role.')
  }

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_COOKIE_MAX_AGE_MS,
  })
  const cookieStore = await cookies()

  cookieStore.set(
    SESSION_COOKIE_NAME,
    sessionCookie,
    SESSION_COOKIE_OPTIONS
  )
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, '', {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
    expires: new Date(0),
  })
}

export async function verifySession(): Promise<AuthenticatedSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) {
    return null
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)

    if (!isUserRole(decodedToken.role)) {
      return null
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      role: decodedToken.role,
    }
  } catch {
    return null
  }
}
