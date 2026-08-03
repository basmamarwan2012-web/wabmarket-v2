# WABMARKET BUSINESS REQUIREMENTS DOCUMENT (BRD)

Version: 1.0

---

# Executive Summary

Wabmarket is an AI-powered SaaS platform dedicated to premium domain acquisition, branding, outbound marketing, and domain sales automation.

The objective is to automate the entire workflow from domain discovery to final sale.

---

# Primary objectives

The platform must:

- Discover valuable domains.
- Analyze search volume.
- Analyze CPC values.
- Discover potential buyers.
- Purchase domains automatically.
- Generate brand assets.
- Launch automated campaigns.
- Track replies.
- Manage negotiations.
- Close sales.
- Calculate profitability.

---

# User roles

## Super Administrator

Permissions:

- Full access.
- Purchase domains.
- Configure APIs.
- Manage settings.
- Configure campaigns.
- Manage users.
- Access financial information.

---

## Team Member

Permissions:

- View domains.
- View analytics.
- Manage negotiations.
- Update statuses.

---

## Viewer

Permissions:

- Read-only access.

---

# Business workflow

The complete workflow is illustrated below.

Domain discovery

↓

FlipScore analysis

↓

Market analysis

↓

Lead generation

↓

Domain purchase

↓

AI branding

↓

Landing page creation

↓

Cold outreach

↓

Follow-up sequences

↓

Negotiation

↓

Payment

↓

Transfer

↓

Sale completed

---

# Revenue model

Revenue sources:

- Domain sales
- Brokerage services
- Subscription plans
- Premium AI services

---

# Key Performance Indicators (KPIs)

## Acquisition

- Domains analyzed
- Domains purchased
- Average purchase price

---

## Marketing

- Emails sent
- Open rate
- Click rate
- Response rate

---

## Sales

- Deals created
- Negotiations started
- Deals closed

---

## Financial indicators

- Revenue
- Expenses
- Net profit
- ROI

---

# Portfolio management

The system manages two different portfolios.

---

## Owned domains

These domains are synchronized automatically from Dynadot.

The synchronization process must retrieve:

- Domain names
- Purchase dates
- Expiration dates
- Nameservers
- Auto-renew settings
- Transfer status

---

## Opportunity domains

These domains are identified by the FlipScore engine.

---

# Domain statuses

Possible statuses:

- New
- Evaluating
- Hot
- Purchased
- Configured
- Prospecting
- Contacting
- Negotiating
- Sold
- Archived

---

# Lead statuses

Possible statuses:

- New
- Contacted
- Interested
- Follow-up
- Negotiating
- Won
- Lost

---

# Campaign statuses

Possible statuses:

- Draft
- Running
- Paused
- Completed
- Failed

---

# Domain profile

Every domain must have a dedicated profile.

---

## Overview section

Contains:

- Domain name
- Purchase price
- Estimated value
- FlipScore
- ROI
- Registration date
- Expiration date
- Registrar

---

## Branding section

Contains:

- Logo
- Icon
- Favicon
- Colors
- Typography
- Brand story
- Brand slogan

---

## Description section

Contains:

- SEO analysis
- Market analysis
- Competitor analysis
- AI-generated pitch

---

## Lead section

Contains:

- Companies
- Websites
- Emails
- Phones
- Social media accounts

---

## Outreach section

Contains:

- Campaigns
- Replies
- Open rate
- Click rate

---

## Activity section

Contains:

- Domain history
- Email history
- Negotiation history
- Payment history

---

## Attachment section

Contains:

- Images
- Contracts
- PDF files
- Notes

---

# Branding engine

Each domain automatically receives:

- Logo
- Favicon
- Color palette
- Typography
- Slogan
- Description
- Landing page

---

# CRM pipeline

Stages:

- To Contact
- Contacted
- Interested
- Negotiating
- Payment Pending
- Sold

---

# Email sequence

Day 1

Teaser email

---

Day 3

Reminder email

---

Day 7

Value email

---

Day 14

Breakup email

---

# Dashboard

Widgets:

- Revenue
- Expenses
- ROI
- Portfolio value
- Active negotiations
- Pending emails
- Opportunities
- Expiring domains

---

# Notifications

Notifications must be generated for:

- New opportunities
- New replies
- Negotiations
- Sales
- Expiring domains
- Failed jobs

---

# Final requirement

Every module must remain independent, reusable, and scalable.