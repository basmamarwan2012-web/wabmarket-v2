import {
  discoveryApiError,
  discoveryApiSuccess,
  requireDiscoveryApiSession,
} from '@/lib/discoveries/api'
import {
  discoveryCreateSchema,
  discoveryListQuerySchema,
} from '@/lib/discoveries/validation'
import { discoveryServerService } from '@/services/discovery.server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  let userUid: string | undefined
  try {
    const session = await requireDiscoveryApiSession()
    userUid = session.uid
    const query = discoveryListQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    )
    return discoveryApiSuccess(
      await discoveryServerService.list(session, query)
    )
  } catch (error) {
    return discoveryApiError(error, {
      endpoint: '/api/discoveries',
      operation: 'list',
      userUid,
    })
  }
}

export async function POST(request: Request) {
  let userUid: string | undefined
  try {
    const session = await requireDiscoveryApiSession()
    userUid = session.uid
    const input = discoveryCreateSchema.parse(await request.json())
    return discoveryApiSuccess(
      await discoveryServerService.create(session, input),
      201,
      'Discovery job created.'
    )
  } catch (error) {
    return discoveryApiError(error, {
      endpoint: '/api/discoveries',
      operation: 'create',
      userUid,
    })
  }
}
