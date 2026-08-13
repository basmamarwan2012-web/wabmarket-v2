# WABMARKET CHANGELOG

---

## Phase B Owned Domains

### Added

- server-only Owned Domains repository and API service boundary;
- canonical snake_case persistence with backward-compatible read mapper;
- transactional tenant name reservations;
- prefix search, filters, sorting, and cursor pagination;
- create, detail, edit, move-to-trash, trash, and restore UI;
- atomic activities, timelines, logs, and analytics updates;
- administrator/manager/operator/viewer enforcement;
- Firestore rule and index deployment configuration.

### Terminology

- lifecycle archive uses `domain_archived`;
- soft deletion uses `domain_deleted` and “Move to trash” UI wording;
- trash recovery uses `domain_restored`.

---

## Phase B stabilization

### Fixed

- resolved tenant-owner actor names/emails without exposing full UIDs as the
  primary UI label;
- added immutable actor display snapshots while retaining authoritative UIDs;
- added bidirectional indexes for the supported domain query matrix;
- added optimistic trash/restore with rollback and background reconciliation;
- removed mutation post-commit rereads;
- added abortable list requests and debounced prefix search;
- added structured API diagnostics and safe missing-index responses.

### Query limitation

To avoid excessive composite indexes, search, status, and registrar filters are
mutually exclusive and filtered results use created-date sorting only.

---

## Phase A security foundation

### Added

- server-side registration with viewer as the public default;
- synchronized Firebase browser authentication and server session cookies;
- verified Node.js `/admin` boundary and centralized RBAC;
- UID-isolated Firestore and Storage rules;
- explicit first-administrator bootstrap tooling.

### Architecture decision

- `users/{uid}/...` is the authoritative Firestore SaaS v2 hierarchy;
- custom claims are authoritative and Firestore roles are server-controlled
  mirrors.

---

## Version 1.0.0

### Added

- Next.js architecture
- Firebase integration
- Gmail integration
- Dynadot integration
- FlipScore engine
- AI branding engine
- lead generation engine
- CRM pipeline
- deployment architecture

---

## Version 1.1.0

### Added

- AI negotiation engine
- advanced analytics
- landing page generation

---

## Version 1.2.0

### Added

- webhook support
- additional providers
- advanced automation

---

## Status values

```text
planned

in progress

testing

completed

deprecated
```

---

## Priority values

```text
low

medium

high

critical
```

# Phase B.5 - UX and loading experience

- Added one application-level UX provider with reference-counted loading,
  delayed foreground overlays, concurrent progress, and prioritized messages.
- Added guarded route transition links, destination-shaped skeletons, reusable
  spinners, and bounded accessible toast notifications.
- Added operation feedback for domain create, update, trash, restore, filter,
  refresh, and search flows while retaining optimistic rollback and request
  cancellation.
- Added reduced-motion behavior. No API, Firestore, authentication, RBAC,
  pagination, or business-permission behavior changed.

# Phase C.1 - Discovery Engine Foundation

- Added tenant-scoped discovery job models, snake_case persistence mapper,
  validation, lifecycle transition engine, opaque cursor pagination, RBAC, and
  structured APIs.
- Added atomic discovery/activity/timeline/log transactions for creation,
  processing, manual progress, completion, failure, and cancellation.
- Added Discovery Jobs list, create, and detail routes under the Opportunities
  product navigation with Phase B.5 loading, toast, progress, and skeleton UX.
- Added type-only Opportunity contracts without persistence, APIs, scoring, or
  generated records.
- Added tenant discovery reads and denied direct client writes in Firestore
  rules. Firebase Admin writes remain authorized by server API checks.
- No external search, AI, BullMQ, Redis, crawler, email, lead-generation, or
  background processing was implemented.

# Phase C.1.5 - Discovery UX and product structure

- Established `/admin/discovery` as the canonical Domain Discovery route and
  separated it from the future-results Opportunities destination.
- Renamed user-facing discovery concepts to Domain Search terminology and added
  friendly status labels, badges, result counts, product copy, and empty states.
- Renamed Domains navigation to Portfolio and added the exact product navigation
  order, including a minimal unavailable Campaigns page.
- Converted former discovery child routes below `/admin/opportunities` into
  temporary query-preserving permanent redirects to `/admin/discovery`.
- Added no API, schema, lifecycle, audit, permission, Firebase, external
  provider, or opportunity-generation behavior.

# Phase C.2.0 - Discovery provider architecture

- Added server-only provider contracts, capability metadata, extensible search
  modes, acquisition statuses, execution context separation, and strict
  canonical normalized results.
- Added a constructor-injected Discovery Engine with support validation,
  monotonic duration measurement, safe provider-error wrapping, and normalized
  item validation.
- Added an instance-scoped provider registry with duplicate and unknown-provider
  errors and no provider-specific switches or global mutable state.
- Added dormant Google and Dynadot provider classes whose search methods throw
  `PROVIDER_NOT_IMPLEMENTED`; neither reads credentials nor performs network or
  SDK calls.
- The architecture is not wired to APIs, lifecycle, Firestore, UI, or legacy
  services. It performs no search and generates no opportunities. Phase C.2.1
  remains the first real-provider integration phase.

# Phase C.2.0.5-A - Dormant discovery and acquisition orchestration

- Added server-only orchestration contracts for priority fallback and parallel
  acquisition aggregation with explicit constructor-injected dependencies.
- Added provider categories, policy and eligibility boundaries, typed quota,
  budget, health, cache, fingerprint, statistics, and failover contracts.
- Added canonical acquisition offers and intelligence that keep registration
  availability separate from acquisition availability, preserve all channels,
  and support partial provider success through typed coverage diagnostics.
- Added immutable safe defaults that disable every provider and make paid
  request execution impossible. Provider-request cost remains separate from
  domain acquisition price.
- This phase contains no working orchestration, external access, provider
  execution, persistence, fake results, pricing, cache, quotas, budgets, or
  failover. Real tracking and execution remain future phases.

# Phase C.2.0.5-B - Dormant provider policy foundation

- Split provider policy into immutable declaration, tenant restriction, usage,
  statistics-event, quota, budget, health, cache, and eligibility contracts.
- Added inactive default factories, optional priority/weight settings, typed
  policy validation errors, and deterministic blocking eligibility reasons.
- Added opaque, idempotency-aware quota and budget reservation lifecycles for
  future atomic persistence without implementing counters or storage.
- Preserved zero-cost free-tier eligibility despite zero paid budgets while
  making unknown or potentially paid request cost fail closed by default.
- Kept provider capabilities adapter-authoritative, cache fingerprints separate
  from namespaces, and provider-request costs separate from acquisition prices.
- No provider execution, persistence, API/UI integration, external access,
  pricing implementation, cache, monitoring, or orchestrator connection was
  added. All providers remain inactive.

# Phase C.2.0.5-C - Dormant persistence contracts

- Added storage-neutral, versioned persistence document contracts for provider
  configuration, tenant restrictions, usage snapshots, statistics events,
  quota and budget reservations, health history, and cache metadata.
- Added server-only repository interfaces with trusted tenant context,
  domain-specific methods, bounded history reads, and explicit reservation
  terminal transitions.
- Kept usage snapshots immutable, statistics append-only, cached payloads out
  of scope, and raw reservation tokens out of persistence documents.
- Added no database implementation, Firebase/Firestore integration, storage,
  runtime mapper, collection, API/UI integration, or provider execution.

# Phase C.2.0.6 - Dormant discovery composition

- Added a server-only composition factory that creates a fresh, constructor-
  injected discovery graph on every call and returns a typed frozen container.
- Registered the dormant Google and Dynadot adapters without credential reads,
  provider-method calls, activation, or capability duplication.
- Added a read-only provider metadata view, pure eligibility wrapper, inactive
  policy manager, dormant supporting services, and an engine gateway that
  blocks before any provider or policy execution.
