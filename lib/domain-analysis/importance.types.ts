import type { DomainSignals } from './signals.types'

export const SIGNAL_IMPORTANCE_LEVELS = Object.freeze([
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'NEUTRAL',
] as const)

export type SignalImportanceLevel =
  (typeof SIGNAL_IMPORTANCE_LEVELS)[number]

export interface SignalImportanceMetadata {
  readonly active: boolean
  readonly importance: SignalImportanceLevel
}

export interface DomainSignalImportanceInput {
  readonly signals: DomainSignals
}

export interface DomainQualityImportance {
  readonly nonDotCom: SignalImportanceMetadata
  readonly hasHyphen: SignalImportanceMetadata
  readonly hasDigits: SignalImportanceMetadata
  readonly hasSubdomain: SignalImportanceMetadata
}

export interface BrandAlignmentImportance {
  readonly branded: SignalImportanceMetadata
  readonly partiallyBranded: SignalImportanceMetadata
  readonly genericKeyword: SignalImportanceMetadata
  readonly unrelated: SignalImportanceMetadata
}

export interface BusinessNamingImportance {
  readonly containsLegalSuffix: SignalImportanceMetadata
}

export interface DomainCompositionImportance {
  readonly compactBrandDomain: SignalImportanceMetadata
  readonly keywordOnlyDomain: SignalImportanceMetadata
  readonly cityOnlyDomain: SignalImportanceMetadata
}

export interface DomainSignalImportance {
  readonly domainQuality: DomainQualityImportance
  readonly brandAlignment: BrandAlignmentImportance
  readonly businessNaming: BusinessNamingImportance
  readonly domainComposition: DomainCompositionImportance
}
