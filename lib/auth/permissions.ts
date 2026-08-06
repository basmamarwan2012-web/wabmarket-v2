import type { UserRole } from './roles'

export const PERMISSIONS = [
  'admin.access',
  'data.read',
  'domains.manage',
  'domains.read',
  'domains.create',
  'domains.update',
  'domains.delete',
  'domains.restore',
  'discoveries.read',
  'discoveries.create',
  'discoveries.transition',
  'discoveries.cancel',
  'leads.manage',
  'campaigns.manage',
  'campaigns.send',
  'negotiations.manage',
  'statuses.update',
  'financials.read',
  'files.manage',
  'settings.manage',
  'users.manage',
] as const

export type Permission = (typeof PERMISSIONS)[number]

const rolePermissions: Record<UserRole, readonly Permission[]> = {
  administrator: PERMISSIONS,
  manager: [
    'admin.access',
    'data.read',
    'domains.manage',
    'domains.read',
    'domains.create',
    'domains.update',
    'domains.delete',
    'domains.restore',
    'discoveries.read',
    'discoveries.create',
    'discoveries.transition',
    'discoveries.cancel',
    'leads.manage',
    'campaigns.manage',
    'campaigns.send',
    'negotiations.manage',
    'statuses.update',
    'files.manage',
  ],
  operator: [
    'admin.access',
    'data.read',
    'campaigns.send',
    'negotiations.manage',
    'statuses.update',
    'domains.read',
    'domains.update',
    'discoveries.read',
    'discoveries.create',
    'discoveries.transition',
  ],
  viewer: ['admin.access', 'data.read', 'domains.read', 'discoveries.read'],
}

export function hasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role].includes(permission)
}

export function hasEveryPermission(
  role: UserRole,
  permissions: readonly Permission[]
) {
  return permissions.every((permission) => hasPermission(role, permission))
}

export function getPermissions(role: UserRole) {
  return rolePermissions[role]
}
