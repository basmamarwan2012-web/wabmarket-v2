import 'server-only'

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Firebase Admin credentials are not configured.')
}

const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })

export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)
export const adminStorage = getStorage(adminApp)
