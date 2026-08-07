# CURRENT STATE OF THE PROJECT

## Project Name

Wabmarket

---

## Project Goal

Wabmarket is an AI-powered domain acquisition, branding, lead generation, and outbound marketing platform.

The application is built with:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Firebase
- Firestore
- Firebase Auth
- Firebase Storage
- Gemini AI
- Dynadot API
- Gmail API
- Redis
- BullMQ

---

## Current Status

The project has already been initialized.

This project must NEVER be recreated from scratch.

Every modification must be based on the current codebase.

---

# Completed documentation

The following files already exist inside the docs directory:

- 00_MASTER_PROMPT.md
- 01_BUSINESS_REQUIREMENTS_DOCUMENT.md
- 02_TECHNICAL_ARCHITECTURE_DOCUMENT.md
- 03_DATABASE_SCHEMA.md
- 04_API_DOCUMENTATION.md
- 05_FRONTEND_UI_UX.md
- 06_DOMAIN_LIFECYCLE.md
- 07_AI_ENGINE.md
- 08_EMAIL_AUTOMATION.md
- 09_SECURITY_AND_PERMISSIONS.md
- 10_DEPLOYMENT_GUIDE.md
- 11_DEVELOPMENT_ROADMAP.md
- 12_CHANGELOG.md

---

# Current architecture

## Frontend

- Next.js App Router
- Tailwind CSS
- Shadcn UI
- Framer Motion

## Backend

- Next.js API routes
- Next.js server actions
- Firebase Admin SDK

## Database

- Firestore

## Authentication

- Firebase Authentication

## Storage

- Firebase Storage

## Queue system

- BullMQ
- Redis

## AI engine

- Gemini

## External APIs

- Dynadot API
- Gmail API
- Google Search API

---

# Existing folders

```text
app/
components/
cron/
docs/
firebase/
hooks/
lib/
node_modules/
prompts/
public/
scripts/
services/
types/
utils/
```

---

# Existing files

```text
.env.example
.eslintrc.json
.prettierrc
package.json
package-lock.json
postcss.config.js
tailwind.config.ts
tsconfig.json
firebase/admin.ts
firebase/client.ts
```

---

# Existing application structure

```text
app
├── (auth)
├── (dashboard)
├── [domain]
├── globals.css
├── layout.tsx
└── page.tsx
```

---

# Existing Firebase structure

```text
firebase
├── admin.ts
├── client.ts
└── rules
```

---

# Existing folders inside the project

```text
components/
cron/
docs/
firebase/
hooks/
lib/
prompts/
public/
scripts/
services/
types/
utils/
```

---

# Missing files

```text
middleware.ts
next.config.ts
app/providers.tsx
```

---

# Theme requirements

The application must support:

- Light mode
- Dark mode
- System mode

The theme preference must be persisted.

---

# Domain requirements

Every domain must have:

- FlipScore history
- Logo
- Favicon
- Description
- Slogan
- Timeline
- Lead list
- CRM status
- Notes
- Attachments
- Afternic checkout link
- Analytics
- Landing page

---

# Dynadot requirements

The application must:

- Synchronize domains from Dynadot.
- Import owned domains automatically.
- Update expiration dates.
- Update nameservers.
- Track domain status.

---

# AI requirements

The AI engine must generate:

- Logos
- Favicons
- Descriptions
- Slogans
- Target audience analysis
- Domain valuation
- Sales recommendations
- Email content

---

# Workflow rules

- Never rebuild the project.
- Never delete existing files.
- Read the existing files before modifying them.
- Ask for confirmation before creating large modules.
- Work phase by phase.
- Explain all changes.

---

# Current development phase

## Phase C.1 Discovery Engine Foundation

- Discovery jobs are stored below `users/{uid}/discoveries` with canonical
  snake_case persistence, mapper-based camelCase APIs, verified sessions, and
  server-side RBAC.
- `/admin/discovery` presents the real Domain Discovery search workflow.
  `/admin/opportunities` is reserved for future generated opportunity results
  and currently contains no data or lifecycle controls.
- Creation, transition, and cancellation atomically write the discovery plus
  activity, timeline, and log records. Direct client writes are denied.
- The list uses bounded tenant-bound cursor pagination ordered by creation date
  descending. No discovery filters, search, or composite indexes are included.
- Progress is manually advanced through authenticated lifecycle actions for
  architectural validation: queued 0, processing 25/50/75, completed 100.
  Failure stores a safe server message; cancellation never deletes a document.
- Completed, failed, and cancelled jobs are terminal. Opportunity models are
  type-only and no opportunity records are written.
- No external search, AI, queue, timer, crawler, email, lead, or scoring process
  exists in Phase C.1. Phase C.2 will connect the first real provider behind the
  existing trusted repository/service boundary.

## Phase C.1.5 discovery product structure

- Navigation now distinguishes Portfolio (`/admin/domains`), Domain Discovery
  (`/admin/discovery`), and future Opportunities (`/admin/opportunities`).
- Domain Discovery uses customer-facing Domain Search terminology and
  presentation labels while backend statuses and API contracts remain intact.
- Opportunities is a polished empty destination with no API calls, fake
  results, scores, or discovery lifecycle controls.
