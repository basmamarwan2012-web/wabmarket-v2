import 'server-only'

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { hasPermission } from '@/lib/auth/permissions'
import { verifySession, type AuthenticatedSession } from '@/lib/auth/session'
import { PersistenceError } from '@/lib/persistence/errors'

const privateHeaders = { 'Cache-Control': 'private, no-store' }

export const requireMarketplaceAdminSession = async (
  mutation = false
): Promise<AuthenticatedSession> => {
  const session = await verifySession()
  if (!session) throw new MarketplaceAdminRequestError('UNAUTHENTICATED', 401)
  if (!hasPermission(session.role, mutation ? 'domains.manage' : 'admin.access'))
    throw new MarketplaceAdminRequestError('FORBIDDEN', 403)
  return session
}

class MarketplaceAdminRequestError extends Error {
  constructor(
    readonly code: 'UNAUTHENTICATED' | 'FORBIDDEN',
    readonly status: number
  ) {
    super(code === 'UNAUTHENTICATED' ? 'Authentication is required.' : 'Permission denied.')
  }
}

export const marketplaceAdminSuccess = <T>(data: T, message?: string) =>
  NextResponse.json(
    { success: true, data, ...(message ? { message } : {}) },
    { headers: privateHeaders }
  )

export const marketplaceAdminError = (error: unknown) => {
  if (error instanceof MarketplaceAdminRequestError)
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: error.status, headers: privateHeaders }
    )
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The request is invalid.',
          issues: error.flatten().fieldErrors,
        },
      },
      { status: 400, headers: privateHeaders }
    )
  if (error instanceof PersistenceError) {
    const status =
      error.code === 'PERSISTENCE_NOT_FOUND'
        ? 404
        : error.code === 'PERSISTENCE_VERSION_CONFLICT'
          ? 409
          : error.code === 'PERSISTENCE_INVALID_INPUT'
            ? 400
            : 503
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status, headers: privateHeaders }
    )
  }
  return NextResponse.json(
    {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    },
    { status: 500, headers: privateHeaders }
  )
}