- Kept raw engines, provider adapters, mutable registry implementation, and
  internal construction services out of the public composition API.
- No API/lifecycle integration, persistence, environment access, network call,
  provider execution, timer, worker, or background work was added. Registered
  providers remain disabled.

# Phase C.2.1-A - Disconnected Google web-search adapter

- Replaced the Google provider stub with a native-fetch Custom Search JSON API
  adapter supporting one request, 1-10 results, allowlisted language
  restrictions, caller cancellation, and a 10-second timeout.
- Added lazy server-only configuration and sanitized mappings for missing
  configuration, HTTP failure, timeout, cancellation, invalid response, quota,
  throttling, and network failure.
- Normalized Google links as current websites/domains and titles as source
  titles. Candidate domains, verified business names, location facts, and
  acquisition availability are not inferred.
- The adapter remains disconnected from composition execution, APIs, UI,
  lifecycle, persistence, and opportunity generation. No product route can
  issue a Google request or incur Google API cost.
- Documented Google Custom Search as temporary, closed to new customers, and
  scheduled for discontinuation for existing eligible customers on January 1,
  2027. Open Discovery remains the planned free fallback.

# Phase C.2.1-B - Controlled internal Google validation

- Added conservative Google query profiles with controlled exclusions and OR
  terms, allowlisted language restrictions, `safe=active`, and `filter=1`.
- Added a pure local quality gate with explicit scoring weights, a fixed
  experimental 65/100 threshold, narrow exact/subdomain host blocking,
  non-website/file rejection, and deterministic exact-host deduplication.
- Added one-pass normalization diagnostics and a fresh Google-only internal
  execution capability while keeping production composition dormant.
- Added an explicit `tsx`-backed manual command that requires live-request
  confirmation before environment loading or service import. One confirmed
  invocation performs at most one request and prints only safe diagnostics and
  accepted summaries.
- Added no API/UI/lifecycle integration, retry, pagination, persistence,
  opportunity generation, crawler, AI, or Dynadot execution. Accepted results
  remain heuristic web results and may be empty.

# Google Custom Search failure diagnostics

- Added temporary manual-CLI-only HTTP failure diagnostics through an internal
  diagnostic channel subscribed after explicit confirmation and environment
  loading.
- Limited diagnostic output to provider, HTTP status, Google code/status/reason,
  and a strict allowlisted category. Raw Google messages, response payloads,
  credentials, request URLs, headers, stacks, and internal causes remain
  undisclosed.
- Preserved existing sanitized provider errors and request behavior. No retry,
  additional request, API/UI exposure, persistence, lifecycle integration, or
  provider-result field was added.

# Phase C.2.2-A - Open Discovery provider foundation

- Added the known `open_discovery` provider identifier and a server-only typed
  provider stub for `business_upgrade` and `local_seo` with pure required-
  criteria validation.
- Added immutable source/configuration defaults that keep free, zero-request-
  cost metadata separate from `business_discovery` capability semantics and
  contain no provider activation or policy state.
- Added minimal dormant raw-response types plus pure whitespace, hostname, and
  source-record helper boundaries without selecting or modeling a real source.
- The provider performs no request, returns no data, remains unregistered and
  inactive, and is not connected to composition, orchestration, APIs, UI,
  lifecycle, persistence, or testing. A future phase must select the first real
  free open-data source.

# Phase C.2.2-B - Isolated Overpass transport investigation

- Added deterministic, injection-resistant Overpass QL construction for the
  currently executable `business_upgrade` mode. The query uses conservative
  exact-name administrative-area nesting, four allowlisted text tags, and a
  website-tag requirement without speculative keyword/category mappings.
- Added one server-only native-fetch POST boundary with URL-encoded form data,
  fixed endpoint configuration, a 10-second server timeout, a 12-second client
  timeout, and a deterministic 50-element ceiling. No geocoder, retry,
  pagination, batching, endpoint rotation, or secondary request was added.
- Added narrow raw Overpass types and structural validation for node, way, and
  relation records, finite IDs/coordinates, string tags, ignored unknown
  fields, and valid empty responses.
- Added sanitized mappings for unsupported input, caller cancellation, client
  or HTTP 504 timeout, HTTP 429 throttling, other HTTP failures, malformed
  successful responses, and network failures. Raw HTML/JSON error bodies,
  query text, endpoints, and arbitrary provider payloads are not exposed.
- Narrowed the provider's authoritative executable capability from the earlier
  future-planning mode set to `business_upgrade` only. Free-text matching and
  exact area names remain incomplete and potentially ambiguous.
- Kept normalization frozen and empty and left the provider unregistered. No
  composition, product API/UI, lifecycle, Firebase, persistence, opportunity,
  Google, or Dynadot integration changed; no product path executes Overpass.
  Controlled manual coverage testing remains a future phase, and this work is
  not a production-readiness claim.

# Phase C.2.2-C - Manual Overpass investigation CLI

- Added a manually invoked, confirmation-gated `test:open-discovery` command
  for `business_upgrade` criteria. Argument validation and confirmation occur
  before the server-only test service and provider are dynamically imported;
  no environment file or credential configuration is read.
- Added an isolated service that constructs a fresh Open Discovery provider,
  measures only one `search()` execution with a monotonic clock, and performs
  no retry, pagination, normalization, composition, orchestration, persistence,
  lifecycle transition, or opportunity generation.
- Added typed, aggregate-only diagnostics for raw element/type counts and
  records containing a name, website, or usable coordinate pair. Runtime
  invariants keep counts integral, non-negative, bounded, and consistent with
  the total element count; zero elements is a valid result.
- Limited output to one compact JSON result or a sanitized allowlisted error.
  Raw OSM records, tags, query text, endpoint details, locations, URLs, contact
  data, payloads, stack traces, and internal causes are never printed.
- Each confirmed invocation consumes exactly one public Overpass request and
  is intended only for manual engineering evaluation. The command is never run
  automatically, stores no data, creates no canonical result or opportunity,
  and does not make the disconnected provider available to the product.

# Isolated Overpass timeout diagnosis and query optimization

- Recorded that the first confirmed Miami roofing investigation ended with
  `PROVIDER_TIMEOUT`; the original output could represent either the local
  12-second abort or an HTTP 504 and did not prove which occurred.
- Replaced ambiguity-expanding area traversal with fail-closed named-set
  statistical-count guards. Country, optional state, and city must each resolve
  to exactly one administrative area before business scanning runs; otherwise
  the response contains a valid empty element set.
- Reduced the query from four node/way/relation selectors to four actual search
  branches covering only node/way records and `name`/`brand` keyword fields.
  Removed operator, description, relation, and quick-sort work while preserving
  one code-owned website-key allowlist filter.
- Reduced the serialized raw-element ceiling from 50 to 25. The ceiling does
  not limit all server scanning and is not a production reliability guarantee.
- Increased the bounded server/client timeouts from 10/12 seconds to 20/28
  seconds so a server response has more time to arrive before client abort.
  No maxsize increase, retry, pagination, second request, or endpoint fallback
  was added.
- Added manual-CLI-only timeout categories for client abort, real HTTP 504,
  strictly classified runtime-timeout remarks, and unknown timeouts. Provider
  errors remain sanitized; raw remarks, payloads, queries, endpoints, stacks,
  and causes remain private.
- Kept Open Discovery disconnected from normalization, canonical results,
  opportunities, APIs, UI, lifecycle, composition, orchestration, and
  persistence. No live request was executed while implementing this change.

# Phase C.2.2-D - Open Discovery OSM taxonomy foundation

- Recorded that the first optimized live Overpass investigation completed in
  about 2.5 seconds with a valid empty result. Transport succeeded; the result
  demonstrated the weakness of name/brand-only category retrieval.
