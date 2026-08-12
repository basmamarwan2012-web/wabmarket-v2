export const CANDIDATE_DOMAIN_PATTERNS = Object.freeze([
  Object.freeze({ id: 'brand', segments: Object.freeze(['brand']) }),
  Object.freeze({
    id: 'brand_keyword',
    segments: Object.freeze(['brand', 'keyword']),
  }),
  Object.freeze({
    id: 'brand_keyword_city',
    segments: Object.freeze(['brand', 'keyword', 'city']),
  }),
  Object.freeze({
    id: 'city_brand_keyword',
    segments: Object.freeze(['city', 'brand', 'keyword']),
  }),
  Object.freeze({
    id: 'keyword_brand',
    segments: Object.freeze(['keyword', 'brand']),
  }),
  Object.freeze({
    id: 'brand_experts',
    segments: Object.freeze(['brand', 'experts']),
  }),
  Object.freeze({
    id: 'brand_pros',
    segments: Object.freeze(['brand', 'pros']),
  }),
  Object.freeze({
    id: 'brand_services',
    segments: Object.freeze(['brand', 'services']),
  }),
  Object.freeze({
    id: 'brand_solutions',
    segments: Object.freeze(['brand', 'solutions']),
  }),
  Object.freeze({
    id: 'brand_group',
    segments: Object.freeze(['brand', 'group']),
  }),
  Object.freeze({
    id: 'keyword_experts',
    segments: Object.freeze(['keyword', 'experts']),
  }),
  Object.freeze({
    id: 'keyword_pros',
    segments: Object.freeze(['keyword', 'pros']),
  }),
  Object.freeze({
    id: 'keyword_services',
    segments: Object.freeze(['keyword', 'services']),
  }),
  Object.freeze({
    id: 'keyword_group',
    segments: Object.freeze(['keyword', 'group']),
  }),
] as const)

export type CandidateDomainPattern =
  (typeof CANDIDATE_DOMAIN_PATTERNS)[number]
export type CandidateDomainPatternId = CandidateDomainPattern['id']
export type CandidateDomainPatternSegment =
  CandidateDomainPattern['segments'][number]

export const APPROVED_CANDIDATE_GENERIC_WORDS = Object.freeze([
  'experts',
  'pros',
  'services',
  'solutions',
  'group',
] as const)
