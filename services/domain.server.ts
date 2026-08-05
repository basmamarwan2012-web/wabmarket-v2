import 'server-only'

import type { AuthenticatedSession } from '@/lib/auth/session'
import { canPerformDomainAction } from '@/lib/domains/permissions'
import { DomainError } from '@/lib/domains/errors'
import { domainRepository } from '@/repositories/domain.repository'
import type { DomainListQuery } from '@/types/domain-api'
import type {
  DomainCreateInput,
  DomainPatchInput,
} from '@/lib/domains/validation'

function authorize(
  session: AuthenticatedSession,
  action: Parameters<typeof canPerformDomainAction>[1]
) {
  if (!canPerformDomainAction(session.role, action)) {
    throw new DomainError(
      'DOMAIN_FORBIDDEN',
      'You do not have permission for this action.',
      403
    )
  }
}

export class DomainServerService {
  async list(session: AuthenticatedSession, query: DomainListQuery) {
    authorize(session, query.deleted === 'deleted' ? 'trash.read' : 'read')
    return domainRepository.list(session.uid, query)
  }

  async get(
    session: AuthenticatedSession,
    domainId: string,
    includeDeleted = false
  ) {
    authorize(session, 'read')
    const detail = await domainRepository.getDetail(
      session.uid,
      domainId,
      session.email
    )
    if (!detail || (detail.domain.isDeleted && !includeDeleted)) {
      throw new DomainError('DOMAIN_NOT_FOUND', 'Domain not found.', 404)
    }
    if (detail.domain.isDeleted) authorize(session, 'trash.read')
    return detail
  }

  async create(session: AuthenticatedSession, input: DomainCreateInput) {
    authorize(session, 'create')
    return domainRepository.create(
      session.uid,
      session.uid,
      session.email,
      input
    )
  }

  async update(
    session: AuthenticatedSession,
    domainId: string,
    input: DomainPatchInput
  ) {
    authorize(session, 'update')
    return domainRepository.update(
      session.uid,
      session.uid,
      session.email,
      session.role,
      domainId,
      input
    )
  }

  async moveToTrash(session: AuthenticatedSession, domainId: string) {
    authorize(session, 'delete')
    return domainRepository.moveToTrash(
      session.uid,
      session.uid,
      session.email,
      domainId
    )
  }

  async restore(session: AuthenticatedSession, domainId: string) {
    authorize(session, 'restore')
    return domainRepository.restore(
      session.uid,
      session.uid,
      session.email,
      domainId
    )
  }
}

export const domainServerService = new DomainServerService()
