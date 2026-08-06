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