- Added a pure immutable taxonomy containing exactly one approved entry. The
  explicit aliases `roofer`, `roofers`, `roofing`, and `roof repair` resolve to
  the established OSM selector `craft=roofer`; dash and underscore separator
  variants resolve through conservative deterministic normalization.
- Added typed source and status metadata, a readonly discriminated lookup
  result, deeply frozen taxonomy data, and a deterministic duplicate-normalized
  alias invariant for future taxonomy growth.
- Kept selector authority entirely within code-owned entries. The resolver
  accepts only a keyword, proposed/deprecated entries cannot become active
  accidentally, and unknown terms return no match without fuzzy inference,
  stemming, translation, AI, or guessed synonyms.
- Added no taxonomy/query connection, network or environment access, provider
  execution, API/UI/lifecycle integration, persistence, canonical result, or
  opportunity behavior. Structured-selector retrieval remains a future phase.

# Phase C.2.2-E - Taxonomy-aware Overpass query integration

- Connected the approved code-owned taxonomy to the isolated Overpass query
  planner after the optimized name/brand investigation completed successfully
  with zero elements.
- Added exactly two internal retrieval strategies. Approved aliases use
  `taxonomy_structured`; unknown keywords use `text_fallback` without fuzzy
  matching, inference, or guessed selectors.
- Roofing now resolves through the `roofer` entry to `craft=roofer`. Its
  structured scan contains exactly two website-bearing branches for nodes and
  ways and does not require roofing text in the OSM name or brand.
- Preserved the four node/way name/brand branches for text fallback, the fixed
  website-key allowlist, all unique-area count guards, the 20/28-second
  server/client timeouts, the 25-element ceiling, tags/center output, and the
  single-request transport boundary.
- Added safe manual diagnostics for retrieval strategy and taxonomy entry ID
  without exposing selector keys/values, query text, tags, URLs, coordinates,
  endpoints, or response payloads.
- Left canonical normalization frozen and empty and added no product API/UI,
  lifecycle, persistence, Firebase, composition, orchestration, Google,
  Dynadot, or opportunity integration. Open Discovery remains an isolated
  engineering investigation.

# Phase G.2.1 - Google Places primary discovery provider

- Added `google_places` as a distinct provider identifier without renaming,
  deleting, refactoring, or repurposing the deprecated `google` Custom Search
  adapter.
- Added a disconnected server-only Places API (New) Text Search provider for
  `business_upgrade`, with one native-fetch POST, pure service-area business
  inclusion, a fixed 20-result and one-page ceiling, a 10-second timeout, and no
  retries or automatic pagination.
- Added an immutable, caller-inaccessible field mask. Its `websiteUri` field
  triggers Text Search Enterprise pricing; wildcard masks and caller-supplied
  Google request parameters are rejected by the architecture.
- Added lazy `GOOGLE_PLACES_API_KEY` configuration without reusing Custom
  Search credentials, printing secrets, or placing credentials in request
  URLs.
- Added strict transient response validation and in-memory normalization for
  operational businesses with IDs, display names, valid HTTP/HTTPS websites,
  and unique normalized hostnames. No valid `.com` or non-hyphenated result is
  excluded by domain-shape diagnostics.
- Added local-only `.com`, non-`.com`, hyphen, and basic weakness diagnostics.
  The hostname-only hyphen check is conservative and is not eTLD+1 parsing,
  FlipScore, availability verification, or an opportunity recommendation.
- Added a confirmation-gated manual CLI that reports consistent aggregate
  counts and safe place/name/domain/type diagnostics after at most one request.
  It performs no Place Details, DNS, WHOIS, registrar, or website requests.
- Recorded the validated Miami roofing sample: 20 relevant businesses, all 20
  with websites, with 5 of 20 using non-`.com` domains. The observation is a
  sample, not a guaranteed global rate.
- Kept all Google Places content transient and added no persistence or caching.
  Place IDs are the only approved durable Google identifier, but are not stored
  in this phase.
- Left Google Places disconnected from production composition, APIs, UI,
  lifecycle, persistence, Firebase, opportunities, campaigns, background work,
  quota counters, and billing. External Google Cloud quota limits and future
  persistent Wabmarket usage protection remain required for zero-cost control.

# Phase G.2.2-A - Domain opportunity analyzer foundation

- Added five isolated pure TypeScript modules for deterministic business-name
  normalization, hostname normalization and label parsing, separate business
  and domain tokenization, fact rules, and immutable analysis composition.
- The analyzer requires both business name and domain input. Business tokens
  preserve generic terms and legal suffixes, while a separately exposed
  filtered list removes only conservatively detected trailing legal suffixes.
- Added factual detection for trailing `llc`, `inc`, `corp`, `corporation`,
  `ltd`, `limited`, `company`, and `co` business-name suffixes without treating
  them as weaknesses.
- Added conservative hostname facts for labels, rightmost and immediate-left
  positions, candidate subdomain labels, length, `.com`, non-`.com`, hyphen,
  numeric characters, and the existing basic weakness boolean.
- Kept compound domain labels intact unless an explicit dot, hyphen, or
  alphabetic/numeric boundary exists. No semantic word segmentation is
  fabricated.
- Explicitly reports that Public Suffix List resolution and authoritative
  eTLD+1 parsing are unavailable. Multi-label suffixes such as `co.uk` are not
  presented as authoritative registrable-domain splits.
- Added no score, similarity, token-overlap judgment, FlipScore, candidate
  domain, availability check, AI, provider call, network access, persistence,
  API, UI, lifecycle, composition, or opportunity generation.

# Phase G.2.2-B - Brand-to-domain comparison foundation

- Added three standalone pure TypeScript modules for comparison types, exact
  token and controlled whole-stem compact helpers, and deterministic
  classification over an existing immutable domain-analysis result.
- Requires explicit primary-keyword and city context and reuses the existing
  tokenizer output. No provider criteria, location, synonym, or semantic intent
  is inferred.
- Added only six boolean facts: brand-word, primary-keyword, city, complete
  business-token, zero-brand-token, and generic-only-token detection.
- Added exactly four immutable classifications: `BRANDED`,
  `PARTIALLY_BRANDED`, `GENERIC_KEYWORD`, and `UNRELATED`.
- Preserved the tokenizer unchanged while recognizing concatenated domains only
  when the entire normalized stem equals an ordered sequence generated from
  known business/context tokens. No arbitrary substring matching or semantic
  word inference was added, and context-only matches remain generic.
- Added no score, similarity metric, edit distance, FlipScore, candidate domain,
  availability lookup, network access, AI, provider integration, persistence,
  API, UI, lifecycle, or opportunity generation.

# Phase G.2.2-C - Weakness signals engine

- Added three isolated pure TypeScript modules defining signal types, trusted
  derivation helpers, and one immutable grouped signal result.
- Added domain-quality facts for non-`.com`, hyphen, digit, and analyzer-provided
  subdomain state without introducing new public-suffix interpretation.
- Added a mutually exclusive one-of-four projection of the existing comparator
  classification into branded, partially branded, generic-keyword, and
  unrelated booleans.
- Added the existing business legal-suffix fact plus conservative compact-brand,
  keyword-only, and city-only domain-composition facts.
- Compact-brand detection requires existing comparator brand evidence, a
  branded/partially-branded classification, and one compact token distinct from
  any exact individual business token. It performs no arbitrary substring
  inference.
- Keyword-only and city-only facts use only explicit comparator evidence and
  remain false when brand evidence or the opposite context evidence is present.
- Added no weights, severity, score, opportunity classification, FlipScore,
  candidates, availability, AI, networking, Google, Dynadot, persistence,
  provider integration, API, UI, or lifecycle behavior.

# Phase G.2.2-D - Signal importance foundation

- Added three isolated pure TypeScript modules for importance types, immutable
  metadata construction, and a grouped projection over the existing signals.
