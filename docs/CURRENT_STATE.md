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

Phase 1 is partially completed.

The next objective is to complete Phase 1.

---

# Important instruction

Continue only from the current state of the repository.