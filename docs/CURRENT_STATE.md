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

- Firestore remains the current persistence implementation for existing
  shipped modules pending controlled migration.
- MySQL is the approved target for new Wabmarket business-data persistence,
  isolated behind provider-neutral repositories and Drizzle infrastructure.

## Authentication

- Firebase Authentication

## Storage

- Firebase Storage remains available to existing modules.
- Future generated asset binaries use a provider-neutral file/object-storage
  boundary; relational records store references and metadata, never blobs.

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

## Phase G.2.2-F3 FlipScore engine v1

- Added the first pure deterministic scoring engine over only the immutable F1
  policy and F2 magnitude policy. It returns frozen NEED, IMPACT, CONFIDENCE,
  FlipScore, priority, and active human-readable reasons without importing
  analyzers, providers, persistence, APIs, or UI code.
- Opportunity dimensions normalize active positive magnitude against the
  maximum magnitude that can be simultaneously active under explicit v1
  constraints. The alignment rules form one mutually exclusive NEED family,
  producing a safe maximum of 30; the four explicitly independent IMPACT rules
  may coexist, producing a safe maximum of 30. The engine fails closed if a
  positive opportunity rule lacks explicit coexistence coverage.
- The formula is
  `round(allocation * activeMagnitude / maximumSimultaneousMagnitude)`, clamped
  to the dimension allocation. Consequently unrelated-domain magnitude 30
  yields NEED 50, keyword-only magnitude 12 yields NEED 20, non-`.com`
  magnitude eight yields IMPACT eight, and all four IMPACT rules yield 30.
- CONFIDENCE represents trust in the opportunity assessment. Without any
  positive-magnitude opportunity evidence it is zero. Otherwise it begins at
  20 and active protective CONFIDENCE magnitude reduces it, clamped to zero.
  Protective evidence never creates opportunity points.
- FlipScore v1 is the clamped sum of NEED, IMPACT, and CONFIDENCE. Priorities
  are LOW for 0â€“24, MEDIUM for 25â€“49, HIGH for 50â€“74, and CRITICAL for
  75â€“100. Reasons contain only deduplicated active F1 messages in stable F1
  order, including protective explanations where active.
- The v1 policy is deterministic and explainable but not statistically
  calibrated. Future calibration may change magnitudes, allocations, and
  thresholds without changing analyzer, comparator, signal, or composition
  contracts.
- No candidate generation, availability lookup, DNS, Dynadot, Google, AI,
  network access, persistence, API, UI, ranking, or recommendation integration
  was added.

## Phase G.2.2-G manual end-to-end FlipScore validation

- Extended only the confirmation-gated Google Places engineering test service.
  Every accepted transient business now passes locally through the existing
  analyzer, comparator, signals, importance, domain composition, F1 policy, F2
  magnitude policy, and F3 engine in that exact order.
- Business name and normalized hostname come from the accepted transient Google
  Places result. Primary keyword and city come explicitly from the already
  validated CLI request; neither value is inferred from the business or domain.
- Each safe result contains only place ID, business name, normalized domain,
  primary type, FlipScore, priority, NEED/IMPACT/CONFIDENCE breakdown, and
  active human-readable reasons. Results sort by FlipScore descending and retain
  original Google order for ties.
- The report retains useful domain-shape diagnostics and adds accepted total,
  priority counts, and a deterministic average FlipScore rounded to two decimal
  places. All report objects, nested breakdowns, reasons, and result arrays are
  immutable.
- The live boundary remains one existing Text Search request followed by local
  transient analysis. No extra fetch, retry, pagination, persistence, candidate
  generation, Dynadot, DNS, AI, opportunity creation, API, UI, lifecycle, or
  production composition integration was added.

## Phase G.2.3-A deterministic candidate-domain generation foundation

- Added a disconnected pure TypeScript generator for forward-discovery domain
  possibilities. It accepts explicit business name, primary keyword, city, and
  optional country context and reuses the existing deterministic business-name
  normalization, tokenizer, and trailing legal-suffix analysis.
- V1 emits only lowercase single-label `.com` hostnames. It uses normalized
  non-legal business tokens, explicit keyword/city tokens, and the fixed generic
  dictionary `experts`, `pros`, `services`, `solutions`, and `group`; it does
  not infer abbreviations, synonyms, translations, or semantic relationships.
- Fourteen immutable patterns run in fixed order: brand; brand-keyword;
  brand-keyword-city; city-brand-keyword; keyword-brand; five brand-led
  commercial variants; and four keyword-led variants. Exact repeated tokens
  are retained only at their first position and duplicate hostnames preserve
  their earliest pattern.
- Generated second-level labels must be non-empty ASCII alphanumeric strings no
  longer than 32 characters. The generator never truncates, adds hyphens, or
  invents digits; digits survive only when present in explicit normalized
  inputs.
- Results and nested candidate records are immutable and include only hostname
  and stable pattern ID. No availability, price, registrar, marketplace,
  acquisition status, score, recommendation, provider call, network access,
  persistence, opportunity creation, API, UI, or existing workflow integration
  was added.

## Phase G.2.3-B scalable domain-availability provider foundation

- Added a server-only, provider-neutral `DomainAvailabilityProvider` boundary
  with normalized immutable `hostname`, provider identifier,
  `AVAILABLE | REGISTERED | UNKNOWN`, and `checkedAt` results. The generic
  service validates and normalizes the complete ordered caller input before
  execution, preserves order defensively, and rejects invalid provider output.
