import { evaluateDomainPreparationChecklist } from './checklist'
import { normalizeDomainPreparationInput } from './preparation.helpers'
import type {
  DomainPreparation,
  DomainPreparationInput,
} from './preparation.types'

export const createDomainPreparation = (
  input: DomainPreparationInput
): DomainPreparation | null => {
  const normalized = normalizeDomainPreparationInput(input)
  if (!normalized) return null

  return Object.freeze({
    hostname: normalized.hostname,
    ownershipConfirmed: normalized.ownershipConfirmed,
    sourceOpportunityId: normalized.sourceOpportunityId,
    preparation: normalized.preparation,
    readiness: evaluateDomainPreparationChecklist(normalized),
  })
}

export type {
  DomainPreparation,
  DomainPreparationChecklistResult,
  DomainPreparationFacts,
  DomainPreparationInput,
  DomainPreparationReadiness,
  DomainPreparationRequirement,
  PreparationAssetFact,
  PreparationDescriptionFact,
  PreparationSalesFact,
} from './preparation.types'

