# WABMARKET CHANGELOG

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