- Added the first isolated adapter for Dynadot REST v2 `bulk_search`. One lookup
  accepts at most five unique valid hostnames and performs at most one native
  `fetch`, with a 10-second timeout, no retry, no pagination, no parallel fanout,
  and no hidden second pass. Credentials remain behind a lazy server-only Bearer
  header configuration boundary.
- `show_price=true` is sent only because Dynadot documents the premium marker
  with priced availability results. Price lists are neither modeled nor retained.
  Explicit `available=true` plus `premium=no` maps to `AVAILABLE`; explicit
  unavailable maps to `REGISTERED`; premium, unknown, missing, duplicate,
  mismatched, malformed, and per-domain-error evidence maps conservatively to
  `UNKNOWN`.
- Transport, configuration, HTTP, rate-limit, timeout, cancellation, invalid
  JSON, and unexpected network failures remain typed sanitized failures. No raw
  provider body, credential, price, or provider-specific cause is returned.
- Registration availability remains separate from marketplace, auction,
  closeout, liquidation, backorder, premium-purchase, and other acquisition
  inventory. This foundation is disconnected from candidate generation,
  opportunity creation, persistence, API, UI, lifecycle, routing, and AI.

## Phase G.2.3-C canonical opportunity model foundation

- Added a pure provider-neutral canonical Opportunity constructor representing
  a business, current hostname, candidate hostname, current-domain FlipScore,
  candidate registration-availability fact, and discovery provenance. Output is
  deeply immutable and contains no raw provider fields.
- Canonical identity is `opp_` plus SHA-256 of a versioned, length-prefixed tuple
  containing only `opportunity:v1`, canonical business identity, current
  hostname, and candidate hostname. Business identity prefers a normalized
  Place ID and otherwise uses normalized business name, city, optional state,
  and country. Timestamps, discovery mode, provider, availability, score,
  reasons, and candidate pattern do not affect identity.
- `BUSINESS_FIRST` and `DOMAIN_FIRST` remain immutable provenance facts but
  converge on the same opportunity ID for the same commercial opportunity.
  Future persistence may attach multiple discovery events to that one identity.
- Construction validates hostname and candidate/availability agreement,
  canonical timestamps, provider and availability status, candidate pattern,
  FlipScore and dimension ranges, score sum, priority threshold consistency,
  and bounded human-readable fields before producing the allowlisted model.
- This foundation adds no persistence, lifecycle state, Opportunity Feed,
  acquisition, purchase, marketplace, marketing, CRM, API, UI, AI, or provider
  execution and does not modify the legacy opportunity placeholder.

## Phase G.2.3-D forward opportunity qualification service

- Added a server-only Business-First orchestration boundary that accepts an
  already-completed FlipScore result and explicit business, current-domain,
  keyword, location, and discovery-time facts. It reuses the deterministic
  candidate generator, injected provider through `DomainAvailabilityService`,
  and the canonical Opportunity constructor without duplicating their logic.
- V1 selects only the first candidates in generator order, capped by both the
  explicit five-candidate product ceiling and the provider's declared per-call
  capacity. It performs one provider lookup at most, with no further batch,
  retry, ranking, or continuation to candidate six and beyond.
- Only explicit `AVAILABLE` results become canonical opportunities.
  `REGISTERED` and `UNKNOWN` results remain report facts and produce none.
  Opportunities retain deterministic candidate order and canonical identity.
- The immutable report exposes generated, checked, and available counts plus
  deeply immutable opportunities. A valid zero-candidate generation returns an
  empty report without invoking the provider.
- Availability does not create or alter qualification scores: the input
  business must already have completed FlipScore analysis. This phase adds no
  Google or live Dynadot call, persistence, Firestore, API, UI, feed, purchase,
  acquisition, marketplace, preparation, marketing, CRM, AI, or Domain-First
  orchestration.

## Phase G.2.3-E manual forward-opportunity qualification CLI

- Added an isolated confirmation-gated engineering CLI for one Business-First
  qualification run. It accepts explicit business identity, current domain,
  keyword, city, optional state, country, optional Place ID, and optional
  primary type and prints only a compact allowlisted report.
- Current-domain FlipScore is calculated locally by composing the existing
  analyzer, comparator, signals, importance, composition, F1 policy, F2
  magnitude policy, and F3 engine in their established order. The result is
  passed to the existing forward qualification service; no scoring, candidate,
  availability, or canonical-opportunity logic is duplicated.
- CLI parsing, duplicate-option rejection, normalization, hostname validation,
  and explicit `--confirm-live-domain-availability-request` checking occur
  before `.env.local` loading. The server-only test service is dynamically
  imported afterward and creates a fresh Dynadot adapter only for that run.
- The inherited ceilings remain five candidates, one availability-service
  lookup, and one Dynadot REST v2 `bulk_search` request, with no retry,
  pagination, second batch, or candidate-six continuation.
- Implementation validation uses injected mocked providers only. No live
  Dynadot or Google request, persistence, purchase, marketplace, API, UI, AI,
  feed, or production workflow integration was added.

## Phase G.2.3-F candidate-domain quality and selection foundation

