# WABMARKET UI/UX SPECIFICATION

Version: 1.0

---

# Design philosophy

The interface must be:

- modern;
- minimal;
- responsive;
- fast;
- highly interactive;
- scalable;
- easy to navigate.

---

# Theme system

The application must support:

- light mode;
- dark mode;
- system mode.

---

Default mode:

```text
Light mode
```

---

Theme settings must persist between sessions.

---

# Main design principles

- rounded corners;
- soft shadows;
- smooth transitions;
- loading skeletons;
- reusable components;
- responsive layouts;
- accessibility support.

---

# Layout structure

```text
Header
Sidebar
Content Area
Footer
Notifications
```

---

# Header

Contains:

- logo;
- global search;
- notifications;
- theme switcher;
- profile menu.

---

# Sidebar

Contains:

```text
Dashboard

Portfolio

Owned Domains

Opportunities

Lead Generation

Campaigns

CRM

Analytics

Notifications

Settings
```

---

# Dashboard

Path:

```text
/admin/dashboard
```

---

Widgets:

- total investment;
- total revenue;
- ROI;
- portfolio value;
- domains purchased;
- domains sold;
- active campaigns;
- new opportunities;
- expiring domains;
- unread notifications.

---

Charts:

- monthly revenue;
- lead conversion;
- portfolio growth;
- FlipScore distribution.

---

# Portfolio page

Path:

```text
/admin/portfolio
```

---

Features:

- filtering;
- sorting;
- pagination;
- bulk actions;
- import;
- export.

---

# Owned Domains page

Path:

```text
/admin/owned-domains
```

---

Features:

- synchronize Dynadot domains;
- search domains;
- filter domains;
- create tags;
- create folders;
- archive domains.

---

Columns:

```text
Domain

FlipScore

Purchase price

Estimated price

Expiration date

Leads

Campaigns

Status

Actions
```

---

# Opportunities page

Path:

```text
/admin/opportunities
```

---

Features:

- discovery;
- ranking;
- filtering;
- purchasing.

---

# Domain Details page

Path:

```text
/admin/domains/[id]
```

---

Each domain has its own profile.

---

# Domain header

Contains:

- domain name;
- logo;
- favicon;
- status;
- FlipScore;
- estimated value;
- ROI.

---

# Tabs

```text
Overview

Branding

Description

Leads

Campaigns

Timeline

Files

Notes

Analytics

Settings
```

---

# Overview tab

Contains:

- acquisition details;
- registrar information;
- nameservers;
- expiration date;
- statistics.

---

# Branding tab

Contains:

- logo;
- favicon;
- typography;
- colors;
- slogan;
- AI tools.

---

Actions:

- regenerate logo;
- upload logo;
- edit colors;
- edit fonts.

---

# Description tab

Contains:

- niche analysis;
- SEO analysis;
- city analysis;
- sales pitch;
- brand story.

---

# Leads tab

Contains:

- companies;
- websites;
- emails;
- phone numbers;
- social media links.

---

Features:

- bulk actions;
- email verification;
- export.

---

# Campaigns tab

Contains:

- active campaigns;
- completed campaigns;
- failed campaigns.

---

# Timeline tab

Contains:

- purchases;
- emails;
- negotiations;
- activities;
- payments.

---

# Files tab

Contains:

- contracts;
- images;
- invoices;
- PDFs.

---

# Notes tab

Contains:

- private notes;
- reminders;
- AI suggestions.

---

# Analytics tab

Contains:

- revenue;
- email statistics;
- conversion rate;
- estimated value.

---

# CRM page

Path:

```text
/admin/crm
```

---

Style:

Kanban board.

---

Columns:

```text
To Contact

Email Sent

Interested

Negotiation

Payment Pending

Sold
```

---

# Analytics page

Path:

```text
/admin/analytics
```

---

Contains:

- charts;
- statistics;
- comparisons;
- reports.

---

# Notifications page

Path:

```text
/admin/notifications
```

---

Notification categories:

- domains;
- campaigns;
- emails;
- negotiations;
- sales;
- errors.

---

# Settings page

Path:

```text
/admin/settings
```

---

Contains:

- profile settings;
- theme settings;
- API keys;
- Gmail settings;
- Dynadot settings;
- cron jobs;
- notifications.

---

# Components

---

Buttons

```text
PrimaryButton

SecondaryButton

DangerButton

IconButton
```

---

Cards

```text
StatCard

MetricCard

DomainCard

LeadCard
```

---

Tables

```text
DomainTable

LeadTable

CampaignTable
```

---

Drawers

```text
LeadDrawer

SettingsDrawer

NotificationDrawer
```

---

Dialogs

```text
ConfirmationDialog

DeleteDialog

PurchaseDialog
```

---

Loaders

```text
SkeletonLoader

Spinner

ProgressBar
```

---

# Search system

Supports:

- domains;
- leads;
- campaigns;
- activities.

---

# Responsive breakpoints

```text
mobile

tablet

desktop

large desktop
```

---

# Accessibility

The application must support:

- keyboard navigation;
- screen readers;
- high-contrast mode;
- focus management.

---

# Final rule

Every component must remain reusable, independent, and fully documented.