- Campaigns has a minimal unavailable placeholder so the declared navigation
  does not lead to a missing route; no campaign functionality was added.
- Temporary compatibility debt: `/admin/opportunities/new` and
  `/admin/opportunities/{discoveryId}` permanently redirect internally to the
  canonical discovery routes while preserving query parameters and IDs. These
  redirects should be removed when real opportunity child routes are built.

## Phase C.2.0 discovery provider architecture

- A dormant, server-only provider plugin contract now separates provider search
  criteria from future execution context such as tenant, correlation,
  cancellation, and deadline metadata.
- Canonical contracts define extensible provider identifiers, provider-neutral
  search modes, immutable capabilities, acquisition statuses, strict normalized
  items, and timed provider results.
- `DiscoveryEngine` accepts a provider through constructor injection, verifies
  support, measures duration monotonically, invokes search and normalization,
  and rejects non-canonical output. It does not retry, persist, authorize,
  update lifecycle state, score domains, or generate opportunities.
- `DiscoveryProviderRegistry` is instance-scoped, rejects duplicate providers,
  resolves identifiers without provider-specific switches, and exposes readonly
  provider and identifier lists. No global registry or engine is instantiated.
- Google and Dynadot provider classes are explicit stubs. They read no
  credentials, make no network or SDK calls, and throw
  `PROVIDER_NOT_IMPLEMENTED` from `search()`.
- The architecture is not connected to APIs, Firestore, discovery lifecycle,
  UI, or legacy integrations. No search occurs and no opportunity is generated.
  Phase C.2.1 will implement the first real provider behind these contracts.

## Phase C.2.0.5-A dormant orchestration foundation

- Added server-only, constructor-injected contracts for provider selection,
  policy, cache, quota, budget, health, statistics, failover, request
  fingerprinting, and acquisition-offer aggregation. This phase creates
  contracts, not working orchestration; execution boundaries throw the typed
  `ORCHESTRATOR_DORMANT` error.
- Providers remain inactive. The default policy is a fresh immutable object
  with `enabled=false`, free-only use, paid providers disabled, zero daily and
  monthly request-cost budgets, emergency stop enabled, and fallback and
  aggregation disabled. Registration never activates a provider, and no API
  request can incur cost.
- Priority fallback is reserved for business/domain discovery. Parallel
  aggregation is reserved for acquisition intelligence and is designed to
  preserve partial successes and every legitimate registration, buy-now,
  auction, closeout, backorder, premium, or brokerage path.
- Registration availability and acquisition availability are separate. A
  registered result from one source does not mean a domain cannot be acquired
  elsewhere. Future registration aggregation will use conservative consensus
  semantics rather than treating one response as certainty.
- Provider-request cost is separate from a domain registration, renewal,
  auction, buy-now, backorder, or brokerage price. No prices are fabricated and
  no currency conversion is performed.
- Real provider execution, free-quota tracking, atomic usage reservations,
  cache implementation, budget and health persistence, statistics storage,
  failover execution, and parallel execution remain future work. Partial
  acquisition-provider success is represented by typed provider coverage but
  is not executed in this phase.

## Phase C.2.0.5-B dormant provider policy foundation

- Provider-declared capabilities are authoritative. Tenant/provider settings
  can disable providers and restrict categories or search modes, but cannot
  expand adapter capabilities. Registration and activation remain separate;
  every fresh default setting is immutable and disabled.
- Independent contracts now cover provider configuration, accumulated usage,
  statistics events, provider and tenant quotas, provider and tenant budgets,
  provider health, cache metadata, and deterministic eligibility reasons.
- A verified zero-cost tier from a provider that does not require paid access
  is not blocked merely because paid-request budgets are zero. Potentially paid
  execution requires explicit opt-in and positive provider and tenant budgets;
  unknown request cost fails closed. Provider-request cost remains separate
  from domain acquisition price, and currencies are never silently converted.
- Quota and budget boundaries expose validate, reserve, commit, reconcile, and
  release contracts with opaque tokens and idempotency metadata. Correct
  concurrent enforcement will require atomic persistence in a future phase;
  no counters or reservations are implemented now.
- Cache fingerprints identify normalized reusable queries while namespaces are
  reserved for isolation/sharing policy. Cache schema, fingerprint, and value
  versions are distinct and no hashing or cache implementation exists.
- Eligibility evaluation is pure and deterministically aggregates already-made
  capability, compatibility, policy, health, quota, and budget decisions. It
  performs no selection, reservation, statistics recording, or provider call.
  No provider is executable after this phase.

## Phase C.2.0.5-C dormant persistence contracts

- Storage-neutral, snake_case document contracts now exist independently for
  platform provider configuration, tenant provider settings, immutable usage
  snapshots, append-only statistics events, quota reservations, budget
  reservations, health snapshots, and cache metadata.
- Repository boundaries are server-only interfaces with explicit immutable
  tenant context. Tenant UID is injected by a trusted server boundary rather
  than duplicated in documents; repository context carries no role or
  client-submitted authorization data.
- Reservation repositories expose only the future transitions `reserved` to
  `committed`, `released`, or `expired`. Persistence documents contain token
  digests/references, never raw runtime reservation tokens; future
  implementations must securely transform and compare tokens and never log the
  raw value.