- Added a pure deterministic candidate-quality layer over existing generator
  pattern metadata and normalized business, keyword, and city tokens. It emits
  immutable structural, coverage, declared-order, generic-suffix, repetition,
  digit-origin, length, and compactness facts without numeric scoring.
- V1 selection tiers are `PREFERRED`, `ACCEPTABLE`, `WEAK`, and `REJECT`.
  Structural or declared-pattern integrity failures reject; exact distinctive
  brand coverage in business order is preferred unless long; city-first exact
  coverage is acceptable; keyword-first, partial coverage, controlled appended
  generic suffixes, generic-only businesses, and valid long forms are weak.
- Controlled generic words are marked unnecessary only when the declared
  generator pattern appends one that was not already present in the normalized
  business name. Legitimate business terms such as `services` or `group` are
  not penalized merely for belonging to the controlled generic dictionary.
- Labels longer than 32 characters reject and are never truncated. Valid labels
  through 32 characters may be `LONG` and remain eligible for a non-reject tier.
  Repetition detection requires full deterministic tokenization from known
  context tokens; arbitrary substring, fuzzy, semantic, and AI inference remain
  absent.
- Stable ordering uses tier, exact brand coverage, declared token order,
  unnecessary-generic absence, compactness, hostname length, and original
  position. Optional availability facts are copied canonically but never affect
  quality or ordering.
- No provider execution, acquisition decision, automatic selection or purchase,
  persistence, marketplace, API, UI, or AI integration was added.

## Phase G.2.3-G acquisition recommendation and external handoff foundation

- Added a pure provider-neutral recommendation boundary that combines candidate
  selection tier, canonical registration availability, optional acquisition
  type, explicit fixed-price evidence, and a caller-owned maximum price policy.
- V1 returns only `RECOMMEND`, `REVIEW`, or `SKIP` with stable controlled reason
  codes. Preferred and acceptable candidates can be recommended when an
  actionable fixed-price path is complete; weak, unknown, auction, backorder,
  and incomplete evidence require review; rejected quality, comparable
  over-budget pricing, contradictory facts, and registered domains without a
  separate acquisition offer are skipped.
- Observed and maximum currencies are normalized explicitly and must match
  before any numeric comparison. Currency mismatch requires review, and this
  layer performs no exchange-rate inference or conversion.
- Registration availability and acquisition inventory remain distinct. A
  registered domain can still be recommended when separate complete fixed-price
  buy-now, marketplace, premium, closeout, or liquidation evidence exists.
- External handoff uses only an explicitly supplied absolute HTTPS provider URL
  with no embedded credentials. Wabmarket never constructs, opens, purchases,
  bids, backorders, accepts offers, intermediates checkout, or handles provider
  payment credentials.
- No network call, provider integration, persistence, API, UI, feed, purchase,
  marketplace fetch, marketing, CRM, or AI behavior was added.

## Domain Preparation model and readiness checklist foundation

- Added a pure immutable preparation model for an explicitly owned domain. It
  records canonical hostname, explicit ownership confirmation, optional source
  Opportunity provenance, structured logo, favicon, description, landing-page,
  and external-sales facts, plus deterministic readiness.
- Portfolio existence or lifecycle status, Opportunity existence, availability,
  recommendation, and provider handoff never infer ownership. Preparation can
  originate from independently recorded ownership without an Opportunity.
- Readiness is monotonic: `NOT_READY`, `READY_FOR_MARKETPLACE`, then
  `READY_FOR_MARKETING`. Marketplace and marketing requirement collections are
  structurally separate. V1 has no additional marketing-only requirements, so
  satisfying every marketplace requirement currently reaches marketing-ready.
- Marketplace readiness requires confirmed ownership, valid hostname, logo,
  favicon, description, finite positive asking price, normalized currency,
  landing page, explicitly supplied safe external HTTPS sales URL, and a
  configured CTA. Missing and invalid facts use stable controlled codes.
- Asking price is exclusively the intended resale price. It is not Portfolio
  purchase price, provider-observed acquisition cost, or acquisition budget;
  currencies are explicit and never converted.
- Invalid external sales URLs are not retained as usable destinations. URLs are
  never constructed, guessed, opened, or submitted, and embedded credentials
  are rejected. No checkout or other commercial action occurs in Wabmarket.
- No generation, deployment, publication, provider call, persistence, API, UI,
  marketplace integration, marketing, outreach, CRM, Domain-First discovery,
  Opportunity Feed, Company Intelligence, calibration, or AI was added.

## Domain Preparation assets and content generation foundation

- Added a provider-neutral preparation generator contract and a built-in pure
  deterministic template implementation. Generation requires explicit upstream
  ownership confirmation and never derives ownership from Portfolio,
  Opportunity, availability, recommendation, or provider handoff state.
- V1 produces immutable description, landing-page configuration, resale price
  and currency display facts, controlled external CTA metadata, SEO metadata,
  and Open Graph metadata using only explicitly supplied hostname, optional
  business/category/keyword/city context, and validated sales facts.
- Missing optional context is omitted rather than inferred. The external sales
  URL is copied exactly from validated explicit HTTPS input and is never built,
  guessed, modified, navigated to, or executed by this layer.
- Logo, favicon, and Open Graph images are generic asset slots. Missing assets
  remain `NONE`/`PENDING`; explicit manual or provider references become
  `AVAILABLE`. No image bytes, favicon derivation, HTML, page deployment, or
  marketplace publication is performed.
