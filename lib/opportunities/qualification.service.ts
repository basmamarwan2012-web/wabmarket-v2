import 'server-only'

import { generateCandidateDomains } from '../candidate-domains/generator'
import type { DomainAvailabilityProvider } from '../domain-availability/provider'
import { DomainAvailabilityService } from '../domain-availability/service'
import type { DomainAvailabilityLookupContext } from '../domain-availability/types'
import { createCanonicalOpportunity } from './model'
import {
  freezeForwardQualificationReport,
  selectForwardQualificationCandidates,
} from './qualification.helpers'
import type {
  ForwardOpportunityQualificationInput,
  ForwardOpportunityQualificationReport,
} from './qualification.types'

export class ForwardOpportunityQualificationService {
  private readonly availabilityService: DomainAvailabilityService

  constructor(private readonly provider: DomainAvailabilityProvider) {
    this.availabilityService = new DomainAvailabilityService(provider)
  }

  async qualify(
    input: ForwardOpportunityQualificationInput,
    context: Readonly<DomainAvailabilityLookupContext> = {}
  ): Promise<ForwardOpportunityQualificationReport> {
    const generated = generateCandidateDomains({
      businessName: input.businessName,
      primaryKeyword: input.primaryKeyword,
      city: input.city,
      country: input.country,
    })
    if (!generated)
      throw new TypeError('Forward opportunity qualification input is invalid.')

    const selected = selectForwardQualificationCandidates(
      generated.candidates,
      this.provider.limits.maxCandidatesPerLookup
    )
    if (selected.length === 0)
      return freezeForwardQualificationReport({
        generatedCandidateCount: generated.candidates.length,
        checkedCandidateCount: 0,
        opportunities: Object.freeze([]),
      })

    const availability = await this.availabilityService.lookup(
      Object.freeze(selected.map((candidate) => candidate.hostname)),
      context
    )
    const opportunities = []

    for (let index = 0; index < selected.length; index += 1) {
      const availabilityFact = availability[index]
      if (availabilityFact.availabilityStatus !== 'AVAILABLE') continue

      const candidate = selected[index]
      const opportunity = createCanonicalOpportunity({
        businessName: input.businessName,
        businessPlaceId: input.businessPlaceId,
        primaryType: input.primaryType,
        city: input.city,
        state: input.state,
        country: input.country,
        currentHostname: input.currentHostname,
        candidateHostname: candidate.hostname,
        candidatePatternId: candidate.patternId,
        flipScore: input.flipScore,
        availability: availabilityFact,
        discoveryMode: 'BUSINESS_FIRST',
        discoveredAt: input.discoveredAt,
      })
      if (!opportunity)
        throw new TypeError(
          'Canonical opportunity construction rejected qualified input.'
        )
      opportunities.push(opportunity)
    }

    return freezeForwardQualificationReport({
      generatedCandidateCount: generated.candidates.length,
      checkedCandidateCount: selected.length,
      opportunities,
    })
  }
}

export type {
  ForwardOpportunityQualificationInput,
  ForwardOpportunityQualificationReport,
} from './qualification.types'
