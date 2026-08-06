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
