import type { UserRole } from '@/lib/auth/roles'

export type { UserRole } from '@/lib/auth/roles'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: Date
  updatedAt: Date
}
