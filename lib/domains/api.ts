import 'server-only'

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { verifySession } from '@/lib/auth/session'
import { DomainError } from './errors'
import logger from '@/services/logger'

export interface DomainErrorContext {
  endpoint: string
  operation: string
  userUid?: string
  domainId?: string
}

const privateHeaders = { 'Cache-Control': 'private, no-store' }

export async function requireApiSession() {
  const session = await verifySession()
  if (!session)
    throw new DomainError('UNAUTHENTICATED', 'Authentication is required.', 401)
  return session
}

function firestoreDetails(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return { code: null, message: null, indexLink: null }
  }
  const code = 'code' in error ? String(error.code) : null
  const message =
    'message' in error && typeof error.message === 'string'
      ? error.message
      : null
  const indexLink =
    message?.match(/https:\/\/console\.firebase\.google\.com\/\S+/)?.[0] ?? null
  return { code, message, indexLink }
}

export function domainApiSuccess<T>(data: T, status = 200, message?: string) {
  return NextResponse.json(
    { success: true, data, ...(message ? { message } : {}) },
    { status, headers: privateHeaders }
  )
}

export function domainApiError(error: unknown, context: DomainErrorContext) {
  const firestore = firestoreDetails(error)
  const indexRequired =
    firestore.code === '9' ||
    firestore.code === 'failed-precondition' ||
    firestore.message?.toLowerCase().includes('requires an index')
  const internalCode =
    error instanceof DomainError
      ? error.code
      : error instanceof ZodError
        ? 'VALIDATION_ERROR'
        : indexRequired
          ? 'FIRESTORE_INDEX_REQUIRED'
          : 'INTERNAL_ERROR'

  logger.error('Owned Domains request failed', {
    code: internalCode,
    endpoint: context.endpoint,
    operation: context.operation,
    userUid: context.userUid ?? null,
    domainId: context.domainId ?? null,
    firestoreCode: firestore.code,
    indexDiagnostic: indexRequired ? firestore.indexLink : null,
  })

  if (error instanceof DomainError) {
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
  if (indexRequired) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FIRESTORE_INDEX_REQUIRED',
          message:
            'This domain query requires a database index that is not deployed yet.',
        },
      },
      { status: 503, headers: privateHeaders }
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