- Usage snapshots cannot be updated and statistics events are append-only.
  Corrections will require new snapshots, compensating events, or an explicit
  future versioned replacement policy.
- Cache documents contain compatibility and invalidation metadata only. No
  cached result payload is defined and metadata cannot currently serve a cache
  hit.
- These are contracts only: no data is stored, no repository is implemented or
  instantiated, and no new Firestore collection exists. Runtime-to-persistence
  validation and mappers remain future work.

## Phase C.2.0.6 dormant discovery composition

- `createDiscoveryComposition()` is the server-only canonical construction
  boundary for production discovery runtime graphs. Each call creates fresh
  Google and Dynadot adapter instances, a new registry, fresh inactive policy
  data, new managers, selector, eligibility wrapper, provider-bound engines,
  dormant gateway, orchestrator, and frozen public container.
- Registration derives declarations from adapter-authored capabilities and does
  not call provider support, search, or normalization methods. It reads no
  credentials and does not activate either provider. Default settings remain
  disabled with null priority/weight, free-only mode, paid providers disabled,
  zero paid budgets, emergency stop enabled, and fallback/aggregation disabled.
- Raw providers, engines, mutable registry implementation, dormant managers,
  and construction helpers are private. The public registry exposes immutable
  metadata reads only; the public container exposes the registry view and
  dormant orchestrator without a generic service locator.
- The engine gateway rejects with `ORCHESTRATOR_DORMANT` before provider
  resolution, eligibility, cache, health, quota, budget, statistics, support,
  search, or normalization work. Composition itself performs no provider
  request, health probe, timer, persistence operation, or external access.
- No API route uses the composition yet. Production integrations must assemble
  full runtime graphs through the composition root, while isolated tests and
  tooling may still construct individual pure units directly.
- This is the final dormant infrastructure phase before the first explicitly
  approved real-provider integration.

## Phase C.2.1-A disconnected Google web-search adapter

- The Google provider adapter now supports one native-fetch Google Custom
  Search JSON API request for `business_upgrade` and `local_seo`, with strict
  keyword/city/country validation, a maximum of 10 results, an explicit
  `lang_*` allowlist, caller cancellation, and a 10-second timeout.
- Configuration is loaded lazily only from the server-only Google configuration
  boundary. Provider construction, registry composition, builds, and startup do
  not read Google credentials or make requests. No application route executes
  this adapter, so Wabmarket UI cannot incur Google API cost.
- Normalized records are unverified web results, not verified businesses. Page
  URLs populate `website` and `currentDomain`; Google titles populate
  `sourceTitle`. `businessName`, `candidateDomain`, location facts, and
  acquisition status remain null. Qualification, directory exclusion,
  deduplication, and company verification remain future work.
- Google Custom Search is a temporary replaceable provider, not Wabmarket's
  permanent discovery foundation. It is closed to new customers; existing
  eligible customers must migrate before its January 1, 2027 discontinuation.
  Deployment requires a project that already has legitimate access. Open
  Discovery remains the planned free fallback, and replacing Google must not
  change canonical downstream provider contracts.
- The dormant composition gateway remains unchanged and prevents product-flow
  execution. There is still no orchestration, API/UI integration, persistence,
  opportunity generation, quota/budget tracking, or background processing.

## Phase C.2.1-B controlled internal Google validation

- Production composition remains dormant and no API, UI, discovery lifecycle,
  repository, persistence, opportunity, or Dynadot path can execute Google. A
  fresh internal graph can execute Google only through an unexported, per-call
  reference capability scoped to the local provider test service.
- Google queries now use small immutable profiles for `business_upgrade` and
  `local_seo`. Profiles control `q`, conservative exclusions, short OR-term
  lists, allowlisted `lr`, `num` from 1-10, `safe=active`, and `filter=1`.
  Safe Search is a content-safety filter, not a business-quality signal, and
  Google's duplicate filter does not replace local hostname deduplication.
- All returned items pass through a pure, zero-request quality gate. It rejects
  invalid/private/local URLs, blocked exact/subdomain hosts, and obvious files;
  applies an explicit 0-100 heuristic; enforces an experimental immutable
  threshold of 65; and keeps the highest-quality page for each exact normalized
  hostname while preserving winning Google order.
- The initial score starts at 30 for a valid website, adds 18 for a homepage,
  10 for a shallow path, 15/10 for keyword evidence in title/snippet, 10 for
  title-or-snippet location evidence, 12 for company-oriented language, and 5
  for a plausible standalone hostname. It subtracts 35 for jobs language, 20
  for article/news/blog evidence, 25 for contextual directory/listing language,
  15 for deep paths, and 15 when both title and snippet are absent. Scores are
  clamped to 0-100 and signal metadata uses stable codes.
- The score is not FlipScore, verification, qualification, or an investment
  recommendation. Results may still be imperfect web pages, and accepted count
  may be zero. No crawler, DNS, redirect, AI, or additional provider request is
  used.
- Safe diagnostics enforce the invariant `received = accepted + hard rejected
  + below threshold + duplicate host`. Each rejected result has one primary
  reason; blocked/invalid/non-website counters are documented hard-rejection
  subcategories and do not change that invariant.
