import type { UserRole } from '@/lib/auth/roles'
import { hasPermission, type Permission } from '@/lib/auth/permissions'
import type { DiscoveryProgress, DiscoveryStatus } from '@/types/discovery'

export type DiscoveryAction = 'read' | 'create' | 'transition' | 'cancel'

export function canPerformDiscoveryAction(
  role: UserRole,
  action: DiscoveryAction
) {
  const permission: Record<DiscoveryAction, Permission> = {
    read: 'discoveries.read',
    create: 'discoveries.create',
    transition: 'discoveries.transition',
    cancel: 'discoveries.cancel',
  }
  return hasPermission(role, permission[action])
}

export function getDiscoveryActions(
  role: UserRole,
  status: DiscoveryStatus,
  progress: DiscoveryProgress
) {
  if (!canPerformDiscoveryAction(role, 'transition')) return []
  if (status === 'queued') return ['processing', 'failed'] as const
  if (status === 'processing')
    return progress < 75
      ? (['processing', 'completed', 'failed'] as const)
      : (['completed', 'failed'] as const)
  return []
}
