import 'server-only'

import { analyzeDomainOpportunity } from '../domain-analysis/analyzer'
import { compareBrandToDomain } from '../domain-analysis/comparator'
import { analyzeDomainComposition } from '../domain-analysis/domain-composition'
import { createDomainSignalImportance } from '../domain-analysis/importance'
import { createDomainSignals } from '../domain-analysis/signals'
import type { DomainAvailabilityProvider } from '../domain-availability/provider'
import { DynadotDomainAvailabilityProvider } from '../domain-availability/providers/dynadot.provider'
import { calculateFlipScore } from '../flipscore/engine'
import { createFlipScorePolicy } from '../flipscore/policy'
import { createFlipScoreWeightPolicy } from '../flipscore/weights'
import { ForwardOpportunityQualificationService } from './qualification.service'
import type {
  OpportunityQualificationSafeResult,
  OpportunityQualificationTestInput,
  OpportunityQualificationTestReport,
} from './qualification-test.types'

const invalidAnalysis = (): never => {
  throw new TypeError('Opportunity qualification test input is invalid.')
}

export const createOpportunityQualificationTestReport = async (
  input: OpportunityQualificationTestInput,
  provider: DomainAvailabilityProvider,
  discoveredAt: string
): Promise<OpportunityQualificationTestReport> => {
  const analyzed = analyzeDomainOpportunity({
    businessName: input.businessName,
    domain: input.currentDomain,
  })
  if (!analyzed.success) return invalidAnalysis()

  const comparison = compareBrandToDomain({
    analysis: analyzed.analysis,
    primaryKeyword: input.keyword,
    city: input.city,
  })
  if (!comparison) return invalidAnalysis()

  const signals = createDomainSignals({
    analysis: analyzed.analysis,
    comparison,
  })
  const importance = createDomainSignalImportance({ signals })
  const composition = analyzeDomainComposition({
    analysis: analyzed.analysis,
    primaryKeyword: input.keyword,
    city: input.city,
  })
  if (!composition) return invalidAnalysis()

  const policy = createFlipScorePolicy({
    importance,
    composition,
    signals,
    comparison,
  })
  const weights = createFlipScoreWeightPolicy({ policy })
  const score = calculateFlipScore({ policy, weights })
  const qualification = await new ForwardOpportunityQualificationService(
    provider
  ).qualify({
    businessName: input.businessName,
    businessPlaceId: input.placeId,
    primaryType: input.primaryType,
    city: input.city,
    state: input.state,
    country: input.country,
    currentHostname: analyzed.analysis.domain.hostname,
    flipScore: score,
    primaryKeyword: input.keyword,
    discoveredAt,
  })

  const opportunities = Object.freeze(
    qualification.opportunities.map(
      (opportunity): OpportunityQualificationSafeResult =>
        Object.freeze({
          opportunityId: opportunity.opportunityId,
          candidateHostname: opportunity.candidateHostname,
          candidatePatternId: opportunity.candidatePatternId,
          availabilityStatus: 'AVAILABLE',
          provider: opportunity.availability.provider,
          flipScore: opportunity.flipScore,
          priority: opportunity.priority,
        })
    )
  )

  return Object.freeze({
    business: analyzed.analysis.business.originalBusinessName,
    currentDomain: analyzed.analysis.domain.hostname,
    flipScore: score.flipScore,
    priority: score.priority,
    generatedCandidateCount: qualification.generatedCandidateCount,
    checkedCandidateCount: qualification.checkedCandidateCount,
    availableCandidateCount: qualification.availableCandidateCount,
    opportunities,
  })
}

export const executeOpportunityQualificationTest = (
  input: OpportunityQualificationTestInput
) =>
  createOpportunityQualificationTestReport(
    input,
    new DynadotDomainAvailabilityProvider(),
    new Date().toISOString()
  )

export type {
  OpportunityQualificationSafeResult,
  OpportunityQualificationTestInput,
  OpportunityQualificationTestReport,
} from './qualification-test.types'
