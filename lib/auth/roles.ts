export const USER_ROLES = [
  'administrator',
  'manager',
  'operator',
  'viewer',
] as const

export type UserRole = (typeof USER_ROLES)[number]

export const DEFAULT_USER_ROLE: UserRole = 'viewer'

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole)
}
