# Domain First Discovery Specification

## Purpose

Domain First Discovery is the second discovery engine of Wabmarket.

Unlike Business First Discovery, it starts from available domains instead of existing businesses.

Its objective is to discover businesses that are strong buyers for domains already available for acquisition.

---

# Core Principle

Business First asks:

Which businesses have weak domains?

Domain First asks:

Which available domains already have strong potential buyers?

Both pipelines eventually produce the same Opportunity model.

---

# High-Level Pipeline

Domain Provider

↓

Candidate Domains

↓

Quality Filters

↓

Keyword Extraction

↓

Location Extraction

↓

Google Places Search

↓

Business Matching

↓

Current Domain Analysis

↓

FlipScore

↓

Opportunity

---

# Step 1 — Domain Sources

Future providers may include:

- Dynadot
- GoDaddy
- Afternic
- Sedo
- Namecheap
- DropCatch
- SnapNames

Possible inventories:

- Available
- Premium
- Marketplace
- Auction
- Closeout
- Backorder
- Liquidation

Each provider is implemented through its own adapter.

---

# Step 2 — Domain Quality Filter

Candidate domains are filtered before any Google request.

Examples:

Preferred TLD

- .com

Maximum price

- configurable

Maximum length

No hyphens

No unnecessary numbers

No adult keywords

No spam patterns

Brandable structure

Domains failing these rules never continue.

---

# Step 3 — Keyword Extraction

Example

miamiroofexperts.com

↓

keyword

roofing

brand

experts

city

Miami

Extraction remains deterministic.

No AI.

No semantic guessing.

---

# Step 4 — Google Places

Example query

roofing in Miami

Only one controlled Google Places search.

No pagination.

No retry.

No uncontrolled expansion.

---

# Step 5 — Business Matching

Every returned business is evaluated against:

Business name

Current domain

Candidate domain

Keyword

City

Current branding

Candidate branding

Existing FlipScore

---

# Step 6 — Candidate Evaluation

The candidate domain is evaluated separately.

Examples

Brand quality

Keyword quality

Length

Extension

Readability

Price

Availability status

Marketplace source

Candidate quality never replaces FlipScore.

---

# Step 7 — Opportunity Creation

Business

+

Current Domain

+

Candidate Domain

↓

Opportunity

Opportunity contains both current-state facts and candidate-domain facts.

---

# Price Strategy

Future configurable filters

Maximum purchase price

Preferred default

20 USD

Different users may configure different limits.

---

# Acquisition Types

AVAILABLE

BUY_NOW

AUCTION

CLOSEOUT

BACKORDER

PREMIUM

LIQUIDATION

Status always comes from the provider.

Never inferred.

---

# Duplicate Protection

The same candidate domain should not generate duplicate opportunities.

Possible identity

Candidate domain

+

Business

+

Discovery source

---

# Future Matching Improvements

Possible future signals

Business keyword

Brand similarity

City similarity

Existing website quality

Domain quality

Acquisition price

Expected resale value

Search demand

Trademark safety

These are future additions.

---

# Automation

Future scheduled workflow

Provider

↓

Quality filters

↓

Keyword extraction

↓

Business discovery

↓

FlipScore

↓

Opportunity Feed

Automation must respect:

API quotas

Provider limits

Monthly budget

Duplicate protection

---

# User Controls

Users may configure

Maximum price

Preferred TLD

Allowed marketplaces

Allowed registrars

Preferred acquisition types

Preferred countries

Preferred niches

---

# Safety

The system must never

Purchase domains

Bid automatically

Place backorders

Spend money

Contact businesses

All purchasing remains a future manual action.

---

# Current Status

Implemented

Business First Discovery

Google Places

FlipScore

Domain Analysis

Comparator

Signals

Weights

Policy

Engine

Planned

Candidate generation

Marketplace adapters

Availability providers

Domain First Discovery

Opportunity Feed

Automation