# AI Ads Revolution – Render Deploy Pack

Questo pacchetto ti permette di pubblicare **subito** la piattaforma su Render con storage persistente e Stripe.

> **Struttura consigliata repo**
>
> ```
> ai-ads-revolution/
> ├─ server.js
> ├─ db.js           (aggiornato per variabile DB_FILE)
> ├─ auth.js
> ├─ package.json
> ├─ public/ (client, dashboard, widget)
> ├─ uploads/ (verrà creata runtime)
> ├─ render.yaml     ✅ (blueprint Render)
> ├─ .renderignore   ✅
> ├─ README_RENDER.md ✅
> └─ .env.example    ✅
> ```

---

## 1) Modifica minima per **db.js** (supporto storage persistente)
Usa il file path da variabile d'ambiente `DB_FILE` (Render → Disk mount), con fallback locale.

```js
// db.js (versione per deploy)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data.db');
const db = new sqlite3.Database(DB_FILE);

function run(sql){
  db.run(sql, (e)=>{ if(e && !/duplicate|already exists/i.test(e.message)) console.error('DB init warn:', e.message); });
}

// (resto del tuo schema invariato)
// ...

module.exports = db;
```

> **Perché**: su Render la memoria del container è temporanea. Con `Disk` montato a `/data`, imposteremo `DB_FILE=/data/data.db` così il DB rimane persistente ai redeploy.

---

## 2) **package.json** (ok la tua versione) – aggiunta script health (opzionale)
```json
{
  "name": "ai-ads-revolution",
  "version": "1.1.0",
  "description": "AI-like community ads platform – MVP backend + minimal client + publisher widget",
  "main": "server.js",
  "scripts": {
    "dev": "node server.js",
    "start": "NODE_ENV=production node server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "nanoid": "^5.0.6",
    "sqlite3": "^5.1.7"
  }
}
```

---

## 3) **render.yaml** (Blueprint Render – 1 click deploy)
Salva questo file nella root del repo. Poi da Render: **New + Blueprint** → collega il repo.

```yaml
services:
  - type: web
    name: ai-ads-revolution
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
      - key: JWT_SECRET
        generateValue: true
      - key: BASE_URL
        fromService:
          type: web
          name: ai-ads-revolution
          property: url
      - key: DB_FILE
        value: /data/data.db
      - key: CURRENCY
        value: eur
      # Stripe (facoltativo – inserisci test/live quando pronto)
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
    disk:
      name: adsdb
      mountPath: /data
      sizeGB: 1
    healthCheckPath: /health
    headers:
      - path: /
        name: Access-Control-Allow-Origin
        value: "*"
```

> Nota: puoi aumentare `sizeGB` quando vuoi. L’header CORS aperto è comodo per test; in produzione imposta domini specifici.

---

## 4) **.renderignore** (evita di caricare file inutili)
```gitignore
node_modules
uploads
.env
*.db
*.sqlite
```

---

## 5) **.env.example** (per sviluppo locale)
```env
JWT_SECRET=change_me
PORT=4000
BASE_URL=http://localhost:4000
DB_FILE=./data.db
CURRENCY=eur
# Stripe (opzionale)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 6) **README_RENDER.md** (istruzioni passo‑passo)
```md
# Deploy su Render – AI Ads Revolution

## Requisiti
- Account GitHub
- Account Render (free)
- (Facoltativo) Account Stripe

## Passo 1 – Fork/Push del repo
Carica questo progetto su GitHub (privato o pubblico).

## Passo 2 – Deploy con Blueprint
- Vai su https://render.com → New → **Blueprint**
- Collega il repo e conferma.
- Render leggerà `render.yaml` e creerà il servizio web + disco persistente.

## Passo 3 – Variabili d’ambiente
- `JWT_SECRET` viene generato automaticamente.
- `BASE_URL` si autocompila con l’URL del servizio.
- `DB_FILE=/data/data.db` usa il Disco persistente.
- (Stripe) Aggiungi le tue chiavi quando pronto.

## Passo 4 – Test
- Apri `https://<tuo-servizio>.onrender.com/health` → `{ ok: true }`
- Apri `/dashboard` → registra utente → crea campagna.
- In `POST /publisher/register` ottieni lo **snippet** da incollare su un sito terzo.

## Passo 5 – Abilitare Stripe (opzionale)
- Dashboard Stripe → Developers → API Keys → copia `sk_test_...` in `STRIPE_SECRET_KEY`.
- Crea **Webhook**:
  - Endpoint: `https://<tuo-servizio>.onrender.com/billing/stripe-webhook`
  - Eventi: `checkout.session.completed`
  - Copia il `Signing secret` in `STRIPE_WEBHOOK_SECRET`.

## Passo 6 – Dominio personalizzato (opzionale)
- Render → Settings → Custom Domains → aggiungi dominio (es. aiadsrevolution.com)
- Punta DNS (CNAME) come indicato.

## Sicurezza & Produzione
- Limita CORS a domini fidati.
- Usa HTTPS (Render lo abilita in automatico).
- Fai backup periodici di `/data/data.db` (esporta e salva altrove).
- Valuta migrazione a **PostgreSQL** gestito su Render quando crescono utenti.

## Migrazione opzionale a Postgres
- Crea un servizio Postgres su Render.
- Imposta `DATABASE_URL` e aggiorna il codice per usare `pg` invece di `sqlite3`.

## Endpoints utili
- `GET /health`
- `POST /auth/register`, `/auth/login`
- `POST /campaigns`, `GET /campaigns`, `PUT /campaigns/:id`
- `POST /assets/upload` (multipart)
- `GET /feed?location=...&interests=...`
- `POST /interact` ({ campaign_id, type: 'view'|'click'|'share' })
- `POST /publisher/register` → embed script
- `GET /ad-widget.js` → js del widget
- `GET /ads.json?pub=...&location=...&interests=...`
- `POST /billing/create-checkout-session` (Stripe)
- `POST /billing/stripe-webhook` (raw JSON)

## Snippet Publisher (esempio)
```html
<script src="https://<tuo-servizio>.onrender.com/ad-widget.js"
        data-pub="pub_XXXXXXXXXXXX"
        data-location="Piacenza"
        data-interests="ristorante,pizza"></script>
```

Buon deploy 🚀
```

---

## 7) (Facoltativo) CORS stretto e sicuro
Se vuoi limitare CORS solo al tuo dominio, nel tuo `server.js` sostituisci l’uso generico di `cors()` con:

```js
const allowed = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map(s => s.trim());
app.use(cors({
  origin: function (origin, cb) {
    if (!origin || allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }
}));
```

E nel **render.yaml** aggiungi:
```yaml
    envVars:
      - key: ALLOWED_ORIGINS
        value: https://aiadsrevolution.com,https://tuodominio.it
```

---

## 8) (Facoltativo) Header di sicurezza
Nel tuo `server.js` puoi aggiungere:

```js
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

---

## 9) Test rapido con `curl`
```bash
curl https://<tuo-servizio>.onrender.com/health
# → {"ok":true}
```

Se risponde, la rete annunci è attiva e raggiungibile dal mondo.