- Generic source metadata is limited to `TEMPLATE`, `MANUAL`, `PROVIDER`, and
  `NONE`. No AI provider, model, prompt, credential, quota, billing, or provider
  selection detail enters the contract; template generation works with AI off.
- No network, AI, persistence, Firestore, API, UI, purchase, checkout,
  marketplace call, marketing, outreach, CRM, or Company Intelligence behavior
  was added.

## Domain Preparation landing-page rendering foundation

- Added a pure framework-neutral renderer that maps an existing immutable
  `PreparationGenerationResult` into a landing-page document model. It reuses
  generated content verbatim and performs no copy or template generation.
- The render model includes canonical hostname, title and meta description,
  Open Graph metadata, logo/favicon/OG image render states, hero content,
  display domain, resale price facts, controlled CTA, stable sections, and
  non-numeric readiness.
- V1 section order is fixed as `HERO`, `VALUE_PROPOSITION`, `DOMAIN_DETAILS`,
  `PRICE`, `CTA`, and `FOOTER`. No testimonials, urgency, scarcity, fake buyer
  claims, statistics, or schema markup are introduced.
- Invalid core hostname, content, price, currency, or sales URL yields
  `NOT_RENDERABLE`. Valid core content with missing visual references yields
  `RENDERABLE_WITH_PLACEHOLDERS`; all three explicit visual references yield
  `FULLY_RENDERABLE`. Placeholder references remain null.
- The external CTA URL is validated and reused exactly. It is never constructed,
  guessed, modified, opened, or used for checkout inside Wabmarket.
- No raw HTML, Next.js route, deployment, marketplace publication, persistence,
  API, UI, provider call, AI, image generation, analytics, or outreach was added.

## Domain Preparation landing-page UI and route integration foundation

- Added the authenticated internal preview route
  `/admin/preparation/preview`. It uses an explicit deterministic `.example`
  fixture and does not connect Portfolio, Firestore, marketplace, or other
  persisted domain data.
- The Server Component builds the fixture through the existing preparation
  generator, converts it through the existing landing-page renderer, and passes
  only `LandingPageRenderModel` to the presentational component. React contains
  no template, validation, readiness, URL-validation, or preparation logic.
- `NOT_RENDERABLE` refuses the sales presentation. Placeholder-ready and fully
  renderable models map the controlled section order into a simple premium
  domain-product page without fabricated business identity, services,
  testimonials, reviews, statistics, urgency, or scarcity.
- Available logo references render as supplied; missing logo references render
  an explicit visual placeholder without an image URL. Favicon and Open Graph
  images are included in route metadata only when the render model marks their
  explicit references available.
- Metadata reuses render-model title, description, and Open Graph copy and sets
  `index: false` and `follow: false`. No metadata copy is regenerated.
- The CTA is a user-triggered external link using the exact render-model URL,
  `_blank`, and `noopener noreferrer`. No redirect, checkout, purchase, bid,
  backorder, or provider transaction occurs within Wabmarket.
- No public route, deployment, marketplace publication, persistence, API,
  provider call, AI, asset generation, analytics, marketing, outreach, or CRM
  integration was added.

## Marketplace listing model and publication eligibility foundation

- Added a pure provider-neutral canonical marketplace-listing projection over
  approved Domain Preparation, generated content, and landing-page render facts.
  The constructor regenerates no content, price, CTA, sales URL, asset, or
  readiness logic and publishes nothing.
- Listing identity is `listing_` plus SHA-256 of a length-prefixed tuple
  containing only `marketplace-listing:v1` and normalized hostname. Price,
  content, assets, readiness, URLs, provenance, and timestamps do not affect it.
- Publication policy returns `NOT_ELIGIBLE`,
  `ELIGIBLE_WITH_PLACEHOLDERS`, or `ELIGIBLE`. Ownership/preparation failure,
  upstream mismatch, non-renderable landing page, or invalid supplied landing
  reference blocks eligibility; fully complete facts and a real reference are
  eligible.
- Missing landing-page deployment reference and incomplete visual assets remain
  distinct facts through `LANDING_PAGE_REFERENCE_MISSING` and
  `VISUAL_ASSETS_INCOMPLETE`. Either can retain structural placeholder
  eligibility without fabricating a route or public URL.
- Canonical listing output is limited to domain-product display, resale,
  external CTA, visual, landing-reference, eligibility, and optional internal
  Opportunity provenance facts. It excludes business lead data, weak-domain
  facts, Place IDs, FlipScore, internal reasons, acquisition cost/budget,
  provider payloads, credentials, and tokens.
- No catalog, public route, persistence, publication, deployment, marketplace
  API, provider fetch, AI, asset generation, marketing, CRM, Reverse Discovery,
  Opportunity Feed, Company Intelligence, or calibration was added.

## Public marketplace catalog and read-model foundation

- Added a public-safe immutable catalog projection and a read-only public
  `/marketplace` route backed exclusively by explicit reserved `.example`
  fixtures. The route requires no authentication and has no write or publication
  controls.
- Catalog inclusion delegates to canonical publication output and admits only
  listings in `ELIGIBLE` state. `ELIGIBLE_WITH_PLACEHOLDERS` and
  `NOT_ELIGIBLE` records are excluded without duplicating eligibility rules.
