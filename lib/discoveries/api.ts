import 'server-only'

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { verifySession } from '@/lib/auth/session'
import logger from '@/services/logger'
import { DiscoveryError } from './errors'

export interface DiscoveryErrorContext {
  endpoint: string
  operation: string
  userUid?: string
  discoveryId?: string
}

const privateHeaders = { 'Cache-Control': 'private, no-store' }

export async function requireDiscoveryApiSession() {
  const session = await verifySession()
  if (!session)
    throw new DiscoveryError(
      'UNAUTHENTICATED',
      'Authentication is required.',
      401
    )
  return session
}

export function discoveryApiSuccess<T>(
  data: T,
  status = 200,
  message?: string
) {
  return NextResponse.json(
    { success: true, data, ...(message ? { message } : {}) },
    { status, headers: privateHeaders }
  )
}

export function discoveryApiError(
  error: unknown,
  context: DiscoveryErrorContext
) {
  const code =
    error instanceof DiscoveryError
      ? error.code
      : error instanceof ZodError
        ? 'VALIDATION_ERROR'
        : 'INTERNAL_ERROR'
  logger.error('Discovery request failed', {
    code,
    endpoint: context.endpoint,
    operation: context.operation,
    userUid: context.userUid ?? null,
    discoveryId: context.discoveryId ?? null,
  })

  if (error instanceof DiscoveryError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          issues: error.issues,
        },
      },
      { status: error.status, headers: privateHeaders }
    )
  }
  if (error instanceof ZodError) {
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
