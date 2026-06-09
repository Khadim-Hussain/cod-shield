# COD Shield — Shopify COD Fraud Detection App

A production-ready Shopify app for Pakistani merchants to detect COD fraud and confirm orders via WhatsApp.

---

## Features

- Fraud scoring engine (0-100)
- WhatsApp order confirmation (Urdu/Roman Urdu)
- Auto-cancel high risk orders
- Merchant WhatsApp alerts
- Redis-based order history
- Shopify billing (Free / Starter / Pro)
- Dashboard with stats & charts

---

## Setup

### 1. Free Accounts Banao

| Service | URL | Kya milta hai |
|---|---|---|
| Shopify Partners | partners.shopify.com | Dev store + credentials |
| Upstash | upstash.com | Redis 10,000 req/day free |
| Meta Developers | developers.facebook.com | WhatsApp 1,000 msg/month free |
| Vercel | vercel.com | Hosting + serverless free |

---

### 2. Clone & Install

```bash
git clone your-repo
cd cod-shield
npm install
cd web && npm install && cd ..
```

---

### 3. Environment Variables

```bash
cp .env.example .env
# Fill in all values
```

---

### 4. Vercel Deploy

```bash
npm install -g vercel
vercel
# Follow prompts
# Copy your Vercel URL
```

---

### 5. Shopify App Setup

```
1. partners.shopify.com → Apps → Create App
2. App URL: https://your-vercel-url.vercel.app
3. Redirect URL: https://your-vercel-url.vercel.app/api/auth/callback
4. Copy API Key & Secret → paste in .env
5. shopify.app.toml mein VERCEL_URL update karo
```

---

### 6. Upstash Redis Setup

```
1. upstash.com → Create Database → Free tier
2. REST URL & Token copy karo → paste in .env
```

---

### 7. Meta WhatsApp Setup

```
1. developers.facebook.com → Create App → Business
2. Add WhatsApp product
3. Phone Number ID copy karo → WHATSAPP_PHONE_ID
4. Temporary/Permanent token → WHATSAPP_TOKEN
5. Webhook URL: https://your-vercel-url.vercel.app/api/whatsapp
6. Verify Token: same as WHATSAPP_VERIFY_TOKEN in .env
7. Subscribe to: messages
```

---

### 8. Shopify Webhooks Register

```
Partners Dashboard → App → Webhooks:
- orders/create → https://your-vercel-url.vercel.app/api/webhook
- orders/cancelled → https://your-vercel-url.vercel.app/api/webhook/cancelled
```

---

## Fraud Scoring Rules

| Rule | Points |
|---|---|
| Same phone, 3+ different addresses | +40 |
| Order between 2am–5am PKT | +10 |
| Order > Rs 10,000, new customer | +20 |
| Same address, 3+ different phones | +30 |
| Phone has previous cancelled orders | +25 |

| Score | Level | Action |
|---|---|---|
| 0–30 | Safe | Auto-confirm |
| 31–60 | Suspicious | WhatsApp confirmation |
| 61–100 | High Risk | Auto-cancel + merchant alert |

---

## File Structure

```
cod-shield/
├── api/
│   ├── webhook.js       # Shopify webhook handler
│   ├── whatsapp.js      # WhatsApp send/receive
│   ├── billing.js       # Subscription management
│   ├── orders.js        # Orders API
│   ├── stats.js         # Stats API
│   └── settings.js      # Settings API
├── lib/
│   ├── scorer.js        # Fraud scoring engine
│   ├── redis.js         # Upstash Redis helpers
│   └── shopify.js       # Shopify API client
├── web/src/
│   ├── App.jsx          # Main app + routing
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Orders.jsx
│   │   ├── Settings.jsx
│   │   └── Billing.jsx
│   └── components/
│       ├── FraudBadge.jsx
│       ├── StatsCard.jsx
│       └── OrderTable.jsx
├── shopify.app.toml
├── vercel.json
└── .env.example
```
