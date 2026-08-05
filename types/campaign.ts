export type CampaignStatus =
  'draft' | 'scheduled' | 'active' | 'completed' | 'paused'

export interface Campaign {
  id: string

  domainId: string

  campaignName: string

  status: CampaignStatus

  scheduledDate?: Date

  createdAt: Date

  updatedAt: Date
}
