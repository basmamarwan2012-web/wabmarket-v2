import { collection, addDoc, getDocs } from 'firebase/firestore'

import { db } from '@/firebase/client'
import { Lead } from '@/types'

export class LeadService {
  async createLead(userId: string, lead: Omit<Lead, 'id'>) {
    return addDoc(collection(db, 'users', userId, 'leads'), lead)
  }

  async getLeads(userId: string) {
    const snapshot = await getDocs(collection(db, 'users', userId, 'leads'))

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  }
}

export const leadService = new LeadService()