- The public read model exposes only listing identity, domain-product display
  facts, resale price/currency, description, logo state, explicit landing-page
  reference, and external sales CTA facts. Internal preparation Opportunity
  provenance and all non-public listing internals are stripped.
- Fixtures pass through deterministic generation, canonical Domain Preparation,
  landing-page rendering, canonical MarketplaceListing construction, and the
  catalog projection. No fixture bypasses existing business boundaries.
- Catalog order is normalized hostname ascending with listing ID as a stable
  tie-breaker. No rank or marketplace score was introduced.
- Cards reuse exact canonical landing and external sales URLs through explicit
  user-triggered links with `noopener noreferrer`. The accessible empty state
  supports a catalog with no eligible records.
- No persistence, Firestore, Portfolio wiring, public domain detail route,
  automatic publication, marketplace API, search, filters, pagination,
  analytics, AI, outreach, CRM, Reverse Discovery, Opportunity Feed, Company
  Intelligence, calibration, or purchase execution was added.

## Public individual marketplace domain route foundation

- Added public read-only `/marketplace/domains/[hostname]` pages backed by one
  immutable reserved `.example` fixture allowlist shared with `/marketplace`.
  Catalog and detail routes no longer construct independent fixture facts.
- Every fixture passes through deterministic preparation generation, canonical
  Domain Preparation, landing-page rendering, and canonical MarketplaceListing
  construction once. The shared record supplies both catalog listing and detail
  render model, preventing catalog/detail drift.
- Route resolution safely decodes and normalizes the hostname, matches only the
  explicit allowlist, requires canonical `ELIGIBLE` publication and a renderable
  landing model, and returns `notFound()` for all other input. Route parameters
  never create listings.
- Canonical landing-page references now accept either explicit safe HTTPS URLs
  or the exact root-relative `/marketplace/domains/<normalized-hostname>` form.
  Queries, fragments, encoded targets, extra segments, protocol-relative URLs,
  and arbitrary paths remain invalid. External sales URLs remain HTTPS-only.
- Catalog cards now reference their matching internal public detail routes,
  while external sales URLs remain unchanged and separate. Detail pages reuse
  the existing `DomainLandingPage` component and exact external CTA behavior.
- Public metadata is projected only from the resolved render model; unknown,
  ineligible, and non-renderable fixtures produce no valid sales metadata.
- No persistence, Firestore, Portfolio integration, admin publication workflow,
  deployment automation, root-level slug, marketplace API, AI, analytics,
  outreach, CRM, Reverse Discovery, Opportunity Feed, Company Intelligence, or
  transaction execution was added.

## Relational Persistence Foundation v1

- Firebase Authentication, verified session cookies, custom claims, and RBAC
  remain authoritative for identity and authorization. A trusted server-only
  context maps the verified Firebase UID to a unique SQL account; SQL foreign
  keys use the internal account ID and no team/membership model is introduced.
- Added storage-neutral repository contracts for accounts, owned domains,
  preparation snapshots, asset metadata, marketplace publication, public
  marketplace reads, and transactional units of work. MySQL, Drizzle, and
  Firebase SDK types do not cross these repository interfaces.
- Added an isolated Drizzle/mysql2 adapter with an explicit lazy client factory
  and environment configuration for conventional local or approved remote
  MySQL. Importing configuration, schema, or repositories creates no pool and
  opens no connection; credentials are never placed in persistence errors.
- Added exactly five relational tables: `accounts`, `owned_domains`,
  `domain_assets`, `domain_preparations`, and `marketplace_listings`. Database
  constraints enforce unique Firebase identities, tenant-scoped hostnames, one
  current preparation/listing per owned domain, optimistic versions, explicit
  ownership facts, and one live globally published hostname.
- Publication eligibility remains a calculated canonical fact while actual
  lifecycle uses `DRAFT`, `PUBLISHED`, and `UNPUBLISHED`. Only canonical
  `ELIGIBLE` snapshots with a renderable landing model and explicit landing
  reference can be published. Public reads select `PUBLISHED` records only and
  project public-safe fields in deterministic hostname/listing-ID order.
- Asset persistence stores opaque storage keys, safe public references, MIME
  type, byte size, checksum, kind, and availability only. No bytes, absolute
  filesystem paths, provider credentials, or concrete filesystem adapter were
  added.
- This foundation is parallel and disconnected. Existing Firestore Owned
  Domains and discovery behavior remain unchanged; no migration, deletion,
  dual-write, route cutover, fixture replacement, database connection, or
  production deployment was performed.

## Marketplace Publication Application Service Foundation

- Added constructor-injected application services for saving current Domain
  Preparation and publishing or unpublishing canonical marketplace listings
  through the provider-neutral `PersistenceUnitOfWork` boundary.
- Preparation saves resolve the account-scoped owned domain, require exact
  hostname agreement across the owned domain, preparation, generated content,
  and landing render model, and validate each supplied logo/favicon/Open Graph
  asset through the account-scoped metadata repository. Associated assets must
  belong to the same owned domain and have the declared asset kind.
- Preparation persistence delegates the exact nullable expected version to the
  repository. Stale writes retain the sanitized
  `PERSISTENCE_VERSION_CONFLICT`; the service adds no retry or last-write-wins
  behavior and returns only owned-domain ID, hostname, preparation version, and
  readiness.
