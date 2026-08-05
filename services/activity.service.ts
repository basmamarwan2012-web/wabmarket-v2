import { addDoc, collection } from 'firebase/firestore'

import { db } from '@/firebase/client'
import { Activity } from '@/types'

export class ActivityService {
  async createActivity(userId: string, activity: Omit<Activity, 'id'>) {
    return addDoc(collection(db, 'users', userId, 'activities'), activity)
  }
}

export const activityService = new ActivityService()
