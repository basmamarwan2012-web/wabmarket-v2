import type { DiscoveryProviderRequest } from '@/types/discovery-provider'

export interface OpenDiscoveryTestRequest extends DiscoveryProviderRequest {
  readonly mode: 'business_upgrade'
  readonly criteria: Readonly<{
    keyword: string
    city: string
    state: string | null
    country: string
  }>
}

export interface OpenDiscoveryTestResult {
  readonly provider: 'open_discovery'
  readonly elementsReceived: number
  readonly nodes: number
  readonly ways: number
  readonly relations: number
  readonly recordsWithWebsite: number
  readonly recordsWithName: number
  readonly recordsWithCoordinates: number
  readonly durationMs: number
}

export type OpenDiscoveryTimeoutDiagnosticCategory =
  | 'client_timeout'
  | 'server_timeout_504'
  | 'server_runtime_timeout'
  | 'unknown_timeout'

export interface OpenDiscoveryTimeoutDiagnostic {
  readonly category: OpenDiscoveryTimeoutDiagnosticCategory
  readonly httpStatus?: 504
}
