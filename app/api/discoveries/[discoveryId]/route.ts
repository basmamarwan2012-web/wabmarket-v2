import {
  discoveryApiError,
  discoveryApiSuccess,
  requireDiscoveryApiSession,
} from '@/lib/discoveries/api'
import { discoveryTransitionSchema } from '@/lib/discoveries/validation'
import { discoveryServerService } from '@/services/discovery.server'

export const runtime = 'nodejs'

type Context = { params: Promise<{ discoveryId: string }> }

export async function GET(_request: Request, context: Context) {
  let userUid: string | undefined
  let discoveryId: string | undefined
  try {
    const session = await requireDiscoveryApiSession()
    userUid = session.uid
    discoveryId = (await context.params).discoveryId
    return discoveryApiSuccess(
      await discoveryServerService.get(session, discoveryId)
    )
  } catch (error) {
    return discoveryApiError(error, {
      endpoint: '/api/discoveries/[discoveryId]',
      operation: 'get',
      userUid,
      discoveryId,
    })
  }
}

export async function PATCH(request: Request, context: Context) {
  let userUid: string | undefined
  let discoveryId: string | undefined
  try {
    const session = await requireDiscoveryApiSession()
    userUid = session.uid
    discoveryId = (await context.params).discoveryId
    const input = discoveryTransitionSchema.parse(await request.json())
    return discoveryApiSuccess(
      await discoveryServerService.transition(session, discoveryId, input),
      200,
      'Discovery job updated.'
    )
  } catch (error) {
    return discoveryApiError(error, {
      endpoint: '/api/discoveries/[discoveryId]',
      operation: 'transition',
      userUid,
      discoveryId,
    })
  }
}

export async function DELETE(_request: Request, context: Context) {
  let userUid: string | undefined
  let discoveryId: string | undefined
  try {
    const session = await requireDiscoveryApiSession()
    userUid = session.uid
    discoveryId = (await context.params).discoveryId
    return discoveryApiSuccess(
      await discoveryServerService.cancel(session, discoveryId),
      200,
      'Discovery job cancelled.'
    )
  } catch (error) {
    return discoveryApiError(error, {
      endpoint: '/api/discoveries/[discoveryId]',
      operation: 'cancel',
      userUid,
      discoveryId,
    })
  }
}
