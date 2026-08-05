import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore'

import { db } from '@/firebase/client'
import { Domain } from '@/types'

export class DomainService {
  async createDomain(userId: string, domain: Omit<Domain, 'id'>) {
    return addDoc(collection(db, 'users', userId, 'owned_domains'), domain)
  }

  async getDomains(userId: string) {
    const snapshot = await getDocs(
      collection(db, 'users', userId, 'owned_domains')
    )

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }))
  }

  async getDomain(userId: string, domainId: string) {
    const snapshot = await getDoc(
      doc(db, 'users', userId, 'owned_domains', domainId)
    )

    return snapshot.data()
  }

  async updateDomain(userId: string, domainId: string, data: Partial<Domain>) {
    return updateDoc(doc(db, 'users', userId, 'owned_domains', domainId), data)
  }

  async deleteDomain(userId: string, domainId: string) {
    return deleteDoc(doc(db, 'users', userId, 'owned_domains', domainId))
  }
}

export const domainService = new DomainService()
