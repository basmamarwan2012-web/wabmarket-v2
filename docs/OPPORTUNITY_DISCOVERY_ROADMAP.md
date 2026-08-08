# Wabmarket Opportunity Discovery Roadmap

## Purpose

Wabmarket has two complementary discovery directions:

1. Forward Discovery
2. Reverse Discovery

Both eventually produce the same canonical business opportunity.

---

# 1. Forward Discovery

Forward Discovery starts from an existing business.

Pipeline:

Google Places
→ Business
→ Current Website
→ Domain Analysis
→ Brand/Domain Comparison
→ Weakness Signals
→ FlipScore
→ Candidate Domain Generation
→ Domain Availability
→ Opportunity

Primary use case:

Find businesses whose current domain can be improved.

Example:

Business:
Best Roofing Miami

Current domain:
bestroofing.net

Potential future upgrade:
bestroofing.com

---

# 2. Reverse Discovery Engine

Reverse Discovery starts from a domain opportunity.

This complements Forward Discovery and does not replace it.

Pipeline:

Domain Providers / Marketplaces
→ Candidate Domains
→ Price / Status Filtering
→ Domain Quality Filtering
→ Keyword & Location Extraction
→ Google Places
→ Matching Businesses
→ Current-Domain Analysis
→ FlipScore
→ Opportunity

Core principle:

Find a valuable domain first, then identify businesses that are strong potential buyers for that exact domain.

This can produce cleaner leads while consuming fewer business-discovery requests.

---

# 3. Future Domain Sources

Reverse Discovery must use provider adapters.

Potential sources include:

- standard registration availability
- marketplace listings
- expired domains
- closeouts / liquidation inventory
- auctions
- backorders

Potential future providers may include:

- Dynadot
- GoDaddy
- Namecheap
- Sedo
- Afternic
- DropCatch
- SnapNames

No provider is assumed to support every inventory type.

---

# 4. Domain-First Filters

The system must filter domains before using Google Places.

Possible filters:

- maximum acquisition price
- default preferred maximum: configurable
- initial experimental example: USD 20
- .com preference
- no hyphens
- no unnecessary digits
- acceptable domain length
- business-relevant keyword
- optional city/location token
- clean brand structure
- excluded unsafe/adult categories
- future trademark-risk filtering

Filtering must happen before business discovery whenever possible.

---

# 5. Acquisition Status

Candidate domains must retain explicit source status.

Examples:

- AVAILABLE
- MARKETPLACE
- CLOSEOUT
- EXPIRED_AUCTION
- BACKORDER
- BUY_NOW
- PREMIUM

These states must never be fabricated.

Price, source, and status must be treated as time-sensitive data.

---

# 6. Business Matching

After a candidate domain passes domain-side filters:

Example candidate:

miamiroofexperts.com

Derived context:

keyword:
roofing

city:
Miami

Google Places query:

roofing in Miami

Returned businesses are compared against the candidate domain.

The matching layer evaluates:

- business name
- current domain
- candidate domain
- keyword
- city
- brand alignment
- current-domain weaknesses
- candidate-domain quality

---

# 7. Reverse Opportunity Score

Reverse Discovery must not assume that an available domain automatically has a buyer.

A future matching score should evaluate:

- candidate domain quality
- business/candidate brand similarity
- current-domain weakness
- geographic relevance
- keyword relevance
- acquisition price
- expected upgrade value
- confidence

FlipScore may be reused or extended, but domain ownership/availability must remain a separate fact.

---

# 8. Opportunity Feed

Wabmarket should eventually generate a recurring Opportunity Feed.

Example:

Today's Opportunities

- Critical
- High
- Medium
- Low

Each opportunity may show:

- business
- current domain
- candidate domain
- FlipScore
- domain source
- acquisition status
- acquisition price
- reasons
- freshness
- recommended next action

The feed supplements manual discovery.

It must never remove the user's ability to run their own searches.

---

# 9. Manual Search Modes

Future Wabmarket should expose at least two manual modes.

## Business First

Inputs:

- keyword
- city
- state
- country

Flow:

Business → Domain → Opportunity

## Domain First

Inputs may include:

- keyword
- city
- country
- maximum price
- inventory type
- registrar / marketplace
- TLD
- domain-quality filters

Flow:

Domain → Business → Opportunity

---

# 10. Domain Preparation

After a domain has been selected and acquired, it must go through a preparation phase before entering any marketing workflow.

Preparation transforms a raw domain into a complete branded digital product.

Pipeline:

Acquired Domain

↓

Brand Identity

↓

Landing Page

↓

Marketplace Listing

↓

Marketing Assets

↓

Ready For Promotion

---

## Brand Identity

Each prepared domain should receive:

- Logo
- Favicon
- Brand color palette
- Typography
- Visual identity

These assets improve perceived quality and create a consistent identity across all sales channels.

---

## Landing Page

Each domain should receive a dedicated landing page.

The landing page may contain:

- Logo
- Hero section
- Brand description
- Industry positioning
- Buy button
- Marketplace link
- SEO metadata
- Open Graph image

Landing pages represent premium domain products, not company websites.

---

## Marketplace Listing

Every prepared domain should automatically appear inside:

wabmarket.com/marketplace

Each marketplace card may contain:

- Domain
- Logo
- Category
- Industry
- Price
- Status
- Buy button

Selecting a marketplace card opens the dedicated landing page.

---

## Marketplace Integration

Landing pages redirect buyers to the configured marketplace provider.

Supported future providers may include:

- Afternic
- Dynadot Marketplace
- Sedo

The first implementation targets Afternic.

---

## Preparation Checklist

A domain is considered READY FOR MARKETING only when the following assets exist:

- Logo
- Favicon
- Landing page
- Marketplace listing
- Buy CTA
- SEO metadata
- Open Graph image

---

## Product Principle

A domain should never enter marketing as a raw domain.

Every domain must first become a complete branded digital product.

--- 

# 11. Automation

Future scheduled discovery may run periodically.

Example:

Marketplace inventory
→ Filter cheap high-quality domains
→ Match categories/locations
→ Search businesses
→ Score opportunities
→ Add qualified items to Opportunity Feed

Automation must respect:

- API quotas
- provider rate limits
- budget caps
- duplicate protection
- freshness rules
- user-defined search preferences

---

# 12. Safety Boundaries

Wabmarket must never automatically:

- purchase a domain
- place an auction bid
- submit a backorder
- contact a business
- spend money
- change registrar settings

These require explicit future user actions and permission boundaries.

---

# 13. Current Implementation Status

Implemented:

- Google Places primary business discovery
- Domain normalization
- Domain analyzer
- Brand/domain comparator
- Domain weakness signals
- Signal importance
- Domain composition analysis
- FlipScore policy
- FlipScore weights
- FlipScore v1 engine

Not yet implemented:

- Candidate domain generation
- Availability provider integration
- Marketplace discovery
- Reverse Discovery Engine
- Opportunity persistence
- Opportunity Feed
- Automated discovery
- Production UI integration

---

# 14. Planned Order

Recommended implementation order:

1. Finish FlipScore validation
2. Candidate domain generation
3. Domain availability providers
4. Opportunity model
5. Domain acquisition
6. Domain preparation
7. Marketplace publication
8. Forward marketing
9. CRM & Outreach
10. Reverse Discovery Engine
11. Opportunity Feed
12. Scheduled discovery

---

# 15. Product Principle

Forward Discovery answers:

"Which existing businesses have weak domains?"

Reverse Discovery answers:

"Which valuable domains already available can be matched to businesses that are likely to benefit from them?"

Wabmarket should support both.