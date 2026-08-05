import { addDoc, collection, getDocs } from 'firebase/firestore'

import { db } from '@/firebase/client'
import { Notification } from '@/types'

export class NotificationService {
  async createNotification(
    userId: string,
    notification: Omit<Notification, 'id'>
  ) {
    return addDoc(
      collection(db, 'users', userId, 'notifications'),
      notification
    )
  }

  async getNotifications(userId: string) {
    const snapshot = await getDocs(
      collection(db, 'users', userId, 'notifications')
    )

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  }
}

export const notificationService = new NotificationService()
