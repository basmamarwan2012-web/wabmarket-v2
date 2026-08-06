import 'server-only'

import { createHash } from 'node:crypto'
import { z } from 'zod'

import type { DiscoveryListQuery } from '@/types/discovery-api'

const cursorSchema = z.object({
  version: z.literal(1),
  fingerprint: z.string().length(64),
  createdAt: z.string().datetime(),
  lastId: z.string().min(1),
})

export function getDiscoveryQueryFingerprint(
  uid: string,
  query: Omit<DiscoveryListQuery, 'cursor'>
) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        tenant: uid,
        order: query.order,
        pageSize: query.pageSize,
      })
    )
    .digest('hex')
}

export function encodeDiscoveryCursor(input: z.infer<typeof cursorSchema>) {
  return Buffer.from(JSON.stringify(input)).toString('base64url')
}

export function decodeDiscoveryCursor(
  value: string,
  expectedFingerprint: string
) {
  try {
    const cursor = cursorSchema.parse(
      JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    )
    if (cursor.fingerprint !== expectedFingerprint) throw new Error()
    return cursor
  } catch {
    throw new Error('Invalid or mismatched discovery cursor.')
  }
}