- Manual validation requires the explicit command below. Each confirmed
  invocation consumes at most one Google request, creates no opportunity, and
  writes no database, cache, quota, budget, health, usage, or statistics data:

  `npm.cmd run test:google-discovery -- --confirm-live-google-request --mode business_upgrade --keyword roofing --city Miami --country "United States" --maxResults 10`

- Without the confirmation flag, the script exits before loading `.env.local`,
  importing the test service, constructing a provider, or reading Google
  configuration. It never runs during dev, build, startup, lint, or tests. Open
  Discovery remains the planned free fallback.

Phase B Owned Domains is implemented with server-session APIs, canonical
snake_case Firestore persistence, legacy camelCase read mapping, transactional
name reservations, soft-delete trash/restore, bounded audit history, atomic
activity/timeline/log writes, analytics counter maintenance, prefix search,
filters, sorting, and cursor pagination. Routes exist for list, create, detail,
edit, trash, and restore.

Remaining Phase B operational work: deploy Firestore rules and indexes, and run
a future non-destructive backfill so legacy camelCase documents participate in
all canonical indexed queries. The repository still has no automated test
runner.

## Phase B stabilization

- Domain actor UIDs remain authoritative, while detail UI resolves the tenant
  owner name/email and uses immutable audit display snapshots for new writes.
  Historical non-owner actors fall back to shortened UIDs without cross-tenant
  profile reads.
- Domain list requests abort stale fetches; prefix search is debounced by 300 ms.
- Trash and restore optimistically remove list rows, roll back failures, provide
  visible feedback, and refetch private tenant data without a full reload.
- Ascending and descending indexes are configured for the supported query
  matrix.
- To limit composite indexes, search, status, and registrar are mutually
  exclusive. Filtered/search lists use created-date sorting. Unfiltered lists
  support created date, expiration date, FlipScore, purchase price, and asking
  price in both directions.
- Domain API responses use `private, no-store`. Missing-index failures return
  `FIRESTORE_INDEX_REQUIRED` and emit structured, secret-free diagnostics.

## Phase B.5 UX and loading experience

- One application-level `UXProvider`, mounted inside the existing theme
  provider, owns loading operations, navigation progress, and bounded toasts.
- Foreground operations show an immediate thin progress bar and show the smoky
  fullscreen overlay only when they exceed 250 ms. Foreground mutation messages
  take priority over generic navigation messages.
- Navigation tokens complete on pathname/query changes and have a 12-second
  orphan fallback. Modified, external, download, new-tab, same-URL, and
  hash-only link clicks retain native behavior and do not start route loading.
- Admin, domain-list, domain-detail, and domain-form route boundaries use
  destination-shaped skeletons. Existing list results remain visible during
  background search and refresh requests.
- Toasts support success, error, warning, and information states, manual
  dismissal, bounded visibility, deduplication, expiry, and pause-on-hover or
  focus.
- CSS implements progress, shimmer, overlay, and toast animation without
  animation-frame state updates. Reduced-motion preferences disable
  nonessential movement.
- Route progress cannot observe a navigation before browser history emits its
  event, and its fallback is intentionally finite. Runtime interaction and
  assistive-technology behavior still require authenticated browser testing.

Phase A of the authentication security foundation is implemented.

The authoritative database architecture is SaaS v2 below `users/{uid}`. Public
registration defaults to viewer, Firebase custom claims are authoritative, and
the `/admin` shell is protected by a verified server session. Existing accounts
without a role claim require an explicit manual assignment.

Cleanup debt: the tracked `gitignore/.next/` directory must be resolved directly
after Phase A security validation and is intentionally untouched in Phase A.

---

# Important instruction

Continue only from the current state of the repository.

## Temporary Google Custom Search manual diagnostics

- The explicitly confirmed Google discovery CLI temporarily subscribes to an
  internal HTTP-error diagnostic channel for failure analysis.
- Diagnostics are limited to HTTP status, Google error code/status/reason, and
  a strict allowlisted category. Google's raw response and message are never
  printed, stored, attached to provider errors, or returned through runtime
  interfaces.
- Runtime provider errors remain sanitized and unchanged. Product APIs, UI,
  discovery lifecycle, persistence, normalization, and quality filtering do
  not receive these diagnostics.
- The diagnostic path adds no retry or additional request. One confirmed CLI
  invocation still performs at most one Google request.

## Phase C.2.2-A Open Discovery provider foundation

- A server-only `open_discovery` provider foundation now implements the common
  provider contract for `business_upgrade` and `local_seo` requests with pure,
  meaningful criteria validation.
- Its capability category is `business_discovery`. Its separate immutable
  configuration metadata classifies provider access as free, requires no paid
  access, and assigns zero request cost without defining activation state.
- The provider is a typed stub only: `search()` always throws the sanitized
  `PROVIDER_NOT_IMPLEMENTED` error, normalization returns an immutable empty
  result, and no open-data source or transport has been selected.
- It is exported and known by identifier but remains unregistered in discovery
  composition, inactive under provider policy, and unreachable from APIs, UI,
  lifecycle processing, persistence, orchestration, or internal test tooling.