- Publication runs atomically: tenant-owned domain resolution, explicit
  ownership confirmation, current preparation load, canonical fact checks,
  `createMarketplaceListing()` reconstruction, exact `ELIGIBLE` gating, and
  repository publication occur inside one unit of work. Placeholder-eligible
  and ineligible listings never reach the publication write.
- Unpublication is tenant-scoped and version-exact through the repository.
  Service commands accept no account ID, Firebase UID, tenant ID, role, or
  ownership actor, and outputs expose no account, SQL, ORM, private preparation,
  credential, or provider records.
- Added no MySQL connection, migration execution, route cutover, fixture
  removal, Firestore migration/dual-write, asset storage adapter, provider
  request, AI, marketing, CRM, Reverse Discovery, Opportunity Feed, or
  transaction execution outside the injected persistence boundary.

## MySQL Production Readiness and controlled migration setup

- Standardized runtime and operator configuration on one server-only
  `DATABASE_*` contract. The lazy mysql2 pool now has a fixed ten-second
  connection timeout and bounded connection count; no import creates a pool.
- Added three explicit operator commands. `db:check` performs exactly one
  `SELECT 1`; `db:migrate` separates read-only status from explicit execution;
  and `db:smoke` verifies repository read-back and tenant isolation using
  synthetic reserved `.example` records that are always transaction-rolled
  back.
- Every command validates its exact confirmation flag before importing database
  execution modules or reading configuration. Pools close after success or
  failure, output is allowlisted, and raw mysql errors, SQL, endpoints,
  usernames, paths, and credentials are not exposed.
- Registered migration 0001 in Drizzle's journal and added statement
  breakpoints required by the existing migration runner. Status is derived only
  from ordered Drizzle history timestamps and hashes and reports `PENDING`,
  `APPLIED`, or `DRIFTED`; existing business tables never substitute for
  migration history.
- Migration 0001 remains editable only until its first real application. After
  that point it is immutable, and every schema change must use a new numbered
  migration.
- Added a cPanel-compatible deployment runbook covering database/user creation,
  least-privilege separation, configuration, connectivity, status inspection,
  explicit migration, smoke testing, cleanup verification, and stop-on-failure
  behavior.
- No live database operation, migration execution, Firestore migration,
  dual-write, route cutover, fixture removal, asset-storage implementation, or
  automatic build/start/deploy migration was added.

## Production MySQL composition for public marketplace reads

- Added a provider-neutral Marketplace read application service over the
  existing `MarketplaceReadRepository`. It lists published records and resolves
  a safely normalized hostname while preserving empty pages, missing records,
  and persistence failures as distinct outcomes.
- Service results are cloned and deeply frozen public snapshots. The service
  imports no MySQL, Drizzle, configuration, fixture, route, or UI module.
- Added a server-only MySQL composition boundary that lazily reads database
  configuration, creates a fresh client, constructs the existing MySQL read
  repository, injects the service, and closes the owned pool after success or
  failure. Infrastructure failures remain sanitized persistence errors.
- The composition exposes operations rather than an open client or mutable
  singleton. No connection occurs at import time and no fixture fallback masks
  database failures.
- Public marketplace routes remain fixture-backed in this slice. No route/UI,
  schema, migration, Firestore, publication workflow, asset storage, AI,
  outreach, CRM, Reverse Discovery, Opportunity Feed, or transaction behavior
  changed.

## Public marketplace route cutover to persisted MySQL reads

- Cut over public `/marketplace` to the production MySQL read composition. The
  route projects only the existing public catalog allowlist from persisted
  `PUBLISHED` snapshots, preserves repository order, and retains the existing
  empty state for a genuinely empty persisted catalog.
- Cut over `/marketplace/domains/[hostname]` and its metadata generation to the
  same persisted hostname resolver. A shared request-cached resolver safely
  decodes and normalizes route input, resolves published data once per render
  request where React caching applies, and passes the stored landing render
  model directly to the existing presentation component.
- Invalid, missing, and unpublished hostnames return not found. Configuration,
  connection, and query failures remain sanitized server failures and are never
  converted into empty or not-found results.
- Production routes no longer import fixtures or perform fallback. Reserved
  `.example` fixtures remain available only for pure tests and development
  demonstrations through their existing isolated modules.
- Added no component redesign, write API, admin workflow, schema/migration,
  Firestore migration or dual-write, asset storage, AI, outreach, CRM, Reverse
  Discovery, Opportunity Feed, or purchase behavior.

## Admin Marketplace Operations v1

- Added authenticated `/admin/marketplace` list and per-hostname preparation
  routes plus private admin APIs for list/detail, preparation save, publish, and
  unpublish. Reads follow the authenticated admin-shell policy; mutations use
  the existing `domains.manage` permission for administrators and managers.
- Added tenant-scoped owned-domain and publication read methods without schema
  changes. Every operation derives trusted identity from the verified Firebase
  session, resolves the SQL account server-side, creates one request-owned pool,
  and closes it after success or failure.
- Preparation input is limited to resale asking price/currency, explicit
  external sales URL, CTA state, optional description override, and existing
  account/domain-scoped asset metadata IDs. No identity, tenant, role,
  ownership actor, landing destination, raw asset reference, or SQL fact is
  accepted from the browser.
- A missing description override preserves existing deterministic `TEMPLATE`
  generation. A validated explicit override is copied unchanged with `MANUAL`
  source metadata; other landing, SEO, and Open Graph text remains template
  generated.
