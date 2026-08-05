import 'server-only'

import { createHash } from 'node:crypto'
import { z } from 'zod'

import type { DomainListQuery } from '@/types/domain-api'

const cursorSchema = z.object({
  version: z.literal(1),
  fingerprint: z.string().length(64),
  lastValue: z.union([z.string(), z.number(), z.null()]),
  lastId: z.string().min(1),
})

export type DomainCursor = z.infer<typeof cursorSchema>

export function getQueryFingerprint(query: Omit<DomainListQuery, 'cursor'>) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        search: query.search ?? null,
        status: query.status ?? null,
        registrar: query.registrar ?? null,
        deleted: query.deleted,
        sort: query.sort,
        order: query.order,
        pageSize: query.pageSize,
      })
    )
    .digest('hex')
}

export function encodeDomainCursor(cursor: DomainCursor) {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url')
}

export function decodeDomainCursor(value: string, expectedFingerprint: string) {
  try {
    const parsed = cursorSchema.parse(
      JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    )
    if (parsed.fingerprint !== expectedFingerprint) {
      throw new Error('Cursor does not match the current query.')
    }
    return parsed
  } catch {
    throw new Error('Invalid or mismatched pagination cursor.')
  }
}
