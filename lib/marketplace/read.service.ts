import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import type { MarketplaceReadRepository } from './read.repository'
import type {
  ListPublishedMarketplaceInput,
  MarketplaceReadServiceContract,
} from './read.service.types'

const cloneAndFreeze = <T>(value: T): T => {
  const clone = structuredClone(value)

  const freeze = (item: unknown): void => {
    if (item === null || typeof item !== 'object' || Object.isFrozen(item)) return
    for (const nested of Object.values(item)) freeze(nested)
    Object.freeze(item)
  }

  freeze(clone)
  return clone
}

/** Provider-neutral application boundary for public marketplace reads. */
export class MarketplaceReadService implements MarketplaceReadServiceContract {
  constructor(private readonly repository: MarketplaceReadRepository) {}

  async listPublished(input: ListPublishedMarketplaceInput = {}) {
    const page = await this.repository.listPublished(input)
    return cloneAndFreeze(page)
  }

  async resolvePublishedHostname(hostname: string) {
    const normalizedHostname = normalizeHostname(hostname)
    if (!normalizedHostname) return null

    const record = await this.repository.findPublishedByHostname(
      normalizedHostname
    )
    return record === null ? null : cloneAndFreeze(record)
  }
}

export type {
  ListPublishedMarketplaceInput,
  MarketplaceReadServiceContract,
} from './read.service.types'
