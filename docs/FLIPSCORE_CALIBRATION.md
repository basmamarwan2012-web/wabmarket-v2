# FlipScore Calibration Dataset (Phase G)

## Objective

Calibrate FlipScore using real Google Places data before integrating the scoring engine into the discovery pipeline.

---

# Test Case 1

Keyword: Plumbing

City: Houston

Accepted businesses: 19

Weak domains: 3

Examples:

- cooperplumbinghouston.com
- houstonplumbingservices.com
- wedgeworthplumbing.com
- abacusplumbing.net
- imyourplumber.net
- houston-plumbingservices.com

Observations

- Mostly branded domains
- Few non-.com domains
- One hyphenated domain
- Good baseline niche

Expected Opportunity Density

LOW–MEDIUM

---

# Test Case 2

Keyword: Dentist

City: Dallas

Accepted businesses: 20

Weak domains: 2

Examples

- dallasdental.com
- mintdentistry.com
- skillmanfamilydentistry.com
- dallascosmeticdentist.us
- dentistry.tamu.edu

Observations

- Strong branding
- Mostly premium .com domains
- Medical niche has good branding discipline

Expected Opportunity Density

LOW

---

# Test Case 3

Keyword: HVAC

City: Orlando

Accepted businesses: 19

Weak domains: 2

Examples

- mechanicalone.com
- belleairac.com
- ferran-services.com
- downtown-air.com

Observations

- Mostly branded domains
- Hyphen usage appears
- No non-.com domains

Expected Opportunity Density

LOW–MEDIUM

---

# Test Case 4

Keyword: Roofing

City: Miami

Accepted businesses: 20

Weak domains: 5

Examples

- bestroofing.net
- dynastyroofingllc.us
- tophatroofing.homes
- floridacommercialroofing.net
- perkinsroofing.net

Important Case

Business

Atlantic Roofing Miami

Domain

runable.com

Expected Comparator

UNRELATED

Expected FlipScore

HIGH

Reason

Business operates on a completely unrelated domain.

This is considered one of the primary benchmark cases.

Expected Opportunity Density

HIGH

---

# Test Case 5

Keyword: Jewelry

City: New York

Accepted businesses: 19

Weak domains: 1

Examples

- greenwichjewelers.com
- laurenbjewelry.com
- withclarity.com
- tiffany.com
- popular.jewelry

Observations

Luxury brands maintain very strong branding.

Expected Opportunity Density

VERY LOW

---

# Calibration Notes

Current observations suggest:

Roofing > Plumbing > HVAC > Dentist > Jewelry

for expected opportunity density.

Future calibration will adjust only thresholds.

The scoring policy itself should remain deterministic.

This document contains only real-world calibration data.

No scoring rule should ever be introduced solely to fit a single test case.

The calibration process adjusts thresholds, never business logic.