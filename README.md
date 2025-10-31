# AI Ads Revolution – REAL CODE (no demo data)

## Local quick start
```bash
cp .env.example .env   # set JWT_SECRET and BASE_URL
npm install
npm run dev
# open http://localhost:4000/dashboard
```

## Deploy on Render (free)
- Push this folder to GitHub
- Render → New → Blueprint → select repo (uses `render.yaml`)
- Open `/dashboard`

### Stripe (optional)
- Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Render
- Webhook endpoint: `https://<your-app>.onrender.com/billing/stripe-webhook`
