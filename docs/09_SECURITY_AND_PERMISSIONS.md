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

---

# DATABASE SECURITY

---

## Firestore rules

Only authenticated users may access data.

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