- The next Open Discovery phase must select and implement the first real free
  source before this provider can return data.

## Phase C.2.2-B isolated Overpass transport investigation

- Open Discovery now has a server-only OpenStreetMap Overpass investigation
  boundary for `business_upgrade` requests only. The earlier helper's
  `local_seo` mode remains a future planning boundary and is not advertised or
  accepted by the provider's authoritative executable capabilities.
- The boundary builds deterministic Overpass QL from normalized keyword, city,
  optional state, and country criteria. User values are escaped separately for
  quoted QL strings and literal POSIX ERE matching; they cannot supply tag
  keys, operators, statements, timeouts, limits, or output clauses.
- The investigation uses exact administrative-area names, the `name` and
  `brand` text-bearing tags, and requires an explicit website-oriented tag.
  This intentionally favors a narrow signal and cannot provide complete
  category or business coverage; legitimate OSM businesses without website
  tags are excluded.
- Area-name matching can resolve no area, multiple areas, or a different area
  with the same name. No ISO code, admin level, geographic identity, or
  resolved location is inferred, and the query never falls back to an
  unbounded global search.
- The transport permits exactly one URL-encoded native-fetch POST to one fixed
  endpoint, with a 20-second Overpass server timeout, a 28-second client
  timeout, and a code-owned maximum of 25 raw elements. There is no geocoding,
  retry, pagination, batching, alternate endpoint, or parallel request.
- Successful responses are structurally validated and copied into a narrow raw
  node/way/relation model; empty element arrays are valid. Non-success or
  malformed responses map to sanitized provider-neutral errors without
  reading, logging, persisting, or exposing raw error bodies.
- The transport remains disconnected from composition, product APIs, UI,
  lifecycle processing, persistence, and opportunity generation. `normalize()`
  still returns a frozen empty canonical array, so no canonical discovery
  result is created and no product workflow can issue an Overpass request.
- Public Overpass instances have resource and rate limits. This investigation
  does not establish production reliability, data completeness, or suitability
  as Wabmarket's final discovery source. A future controlled manual-testing
  phase must evaluate real coverage before normalization or integration.

## Phase C.2.2-C manual Overpass investigation CLI

- A manual engineering-only `test:open-discovery` command can now execute one
  isolated `business_upgrade` investigation with keyword, city, country, and
  optional state criteria. It requires the explicit
  `--confirm-live-overpass-request` flag before importing the server-only test
  service or provider code.
- Every confirmed invocation consumes exactly one request against the public
  Overpass endpoint. The command is never invoked by application startup,
  build, lint, tests, APIs, UI, lifecycle processing, composition, or the
  orchestrator, and it does not load environment files or tenant configuration.
- The CLI prints one compact JSON diagnostic containing only the provider,
  element/type counts, records with website/name/coordinates, and monotonic
  provider-execution duration. It never prints raw elements, tags, coordinates,
  URLs, contact details, queries, endpoints, response payloads, stacks, or
  internal causes.
- Diagnostic invariants require node, way, and relation totals to equal the raw
  element count and require all aggregate counts to be bounded non-negative
  integers. A valid response containing zero elements remains a successful
  investigation result.
- The isolated service constructs a fresh provider and calls `search()` once.
  It does not call `normalize()`, create canonical provider items, store data,
  generate opportunities, register the provider, retry, paginate, or execute a
  second request.
- Public Overpass coverage may be incomplete or geographically ambiguous, and
  this command does not establish production reliability. No canonical results
  or opportunities are created and no investigation data is persisted.

## Isolated Overpass timeout diagnosis and query optimization

- The first confirmed manual request for `roofing` in Miami, Florida, United
  States returned the sanitized `PROVIDER_TIMEOUT` error. The previous
  transport could not distinguish its 12-second client abort from an HTTP 504,
  and its two-second server/client timeout separation could hide a delayed
  server response.
- The previous hierarchical area sets could contain multiple exact-name
  matches and silently expand the search. The optimized query now uses official
  named-set statistical counts and executes business scanning only when
  country, optional state, and city each resolve to exactly one administrative
  area. Zero or multiple matches leave a valid empty result set.
- Search scope is reduced from four `nwr` selectors to exactly four explicit
  branches: node/name, way/name, node/brand, and way/brand. Operator,
  description, and relation searches were removed; one fixed website-key regex
  still requires `website`, `contact:website`, `url`, or `contact:url`.
- The output ceiling is 25 raw elements and quick sorting was removed. This
  ceiling limits serialization only and does not guarantee low candidate-scan
  cost.
- The bounded server timeout is now 20 seconds and the client timeout is 28
  seconds. A larger declared server timeout can still affect admission under
  public-instance load, and public Overpass reliability remains unproven.
- Confirmed manual CLI runs can distinguish `client_timeout`,
  `server_timeout_504`, `server_runtime_timeout`, and `unknown_timeout` through
  a temporary safe diagnostic channel. Runtime callers still receive only
  `PROVIDER_TIMEOUT`; raw remarks, bodies, queries, endpoints, stacks, and
  causes are not exposed.
- No live request was made during this optimization. The provider remains
  disconnected, no canonical result or opportunity is created, and no data is
  persisted.