- The application layer derives exactly
  `/marketplace/domains/<normalized-hostname>` from the trusted SQL-owned domain
  and stores it as the preparation landing reference. The listing core still
  constructs no public URL, and external sales URLs remain separate.
- Preparation construction reuses generation, canonical Domain Preparation,
  landing rendering, and `DomainPreparationApplicationService`. Missing assets
  remain missing requirements; no upload/reference fabrication or readiness
  weakening was introduced.
- Publish and unpublish exclusively call
  `MarketplacePublicationApplicationService` with exact optimistic versions.
  Conflicts return a sanitized reload-and-retry state with no overwrite or
  automatic retry. Successful mutations revalidate only the corresponding
  public and admin framework paths.
- Existing public MySQL reads automatically include `PUBLISHED` snapshots and
  exclude unpublished records. No fixture fallback, direct UI/API SQL write,
  schema/migration, Firestore business persistence, dual-write, asset storage,
  AI, provider transaction, outreach, CRM, Reverse Discovery, or Opportunity
  Feed behavior was added.

## Asset Storage and Admin Upload v1

- Added server-only `ASSET_STORAGE_ROOT` configuration and a provider-neutral
  local-filesystem `AssetStore` adapter for conventional cPanel-compatible Node
  hosting. Opaque storage keys contain hashed account/domain scopes and a
  server-generated asset UUID; user filenames and absolute paths never enter
  storage metadata or public responses.
- Added strict signature and declared-MIME agreement checks. Logo files accept
  PNG, JPEG, and WebP up to 2 MiB; favicons accept PNG and ICO up to 512 KiB;
  Open Graph images accept PNG, JPEG, and WebP up to 5 MiB. SVG, unknown data,
  unbounded bodies, resizing, derivation, and AI generation remain unsupported.
- Added a tenant-scoped upload/delete application service. Uploads resolve the
  trusted SQL-owned domain, generate SHA-256 checksums and storage identity on
  the server, write bytes, and persist `AVAILABLE` metadata. A metadata failure
  compensates by removing the new file; a failed compensation reports an
  explicit sanitized orphan-risk error rather than pretending the boundary is
  transactional.
- Replacement is deliberately non-destructive: upload and persist the new
  asset, select it through the existing preparation save flow, then explicitly
  delete the old asset. Deletion rejects current preparation associations and
  references in a `PUBLISHED` marketplace snapshot; metadata-delete failures
  restore the previously read bytes where possible.
- Added authenticated `domains.manage` multipart upload and explicit delete
  endpoints plus compact logo/favicon/Open Graph controls on the existing admin
  preparation page. Upload alone does not select an asset, satisfy readiness,
  or publish a listing; all existing preparation and publication services
  remain authoritative.
- Added `/media/domain-assets/<asset-id>` as a controlled public byte route.
  `AVAILABLE` status and UUID knowledge are insufficient: the exact public
  reference must currently appear in the public snapshot of a `PUBLISHED`
  listing. Unselected, draft-only, unpublished, replaced, unknown, and deleted
  assets return not found. Infrastructure failures remain sanitized server
  failures rather than being converted to 404.
- Asset binaries remain outside MySQL and outside the public webroot; MySQL
  stores metadata and public snapshots only. No schema, migration, Firebase
  Storage, Firestore asset write, CDN, provider transaction, or live hosting
  operation was added.

## Branding and Asset Generation v1

- Added an immutable deterministic brand-identity model derived only from the
  normalized hostname/display name and explicitly supplied category, keyword,
  or city context. A versioned SHA-256 seed selects controlled modern, premium,
  professional, bold, or minimal style plus fixed palette and typography
  profiles. Missing context is never inferred.
- Added a provider-neutral visual generation contract with generic
  `DETERMINISTIC`, `MANUAL`, and `PROVIDER` source vocabulary. Core contracts
  contain no AI vendor, model, prompt, token, credential, quota, or billing
  field; future providers remain optional adapters.
- Added a zero-network deterministic PNG generator using only built-in Node
  compression and trusted application raster primitives. It produces a
  512×512 logo, a 64×64 favicon from the same monogram/identity, and a
  1200×630 Open Graph visual from the same palette and domain identity. It uses
  no SVG, user markup, remote font, external resource, native image package,
  asking-price claim, urgency, or scarcity.
- Generated bytes always pass through the existing
  `AssetUploadApplicationService`, signature/size validation, filesystem
  `AssetStore`, checksum verification, and MySQL metadata persistence. The
  generator writes no file or metadata directly and preserves existing upload
  compensation and tenant/domain checks.
- Added an authenticated `domains.manage` generation endpoint and compact
  Generate, Regenerate, and Generate Missing controls. Regeneration creates a
  new asset ID; no asset is overwritten or deleted. Generate Missing skips all
  currently selected slots, including manual and previously generated assets.
- Generation only adds available choices. It performs no automatic selection,
  preparation save, readiness override, publication, or replacement. Admins
  explicitly select generated assets in the existing form and save canonical
  preparation before the existing explicit Publish action can run.
- Published-only public media authorization remains unchanged. Private
  generated assets are not exposed merely to provide an admin preview; a
  future authenticated byte-preview boundary can add that UX without
  weakening public authorization.
- Added no package, schema, migration, Firebase Storage, Firestore persistence,
  AI provider, network call, or live filesystem/database operation.

