# WABMARKET SECURITY AND PERMISSIONS

Version: 1.0

---

# OVERVIEW

The security layer must protect:

- users;
- API keys;
- domains;
- email accounts;
- financial information;
- attachments;
- reports.

Every operation must be authenticated, authorized, and logged.

---

# SECURITY ARCHITECTURE

```text
User
 │
 ▼
Authentication
 │
 ▼
Authorization
 │
 ▼
Validation
 │
 ▼
Rate limiting
 │
 ▼
Business logic
 │
 ▼
Database
```

---

# AUTHENTICATION

Provider:

- Firebase Authentication

---

Supported methods:

- email and password;
- Google OAuth;
- multi-factor authentication (optional).

---

# SESSION MANAGEMENT

Phase A uses the centralized cookie name `wabmarket_session` with a finite
five-day lifetime, HttpOnly, Secure in production, SameSite=Lax, and Path=/.
Middleware checks presence only. Firebase Admin verifies signature, expiry,
revocation, and role in the Node.js server layout before `/admin` renders.

The browser Firebase session remains active for direct Firestore and Storage SDK
calls. Login creates both sessions; logout clears the server cookie and then the
browser Firebase session.

Requirements:

- secure cookies;
- automatic expiration;
- refresh tokens;
- device verification.

---

# PASSWORD POLICY

Minimum requirements:

- twelve characters;
- uppercase letters;
- lowercase letters;
- numbers;
- symbols.

---

# ROLE-BASED ACCESS CONTROL (RBAC)

---

## Administrator

Permissions:

- full access;
- financial access;
- user management;
- configuration management;
- API management.

---

## Manager

Permissions:

- domain management;
- campaign management;
- lead management.

---

## Operator

Permissions:

- update statuses;
- send campaigns;
- manage negotiations.

---

## Viewer

Permissions:

- read-only access.

All four authenticated roles may enter `/admin`. Capabilities are checked with
centralized permission helpers. Custom claims are authoritative; the Firestore
role is only a server-controlled mirror. Missing or invalid role claims are
denied and never promoted automatically.

## First-administrator bootstrap

There is no public role-promotion endpoint. A project owner performs the
one-time bootstrap from a trusted workstation using the existing Firebase Admin
server credentials:

```powershell
node --env-file=.env.local scripts/bootstrap-administrator.mjs '<firebase-auth-uid>'
```

Obtain the exact UID from Firebase Console > Authentication > Users. The script
preserves unrelated custom claims, assigns `administrator`, and updates the
server-controlled Firestore mirror. The user must sign out and sign in again.
No public role-promotion endpoint exists.

---

# DATABASE SECURITY

---

## Firestore rules

Only authenticated users may access data.

SaaS v2 access is isolated below `users/{uid}`. Viewer can read but cannot write
tenant business data. Client writes cannot create profiles or alter authoritative
identity, role, status/security, subscription/plan, timestamp, or audit fields.
Storage uses the same UID isolation and a 20 MB allowlist for file types.

Phase B domain authorization is enforced by every server API after Firebase
Admin session verification. Firebase Admin bypasses Firestore Security Rules;
the rules do not authorize Admin SDK operations. Direct client writes to owned
domains, domain-name reservations, activities, timelines, logs, and analytics
are denied.

Owned-domain permissions:

- administrator/manager: create, read, update, move to trash, trash read, and
  restore;
- operator: normal reads plus description, asking price, estimated price, and
  allowlisted workflow transitions only;
- viewer: normal reads only.

Operator transitions are `active -> sold|expired|archived`, `sold -> archived`,
and `expired -> archived`. Operators cannot transition from opportunity or
archived and cannot move any domain into active. Viewer/operator cannot access
trash records.

---

## Principle of least privilege

Users must only access the resources they need.

---

# ENCRYPTION

---

## Encryption at rest

Provider:

- Google Cloud.

---

## Encryption in transit

Protocol:

```text
TLS 1.2+
```

---

# SECRET MANAGEMENT

The following information must never be exposed:

- API keys;
- refresh tokens;
- access tokens;
- SMTP credentials;
- OAuth credentials.

---

# RATE LIMITING

---

Authentication routes:

```text
10 requests per minute
```

---

API routes:

```text
100 requests per minute
```

---

Administrative routes:

```text
50 requests per minute
```

---

# CROSS-SITE REQUEST FORGERY (CSRF)

Protection must be enabled globally.

---

# CROSS-SITE SCRIPTING (XSS)

Protection rules:

- sanitize all inputs;
- escape all outputs;
- validate HTML content.

---

# SQL INJECTION PROTECTION

Although Firestore does not use SQL, all data must be validated.

---

# FILE UPLOAD SECURITY

Allowed extensions:

- pdf;
- jpg;
- jpeg;
- png;
- webp;
- svg.

---

Maximum size:

```text
20 MB
```

---

# AUDIT LOGS

Every action must generate a log.

---

Examples:

- login;
- logout;
- purchase;
- deletion;
- update;
- email sent.

---

# NOTIFICATIONS

Alerts must be generated for:

- failed logins;
- suspicious activity;
- failed payments;
- expired sessions;
- exceeded quotas.

---

# BACKUP STRATEGY

---

Daily backups.

---

Weekly backups.

---

Monthly backups.

---

# INCIDENT RECOVERY PLAN

---

Step 1:

Detect the incident.

---

Step 2:

Isolate the system.

---

Step 3:

Restore the backup.

---

Step 4:

Analyze the logs.

---

Step 5:

Deploy the fix.

---

# FINAL RULE

Every operation must be:

- authenticated;
- authorized;
- validated;
- logged.