## Phase C.2.2-D Open Discovery OSM taxonomy foundation

- The first optimized live Overpass transport investigation completed in
  approximately 2.5 seconds and returned a structurally valid zero-element
  response for roofing in Miami, Florida. This was a successful transport
  result, not a provider failure.
- The empty result exposed the recall limitation of matching business keywords
  only against OSM `name` and `brand` values. Many business categories are
  represented through structured OSM tags instead of free-text names.
- A pure, code-owned taxonomy now contains one approved mapping: the aliases
  `roofer`, `roofers`, `roofing`, and `roof repair` resolve to the established
  `craft=roofer` selector. Dash and underscore separator variants normalize to
  the same explicitly approved alias.
- Taxonomy entries, aliases, and selectors are deeply immutable. A deterministic
  construction invariant rejects duplicate normalized aliases rather than
  selecting an entry arbitrarily, and only approved entries participate in
  lookup.
- The resolver accepts only a keyword. Runtime callers cannot submit OSM keys,
  values, regular expressions, QL fragments, operators, admin levels, or area
  identifiers. Unknown keywords are never guessed and return no match.
- The taxonomy is a retrieval hint only. It does not verify business identity,
  website ownership, acquisition availability, opportunity quality, or
  FlipScore.
- The taxonomy is connected only to the isolated Overpass investigation query.
  It remains disconnected from product workflows, canonical normalization,
  opportunities, and persistence.

## Phase C.2.2-E taxonomy-aware Overpass query integration

- The optimized name/brand-only live investigation completed successfully but
  returned zero elements. Approved taxonomy keywords now select the
  `taxonomy_structured` retrieval strategy; all unknown keywords select only
  `text_fallback` and are never assigned a guessed category.
- Roofing and the other approved roofer aliases resolve through the code-owned
  `roofer` entry to `craft=roofer`. The structured query uses exactly two
  branches—node and way—and does not require the keyword to appear in `name` or
  `brand`.
- Structured selector keys and values originate only from approved immutable
  taxonomy entries and are escaped by the query builder. Runtime callers cannot
  submit selectors, regular expressions, QL fragments, operators, area IDs, or
  admin levels.
- Unknown terms retain the four conservative text branches for node/way
  `name`/`brand` matching. Both retrieval strategies require a non-empty
  allowlisted website-oriented tag.
- Existing unique-country, optional-state, and city area guards remain
  fail-closed. The 20-second server timeout, 28-second client timeout,
  25-element output ceiling, one-request boundary, and tags/center output are
  unchanged.
- The manual engineering CLI reports only `retrievalStrategy` and
  `taxonomyEntryId` in addition to existing aggregate diagnostics; it does not
  reveal selectors or query text.
- Open Discovery remains investigation-only. `normalize()` still returns no
  canonical items, and no API, UI, lifecycle, database, opportunity,
  composition, or orchestration integration was added.

## Phase G.2.1 Google Places primary discovery provider

- Google Places API (New) is now the selected primary live business-discovery
  source, represented by the distinct `google_places` identifier. The existing
  `google` identifier continues to mean the deprecated Google Custom Search
  adapter and was not changed or repurposed.
- The disconnected provider supports only `business_upgrade` and can execute
  one native-fetch Text Search (New) POST after explicit manual confirmation.
  It includes pure service-area businesses and uses a fixed one-page ceiling of
  20 results, a 10-second client timeout, no retry, and no automatic or parallel
  pagination.
- The immutable field mask requests only ID, display name, formatted address,
  primary type, types, business status, website URI, and the pure-service-area
  indicator. Requesting `websiteUri` places Text Search execution in the
  Enterprise pricing tier.
- Configuration is server-only and lazy. Only `GOOGLE_PLACES_API_KEY` is read,
  only after confirmed execution begins. The deprecated Custom Search API key
  and Search Engine ID are not reused.
- Google Places content is transient. Display names, addresses, websites,
  types, and business status are not written to Firestore, cache, files, logs,
  analytics, or any other durable store. Place IDs are eligible for durable
  storage under Google policy, but this phase adds no persistence.
- The validated manual Miami roofing sample returned 20 relevant businesses;
  all 20 had websites and 5 of 20 used non-`.com` domains. This is one empirical
  sample and is not a guaranteed global coverage or extension rate.
- Local engineering diagnostics classify valid unique website hostnames by
  `.com`, non-`.com`, and hyphen shape. A non-`.com` hostname or any hostname
  containing a hyphen is a basic weakness candidate. This conservative
  hostname-only check does not calculate registrable eTLD+1 boundaries and is
  not FlipScore, availability evidence, or an opportunity decision. Valid
  `.com` and non-hyphenated businesses remain in the provider result.
- Future phases may evaluate candidate `.com` generation, brand/domain
  mismatch, length, extra words, numeric clutter, alternate extensions, hyphen
  replacement, exact-match `.com` opportunities, registrar and aftermarket
  availability, and FlipScore. None are implemented here.
- Zero-cost operation is not assumed. It requires external Google Cloud quota
  configuration plus a future persistent Wabmarket quota/usage policy. This
  phase adds no counters, automatic paid overage, production scheduling, API,
  UI, lifecycle, opportunity, composition, or orchestrator integration.

