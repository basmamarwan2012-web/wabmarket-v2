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
- The investigation uses exact administrative-area names, a fixed allowlist of
  text-bearing tags (`name`, `brand`, `operator`, and `description`), and
  requires an explicit website-oriented tag. This intentionally favors a
  narrow signal and cannot provide complete category or business coverage.
- Area-name matching can resolve no area, multiple areas, or a different area
  with the same name. No ISO code, admin level, geographic identity, or
  resolved location is inferred, and the query never falls back to an
  unbounded global search.
- The transport permits exactly one URL-encoded native-fetch POST to one fixed
  endpoint, with a 10-second Overpass server timeout, a 12-second client
  timeout, and a code-owned maximum of 50 raw elements. There is no geocoding,
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
