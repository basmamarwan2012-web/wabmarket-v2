import { db } from '@/firebase/client'

export class FirebaseService {
  getDatabase() {
    return db
  }
}

export const firebaseService = new FirebaseService()
