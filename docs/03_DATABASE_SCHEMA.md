# WABMARKET DATABASE SCHEMA

Version: 1.0

Database engine: Firebase Firestore

---

# Design principles

- Every document must contain an ID.
- Every document must contain creation and update timestamps.
- Every operation must be traceable.
- Soft deletion must always be enabled.
- Every entity must contain an activity history.

---

# Naming convention

snake_case

Example:

created_at
updated_at
domain_name

---

# Collections

users
settings
domains
owned_domains
opportunities
leads
campaigns
email_sequences
activities
attachments
notifications
analytics
logs
tasks
timelines

---

# users

users/{userId}

{
  "id": "",
  "email": "",
  "first_name": "",
  "last_name": "",
  "avatar": "",
  "role": "",
  "status": "",
  "last_login": "",
  "created_at": "",
  "updated_at": ""
}

---

# settings

settings/general

{
  "dark_mode": false,
  "default_theme": "light",
  "timezone": "UTC",
  "language": "en",
  "currency": "USD",
  "notifications_enabled": true
}

---

# owned_domains

owned_domains/{domainId}

{
  "id": "",
  "domain_name": "",
  "registrar": "Dynadot",
  "keyword": "",
  "city": "",
  "state": "",
  "country": "",
  "purchase_price": 0,
  "estimated_price": 0,
  "asking_price": 0,
  "flipscore": 0,
  "status": "",
  "purchase_date": "",
  "expiration_date": "",
  "renewal_date": "",
  "auto_renew": false,
  "nameservers": [],
  "afternic_checkout_link": "",
  "landing_page_url": "",
  "created_at": "",
  "updated_at": ""
}

---

# opportunities

opportunities/{opportunityId}

{
  "id": "",
  "domain_name": "",
  "keyword": "",
  "city": "",
  "state": "",
  "country": "",
  "search_volume": 0,
  "cpc": 0,
  "competition_score": 0,
  "flipscore": 0,
  "availability": true,
  "status": "",
  "created_at": "",
  "updated_at": ""
}

---

# domain_profiles

domain_profiles/{profileId}

{
  "id": "",
  "domain_id": "",
  "title": "",
  "description": "",
  "slogan": "",
  "industry": "",
  "brand_story": "",
  "logo_url": "",
  "favicon_url": "",
  "font_family": "",
  "primary_color": "",
  "secondary_color": "",
  "generated_by_ai": true,
  "created_at": "",
  "updated_at": ""
}

---

# leads

leads/{leadId}

{
  "id": "",
  "domain_id": "",
  "company_name": "",
  "owner_name": "",
  "website": "",
  "email": "",
  "phone": "",
  "facebook_url": "",
  "linkedin_url": "",
  "instagram_url": "",
  "contact_page": "",
  "status": "",
  "created_at": "",
  "updated_at": ""
}

---

# campaigns

campaigns/{campaignId}

{
  "id": "",
  "domain_id": "",
  "campaign_name": "",
  "status": "",
  "scheduled_date": "",
  "created_at": "",
  "updated_at": ""
}

---

# email_sequences

email_sequences/{sequenceId}

{
  "id": "",
  "campaign_id": "",
  "lead_id": "",
  "step_number": 1,
  "subject": "",
  "body": "",
  "status": "",
  "sent_at": "",
  "opened": false,
  "clicked": false,
  "replied": false
}

---

# attachments

attachments/{attachmentId}

{
  "id": "",
  "domain_id": "",
  "file_name": "",
  "file_url": "",
  "file_type": "",
  "created_at": ""
}

---

# activities

activities/{activityId}

{
  "id": "",
  "domain_id": "",
  "type": "",
  "description": "",
  "created_at": ""
}

---

# notifications

notifications/{notificationId}

{
  "id": "",
  "title": "",
  "description": "",
  "priority": "",
  "is_read": false,
  "created_at": ""
}

---

# analytics

analytics/global

{
  "investment": 0,
  "revenue": 0,
  "profit": 0,
  "roi": 0,
  "total_domains": 0,
  "total_leads": 0,
  "conversion_rate": 0
}

---

# logs

logs/{logId}

{
  "id": "",
  "level": "",
  "service": "",
  "message": "",
  "trace": "",
  "created_at": ""
}

---

# tasks

tasks/{taskId}

{
  "id": "",
  "name": "",
  "status": "",
  "priority": "",
  "created_at": "",
  "updated_at": ""
}

---

# timelines

timelines/{timelineId}

{
  "id": "",
  "domain_id": "",
  "event_type": "",
  "description": "",
  "timestamp": ""
}

---

# Domain profile structure

Every domain must contain:

- logo
- favicon
- slogan
- timeline
- leads
- analytics
- campaigns
- activities
- attachments
- notes
- statistics
- landing page
- AI recommendations

---

# Required indexes

owned_domains

- status
- flipscore
- expiration_date

leads

- email
- domain_id

campaigns

- status
- scheduled_date

activities

- domain_id

timelines

- domain_id

---

# Final rule

Every database modification must generate:

- activity record;
- timeline event;
- log record.