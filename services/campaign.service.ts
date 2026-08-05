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
import { Campaign } from '@/types'

export class CampaignService {
  async createCampaign(userId: string, campaign: Omit<Campaign, 'id'>) {
    return addDoc(collection(db, 'users', userId, 'campaigns'), campaign)
  }

  async getCampaigns(userId: string) {
    const snapshot = await getDocs(collection(db, 'users', userId, 'campaigns'))

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }))
  }

  async getCampaign(userId: string, campaignId: string) {
    const snapshot = await getDoc(
      doc(db, 'users', userId, 'campaigns', campaignId)
    )

    return snapshot.data()
  }

  async updateCampaign(
    userId: string,
    campaignId: string,
    data: Partial<Campaign>
  ) {
    return updateDoc(doc(db, 'users', userId, 'campaigns', campaignId), data)
  }

  async deleteCampaign(userId: string, campaignId: string) {
    return deleteDoc(doc(db, 'users', userId, 'campaigns', campaignId))
  }
}

export const campaignService = new CampaignService()