- Added only the enum labels `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, and `NEUTRAL`;
  inactive signals always resolve to neutral metadata.
- Applied the approved fixed active-signal mapping without numeric weights,
  aggregation, totals, or opportunity classification.
- Kept active subdomain state neutral because a structural subdomain alone is
  not a weakness without future hosted-platform or contextual detection.
- Kept the business-name legal-suffix fact neutral. Importance may change only
  if a future phase introduces a distinct domain-specific legal-suffix signal.
- Added no severity math, score, FlipScore, candidates, availability, AI,
  networking, providers, persistence, API, UI, lifecycle, or opportunity logic.

# Phase G.2.2-E - Domain composition intelligence

- Added three isolated pure TypeScript modules for immutable composition types,
  controlled token recognition, and deterministic fact projection over the
  existing domain analyzer output.
- Added explicit `primaryKeyword` and `city` context. Both use existing
  deterministic normalization and are never inferred from business-token
  position, provider metadata, domain text, fuzzy matching, stemming,
  translation, or AI.
- Added controlled facts for domain occurrences of `llc`, `inc`, `corp`,
  `company`, and `co`; primary-keyword and city presence; repeated keyword,
  city, and known business tokens; compact business domains; and repeated
  explicit-keyword sequences.
- Compact-label recognition requires a complete segmentation into known
  business, explicit context, or controlled legal tokens. Longest-first token
  selection and the full-label requirement prevent substring coincidences such
  as `art` in `cart`, `co` in `company`, and `inc` in `prince`.
- Defined compact brand domains only as full stems matching ordered contiguous
  sequences of at least two known non-legal business tokens. Defined keyword
  stuffing only as more than one deterministic occurrence of the explicit
  normalized keyword sequence.
- Added no weakness or importance classification, numeric weight, score,
  FlipScore, candidate generation, availability, networking, AI, provider,
  persistence, API, UI, lifecycle, or opportunity behavior.

# Phase G.2.2-F1 - FlipScore policy foundation

- Added three isolated pure TypeScript modules defining typed opportunity
  dimensions, rule priorities, semantic effects, explanation categories,
  immutable rule construction, and deterministic policy projection.
- Added the dimensions `NEED`, `IMPACT`, and `CONFIDENCE` and separated every
  rule into `OPPORTUNITY`, `PROTECTIVE`, or `INFORMATIONAL` effect semantics.
  Protective and informational rules always carry `priority: null`.
- Added opportunity explanations for brand mismatch, non-`.com`, hyphen,
  keyword-only, unrelated, domain legal-suffix, and repeated-keyword evidence.
  Added protective explanations for strong and compact branded domains without
  presenting positive evidence as opportunity urgency.
- Made generic brand mismatch, keyword-only, and unrelated explanations
  mutually exclusive where they represent the same underlying alignment gap.
  Distinct domain-shape facts may still produce separate explanations because
  they describe different evidence.
- Derived the domain legal-suffix explanation only from controlled
  domain-composition facts, never from the business-name legal-suffix signal.
  Neutral importance is not coerced into a low priority.
- Added no overall priority, score, numeric weight, total, FlipScore, ranking,
  opportunity classification, AI, networking, provider, persistence, API, UI,
  lifecycle, or recommendation behavior.

# Phase G.2.2-F2 - FlipScore weight policy

- Added three isolated pure TypeScript modules defining immutable dimension
  allocations, single-dimension rule magnitudes, overlap metadata, validation
  helpers, and an F1-policy compatibility boundary.
- Fixed the global allocations at NEED 50, IMPACT 30, and CONFIDENCE 20 with a
  module-initialization invariant requiring a total of 100.
- Configured NEED magnitude 30 for unrelated domains and 12 for keyword-only
  domains. Kept strong brand mismatch explanation-only at zero in the same
  explicit overlap group as unrelated domains, leaving eight NEED units
  deliberately unallocated rather than inventing another rule.
- Configured IMPACT magnitudes of eight for non-`.com`, eight for hyphen, four
  for domain legal suffixes, and ten for repeated primary keywords. Configured
  protective CONFIDENCE magnitudes of twelve for strong branding and eight for
  compact branding.
- Defined magnitude as directionless policy metadata. F1 effect remains the
  sole direction authority, so protective magnitudes are not positive
  opportunity contributions and no active-rule arithmetic occurs in F2.
- Added initialization validation for global allocation, known unique rule
  IDs, known dimensions, finite non-negative magnitudes, dimension caps,
  explanation-only zeroes, and overlap groups. Added F1 compatibility checks
  for complete one-to-one rule coverage and allowed owning dimensions.
- Added no scoring, addition, subtraction, active-rule normalization, overall
  priority, FlipScore, ranking, recommendation, opportunity classification,
  networking, AI, provider, persistence, API, UI, or lifecycle behavior.

# Phase G.2.2-F3 - FlipScore engine v1

- Added three isolated pure TypeScript modules for immutable score output,
  deterministic scoring helpers, explicit activation constraints, priority
  thresholds, stable reasons, and the FlipScore v1 calculation.
- Rejected largest-single-rule normalization. NEED and IMPACT now normalize
  against their maximum simultaneously active positive opportunity magnitude
  after overlap and explicit mutual-exclusivity constraints.
- Declared unrelated, keyword-only, and explanation-only strong mismatch as one
  mutually exclusive NEED family, yielding maximum simultaneous magnitude 30.
  Declared the four distinct IMPACT weaknesses independently coexistent,
  yielding maximum simultaneous magnitude 30. Uncovered positive rules fail
  closed instead of being combined speculatively.
- Added dimension normalization using
  `round(allocation * active / maximumSimultaneous)`, with per-dimension clamps.
  This preserves non-`.com` as IMPACT eight, non-`.com` plus hyphen as sixteen,
  all IMPACT weaknesses as thirty, unrelated NEED as fifty, and keyword-only
  NEED as twenty.
- Added the v1 confidence rule: zero without positive opportunity evidence;
  otherwise twenty minus active protective CONFIDENCE magnitude, clamped to
  0â€“20. Protective rules never create opportunity points.
- Added the clamped NEED + IMPACT + CONFIDENCE FlipScore and version-one LOW,
  MEDIUM, HIGH, and CRITICAL thresholds. Active F1 messages are deduplicated in
  stable order without exposing rule IDs or implementation property names.
- Documented that v1 is deterministic and explainable but not statistically
  calibrated. Magnitudes, allocations, and thresholds remain future
  calibration points independent of upstream analysis contracts.
- Added no provider, Google, Dynadot, DNS, availability, candidate generation,
  AI, network, persistence, API, UI, ranking, or recommendation integration.

# Phase G.2.2-G - Manual end-to-end FlipScore validation

- Extended the isolated Google Places test service with a pure report builder
  that runs every accepted transient result through the completed local domain
  intelligence and FlipScore pipeline.
- Reused the accepted business name and normalized hostname plus the explicit
  request keyword and city. Added no inferred context and duplicated none of
  the analyzer, comparison, signal, importance, composition, policy, magnitude,
  or scoring logic.
- Replaced per-result shape diagnostics with the requested safe scored output:
  place ID, name, domain, primary type, FlipScore, priority, immutable dimension
  breakdown, and immutable human-readable reasons.
- Added stable descending FlipScore sorting with original Google response order
  as the explicit tie-breaker. Added total accepted, priority counts, and an
  average FlipScore rounded to two decimal places while retaining useful
  aggregate domain-shape diagnostics.
- Preserved one provider search and one existing Google Places Text Search
  request per confirmed invocation. All scoring is local and transient; no
  extra request, retry, pagination, persistence, candidates, Dynadot, DNS, AI,
  opportunities, API, UI, lifecycle, or production composition behavior was
  added.

# Phase G.2.3-A - Deterministic candidate-domain generation foundation

- Added four isolated pure TypeScript modules for generator contracts, fixed
  pattern metadata, normalization/composition helpers, and immutable ordered
  candidate generation.
- Reused existing business normalization, tokenization, and legal-suffix
  analysis. Candidate context remains explicit; no abbreviation, fuzzy match,
  synonym, translation, AI, or semantic inference was introduced.
- Added exactly fourteen fixed patterns in the approved priority order and only
  the approved generic words `experts`, `pros`, `services`, `solutions`, and
  `group`. Exact token deduplication prevents obvious repeated keyword/city
  forms, while stable hostname deduplication retains the first pattern.
- Restricted output to lowercase ASCII alphanumeric second-level labels plus
  `.com`, with a 32-character label ceiling, no truncation, no hyphens, and no
  generator-invented digits. Explicit normalized business digits remain
  eligible.
- Returned only deeply immutable hostname/pattern-ID records. Added no
  availability or DNS lookup, registrar, marketplace, acquisition status,
  pricing, score, recommendation, Google request, persistence, opportunity,
  API, UI, lifecycle, or production discovery integration.

# Phase G.2.3-B - Scalable domain-availability provider foundation

- Added provider-neutral immutable availability types, typed sanitized errors,
  hostname normalization, bounded execution, defensive result validation, and
  input-order preservation without exposing registrar-specific response fields.
- Added an isolated Dynadot REST v2 `bulk_search` adapter with a five-candidate
  ceiling, one-request ceiling, 10-second timeout, native `fetch`, zero retries,
  no pagination, and a lazy server-only Bearer credential boundary.
- Used `show_price=true` only to obtain explicit premium evidence and discarded
  all price information. Standard non-premium availability maps to `AVAILABLE`,
  explicit unavailability maps to `REGISTERED`, and ambiguous, premium, missing,
  duplicate, mismatched, malformed, or per-domain-error evidence maps to
  `UNKNOWN`.
- Kept transport and configuration failures as typed sanitized errors and added
  no live validation, purchase, marketplace, auction, closeout, liquidation,
  backorder, premium-pricing, router, persistence, opportunity, API, UI, AI, or
  existing discovery-composition integration.

# Phase G.2.3-C - Canonical opportunity model foundation

- Added pure immutable canonical Opportunity types, validation helpers, and an
  allowlisted constructor over existing FlipScore, candidate-pattern, and
  provider-neutral registration-availability contracts.
- Added deterministic `opp_` SHA-256 identity over a versioned length-prefixed
  tuple of canonical business identity, current hostname, and candidate
  hostname. Place ID is preferred; normalized business and location facts form
  the fallback identity.
- Excluded discovery mode, timestamps, provider, availability status,
  FlipScore, reasons, and candidate pattern from identity. Business-first and
  domain-first discoveries therefore converge on one commercial opportunity
  while retaining their individual provenance on constructed v1 records.
- Added strict construction checks for hostnames, candidate/availability
  agreement, timestamps, provider/status, pattern IDs, FlipScore dimensions,
  score sum, priority consistency, and immutable reasons. Provider-specific
  response fields cannot enter canonical output.
- Added no persistence, Firestore schema, lifecycle, feed, acquisition,
  purchase, marketplace, marketing, CRM, API, UI, AI, or provider request.

# Phase G.2.3-D - Forward opportunity qualification service

- Added a three-module Business-First qualification boundary that composes the
  existing deterministic candidate generator, provider-neutral availability
  service, and canonical Opportunity constructor around a completed FlipScore.
- Limited each run to the first five generated candidates or the injected
  provider's smaller advertised capacity. One provider lookup is permitted;
  there is no extra batch, retry, continuation, or candidate re-ranking.
- Constructed canonical opportunities only for explicit `AVAILABLE` facts and
  preserved generator order. `REGISTERED` and `UNKNOWN` facts create none.
- Added immutable generated, checked, and available counts and immutable
  opportunity output. Zero generated candidates perform zero provider calls.
- Added no live provider request, new score, FlipScore change, persistence,
  Firestore, API, UI, feed, purchase, acquisition, marketplace, preparation,
  marketing, CRM, AI, or Domain-First orchestration.

# Phase G.2.3-E - Manual forward-opportunity qualification CLI

- Added isolated test types, a server-only report service, and a manual npm CLI
  for confirmation-gated Business-First opportunity qualification.
- Reused the complete existing local domain-analysis and FlipScore pipeline,
  then delegated candidate generation, provider-neutral availability, filtering,
  and canonical construction to the existing forward qualification service.
- Required strict argument validation and explicit confirmation before loading
  `.env.local` or dynamically importing provider execution code. A fresh
  Dynadot adapter is constructed only inside the confirmed manual path.
- Limited output to business, normalized current domain, score, priority,
  aggregate candidate counts, and allowlisted canonical opportunity summaries.
  Credentials, request URLs, raw responses, prices, and provider internals are
  never printed.
- Preserved the five-candidate, one-lookup, one-request, zero-retry,
  zero-pagination, and no-second-batch boundaries. Added no live implementation
  validation, Google request, persistence, purchase, marketplace, API, UI, AI,
  or production integration.

# Phase G.2.3-F - Candidate-domain quality and selection foundation

- Added immutable candidate quality contracts, deterministic fact extraction,
  non-numeric tiering, and stable selection ordering under four isolated pure
  modules.
- Evaluated `.com`, hyphens, known digit origin, hostname and label length,
  declared-pattern integrity, distinctive brand/keyword/city coverage, declared
  order, controlled generic suffixes, deterministic repetition, and compactness.
- Marked a controlled generic word unnecessary only when a generator pattern
  appends it and the normalized business name did not already contain it.
- Rejected labels over the existing 32-character limit without truncation while
  retaining `LONG` as a valid fact for candidates at or below that ceiling.
- Added stable `PREFERRED`, `ACCEPTABLE`, `WEAK`, and `REJECT` ordering without a
  numeric score. Optional availability is immutable passthrough data and has no
  effect on quality or selection.
- Added no fuzzy or semantic matching, AI, provider request, acquisition,
  purchase, persistence, marketplace, API, or UI behavior.

# Phase G.2.3-G - Acquisition recommendation and external handoff foundation

- Added immutable provider-neutral recommendation contracts, controlled V1
  decision policy, deterministic reason ordering, and safe external handoff
  metadata.
- Kept registration availability separate from acquisition inventory, allowing
  a registered domain to retain a legitimate fixed-price external acquisition
  path without treating registration as available.
- Required explicit normalized observed and maximum currencies before comparing
  prices. Currency mismatches produce manual review and never trigger within-
  limit or above-limit conclusions; no currency conversion was introduced.
- Added representation for standard registration, buy-now, marketplace,
  premium, auction, closeout, backorder, and liquidation paths without fetching
  inventory or fabricating prices.
- Limited provider handoff to explicitly supplied absolute HTTPS URLs without
  embedded credentials. Added no automatic URL opening, purchasing, bidding,
  backordering, offer acceptance, checkout, payments, network calls,
  persistence, API, UI, marketplace fetch, marketing, CRM, or AI behavior.

# Domain Preparation - Model and readiness checklist foundation

- Added immutable Domain Preparation contracts, normalization, construction,
  and deterministic checklist evaluation for explicitly owned domains.
- Kept ownership as an explicit upstream fact rather than inferring it from a
  Portfolio record, lifecycle status, Opportunity, availability result,
  acquisition recommendation, or provider handoff.
- Added separate immutable marketplace and future marketing requirement sets
  with monotonic `NOT_READY`, `READY_FOR_MARKETPLACE`, and
  `READY_FOR_MARKETING` states. V1 adds no marketing-only requirements.
- Required logo, favicon, description, landing page, finite positive resale
  asking price, normalized currency, safe external sales destination, and CTA
  configuration before readiness, with stable controlled missing-requirement
  codes.
- Kept resale asking price separate from purchase price, acquisition cost,
  provider-observed price, and acquisition budget. Added no currency conversion.
- Accepted only explicitly supplied absolute HTTPS external sales URLs without
  embedded credentials and added no URL construction, navigation, checkout,
  purchase, bid, backorder, generation, deployment, marketplace publication,
  provider request, persistence, API, UI, marketing, CRM, discovery, feed,
  Company Intelligence, calibration, or AI behavior.

# Domain Preparation - Assets and content generation foundation

- Added a provider-neutral generation contract, reusable immutable asset slots,
  deterministic templates, and a built-in generator that remains fully
  functional without AI or networking.
- Required explicit confirmed ownership and validated hostname, finite positive
  resale asking price, normalized currency, and explicitly supplied safe HTTPS
  external sales URL before generation.
- Added deterministic description, landing configuration, controlled CTA, SEO,
  and Open Graph text derived only from supplied facts. Unknown business,
  category, keyword, and city context is never fabricated.
- Represented missing logo, favicon, and Open Graph images as `NONE`/`PENDING`
  slots and accepted explicit manual/provider references as `AVAILABLE`, without
  generating bytes, HTML, or deployed pages.
- Kept source metadata generic and added no AI provider/model/prompt/credential,
  quota, billing, network, persistence, API, UI, marketplace publication,
  purchase, checkout, marketing, CRM, or Company Intelligence behavior.

# Domain Preparation - Landing-page rendering foundation

- Added immutable framework-neutral landing-page render contracts, validation,
  stable sections, asset placeholder mapping, and deterministic readiness.
- Reused existing generated headline, description, SEO, Open Graph, price,
  currency, and external CTA facts without regenerating or enriching copy.
- Added `NOT_RENDERABLE`, `RENDERABLE_WITH_PLACEHOLDERS`, and
  `FULLY_RENDERABLE` states with controlled validation/placeholder reasons.
- Fixed V1 section order to hero, value proposition, domain details, price, CTA,
  and footer while adding no fabricated claims, schema markup, or raw HTML.
- Reused only the exact validated external sales URL and represented unavailable
  logo, favicon, and Open Graph images as null placeholders without fabricating
  references.
- Added no route, deployment, marketplace publication, persistence, API, UI,
  provider call, AI, image generation, analytics, marketing, or outreach.

# Domain Preparation - Landing-page UI and route integration foundation

- Added an authenticated `/admin/preparation/preview` Server Component route,
  loading skeleton, and framework-facing presentational landing-page component.
- Used only an explicit deterministic `.example` fixture and the existing
  generator-to-render-model pipeline; added no Portfolio or persistence wiring.
- Refused sales rendering for `NOT_RENDERABLE` models and mapped the established
  section order for placeholder-ready and fully renderable models without
  duplicating business rules in React.
- Added explicit visual placeholders without fabricated image URLs and included
  favicon/Open Graph image metadata only for available render-model references.
- Reused render-model SEO/Open Graph copy, disabled indexing/following, and
  exposed the exact external CTA as a user-triggered `_blank` link with
  `noopener noreferrer`.
- Added no public domain route, marketplace publication, persistence, provider
  call, checkout, purchase, AI, asset generation, analytics, marketing,
  outreach, or CRM behavior.

# Marketplace Publication - Listing model and eligibility foundation

- Added immutable provider-neutral listing contracts, canonical construction,
  deterministic listing identity, and non-numeric publication eligibility.
- Derived `listing_` identity from SHA-256 of only the versioned normalized
  hostname tuple, keeping identity stable across price, content, asset, URL,
  readiness, provenance, and timestamp changes.
- Cross-checked preparation, generation, and render-model facts without
  regenerating content or duplicating upstream readiness and URL validation.
- Kept missing landing-page deployment reference separate from incomplete
  visual assets using dedicated controlled reasons; either may yield
  `ELIGIBLE_WITH_PLACEHOLDERS` without fabricating a public URL.
- Restricted canonical public-sale fields to domain-product facts and optional
  internal Opportunity provenance, excluding lead identity, weak domain,
  Place ID, FlipScore, internal reasons, acquisition economics, raw provider
  data, credentials, and tokens.
- Added no catalog, public route, persistence, publication, deployment,
  marketplace API, provider call, AI, marketing, CRM, Reverse Discovery,
  Opportunity Feed, Company Intelligence, or calibration.

# Marketplace Publication - Public catalog and read-model foundation

- Added an immutable public-safe marketplace catalog projection and public
  read-only `/marketplace` route with loading and accessible empty states.
- Restricted inclusion to canonical `ELIGIBLE` listings and excluded both
  placeholder-eligible and ineligible records without reimplementing the
  publication policy.
- Stripped internal Opportunity provenance and exposed only allowlisted
  domain-product display, resale, logo, landing-reference, and external CTA
  facts.
- Built reserved `.example` fixtures through the existing generation,
  preparation, rendering, listing, and catalog pipeline with no persistence or
  provider request.
- Sorted by normalized hostname and listing ID, with no ranking or numeric
  marketplace score.
- Reused exact canonical URLs in user-triggered links with safe external-link
  attributes and added no public domain detail route, Portfolio/Firestore
  integration, automatic publication, marketplace API, search, filters,
  pagination, analytics, AI, outreach, CRM, Reverse Discovery, Opportunity
  Feed, Company Intelligence, calibration, or transaction execution.

# Marketplace Publication - Public individual domain route foundation

- Added shared immutable reserved `.example` fixtures and public read-only
  `/marketplace/domains/[hostname]` routes with loading and not-found states.
- Consolidated catalog and detail data into one canonical generation,
  preparation, render, and listing pipeline so the two public views cannot drift.
- Restricted resolution to decoded, normalized, explicitly allowlisted fixture
  hostnames whose canonical listing is `ELIGIBLE` and render model is not
  `NOT_RENDERABLE`; arbitrary route input never constructs a listing.
- Extended only landing-page publication references to accept the exact safe
  root-relative marketplace-domain route form in addition to absolute HTTPS.
  External sales destinations remain absolute HTTPS only.
- Pointed catalog cards to their matching internal detail routes and reused the
  existing landing presentation, exact external CTA, and render-model metadata.
- Added no persistence, Firestore, Portfolio integration, automatic deployment
  or publication, root slug, marketplace API, AI, analytics, marketing, CRM,
  Reverse Discovery, Opportunity Feed, Company Intelligence, or commercial
  transaction behavior.

# Relational Persistence Foundation v1

- Approved MySQL as the target for new Wabmarket business persistence while
  retaining Firebase Authentication/custom claims for authoritative identity
  and RBAC and leaving existing Firestore-backed modules unchanged.
- Added provider-neutral trusted identity/account contexts, sanitized errors,
  repository contracts, and unit-of-work boundaries without leaking Firebase,
  Drizzle, or mysql2 types into application/domain interfaces.
- Added isolated Drizzle/mysql2 infrastructure and a lazy explicit client
  factory. No import-time pool, live connection, credential logging, route
  integration, or hosting-company-specific configuration was introduced.
- Added one five-table MySQL migration for accounts, owned domains, asset
  metadata, current preparations, and marketplace publication snapshots with
  tenant, uniqueness, foreign-key, optimistic-version, eligibility, lifecycle,
  and public-read indexes/constraints.
- Added concrete tenant-scoped repositories for safe lazy account provisioning,
  explicit domain ownership, optimistic preparation replacement, metadata-only
  assets, eligible-only publication, unpublication, and published-only public
  reads in deterministic order.
- Kept asset binaries behind an unimplemented provider-neutral `AssetStore`.
  Added no blobs, filesystem adapter, Firestore migration, dual-write, fixture
  removal, public-route cutover, future-feature tables, or live database work.

# Marketplace Publication Application Service Foundation

- Added a transaction-bound Domain Preparation application service that checks
  account-scoped ownership, canonical hostname consistency, and tenant/domain
  asset associations before delegating exact optimistic-version persistence.
- Added a marketplace publication application service that loads private facts
  only through tenant-scoped repositories, requires explicit ownership,
  reconstructs listings exclusively through the existing canonical constructor,
  and publishes only when the existing policy returns exactly `ELIGIBLE`.
- Kept publish validation and the publication write inside one injected unit of
  work so failures cannot leave partial application state. Added deterministic,
  version-exact tenant-scoped unpublication without retries or overwrite logic.
- Limited service results to immutable IDs, hostname, readiness/version, and
  publication state/version. Commands contain no caller-provided tenant,
  account, Firebase UID, role, or ownership actor.
- Added no repository/schema/infrastructure changes, live database connection,
  migration, route cutover, fixture removal, Firestore dual-write, asset binary
  storage, provider call, AI, marketing, CRM, or purchase behavior.

# MySQL Production Readiness and Controlled Migration Setup

- Unified database runtime and operator configuration under the server-only
  `DATABASE_*` contract and added a fixed bounded connection timeout without
  import-time pool construction.
- Added confirmation-gated `db:check`, `db:migrate`, and `db:smoke` commands.
  They are not referenced by build, start, postinstall, or deployment hooks.
- Added read-only Drizzle-history status with deterministic `PENDING`,
  `APPLIED`, and `DRIFTED` outcomes plus separately confirmed migration
  execution. Business-table existence is never treated as migration history.
- Finalized the not-yet-applied 0001 migration for Drizzle execution by adding
  statement breakpoints and the minimum Drizzle journal. Once migration 0001 is
  applied to any real environment it becomes immutable; subsequent schema work
  must use new numbered migrations.
- Added a rollback-on-success synthetic repository smoke test for read-back and
  tenant isolation with no Firebase dependency and no published listing.
- Added a controlled MySQL deployment runbook distinguishing runtime data
  privileges from migration/schema privileges and requiring operators to stop
  on any failed step.
- Performed no live connection, status query, migration, smoke test, route
  cutover, Firestore migration, dual-write, or fixture removal.

# Production MySQL Composition for Public Marketplace Reads

- Added a provider-neutral read service for published marketplace pages and
  normalized-hostname resolution, returning cloned deeply immutable public
  snapshots with no infrastructure imports.
- Added a server-only MySQL execution composition that owns one fresh lazy pool
  per operation, injects the existing `MySqlMarketplaceReadRepository`, and
  closes the pool on success and failure.
- Preserved empty catalog and missing-hostname outcomes while sanitizing
  configuration, driver, query, and close failures through existing persistence
  errors.
- Added no fixture fallback, route cutover, UI change, schema/migration change,
  Firestore migration or dual-write, admin workflow, asset adapter, AI,
  outreach, CRM, Reverse Discovery, Opportunity Feed, or purchase behavior.

# Public Marketplace Route Cutover to Persisted MySQL Reads

- Replaced fixture reads in public marketplace catalog and domain-detail routes
  with the production MySQL marketplace read composition.
- Added a pure shared route-hostname decoder/normalizer and reused it from the
  fixture-only landing resolver to prevent parsing drift.
- Projected persisted published records into the existing catalog public
  allowlist without reordering, exposing private provenance, or changing
  presentation components.
- Shared one React request-cached persisted resolver between domain metadata and
  page rendering and passed the stored landing render model directly to the
  existing domain presentation.
- Preserved empty catalog, not-found, and sanitized database-failure outcomes as
  distinct states with no fixture fallback.
- Added no schema/migration, write path, admin workflow, Firestore change, asset
  storage, AI, outreach, CRM, Reverse Discovery, Opportunity Feed, or commercial
  transaction behavior.

# Admin Marketplace Operations v1

- Added authenticated admin marketplace list/detail pages, loading/error states,
  a compact preparation form, and private list/detail/save/publish/unpublish API
  routes using existing RBAC.
- Added a provider-neutral admin marketplace service and request-scoped MySQL
  composition that resolves trusted Firebase identity to a SQL account and
  closes its pool on success or failure.
- Extended repository contracts only with tenant-scoped owned-domain listing
  and publication lookup; no schema or migration changed.
- Added one explicit manual-description override to deterministic preparation
  generation. Absent overrides retain template behavior; supplied valid text is
  preserved unchanged with `MANUAL` source metadata.
- Derived the safe internal marketplace landing path server-side from the
  normalized SQL-owned hostname. Browsers cannot submit a landing destination,
  and canonical listing logic still invents no URL.
- Reused canonical generation, preparation, rendering, asset association,
  publication eligibility, optimistic versioning, publish/unpublish, and public
  MySQL read behavior without weakening missing-asset requirements.
- Added no direct SQL in UI/API handlers, fixture fallback, Firestore migration
  or dual-write, asset upload/storage, AI, provider marketplace API, checkout,
  bidding, outreach, CRM, Reverse Discovery, Opportunity Feed, or team model.

# Asset Storage and Admin Upload v1

- Added private configurable filesystem storage behind the existing
  provider-neutral `AssetStore`, with opaque hashed-scope keys, containment
  checks, atomic temporary-file writes, server-derived extensions, and no
  public or SQL exposure of absolute paths.
- Added bounded magic-byte/MIME validation for PNG, JPEG, WebP, and favicon ICO
  uploads, server-generated UUIDs and SHA-256 checksums, tenant/domain-scoped
  metadata writes, and explicit filesystem/SQL compensation behavior.
- Added safe deletion that rejects current preparation selections and published
  marketplace references. Replacement stores and selects the new asset before
  the old asset becomes eligible for explicit deletion.
- Added authenticated multipart upload/delete APIs and preparation-page controls
  without adding a general media library or weakening canonical readiness and
  explicit publication.
- Added a published-only public media route. An `AVAILABLE` row is not public by
  itself; the exact reference must be active in a `PUBLISHED` listing snapshot.
  Private/draft/unpublished records return 404 while infrastructure failures
  remain sanitized server failures.
- Added a hosting-neutral cPanel asset runbook and `ASSET_STORAGE_ROOT` example.
  No schema/migration, live database, real hosting directory, Firebase Storage,
  Firestore asset persistence, AI generation, resizing, CDN, or provider write
  was introduced.

# Branding and Asset Generation v1

- Added deterministic immutable brand identity, controlled style/palette/type
  policy, and a provider-neutral visual generator contract with no AI-specific
  fields or dependency.
- Added trusted built-in PNG generation for 512×512 logos, 64×64 derived
  favicons, and 1200×630 Open Graph visuals. All use the same versioned identity
  seed and contain no SVG, script, external resource, remote font, fabricated
  claim, urgency, or price presentation.
- Routed every generated PNG through the existing upload validation,
  filesystem storage, checksum, metadata, tenant, and compensation path.
- Added authenticated Generate, Regenerate, and Generate Missing operations.
  Each generation creates new metadata/storage identity; selected assets are
  never replaced by the missing-assets action and old assets remain until
  explicit guarded deletion.
- Preserved explicit selection, preparation save, readiness evaluation,
  publication, manual upload, and published-only media authorization. No
  automatic selection/save/publish or private public-media preview was added.
- Added no package, schema/migration, Firebase Storage, Firestore, AI provider,
  network call, or live infrastructure operation.

# Domain Preparation UX Simplification v1

- Added a one-click authenticated Prepare-domain workflow that validates sales
  facts, generates only missing deterministic visual assets, selects only assets
  created for previously empty slots in that request, saves canonical
  preparation with exact optimistic versioning, and returns refreshed readiness.
- Preserved all existing manual and generated selections. Regeneration remains
  non-destructive and never replaces the current choice; previously available
  unselected assets are not automatically selected.
- Derived `ctaConfigured` only after the existing generator and landing renderer
  accept the controlled CTA label and exact validated HTTPS external sales URL.
  No checkout, purchase, or provider confirmation is inferred.
- Added explicit reverse-order cleanup for request-created assets after partial
  generation or save failure. A cleanup failure is reported explicitly and can
  never be mistaken for successful preparation.
- Reworked the admin page into Sales details → Prepare → Preview → Publish with
  non-numeric status states and exact missing requirements. Publish remains an
  explicit eligibility-controlled application-service action; advanced upload,
  regenerate, select, and delete controls remain available in a collapsed area.
- Added an authenticated stored-render-model preview and tenant/domain-scoped
  private draft-asset reads. Public media authorization was not changed.
- Replaced generic preparation failures with allowlisted actionable messages
  while preserving sanitized infrastructure errors and private-data boundaries.
- Added no schema/migration, live infrastructure operation, Firestore write,
  Firebase Storage, AI, automatic publication, marketing, CRM, Reverse
  Discovery, Opportunity Feed, checkout, bid, or backorder behavior.

# Owned Domain Management and Premium Landing Page v1

- Added provider-neutral owned-domain management contracts and authenticated
  admin create/delete operations. Creation requires literal ownership
  confirmation and canonical hostname validation; tenant duplicates are safe
  controlled conflicts.
- Added authoritative race-resistant MySQL deletion. A tenant-scoped parent row
  lock, final preparation/asset/publication checks, and deletion execute in one
  transaction. Prepared, asset-bearing, published, or retained-publication
  domains are blocked without cascading or automatic cleanup.
- Added a compact admin creation form and explicit two-step delete confirmation
  showing the normalized hostname. Delete is offered only when the current
  summary is clean, while the repository guard remains authoritative.
- Added optional explicit category/keyword/city public context to deterministic
  preparation output and canonical domain-product facts to the render model.
  Older stored snapshots use a read-time generic fallback and require no schema
  migration.
- Rebuilt the shared domain landing presentation with responsive premium
  product styling and the stable Hero → Domain Value → Domain Details → Brand
  Preview → Use Case → Purchase CTA → Footer order.
- Kept admin preview and public presentation on the same component and model.
  Private draft assets remain authenticated; public assets remain restricted to
  published snapshots.
- Restricted public content to factual hostname structure, explicitly supplied
  context, persisted price and prepared copy, and the exact external purchase
  destination. Added no private lead/opportunity facts or fabricated metrics,
  valuation, ranking, demand, scarcity, reviews, or operating-business claims.
- Added no schema/migration, live database operation, Firestore write,
  registrar sync, AI, marketing, CRM, checkout, automatic publication, or
  destructive cascade behavior.

# Registrar Owned-Domain Sync v1

- Added provider-neutral registrar inventory types, a bounded manual sync
  service, controlled errors, and immutable reports with fetched, unique,
  created, existing, invalid, duplicate, missing, and truncation facts.
- Added a signed Dynadot REST v2 domain-list adapter using the documented
  key/path/request-ID/body string order, HMAC-SHA256/Base64 signature, exact
  signed request path/query, ten-second timeout, caller cancellation, and no
  retries.
- Limited a manual run to five sequential 100-record requests and 500 fetched
  records. Reaching the ceiling returns an explicit partial result.
- Reconciled imports inside one tenant-scoped SQL unit of work with controlled
  `registrar:dynadot:v1` ownership evidence. Repeated syncs are idempotent and
  existing ownership, preparation, assets, content, branding, price, and
  publication are preserved.
- Retained provider-disappeared domains without revoking ownership, deleting,
  unpublishing, or changing preparation/assets. Missing counts are withheld for
  truncated inventories.
- Added the authenticated `domains.manage` Dynadot sync endpoint and an admin
  button/report that refreshes the current owned-domain list after success.
- Added `DYNADOT_API_SECRET` only to the signed inventory configuration; the
  existing API-key-only availability adapter is unchanged.
- Added no schema/migration, background job, cron, webhook, Firestore write,
  dual-write, purchase, renewal, transfer, registrar settings dashboard, AI,
  marketing, CRM, Reverse Discovery, or Opportunity Feed behavior.

# SQL Portfolio Consolidation and Explicit Prepare-for-Sale Handoff v1

- Replaced the visible `/admin/domains` Firestore composition with a
  tenant-scoped SQL Portfolio service and request-owned MySQL composition. The
  route now lists every SQL-owned or managed domain without merging or falling
  back to legacy Firestore records.
- Moved manual owned-domain creation, guarded deletion, Dynadot synchronization,
  and the transient sync report from Marketplace into Portfolio-specific API,
  client, and UI boundaries. Existing ownership, deletion, sync, signing,
  pagination, idempotency, and tenant-safety services are reused unchanged.
- Added explicit Prepare for Sale, Continue Preparation, and Manage Listing
  actions derived only from persisted preparation and publication state.
  Navigation creates no durable selling state; the existing canonical
  preparation save remains the first persisted selling transition.
- Changed Marketplace admin into a selling workspace that includes only domains
  with stored preparation or retained draft, published, or unpublished listing
  state. Pure registrar/manual inventory is excluded and Marketplace no longer
  exposes add, delete, or registrar-sync controls.
- Removed the obsolete Marketplace inventory manager and misplaced Marketplace
  Dynadot sync route after confirming all production callers moved to Portfolio.
- Kept legacy Firestore Portfolio code/data untouched and added no migration,
  schema change, dual-write, fixture fallback, automatic preparation,
  automatic publication, public Marketplace change, registrar enrichment, AI,
  bulk action, outreach, CRM, or provider transaction.

# Registrar Portfolio Enrichment v1

- Added migration 0002 and a generic registrar-association schema/repository
  with database-enforced tenant ownership, unique owned-domain/provider identity,
  controlled status/sync values, nullable canonical facts, and immutable DTOs.
- Extended the bounded manual sync transaction to attach associations to new or
  matching manual domains and update supported provider facts without changing
  ownership, preparation, assets, branding, price, listing, or publication.
- Preserved first-seen across repeated observations while updating last-seen and
  last-synced. Complete inventories mark absent associations `MISSING` without
  changing last-seen; truncated inventories make no absence updates.
- Defined `MISSING` strictly as absence from the latest complete provider
  inventory. It has no automatic ownership, deletion, transfer, preparation, or
  publication consequence.
- Added compact deterministic registrar facts to SQL Portfolio with neutral
  manual/unknown/not-supplied states and multi-provider display support.
- Kept migration 0001 unchanged and did not execute migration 0002, call live
  Dynadot/MySQL, store raw provider payloads, add scheduled synchronization,
  touch Firestore, or introduce destructive automation.

# Portfolio UX and Domain Profile / Lifecycle View v1

- Reworked SQL Portfolio into a compact responsive inventory table with private
  logo thumbnails, key registrar/selling facts, price, status pills, hostname
  profile links, and server-supplied three-dot actions.
- Added a tenant-scoped provider-neutral Portfolio read snapshot backed by five
  bounded set queries, eliminating per-domain preparation/publication/asset/
  registrar query expansion while retaining deterministic ordering.
- Added `/admin/domains/[hostname]` with Overview, Registrar, Ownership/Source,
  Branding/Assets, Preparation, Marketplace/Listing, and Lifecycle sections.
  Timeline entries are emitted only for persisted timestamps.
- Reused authenticated private asset content for admin thumbnails and existing
  upload/generation services for logo actions. Display fallback is not persisted
  and asset creation does not create preparation or publication.
- Added explicit back links and breadcrumbs across profile, preparation, and
  preview pages while preserving the separation of ownership inventory and the
  Marketplace selling workspace.
- Added no schema or migration change, Firestore read, live provider/database
  operation, automatic selling transition, public-media relaxation, or cache.
