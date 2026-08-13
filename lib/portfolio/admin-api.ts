import 'server-only'

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { hasPermission } from '@/lib/auth/permissions'
import { verifySession, type AuthenticatedSession } from '@/lib/auth/session'
import { OwnedDomainManagementError } from '@/lib/owned-domains/owned-domain-management.errors'
import { PersistenceError } from '@/lib/persistence/errors'
import { RegistrarSyncError } from '@/lib/registrar-sync/errors'

const privateHeaders = { 'Cache-Control': 'private, no-store' }

class PortfolioAdminRequestError extends Error {
  constructor(
    readonly code: 'UNAUTHENTICATED' | 'FORBIDDEN',
    readonly status: number
  ) {
    super(
      code === 'UNAUTHENTICATED'
        ? 'Authentication is required.'
        : 'Permission denied.'
    )
  }
}

export const requirePortfolioAdminSession = async (
  mutation = false
): Promise<AuthenticatedSession> => {
  const session = await verifySession()
  if (!session) throw new PortfolioAdminRequestError('UNAUTHENTICATED', 401)
  if (!hasPermission(session.role, mutation ? 'domains.manage' : 'admin.access'))
    throw new PortfolioAdminRequestError('FORBIDDEN', 403)
  return session
}

export const portfolioAdminSuccess = <T>(data: T, message?: string) =>
  NextResponse.json(
    { success: true, data, ...(message ? { message } : {}) },
    { headers: privateHeaders }
  )

export const portfolioAdminError = (error: unknown) => {
  if (error instanceof PortfolioAdminRequestError)
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
  if (error instanceof OwnedDomainManagementError) {
    const status =
      error.code === 'DOMAIN_ALREADY_EXISTS'
        ? 409
        : error.code === 'DOMAIN_MANAGEMENT_UNAVAILABLE'
          ? 503
          : 400
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status, headers: privateHeaders }
    )
  }
  if (error instanceof RegistrarSyncError)
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: 503, headers: privateHeaders }
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
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    },
    { status: 500, headers: privateHeaders }
  )
}
