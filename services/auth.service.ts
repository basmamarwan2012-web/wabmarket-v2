import { type UserCredential, signInWithEmailAndPassword, signOut } from 'firebase/auth'

import { auth } from '@/firebase/client'
import type { RegisterCredentials } from '@/types'

async function requestJson(url: string, init: RequestInit) {
  const response = await fetch(url, init)
  const body = (await response.json().catch(() => null)) as {
    error?: string
  } | null

  if (!response.ok) {
    throw new Error(body?.error ?? 'Authentication request failed.')
  }

  return body
}

export const registerUser = async (credentials: RegisterCredentials) => {
  return requestJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
}

export const loginUser = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const credentials = await signInWithEmailAndPassword(auth, email, password)

  try {
    const idToken = await credentials.user.getIdToken(true)
    await requestJson('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    return credentials
  } catch (error) {
    await signOut(auth)
    throw error
  }
}

export const logoutUser = async () => {
  await requestJson('/api/auth/logout', { method: 'POST' })
  await signOut(auth)
}
