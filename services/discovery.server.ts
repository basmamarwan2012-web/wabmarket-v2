import 'server-only'

import type { AuthenticatedSession } from '@/lib/auth/session'
import { DiscoveryError } from '@/lib/discoveries/errors'
import {
  canPerformDiscoveryAction,
  type DiscoveryAction,
} from '@/lib/discoveries/permissions'
import type {
  DiscoveryCreateInput,
  DiscoveryTransitionInput,
} from '@/lib/discoveries/validation'
import { discoveryRepository } from '@/repositories/discovery.repository'
import type { DiscoveryListQuery } from '@/types/discovery-api'

function authorize(session: AuthenticatedSession, action: DiscoveryAction) {
  if (!canPerformDiscoveryAction(session.role, action)) {
    throw new DiscoveryError(
      'DISCOVERY_FORBIDDEN',
      'You do not have permission for this action.',
      403
    )
  }
}

export class DiscoveryServerService {
  async list(session: AuthenticatedSession, query: DiscoveryListQuery) {
    authorize(session, 'read')
    return discoveryRepository.list(session.uid, query)
  }

  async get(session: AuthenticatedSession, discoveryId: string) {
    authorize(session, 'read')
    const discovery = await discoveryRepository.get(session.uid, discoveryId)
    if (!discovery)
      throw new DiscoveryError(
        'DISCOVERY_NOT_FOUND',
        'Discovery job not found.',
        404
      )
    return discovery
  }

  async create(session: AuthenticatedSession, input: DiscoveryCreateInput) {
    authorize(session, 'create')
    return discoveryRepository.create(
      session.uid,
      session.uid,
      session.email,
      input
    )
  }

  async transition(
    session: AuthenticatedSession,
    discoveryId: string,
    input: DiscoveryTransitionInput
  ) {
    authorize(session, 'transition')
    return discoveryRepository.transition(
      session.uid,
      session.uid,
      session.email,
      discoveryId,
      input.status
    )
  }

  async cancel(session: AuthenticatedSession, discoveryId: string) {
    authorize(session, 'cancel')
    return discoveryRepository.transition(
      session.uid,
      session.uid,
      session.email,
      discoveryId,
      'cancelled'
    )
  }
}

export const discoveryServerService = new DiscoveryServerService()
