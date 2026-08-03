# WABMARKET TECHNICAL ARCHITECTURE DOCUMENT

Version: 1.0

---

# Overview

Wabmarket is built as an event-driven platform.

The architecture must support:

- scalability;
- fault tolerance;
- asynchronous processing;
- automation;
- high availability;
- modular development.

---

# System architecture

```text
                    Users
                       │
                       ▼
                 Cloudflare CDN
                       │
                       ▼
                    Nginx
                       │
                       ▼
                Next.js Server
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
     Firebase        Redis       Cron Jobs
         │             │              │
         ▼             ▼              ▼
     Firestore      BullMQ       Background Jobs
         │
         ▼
      Storage
```

---

# Application architecture

```text
app/
components/
services/
actions/
hooks/
providers/
firebase/
middleware/
lib/
types/
utils/
scripts/
cron/
public/
```

---

# Frontend stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Framer Motion
- Shadcn UI
- React Hook Form
- Zod

---

# Backend stack

- Node.js
- Next.js API Routes
- Firebase Admin SDK

---

# Database stack

- Firebase Firestore
- Firebase Storage
- Firebase Authentication

---

# Queue system

Technology:

- Redis
- BullMQ

---

# Available queues

---

## Domain discovery queue

Responsible for:

- domain scanning;
- availability checks;
- keyword extraction;
- CPC analysis.

---

## FlipScore queue

Responsible for:

- scoring domains;
- ranking domains.

---

## Lead generation queue

Responsible for:

- crawling websites;
- extracting information.

---

## Branding queue

Responsible for:

- generating logos;
- generating descriptions.

---

## Outreach queue

Responsible for:

- creating campaigns;
- sending emails.

---

## Notification queue

Responsible for:

- sending alerts;
- updating users.

---

# Firebase structure

```text
firebase/
├── admin.ts
├── client.ts
├── auth.ts
├── firestore.ts
├── storage.ts
└── rules/
```

---

# Service architecture

```text
services/

flipscore.service.ts

dynadot.service.ts

gmail.service.ts

google.service.ts

crawler.service.ts

lead.service.ts

branding.service.ts

analytics.service.ts

email.service.ts

queue.service.ts

notification.service.ts

timeline.service.ts

archive.service.ts
```

---

# API architecture

```text
api/

auth/

domains/

owned-domains/

leads/

campaigns/

analytics/

branding/

notifications/

settings/
```

---

# Authentication architecture

Supported methods:

- email and password;
- Google authentication;
- multi-factor authentication.

---

# Permission system

```text
Administrator

Manager

Operator

Viewer
```

---

# Cache system

Supported layers:

---

## Browser cache

Used for:

- images;
- fonts;
- static assets.

---

## Redis cache

Used for:

- API requests;
- frequently used queries;
- analytics.

---

# Logging system

Technology:

- Winston

---

# Monitoring system

Technology:

- Sentry

---

# Backup strategy

Frequency:

- daily backups;
- weekly backups;
- monthly backups.

---

# Retry strategy

Attempts:

```text
Attempt 1

Attempt 2

Attempt 3

Failure
```

---

# Error management

Every error must include:

- timestamp;
- service name;
- severity;
- stack trace;
- user identifier.

---

# Cron architecture

Every hour:

- update analytics;
- verify queues;
- synchronize domains.

---

Every six hours:

- generate leads;
- refresh opportunities.

---

Every day:

- send campaigns;
- update reports.

---

Every week:

- create backups;
- optimize indexes.

---

# Email infrastructure

Provider:

- Gmail API.

---

Features:

- OAuth authentication;
- automatic token refresh;
- bounce detection;
- reply detection;
- spam monitoring.

---

# Domain infrastructure

Provider:

- Dynadot API.

---

Features:

- purchase domains;
- renew domains;
- synchronize domains;
- modify nameservers;
- retrieve WHOIS information.

---

# Artificial intelligence architecture

Modules:

- pricing engine;
- logo generation engine;
- branding engine;
- sales engine;
- negotiation engine;
- reply engine.

---

# Security architecture

Security layers:

- RBAC;
- CSRF protection;
- XSS protection;
- rate limiting;
- encryption;
- audit logs.

---

# Deployment architecture

Environment:

- Asura Hosting;
- Docker;
- PM2;
- Nginx;
- Node.js.

---

# Scalability strategy

Horizontal scaling:

- Redis;
- BullMQ;
- queue separation.

Vertical scaling:

- caching;
- indexing;
- optimization.

---

# Final rule

No module must directly depend on another module.

Every module must communicate through services, events, and queues.