## Phase G.2.2-A domain opportunity analyzer foundation

- Added a standalone, pure TypeScript analyzer that accepts both a business
  name and a hostname. It is not connected to Google Places, another provider,
  APIs, UI, lifecycle processing, persistence, or opportunity generation.
- Business names are normalized deterministically with Unicode NFKC,
  lowercasing, punctuation/separator replacement, trimming, and whitespace
  collapsing. Raw normalized tokens remain available without stemming,
  translation, synonym inference, fuzzy matching, or silent generic-term
  removal.
- Common trailing legal suffixes are reported as facts for `llc`, `inc`,
  `corp`, `corporation`, `ltd`, `limited`, `company`, and `co`. Base business
  tokens are preserved, while a separately named filtered token list omits only
  detected trailing suffix tokens. Legal suffixes are not weaknesses or scores.
- Hostname normalization lowercases, removes one trailing dot and exactly one
  leading `www.`, validates labels conservatively, and preserves all other
  subdomains. It performs no DNS, HTTP, registrar, or public-suffix lookup.
- Hostnames expose factual labels, the rightmost label, immediate-left label,
  candidate subdomain labels, length, domain tokens, digit and hyphen presence,
  and `.com`/non-`.com` facts. Concatenated words are never semantically split.
- Public Suffix List resolution is explicitly unavailable. For names such as
  `example.co.uk`, the rightmost and immediate-left labels are only factual
  positions; the analyzer does not claim an authoritative registrable domain,
  public suffix, eTLD+1, or subdomain classification.
- The only weakness fact retained is the existing basic diagnostic:
  `isNonDotCom || hasHyphen`. No similarity, overlap, edit distance, scoring,
  FlipScore, candidate generation, availability, AI, or recommendation logic
  exists in this phase.

## Phase G.2.2-B brand-to-domain comparison foundation

- Added an isolated pure comparator over the existing immutable domain-analysis
  result. Primary keyword and city are explicit caller-supplied comparison
  context and are never inferred from providers, AI, location services, or
  business-name semantics.
- Comparison keeps exact-token matching and adds controlled whole-stem compact
  matching. Compact forms are generated only from ordered contiguous sequences
  of already-known normalized business, keyword, and city tokens; arbitrary
  hostname substrings are never searched or semantically segmented.
- The immutable result exposes only `containsBrandWord`,
  `containsPrimaryKeyword`, `containsCity`, `allTokensPresent`,
  `zeroBrandTokens`, `onlyGenericTokens`, and one classification: `BRANDED`,
  `PARTIALLY_BRANDED`, `GENERIC_KEYWORD`, or `UNRELATED`.
- Brand candidates exclude explicit keyword/city context and a small immutable
  non-brand token set containing the previously documented generic terms and
  legal suffixes. Generic terms remain tokens and are not independently
  classified as weaknesses.
- `BRANDED` requires a distinctive brand token plus complete non-legal business
  token coverage. `PARTIALLY_BRANDED` requires a controlled exact or compact
  brand match with incomplete coverage. Context-only keyword/city matches remain
  `GENERIC_KEYWORD`; all other comparisons are `UNRELATED`.
- No numeric score, similarity percentage, edit distance, token-overlap score,
  FlipScore, candidate generation, availability lookup, provider integration,
  network access, persistence, API, UI, or opportunity generation was added.

## Phase G.2.2-C weakness signals engine

- Added a pure immutable signal projection that consumes only an existing
  `DomainOpportunityAnalysis` and `BrandDomainComparison`. It performs no new
  normalization, provider lookup, inference, persistence, or external work.
- Domain-quality signals expose non-`.com`, hyphen, digit, and analyzer-provided
  subdomain facts. The subdomain value retains the analyzer's documented
  non-PSL-aware limitation.
- Brand alignment maps the comparator classification to exactly one mutually
  exclusive boolean: branded, partially branded, generic keyword, or unrelated.
- Business naming exposes only the existing legal-suffix fact.
- Domain composition exposes compact brand, keyword-only, and city-only facts.
  Compact brand requires comparator-confirmed brand alignment and exactly one
  domain token that is not itself an exact individual business token. It does
  not perform substring matching or reconstruct unknown words.
- Keyword-only and city-only signals rely exclusively on the comparator's
  explicit primary-keyword and city evidence. They remain false whenever the
  corresponding trustworthy evidence is absent or brand evidence is present.
- Signals have no weights, severity, score, opportunity classification,
  FlipScore, candidate generation, AI, network, Google, Dynadot, persistence,
  provider, API, or UI integration.

## Phase G.2.2-D signal importance foundation

- Added a pure immutable importance projection that consumes only the existing
  grouped signal object. Every signal retains its active boolean and receives
  one typed label: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, or `NEUTRAL`.
- Inactive signals always receive `NEUTRAL`. Active non-`.com` and hyphen facts
  are `HIGH`; digits are `MEDIUM`; structural subdomain state remains
  `NEUTRAL` until future hosted-platform or contextual analysis exists.
- Brand alignment maps active partial branding to `MEDIUM`, generic keyword to
  `HIGH`, unrelated to `CRITICAL`, and branded to `NEUTRAL`.
