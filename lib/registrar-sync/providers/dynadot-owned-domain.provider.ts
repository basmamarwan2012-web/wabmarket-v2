import 'server-only'

import { randomUUID } from 'node:crypto'

import {
  loadDynadotSignedInventoryConfiguration,
  type DynadotSignedInventoryConfigurationLoader,
} from '@/lib/config/dynadot'
import { RegistrarSyncError } from '../errors'
import type { RegistrarOwnedDomainProvider } from '../provider'
import type {
  RegistrarOwnedDomainListContext,
  RegistrarOwnedDomainPage,
} from '../types'
import {
  buildDynadotOwnedDomainPath,
  DYNADOT_OWNED_DOMAIN_BASE_URL,
  DYNADOT_OWNED_DOMAIN_POLICY,
  DYNADOT_OWNED_DOMAIN_PROVIDER_IDENTIFIER,
  isDynadotOutOfRangePayload,
  parseDynadotOwnedDomainPayload,
} from './dynadot-owned-domain.helpers'

type FetchImplementation = typeof fetch
type RequestIdFactory = () => string

export class DynadotRegistrarOwnedDomainProvider
  implements RegistrarOwnedDomainProvider
{
  readonly identifier = DYNADOT_OWNED_DOMAIN_PROVIDER_IDENTIFIER

  constructor(
    private readonly loadConfiguration: DynadotSignedInventoryConfigurationLoader =
      loadDynadotSignedInventoryConfiguration,
    private readonly fetchImplementation: FetchImplementation = fetch,
    private readonly createRequestId: RequestIdFactory = randomUUID
  ) {}

  async listOwnedDomains(
    context: Readonly<RegistrarOwnedDomainListContext> = {}
  ): Promise<RegistrarOwnedDomainPage> {
    const page = this.parseCursor(context.cursor)
    if (context.signal?.aborted)
      throw new RegistrarSyncError('REGISTRAR_REQUEST_FAILED')
    const configuration = this.loadConfiguration()
    if (!configuration.success)
      throw new RegistrarSyncError('REGISTRAR_CONFIGURATION_MISSING')

    const fullPathAndQuery = buildDynadotOwnedDomainPath(page)
    const endpoint = `${DYNADOT_OWNED_DOMAIN_BASE_URL}${fullPathAndQuery}`
    const requestId = this.createRequestId()
    const requestBody = ''
    const controller = new AbortController()
    const abort = () => controller.abort()
    context.signal?.addEventListener('abort', abort, { once: true })
    const timeout = setTimeout(abort, DYNADOT_OWNED_DOMAIN_POLICY.timeoutMs)

    try {
      const response = await this.fetchImplementation(endpoint, {
        method: 'GET',
        headers: configuration.credentials.createSignedRequestHeaders(
          fullPathAndQuery,
          requestId,
          requestBody
        ),
        signal: controller.signal,
      })

      if (response.status === 401)
        throw new RegistrarSyncError('REGISTRAR_AUTH_FAILED')

      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        throw new RegistrarSyncError('REGISTRAR_RESPONSE_INVALID')
      }

      if (!response.ok) {
        if (response.status === 400 && isDynadotOutOfRangePayload(payload))
          return Object.freeze({ domains: Object.freeze([]), nextCursor: null })
        throw new RegistrarSyncError('REGISTRAR_REQUEST_FAILED')
      }

      const domains = parseDynadotOwnedDomainPayload(payload)
      return Object.freeze({
        domains,
        nextCursor:
          domains.length < DYNADOT_OWNED_DOMAIN_POLICY.pageSize
            ? null
            : String(page + 1),
      })
    } catch (error) {
      if (error instanceof RegistrarSyncError) throw error
      throw new RegistrarSyncError('REGISTRAR_REQUEST_FAILED', { cause: error })
    } finally {
      clearTimeout(timeout)
      context.signal?.removeEventListener('abort', abort)
    }
  }

  private parseCursor(cursor: string | null | undefined): number {
    if (cursor === null || cursor === undefined) return 1
    if (!/^[1-9]\d*$/.test(cursor))
      throw new RegistrarSyncError('REGISTRAR_SYNC_FAILED')
    const page = Number(cursor)
    if (!Number.isSafeInteger(page))
      throw new RegistrarSyncError('REGISTRAR_SYNC_FAILED')
    return page
  }
}
