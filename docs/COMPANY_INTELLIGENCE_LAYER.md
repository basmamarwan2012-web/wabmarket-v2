# Company Intelligence Layer

## Purpose

The Company Intelligence Layer allows Wabmarket to improve over time without depending permanently on any single AI provider.

Wabmarket should learn from:

- AI-generated outputs
- Manual edits
- Accepted outputs
- Rejected outputs
- Successful campaigns
- Successful landing pages
- Successful logos
- Successful sales patterns
- User corrections
- Operational experience

The objective is not to train a proprietary foundation model.

The objective is to build a growing company memory that makes future AI and deterministic generation better.

---

# Core Principle

The AI provider is replaceable.

The company memory is permanent.

Wabmarket should never depend on one AI provider for its accumulated knowledge.

OpenAI, Gemini, Claude, or another provider may change.

The accumulated Wabmarket experience remains owned by Wabmarket.

---

# High-Level Architecture

User / System Action

↓

Task Context

↓

Company Memory

↓

Prompt / Template Builder

↓

AI Router

↓

AI Provider

↓

Generated Output

↓

Human Review / Automated Validation

↓

Accepted / Edited / Rejected

↓

Learning Event

↓

Company Memory

---

# AI Provider Layer

AI must remain abstracted behind a provider-neutral boundary.

Potential providers:

- OpenAI
- Gemini
- Claude
- Future providers
- Disabled / deterministic-only mode

AI providers are execution tools.

They are not the source of truth for Wabmarket knowledge.

---

# Deterministic-First Principle

Wabmarket should use deterministic systems whenever possible.

Examples:

- FlipScore
- Domain analysis
- Candidate generation
- Availability status
- Pricing rules
- Marketplace status
- Landing-page structure
- SEO metadata templates
- Email variables
- Favicon generation

AI should be used only where it creates meaningful quality improvement.

---

# Company Memory

Company Memory stores reusable experience.

Examples:

- Accepted landing-page structures
- Preferred CTA styles
- Successful email structures
- Successful subject lines
- Logo preferences
- Industry-specific visual patterns
- Marketplace descriptions
- SEO patterns
- Sales objections
- Negotiation patterns
- Successful pricing strategies
- User corrections
- Rejected patterns

---

# Learning Event

Every AI-assisted or manually edited output may generate a learning event.

A learning event may contain:

- Task type
- Input context
- Generated output reference
- Final approved output
- Whether the original output was accepted
- Whether it was edited
- Whether it was rejected
- Edit summary
- Industry
- Keyword
- Location
- Domain
- Campaign context
- Outcome
- Timestamp
- Version information

No sensitive provider credentials belong in learning events.

---

# Feedback States

Outputs may have explicit feedback states:

- GENERATED
- ACCEPTED
- EDITED
- REJECTED
- PUBLISHED
- SUCCESSFUL
- UNSUCCESSFUL

These states allow Wabmarket to distinguish generated content from proven content.

---

# Editing Intelligence

Manual editing is valuable training data for Wabmarket's company memory.

Example:

AI output:

"Premium Roofing Domain"

Final approved version:

"The perfect domain for roofing companies in Miami."

The system should not blindly memorize the final sentence.

Instead, future intelligence may extract reusable patterns such as:

- Benefit-first headline
- Industry mention
- Location mention
- Short sentence
- Direct commercial positioning

Pattern extraction should remain reviewable and versioned.

---

# Domain Preparation Memory

The Company Intelligence Layer may support:

## Logo Memory

Learn from:

- accepted logo styles
- rejected logo styles
- colors
- icon families
- typography
- industry patterns

Example:

Roofing

Possible learned preference:

- minimal
- strong contrast
- structural iconography

These are preferences, not mandatory rules.

---

## Landing Page Memory

Learn from:

- accepted hero structures
- CTA wording
- description length
- visual hierarchy
- industry positioning
- conversion patterns

---

## Marketplace Memory

Learn from:

- descriptions
- category positioning
- pricing presentation
- CTA placement
- buyer interaction

---

# Marketing Memory

The system may learn from cold-email performance.

Examples:

- subject-line style
- email length
- CTA wording
- personalization structure
- business category
- FlipScore range
- reply rate
- positive reply rate
- unsubscribe rate
- conversion rate

Future email generation should use proven patterns before asking AI to invent new ones.

---

# Sales Memory

The Company Intelligence Layer may later learn from:

- objections
- offered prices
- accepted prices
- negotiation duration
- industry
- acquisition cost
- selling price
- buyer profile
- close reason
- lost reason

This may improve future sales recommendations.

