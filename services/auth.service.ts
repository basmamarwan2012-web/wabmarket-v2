import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

import { auth } from '@/firebase/client'
import { createUserDocument } from '@/services/user.service'

export const registerUser = async (email: string, password: string) => {
  const credentials = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  await createUserDocument(credentials.user.uid, {
    email,
    role: 'admin',
    createdAt: new Date(),
  })

  return credentials
}

export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const logoutUser = () => {
  return signOut(auth)
}
