import 'server-only'

import type { ProviderStatisticsEvent } from '@/types/provider-statistics'

export interface StatisticsCollector {
  record(event: Readonly<ProviderStatisticsEvent>): Promise<void>
}
