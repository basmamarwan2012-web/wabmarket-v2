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
