# WABMARKET API DOCUMENTATION

Version: 1.0

---

# API DESIGN PRINCIPLES

All APIs must:

- use HTTPS;
- return JSON;
- support pagination;
- support filtering;
- support sorting;
- support caching;
- support rate limiting;
- support retries;
- return standardized responses.

---

# Base URLs

Production

https://admin.wabmarket.com/api

---

Development

http://localhost:3000/api

---

# Response structure

Success

{
  "success": true,
  "data": {},
  "message": ""
}

---

Error

{
  "success": false,
  "error": "",
  "status": 500
}

---

############################################################

AUTHENTICATION API

############################################################

POST

/api/auth/login

POST

/api/auth/logout

POST

/api/auth/register

POST

/api/auth/reset-password

POST

/api/auth/verify-token

GET

/api/auth/profile

PATCH

/api/auth/profile

---

############################################################

DOMAIN DISCOVERY API

############################################################

POST

/api/domains/discover

Request

{
  "keyword": "roofing",
  "city": "miami",
  "country": "us"
}

---

Response

{
  "status": "queued"
}

---

GET

/api/domains

GET

/api/domains/:id

PATCH

/api/domains/:id

DELETE

/api/domains/:id

---

############################################################

OWNED DOMAINS API

############################################################

GET

/api/owned-domains

---

GET

/api/owned-domains/:id

---

PATCH

/api/owned-domains/:id

---

DELETE

/api/owned-domains/:id

---

POST

/api/owned-domains/sync

Description:

Synchronize all domains from Dynadot.

---

POST

/api/owned-domains/import

Description:

Import domains manually.

---

############################################################

FLIPSCORE API

############################################################

POST

/api/flipscore/calculate

---

Request

{
  "domain": "roofingmiami.com"
}

---

Response

{
  "flipscore": 91
}

---

############################################################

DYNADOT API

############################################################

POST

/api/dynadot/check

POST

/api/dynadot/purchase

POST

/api/dynadot/renew

POST

/api/dynadot/update-nameservers

POST

/api/dynadot/synchronize

GET

/api/dynadot/whois

---

############################################################

GOOGLE SEARCH API

############################################################

POST

/api/google/search

Request

{
  "keyword": "roofing",
  "city": "miami"
}

---

Response

{
  "companies": []
}

---

############################################################

LEAD GENERATION API

############################################################

POST

/api/leads/generate

GET

/api/leads

PATCH

/api/leads/:id

DELETE

/api/leads/:id

---

############################################################

EMAIL API

############################################################

POST

/api/emails/send

POST

/api/emails/reply

POST

/api/emails/schedule

GET

/api/emails/history

---

############################################################

CAMPAIGN API

############################################################

POST

/ api/campaigns

GET

/ api/campaigns

PATCH

/ api/campaigns/:id

DELETE

/ api/campaigns/:id

---

############################################################

AI API

############################################################

POST

/api/ai/generate-logo

POST

/api/ai/generate-description

POST

/api/ai/generate-brand-story

POST

/api/ai/generate-pitch

POST

/api/ai/generate-reply

POST

/api/ai/generate-landing-page

POST

/api/ai/generate-price

---

############################################################

ANALYTICS API

############################################################

GET

/api/analytics/dashboard

GET

/api/analytics/revenue

GET

/api/analytics/domains

GET

/api/analytics/campaigns

GET

/api/analytics/leads

---

############################################################

ACTIVITY API

############################################################

GET

/api/activities

POST

/api/activities

---

############################################################

TIMELINE API

############################################################

GET

/api/timeline

POST

/api/timeline

---

############################################################

FILE API

############################################################

POST

/api/files/upload

DELETE

/api/files/delete

GET

/api/files/download

---

############################################################

WEBHOOKS

############################################################

POST

/api/webhooks/gmail

POST

/api/webhooks/dynadot

POST

/api/webhooks/stripe

---

############################################################

HEALTH CHECK

############################################################

GET

/api/health

Response

{
  "status": "healthy"
}