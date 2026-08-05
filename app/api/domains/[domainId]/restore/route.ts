import {
  domainApiError,
  domainApiSuccess,
  requireApiSession,
} from '@/lib/domains/api'
import { domainServerService } from '@/services/domain.server'

export const runtime = 'nodejs'

export async function POST(
  _request: Request,
  context: { params: Promise<{ domainId: string }> }
) {
  let userUid: string | undefined
  let requestedDomainId: string | undefined
  try {
    const session = await requireApiSession()
    userUid = session.uid
    const { domainId } = await context.params
    requestedDomainId = domainId
    const data = await domainServerService.restore(session, domainId)
    return domainApiSuccess(data, 200, 'Domain restored.')
  } catch (error) {
    return domainApiError(error, {
      endpoint: '/api/domains/[domainId]/restore',
      operation: 'restore',
      userUid,
      domainId: requestedDomainId,
    })
  }
}
