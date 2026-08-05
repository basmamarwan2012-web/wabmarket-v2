import {
  domainApiError,
  domainApiSuccess,
  requireApiSession,
} from '@/lib/domains/api'
import { normalizeDomainName } from '@/lib/domains/normalization'
import {
  domainCreateSchema,
  domainListQuerySchema,
} from '@/lib/domains/validation'
import { domainServerService } from '@/services/domain.server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  let userUid: string | undefined
  try {
    const session = await requireApiSession()
    userUid = session.uid
    const params = Object.fromEntries(new URL(request.url).searchParams)
    const query = domainListQuerySchema.parse(params)
    if (query.search) query.search = normalizeDomainName(query.search)
    const data = await domainServerService.list(session, query)
    return domainApiSuccess(data)
  } catch (error) {
    return domainApiError(error, {
      endpoint: '/api/domains',
      operation: 'list',
      userUid,
    })
  }
}

export async function POST(request: Request) {
  let userUid: string | undefined
  try {
    const session = await requireApiSession()
    userUid = session.uid
    const input = domainCreateSchema.parse(await request.json())
    const data = await domainServerService.create(session, input)
    return domainApiSuccess(data, 201, 'Domain created.')
  } catch (error) {
    return domainApiError(error, {
      endpoint: '/api/domains',
      operation: 'create',
      userUid,
    })
  }
}
