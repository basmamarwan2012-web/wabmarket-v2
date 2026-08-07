export const GOOGLE_PLACES_TEXT_SEARCH_FIELD_MASK_FIELDS = Object.freeze([
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.primaryType',
  'places.types',
  'places.businessStatus',
  'places.websiteUri',
  'places.pureServiceAreaBusiness',
] as const)

export const GOOGLE_PLACES_TEXT_SEARCH_FIELD_MASK =
  GOOGLE_PLACES_TEXT_SEARCH_FIELD_MASK_FIELDS.join(',')
