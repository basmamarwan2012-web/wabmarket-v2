# Candidate Domain Generation Specification

## Purpose

Candidate Domain Generation creates potential upgrade domains for a business.

It never checks availability.

It never queries registrars.

It never performs DNS lookups.

It only generates deterministic candidate domain names.

Availability is a completely separate phase.

---

# Input

Business

Current domain

Keyword

City

Country

Optional business category

---

# Output

Ordered list of candidate domains.

Example

Business

Atlantic Roofing Miami

↓

Candidates

atlanticroofing.com

atlanticroofingmiami.com

atlanticroofingexperts.com

miamiatlanticroofing.com

...

No availability assumptions are made.

---

# Generation Principles

Generation must be deterministic.

The same input always produces the same candidate list.

No AI.

No randomness.

No external API.

---

# Allowed Sources

Business tokens

Keyword

City

Approved business words

Controlled separators

Nothing else.

---

# Business Name Normalization

Legal suffixes removed

Examples

LLC

Inc

Corp

Company

Co

Ltd

PLC

Business tokens normalized before generation.

---

# Token Types

Brand tokens

Keyword tokens

Location tokens

Generic business words

Each type remains explicitly identified.

---

# Generation Patterns

Examples

Brand

Brand + Keyword

Brand + Keyword + City

City + Brand + Keyword

Keyword + Brand

Brand + Experts

Brand + Group

Brand + Services

Brand + Solutions

Brand + Pros

Keyword + Pros

Keyword + Experts

Keyword + Group

Keyword + Services

Patterns are controlled.

Users never inject templates.

---

# Controlled Dictionary

Only approved business words.

Examples

group

services

experts

pros

solutions

team

systems

company

studio

works

network

partners

No arbitrary dictionary.

---

# Domain Rules

Prefer

.com

No hyphens

No unnecessary digits

Maximum length configurable

ASCII only

No duplicate labels

No empty labels

---

# Deduplication

Generated candidates are normalized.

Duplicates removed.

Stable generation order preserved.

---

# Quality Filters

Candidate rejected if

duplicate

empty

invalid hostname

contains repeated labels

contains illegal characters

contains multiple hyphens

fails length rules

---

# Ranking

Generation order is deterministic.

Ranking signals may include

Shortest

Brand-first

Brand + Keyword

Brand + Keyword + City

Keyword-first

Generic patterns

Ranking is deterministic.

No score.

---

# Availability

Candidate generation never performs

WHOIS

Registrar lookup

Marketplace lookup

Auction lookup

DNS lookup

Availability is a later pipeline.

---

# Future Availability Phase

Candidate

↓

Availability Provider

↓

Status

AVAILABLE

REGISTERED

PREMIUM

BUY_NOW

BACKORDER

AUCTION

CLOSEOUT

LIQUIDATION

---

# Future Marketplace Phase

Candidate domains may later be enriched with

Price

Marketplace

Registrar

Expiration

Inventory type

Seller

None of these belong to generation.

---

# Safety

Generation never

Purchases domains

Places bids

Creates backorders

Contacts businesses

Stores registrar credentials

---

# Example

Business

Best Roofing Miami LLC

Normalized

Brand

Best

Keyword

Roofing

City

Miami

Generated

bestroofing.com

bestroofingmiami.com

miamibestroofing.com

bestroofingpros.com

bestroofingexperts.com

bestroofinggroup.com

bestroofingservices.com

---

# Current Status

Implemented

Business discovery

FlipScore

Comparator

Signals

Weights

Engine

Planned

Candidate generation

Availability providers

Marketplace providers

Opportunity creation

Opportunity Feed

Domain First Discovery

---

# Product Principle

Candidate generation creates possibilities.

Availability determines reality.

FlipScore determines opportunity.

These three responsibilities must always remain independent.