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
