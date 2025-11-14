# AI Ads Revolution – Render Ready Pack

## Local quick start
```bash
npm install
npm run dev
# http://localhost:4000  e  /dashboard
```

## Deploy on Render (free)
- Push this folder to GitHub
- Render → New → Blueprint → select repo (uses `render.yaml`)
- Open `/dashboard`, create campaign, generate publisher snippet

### Stripe in production
- Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Render → Environment
- Webhook endpoint: `https://<your-app>.onrender.com/billing/stripe-webhook`