It must not automatically change prices or contact customers without explicit policy.

---

# Knowledge Types

Company knowledge should distinguish:

## Facts

Observed information.

Example:

Campaign reply rate = 8%.

## Preferences

Human-approved style choices.

Example:

Use shorter CTA text.

## Patterns

Repeated observations.

Example:

Shorter roofing outreach emails receive more replies.

## Policies

Explicit Wabmarket rules.

Example:

AI may not send outreach without approval.

## Experiments

Hypotheses still being tested.

Example:

Luxury jewelry landing pages may perform better with minimal dark layouts.

Experiments must not silently become policies.

---

# Confidence

Learned patterns should carry confidence.

Possible states:

- EXPERIMENTAL
- LOW
- MEDIUM
- HIGH
- VERIFIED

Confidence should depend on evidence volume and consistency.

A pattern observed once must not become permanent company knowledge.

---

# Knowledge Promotion

A future knowledge lifecycle may be:

OBSERVED

↓

REPEATED

↓

PROPOSED

↓

APPROVED

↓

VERIFIED

↓

DEPRECATED

Important company knowledge should remain reviewable.

---

# AI Router

Before using AI, Wabmarket should choose the cheapest reliable path.

Suggested order:

Deterministic template

↓

Existing approved asset / cached output

↓

Company Memory pattern

↓

Free AI provider

↓

Paid AI provider if budget allows

↓

Manual fallback

AI provider selection may depend on:

- task type
- quality requirement
- provider availability
- quota
- latency
- budget
- user preference

---

# AI Budget Gate

Paid AI must never execute automatically without budget permission.

Example policy:

AI paid execution:

DISABLED by default

Possible future settings:

- Monthly AI budget
- Per-task maximum
- Allowed providers
- Free-tier preference
- Hard stop threshold

When the paid budget is exhausted:

Wabmarket should fall back to:

- deterministic output
- cached output
- free provider
- manual review

It should not silently continue spending money.

---

# AI Caching

Reusable AI-generated assets should not be regenerated unnecessarily.

Examples:

- Logo
- Marketplace description
- Landing-page copy
- SEO metadata
- Campaign template

Cache identity may include:

- domain
- task type
- prompt/template version
- company-memory version
- provider/model version

Approved outputs may be reused until explicitly regenerated.

---

# AI Independence

Wabmarket must remain operational when AI is disabled.

Without AI, users must still be able to:

- discover businesses
- calculate FlipScore
- generate deterministic candidates
- check domain availability
- manage opportunities
- prepare template-based landing pages
- publish marketplace listings
- run template-based outreach
- manage CRM and sales

AI improves quality.

AI does not own the workflow.

---

# Hosting Model

The Company Intelligence Layer does not require hosting a large language model.

Standard SaaS infrastructure can store:

- database records
- templates
- edits
- learning events
- approved patterns
- performance metrics
- generated assets

AI inference may remain external and provider-neutral.

This allows Wabmarket to run on normal cloud infrastructure without requiring customer hardware or local LLM installation.

---

# Future Retrieval Layer

When Company Memory becomes large, Wabmarket may add a retrieval layer.

Possible workflow:

Task

↓

Retrieve relevant approved company knowledge

↓

Build compact context

↓

Send only relevant context to selected AI provider

This reduces:

- tokens
- cost
- irrelevant context
- provider dependency

The retrieval system must never blindly send the entire company database to an AI provider.

---

# Long-Term Asset

Over time, Company Memory may become one of Wabmarket's most valuable proprietary assets.

A competitor can copy:

- UI
- prompts
- provider integrations
- workflow concepts

A competitor cannot instantly copy years of:

- accepted edits
- campaign outcomes
- conversion patterns
- branding decisions
- marketplace experience
- negotiation experience

The accumulated company experience should therefore remain provider-independent and portable.

---

# Safety Boundaries

The Company Intelligence Layer must never automatically:

- change business policy
- promote a weak pattern to verified knowledge
- spend AI budget
- publish content
- contact leads
- change pricing
- purchase domains
- negotiate sales

without the required approval and policy boundaries.

---

# Current Status

Not implemented.

Future implementation should occur after the core Wabmarket workflow is stable.

The architecture should nevertheless preserve these principles from the beginning:

- AI abstraction
- deterministic-first execution
- persistent company memory
- learning-event capture
- human-edit feedback
- provider independence
- budget-gated paid AI
- reusable approved outputs

---

# Product Principle

Wabmarket should not become smarter because one AI provider remembers more.

Wabmarket should become smarter because Wabmarket remembers its own experience.