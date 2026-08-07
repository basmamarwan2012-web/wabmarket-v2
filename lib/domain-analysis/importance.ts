import { createSignalImportanceMetadata } from './importance.helpers'
import type {
  DomainSignalImportance,
  DomainSignalImportanceInput,
} from './importance.types'

export const createDomainSignalImportance = (
  input: DomainSignalImportanceInput
): DomainSignalImportance =>
  Object.freeze({
    domainQuality: Object.freeze({
      nonDotCom: createSignalImportanceMetadata(
        input.signals.domainQuality.nonDotCom,
        'HIGH'
      ),
      hasHyphen: createSignalImportanceMetadata(
        input.signals.domainQuality.hasHyphen,
        'HIGH'
      ),
      hasDigits: createSignalImportanceMetadata(
        input.signals.domainQuality.hasDigits,
        'MEDIUM'
      ),
      hasSubdomain: createSignalImportanceMetadata(
        input.signals.domainQuality.hasSubdomain,
        'NEUTRAL'
      ),
    }),
    brandAlignment: Object.freeze({
      branded: createSignalImportanceMetadata(
        input.signals.brandAlignment.branded,
        'NEUTRAL'
      ),
      partiallyBranded: createSignalImportanceMetadata(
        input.signals.brandAlignment.partiallyBranded,
        'MEDIUM'
      ),
      genericKeyword: createSignalImportanceMetadata(
        input.signals.brandAlignment.genericKeyword,
        'HIGH'
      ),
      unrelated: createSignalImportanceMetadata(
        input.signals.brandAlignment.unrelated,
        'CRITICAL'
      ),
    }),
    businessNaming: Object.freeze({
      containsLegalSuffix: createSignalImportanceMetadata(
        input.signals.businessNaming.containsLegalSuffix,
        'NEUTRAL'
      ),
    }),
    domainComposition: Object.freeze({
      compactBrandDomain: createSignalImportanceMetadata(
        input.signals.domainComposition.compactBrandDomain,
        'NEUTRAL'
      ),
      keywordOnlyDomain: createSignalImportanceMetadata(
        input.signals.domainComposition.keywordOnlyDomain,
        'HIGH'
      ),
      cityOnlyDomain: createSignalImportanceMetadata(
        input.signals.domainComposition.cityOnlyDomain,
        'HIGH'
      ),
    }),
  })

export type {
  BrandAlignmentImportance,
  BusinessNamingImportance,
  DomainCompositionImportance,
  DomainQualityImportance,
  DomainSignalImportance,
  DomainSignalImportanceInput,
  SignalImportanceLevel,
  SignalImportanceMetadata,
} from './importance.types'
