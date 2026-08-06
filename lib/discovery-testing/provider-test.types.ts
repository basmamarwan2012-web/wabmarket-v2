import type {
  DiscoveryProviderRequest,
  DiscoveryProviderResult,
} from '@/types/discovery-provider'
import type { GoogleQualityDiagnostics } from '@/lib/discovery-providers/providers/google-result-quality'

export interface GoogleProviderTestRequest extends DiscoveryProviderRequest {
  readonly mode: 'business_upgrade' | 'local_seo'
}

export interface GoogleProviderTestResult {
  readonly providerResult: DiscoveryProviderResult
  readonly diagnostics: GoogleQualityDiagnostics
}
