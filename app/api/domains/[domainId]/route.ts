import {
  domainApiError,
  domainApiSuccess,
  requireApiSession,
} from '@/lib/domains/api'
import { domainPatchSchema } from '@/lib/domains/validation'
import { domainServerService } from '@/services/domain.server'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ domainId: string }>
}

export async function GET(request: Request, context: RouteContext) {
  let userUid: string | undefined
  let requestedDomainId: string | undefined
  try {
    const session = await requireApiSession()
    userUid = session.uid
    const { domainId } = await context.params
    requestedDomainId = domainId
    const includeDeleted =
      new URL(request.url).searchParams.get('deleted') === 'deleted'
    const data = await domainServerService.get(
      session,
      domainId,
      includeDeleted
    )
    return domainApiSuccess(data)
  } catch (error) {
    return domainApiError(error, {
      endpoint: '/api/domains/[domainId]',
      operation: 'detail',
      userUid,
      domainId: requestedDomainId,
    })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  let userUid: string | undefined
  let requestedDomainId: string | undefined
  try {
    const session = await requireApiSession()
    userUid = session.uid
    const { domainId } = await context.params
    requestedDomainId = domainId
    const input = domainPatchSchema.parse(await request.json())
    const data = await domainServerService.update(session, domainId, input)
    return domainApiSuccess(data, 200, 'Domain updated.')
  } catch (error) {
    return domainApiError(error, {
      endpoint: '/api/domains/[domainId]',
      operation: 'update',
      userUid,
      domainId: requestedDomainId,
    })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  let userUid: string | undefined
  let requestedDomainId: string | undefined
  try {
    const session = await requireApiSession()
    userUid = session.uid
    const { domainId } = await context.params
    requestedDomainId = domainId
    const data = await domainServerService.moveToTrash(session, domainId)
    return domainApiSuccess(data, 200, 'Domain moved to trash.')
  } catch (error) {
    return domainApiError(error, {
      endpoint: '/api/domains/[domainId]',
      operation: 'move-to-trash',
      userUid,
      domainId: requestedDomainId,
    })
  }
}
