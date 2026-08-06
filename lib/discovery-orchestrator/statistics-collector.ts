import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'

export type StatisticsEvent =
  | 'provider_selected' | 'provider_skipped' | 'provider_success' | 'provider_failure'
  | 'failover_occurred' | 'cache_hit' | 'cache_miss' | 'quota_denied'
  | 'budget_denied' | 'health_denied'

export interface StatisticsMeasurement { providerIdentifier?: DiscoveryProviderIdentifier; durationMs?: number; resultCount?: number; acquisitionOfferCount?: number; estimatedRequestCost?: number; actualRequestCost?: number; currency?: string | null }
export interface StatisticsCollector { record(event: StatisticsEvent, measurement?: Readonly<StatisticsMeasurement>): Promise<void> }