- Keyword-only and city-only composition facts are `HIGH` when active. Compact
  brand domains remain `NEUTRAL`.
- `containsLegalSuffix` describes the business name, not the domain, and remains
  `NEUTRAL`. Legal-suffix importance can become meaningful only if a future
  analyzer introduces a separate, trustworthy domain-specific legal-suffix
  signal.
- Importance labels are metadata, not numeric weights, severity math, totals,
  scores, FlipScore, or opportunity decisions. No new inference, provider,
  network, AI, persistence, API, or UI behavior was added.

## Phase G.2.2-E domain composition intelligence

- Added a pure immutable domain-composition projection over an existing
  `DomainOpportunityAnalysis` plus explicit `primaryKeyword` and `city`
  context. Keyword and city are normalized with the existing deterministic
  business-text normalization and are never inferred from token position,
  provider type, business-name heuristics, or hostname contents.
- Domain business-term facts are limited to controlled evidence for `llc`,
  `inc`, `corp`, `company`, and `co`. Exact tokens and compact labels are
  recognized only when the entire label can be segmented into known business,
  context, or controlled legal tokens; arbitrary substring matches such as
  `art` in `cart`, `co` in `company`, or `inc` in `prince` are rejected.
- Context facts expose only explicit primary-keyword and city presence.
  Repetition facts expose repeated keyword sequences, city sequences, and
  known business tokens without semantic splitting, fuzzy matching, stemming,
  translation, or inferred word boundaries.
- `compactBrandDomain` requires the complete domain stem to equal an ordered,
  contiguous concatenation of at least two known non-legal business tokens.
  `keywordStuffedDomain` is true only when the explicit normalized keyword
  sequence occurs more than once.
- These outputs are deterministic facts only. They do not assign weakness,
  importance, numeric weights, scores, FlipScore, availability, candidate
  domains, or opportunity classifications and have no network, AI, provider,
  persistence, API, or UI integration.

## Phase G.2.2-F1 FlipScore policy foundation

- Added a pure immutable policy projection that consumes only existing signal
  importance metadata, domain-composition facts, domain signals, and comparator
  output. It defines the dimensions `NEED`, `IMPACT`, and `CONFIDENCE` without
  assigning any numeric values.
- Every explanation rule declares one semantic effect: `OPPORTUNITY` for
  weakness evidence, `PROTECTIVE` for positive brand evidence, or
  `INFORMATIONAL` for context-only future rules. Only opportunity rules carry
  a `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW` rule priority; protective and
  informational rules always use `null`.
- Added concise explanation policies for brand mismatch, non-`.com` domains,
  hyphenated domains, keyword-only domains, unrelated domains, strong and
  compact branding, domain-contained legal suffixes, and repeated primary
  keywords. Generic mismatch, keyword-only, and unrelated-brand rules are
  mutually suppressed where needed so one underlying brand condition does not
  emit redundant user-facing explanations.
- Domain legal-suffix policy reads only the domain-composition facts. It does
  not reuse the separate business-name legal-suffix signal. Existing neutral
  importance is never converted into an artificial low priority.
- Rule priority is explanation metadata, not an overall business priority.
  This foundation calculates no score, numeric weight, total, FlipScore,
  ranking, opportunity classification, or recommendation and has no network,
  AI, provider, persistence, API, or UI integration.

## Phase G.2.2-F2 FlipScore weight policy

- Added immutable numeric policy metadata over the F1 policy model. Dimension
  allocations are fixed at 50 for `NEED`, 30 for `IMPACT`, and 20 for
  `CONFIDENCE`; module initialization fails unless the global allocation totals
  100.
- Rule numbers are magnitudes only. They do not add points, subtract points,
  indicate positive opportunity contribution, normalize active rules, or
  calculate FlipScore. Direction remains exclusively owned by each F1 rule's
  `OPPORTUNITY`, `PROTECTIVE`, or `INFORMATIONAL` effect.
- `unrelated_domain` owns 30 NEED magnitude and `keyword_only_domain` owns 12.
  `strong_brand_mismatch` is explicit explanation-only metadata with magnitude
  zero. NEED retains eight unallocated units because no new or overlapping rule
  was invented merely to fill the dimension cap.
- IMPACT magnitudes are eight for non-`.com`, eight for hyphen, four for a
  domain legal suffix, and ten for keyword repetition. CONFIDENCE magnitudes
  are twelve for strong branding and eight for compact branding.
- Strong and compact branding remain protective evidence. Their magnitudes are
  not positive opportunity points; a future engine must interpret their F1
  effect before applying any direction or normalization.
- The two brand-mismatch rules share an explicit overlap group. Validation
  prevents multiple positive magnitudes within an overlap group and also
  enforces unique known rule IDs, known allowed dimensions, finite non-negative
  magnitudes, zero magnitude for explanation-only rules, and complete one-to-one
  coverage of an F1 policy.
- F2 returns only deeply immutable dimension allocation, rule magnitude, and
  maximum-magnitude normalization metadata. It performs no runtime scoring,
  addition, subtraction, ranking, business priority, recommendation, or
  opportunity classification and adds no network, AI, provider, persistence,
  API, or UI integration.