## Domain Preparation UX Simplification v1

- Simplified the authenticated preparation workflow to Sales details → Prepare
  domain → Preview → Publish while retaining manual upload, generation,
  regeneration, selection, and guarded deletion in secondary advanced controls.
- Added a server-only Prepare-domain coordinator. It validates canonical sales
  facts, preserves existing selections, generates only empty logo/favicon/Open
  Graph slots in deterministic order, persists bytes through the existing
  upload pipeline, and auto-selects only assets created during that request.
- The coordinator reuses deterministic content generation, landing rendering,
  canonical Domain Preparation construction, exact optimistic versioning, and
  readiness evaluation. A valid generated CTA deterministically configures the
  existing CTA fact from the exact validated external HTTPS sales URL; it does
  not represent checkout, acquisition, or provider confirmation.
- Prepare never publishes. Publish remains a separate explicit action through
  `MarketplacePublicationApplicationService` and stays disabled while canonical
  preparation requirements fail.
- Added reverse-order compensation for newly generated request assets when a
  later generation or preparation save fails. Existing preparation and selected
  assets remain unchanged until the final save succeeds; filesystem and SQL are
  explicitly not represented as one ACID transaction.
- Added a stored-model authenticated preview per SQL-owned hostname and a
  tenant/domain-scoped private asset-content boundary for draft visuals. The
  existing public media route remains published-snapshot-only and unchanged.
- Added controlled actionable validation, storage, database, selected-asset,
  generation, optimistic-conflict, and cleanup messages without exposing SQL,
  paths, tenant identity, credentials, stack traces, or internal causes.
- Added no schema/migration, Firestore business write, Firebase Storage, AI,
  provider transaction, automatic publication, marketing, CRM, Reverse
  Discovery, Opportunity Feed, checkout, bid, or backorder behavior.

## Owned Domain Management and Premium Landing Page v1

- Added authenticated tenant-scoped owned-domain creation with canonical
  hostname normalization and mandatory explicit ownership confirmation. A
  duplicate tenant hostname returns a controlled conflict and never overwrites
  existing ownership or domain state.
- Added conservative owned-domain deletion for clean, unprepared, asset-free,
  publication-free records only. Preparation, any asset, published listing,
  and retained draft/unpublished publication records produce distinct safe
  blocking outcomes; no unpublish or cascade cleanup is attempted.
- Made the MySQL repository's guarded deletion authoritative: it locks the
  tenant-owned parent row, performs final reference checks, and deletes within
  the same unit-of-work transaction. Concurrent reference creation or a final
  database conflict blocks deletion instead of allowing cascade data loss.
- Added compact Add Owned Domain controls and two-step hostname-specific delete
  confirmation to `/admin/marketplace`. Tenant/account/Firebase identity and
  ownership actor facts continue to come exclusively from the trusted session
  composition and are never accepted from the browser.
- Extended deterministic generation and the landing render model with optional
  explicit public category, keyword, and city context plus canonical hostname
  structure, factual value points, controlled use-case copy, and sale status.
  Existing stored snapshots without these optional fields remain renderable
  through generic factual fallbacks; no migration is required.
- Upgraded the one shared landing presentation to the stable seven-section
  premium structure: Hero, Domain Value, Domain Details, Brand Preview, Use
  Case, Purchase CTA, and Footer. Admin preview and public pages remain visually
  aligned; only authenticated-private versus published-public asset access
  differs.
- Public copy uses only normalized domain properties, explicit preparation
  context, persisted price/currency, prepared text, explicit assets, and the
  exact validated external sales URL. No traffic, ranking, valuation, demand,
  scarcity, urgency, review, customer, or operating-business claim is created.
- Added no schema/migration, Firestore business write, registrar sync, AI,
  marketing, CRM, checkout, automatic publication, or destructive cascade.

## Registrar Owned-Domain Sync v1

- Added a provider-neutral manual registrar-inventory contract and tenant-scoped
  reconciliation service. A sync normalizes, deduplicates, and sorts provider
  hostnames before one SQL unit of work creates only missing owned domains.
- Added the Dynadot REST v2 account inventory adapter for
  `GET /restful/v2/domains`. Requests use server-only API-key/secret
  configuration, an exact HMAC-SHA256 `X-Signature`, a per-request UUID, a
  ten-second timeout, native fetch, and no retries.
- Manual synchronization is bounded to 100 records per page, five sequential
  pages/requests, and 500 fetched records. A result that reaches the ceiling is
  explicitly partial and never claims complete provider coverage.
- A successful authenticated registrar inventory is accepted as controlled
  ownership evidence for newly imported domains. Existing manual, prepared,
  asset-backed, and published records are never overwritten.
- Domains absent from a later complete provider inventory are counted only when
  they carry the controlled Dynadot evidence, but are retained unchanged. A
  truncated inventory cannot produce an absence count.
- Added a `domains.manage`-protected manual Dynadot sync endpoint and an admin
  action with session-local safe counts and a truncation warning. Browser input
  contains no account identity, provider selection, or credentials.
- Registrar expiration, auto-renew, provider status, provider record identity,
  and last-seen history remain transient/deferred because the current schema has
  no canonical columns for them. No schema, migration, scheduled sync,
  destructive reconciliation, Firestore write, purchase, renewal, or transfer
  behavior was added.
