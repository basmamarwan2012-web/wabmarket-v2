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
