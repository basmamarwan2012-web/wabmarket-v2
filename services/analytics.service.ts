import { doc, getDoc, setDoc } from 'firebase/firestore'

import { db } from '@/firebase/client'
import { Analytics } from '@/types'

export class AnalyticsService {
  async getAnalytics(userId: string) {
    const snapshot = await getDoc(
      doc(db, 'users', userId, 'analytics', 'global')
    )

    return snapshot.data()
  }

  async saveAnalytics(userId: string, analytics: Analytics) {
    return setDoc(doc(db, 'users', userId, 'analytics', 'global'), analytics)
  }
}

export const analyticsService = new AnalyticsService()
