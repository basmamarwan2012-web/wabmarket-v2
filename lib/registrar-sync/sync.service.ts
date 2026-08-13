import 'server-only'

import type { PersistenceAccountContext } from '@/lib/persistence/context'
import type { PersistenceUnitOfWork } from '@/lib/persistence/unit-of-work'
import { RegistrarSyncError } from './errors'
import {
  createRegistrarSyncEvidence,
  freezeRegistrarSyncReport,
  normalizeRegistrarAssociationFact,
  REGISTRAR_OWNED_DOMAIN_SYNC_POLICY,
  waitForRegistrarPage,
} from './helpers'
import type { RegistrarOwnedDomainProvider } from './provider'
import type {
  RegistrarOwnedDomainFact,
  RegistrarOwnedDomainSyncReport,
  RegistrarOwnedDomainSyncRequest,
} from './types'

type Delay = (durationMs: number) => Promise<void>
type Clock = () => Date

export class RegistrarOwnedDomainSyncService {
  constructor(
    private readonly unitOfWork: PersistenceUnitOfWork,
    private readonly delay: Delay = waitForRegistrarPage,
    private readonly clock: Clock = () => new Date()
  ) {}

  async sync(
    context: PersistenceAccountContext,
    provider: RegistrarOwnedDomainProvider,
    request: RegistrarOwnedDomainSyncRequest
  ): Promise<RegistrarOwnedDomainSyncReport> {
    const evidenceReference = createRegistrarSyncEvidence(provider.identifier)
    if (request.mode !== 'MANUAL' || !evidenceReference)
      throw new RegistrarSyncError('REGISTRAR_SYNC_FAILED')

    let inventory: Readonly<{
      facts: readonly RegistrarOwnedDomainFact[]
      truncated: boolean
    }>
    try {
      inventory = await this.fetchInventory(provider, request.signal)
    } catch (error) {
      if (error instanceof RegistrarSyncError) throw error
      throw new RegistrarSyncError('REGISTRAR_SYNC_FAILED', { cause: error })
    }
    const normalized = new Map<string, RegistrarOwnedDomainFact>()
    let skippedInvalidCount = 0
    let duplicateCount = 0

    for (const fact of inventory.facts) {
      const normalizedFact = normalizeRegistrarAssociationFact(
        fact,
        provider.identifier
      )
      if (!normalizedFact) {
        skippedInvalidCount += 1
        continue
      }
      if (normalized.has(normalizedFact.normalizedHostname)) {
        duplicateCount += 1
        continue
      }
      normalized.set(normalizedFact.normalizedHostname, normalizedFact)
    }

    const domains = Object.freeze(
      [...normalized.keys()].sort((a, b) => a.localeCompare(b))
    )
    const confirmedAt = this.clock().toISOString()

    try {
      return await this.unitOfWork.run(async (repositories) => {
        const existingDomains = await repositories.ownedDomains.list(context)
        const existingByHostname = new Map(
          existingDomains.map((domain) => [domain.normalizedHostname, domain])
        )
        let createdCount = 0
        let existingCount = 0

        const seenOwnedDomainIds: string[] = []
        for (const hostname of domains) {
          let ownedDomain = existingByHostname.get(hostname)
          if (ownedDomain) {
            existingCount += 1
          } else {
            ownedDomain = await repositories.ownedDomains.create(context, {
              normalizedHostname: hostname,
              status: 'active',
              ownership: {
                confirmed: true,
                confirmedAt,
                evidenceReference,
              },
            })
            existingByHostname.set(hostname, ownedDomain)
            createdCount += 1
          }

          const fact = normalized.get(hostname)!
          await repositories.registrarAssociations.observe(context, {
            ownedDomainId: ownedDomain.id,
            providerIdentifier: provider.identifier,
            providerDomainIdentifier: fact.providerDomainIdentifier,
            registrarStatus: fact.status,
            expiresAt: fact.expiresAt,
            autoRenew: fact.autoRenew,
            observedAt: confirmedAt,
            provenanceReference: evidenceReference,
          })
          seenOwnedDomainIds.push(ownedDomain.id)
        }

        const missingFromProviderCount = inventory.truncated
          ? null
          : await repositories.registrarAssociations.markMissingAfterCompleteSync(
              context,
              {
                providerIdentifier: provider.identifier,
                seenOwnedDomainIds,
                syncedAt: confirmedAt,
              }
            )

        return freezeRegistrarSyncReport({
          provider: provider.identifier,
          fetchedCount: inventory.facts.length,
          uniqueCount: domains.length,
          createdCount,
          existingCount,
          skippedInvalidCount,
          duplicateCount,
          missingFromProviderCount,
          truncated: inventory.truncated,
          warningCode: inventory.truncated ? 'REGISTRAR_SYNC_TRUNCATED' : null,
          domains,
        })
      })
    } catch (error) {
      if (error instanceof RegistrarSyncError) throw error
      throw new RegistrarSyncError('REGISTRAR_SYNC_FAILED', { cause: error })
    }
  }

  private async fetchInventory(
    provider: RegistrarOwnedDomainProvider,
    signal?: AbortSignal
  ): Promise<Readonly<{ facts: readonly RegistrarOwnedDomainFact[]; truncated: boolean }>> {
    const facts: RegistrarOwnedDomainFact[] = []
    const visitedCursors = new Set<string>()
    let cursor: string | null = null

    for (let pageNumber = 0; pageNumber < REGISTRAR_OWNED_DOMAIN_SYNC_POLICY.maxPages; pageNumber += 1) {
      if (pageNumber > 0)
        await this.delay(
          REGISTRAR_OWNED_DOMAIN_SYNC_POLICY.minimumPageStartIntervalMs
        )

      const page = await provider.listOwnedDomains({ cursor, signal })
      const remaining =
        REGISTRAR_OWNED_DOMAIN_SYNC_POLICY.maxFetchedDomains - facts.length
      facts.push(...page.domains.slice(0, remaining))

      if (page.domains.length > remaining)
        return Object.freeze({ facts: Object.freeze(facts), truncated: true })
      if (page.nextCursor === null)
        return Object.freeze({ facts: Object.freeze(facts), truncated: false })
      if (visitedCursors.has(page.nextCursor))
        throw new RegistrarSyncError('REGISTRAR_RESPONSE_INVALID')

      visitedCursors.add(page.nextCursor)
      cursor = page.nextCursor

      if (
        facts.length >= REGISTRAR_OWNED_DOMAIN_SYNC_POLICY.maxFetchedDomains ||
        pageNumber + 1 >= REGISTRAR_OWNED_DOMAIN_SYNC_POLICY.maxRequests
      )
        return Object.freeze({ facts: Object.freeze(facts), truncated: true })
    }

    return Object.freeze({ facts: Object.freeze(facts), truncated: true })
  }
}
