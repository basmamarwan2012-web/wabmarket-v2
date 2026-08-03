# WABMARKET DEPLOYMENT GUIDE

Version: 1.0

---

# OVERVIEW

The production environment must support:

- high availability;
- scalability;
- automatic restarts;
- secure communications.

---

# TECHNOLOGIES

- Node.js
- PM2
- Docker
- Nginx
- Redis
- Firebase

---

# ENVIRONMENT VARIABLES

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=

NEXT_PUBLIC_FIREBASE_PROJECT_ID=

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PRIVATE_KEY=

FIREBASE_CLIENT_EMAIL=

DYNADOT_API_KEY=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

GMAIL_REFRESH_TOKEN=

OPENAI_API_KEY=

ANTHROPIC_API_KEY=

GEMINI_API_KEY=

REDIS_HOST=

REDIS_PORT=

SENTRY_DSN=
```

---

# PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

# DOCKER

```bash
docker compose up -d
```

---

# SSL

Provider:

- Let's Encrypt.

---

# DOMAIN CONFIGURATION

```text
wabmarket.com

admin.wabmarket.com
```

---

# BACKUPS

Automatic backups must run every day.

---

# MONITORING

Tools:

- Sentry;
- Winston;
- PM2 monitoring.

---

# FINAL RULE

Never deploy directly to production.