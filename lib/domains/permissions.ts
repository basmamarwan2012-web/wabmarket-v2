import type { UserRole } from '@/lib/auth/roles'
import type { DomainStatus } from '@/types/domain'
import type { DomainPatchInput } from './validation'

export type DomainAction =
  'read' | 'create' | 'update' | 'delete' | 'restore' | 'trash.read'

const operatorTransitions: Readonly<
  Record<DomainStatus, readonly DomainStatus[]>
> = {
  opportunity: [],
  active: ['sold', 'expired', 'archived'],
  sold: ['archived'],
  expired: ['archived'],
  archived: [],
}

const operatorFields = new Set<keyof DomainPatchInput>([
  'status',
  'description',
  'askingPrice',
  'estimatedPrice',
])

export function canPerformDomainAction(role: UserRole, action: DomainAction) {
  if (role === 'administrator' || role === 'manager') return true
  if (action === 'read') return true
  return role === 'operator' && action === 'update'
}

export function validateOperatorPatch(
  currentStatus: DomainStatus,
  patch: DomainPatchInput
) {
  const unauthorizedFields = (
    Object.keys(patch) as (keyof DomainPatchInput)[]
  ).filter((field) => !operatorFields.has(field))
  if (unauthorizedFields.length > 0) {
    return `Operators cannot update: ${unauthorizedFields.join(', ')}.`
  }

  if (
    patch.status &&
    patch.status !== currentStatus &&
    !operatorTransitions[currentStatus].includes(patch.status)
  ) {
    return `Operators cannot change status from ${currentStatus} to ${patch.status}.`
  }

  return null
}

export function getOperatorStatusTransitions(status: DomainStatus) {
  return operatorTransitions[status]
}
