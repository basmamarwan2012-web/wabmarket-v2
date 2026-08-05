export type NotificationPriority = 'low' | 'medium' | 'high'

export interface Notification {
  id: string

  title: string

  description: string

  priority: NotificationPriority

  isRead: boolean

  createdAt: Date
}
