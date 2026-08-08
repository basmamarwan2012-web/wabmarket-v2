# Opportunity Feed Specification

## Purpose

The Opportunity Feed is the primary working dashboard of Wabmarket.

Its goal is to surface the highest-value domain opportunities discovered by the system while allowing users to perform manual discovery at any time.

The feed complements manual search. It never replaces it.

---

# Dashboard Layout

The dashboard contains two independent areas.

## 1. Opportunity Feed

Automatically populated.

Contains:

- New opportunities
- Recently updated opportunities
- Saved opportunities
- Archived opportunities

---

## 2. Manual Search

Always available.

The user can launch new searches regardless of feed contents.

Supported modes:

- Business First
- Domain First

---

# Opportunity Card

Each opportunity contains immutable discovery facts.

Business

- Business name
- City
- State
- Country

Current Domain

- Current website
- Current hostname

Candidate Domain

- Candidate hostname
- Acquisition source
- Acquisition status
- Acquisition price

Analysis

- FlipScore
- Priority
- Confidence
- Reasons

Discovery

- Discovery mode
- Discovery date
- Last verification
- Freshness

---

# Feed Sections

The feed may expose multiple logical views.

## Critical

Highest priority opportunities.

## High

Strong opportunities.

## Medium

Moderate opportunities.

## Low

Minor opportunities.

## Saved

User-saved opportunities.

## Archived

Previously reviewed opportunities.

---

# Filtering

Examples:

Business

- keyword
- category
- city
- state
- country

Domain

- TLD
- availability status
- registrar
- marketplace
- acquisition type
- maximum price

Opportunity

- FlipScore
- priority
- confidence

Discovery

- Business First
- Domain First

---

# Sorting

Examples:

- FlipScore
- newest
- oldest
- acquisition price
- alphabetical
- confidence

---

# Opportunity Detail

Opening an opportunity may display:

Business

Current domain

Candidate domain

FlipScore explanation

Reasons

Domain comparison

Weakness signals

Availability details

Future contact history

---

# User Actions

Future actions may include:

Save

Archive

Ignore

Export

Refresh

Open business website

Open domain listing

None of these actions automatically purchase domains or contact businesses.

---

# Manual Search

Business First

Inputs

- keyword
- city
- state
- country

Result

Businesses

↓

FlipScore

↓

Candidate domains

---

Domain First

Inputs

- keyword
- city
- inventory type
- registrar
- marketplace
- maximum price
- preferred TLD

Result

Candidate domains

↓

Matching businesses

↓

FlipScore

---

# Saved Searches

Future versions may allow:

Save search

Run again

Scheduled execution

Email notification

Opportunity notification

---

# Freshness

Each opportunity should expose freshness information.

Examples

- Today
- Yesterday
- 3 days ago
- Last week

Stale opportunities should eventually be revalidated.

---

# Duplicate Protection

The feed should avoid duplicate opportunities.

Duplicates may be detected using:

Business

Current domain

Candidate domain

Discovery source

---

# Domain Preparation Status

Prepared domains should expose their preparation state.

Examples:

- Draft
- Branding
- Landing Page Ready
- Marketplace Ready
- Ready For Marketing

Only domains marked as Ready For Marketing should enter outbound marketing campaigns.

---

# Opportunity Lifecycle

NEW

↓

REVIEWED

↓

SAVED

↓

CONTACTED

↓

WON

or

LOST

or

ARCHIVED

Lifecycle tracking is future work.

---

# Performance Goals

The feed should eventually support:

Pagination

Lazy loading

Incremental refresh

Cached UI state

Without changing immutable opportunity facts.

---

# Marketplace

Wabmarket Marketplace is the public catalog of prepared domains.

Each listing represents a complete branded domain product rather than a raw domain name.

Every marketplace listing should display:

- Domain
- Logo
- Category
- Industry
- Price
- Availability status
- Marketplace source

Selecting a marketplace card opens the dedicated landing page.

Landing pages redirect buyers to the configured marketplace provider.

Marketplace visitors may discover domains organically without receiving outreach emails.

The Marketplace complements outbound sales and provides an additional acquisition channel.

---

# Future AI

AI may eventually:

Summarize opportunities

Generate sales angles

Generate outreach drafts

Prioritize review order

AI must never modify FlipScore.

FlipScore remains deterministic.

---

# Product Principle

The Opportunity Feed is not a search result.

It is a continuously growing inventory of validated opportunities.

Manual Search remains available for exploratory discovery whenever the user wants to investigate a new market.