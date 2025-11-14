# Project: AI Ads Revolution – FULL CLEAN PACK (Server + Client + Widget + Render)

> **Questa è la versione consolidata e aggiornata** del progetto, senza duplicati. Copia i file mantenendo la stessa struttura.

---

## package.json
```json
{
  "name": "ai-ads-revolution",
  "version": "1.2.0",
  "description": "AI-like community ads platform – backend Node + SQLite, client web, publisher widget, Stripe (opz.)",
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

## .env.example (copia in `.env`)
```env
JWT_SECRET=change_me
PORT=4000
BASE_URL=http://localhost:4000
DB_FILE=./data.db
CURRENCY=eur
# Stripe (facoltativo)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## db.js (persistente con `DB_FILE`)
```js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data.db');
const db = new sqlite3.Database(DB_FILE);

function run(sql){
  db.run(sql, (e)=>{ if(e && !/duplicate|already exists/i.test(e.message)) console.error('DB init warn:', e.message); });
}

db.serialize(() => {
  run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    balance_cents INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  run(`CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    destination_url TEXT,
    budget_cents INTEGER NOT NULL DEFAULT 0,
    cpc_cents INTEGER NOT NULL DEFAULT 10,
    cpv_micros INTEGER NOT NULL DEFAULT 50,
    active INTEGER NOT NULL DEFAULT 1,
    location TEXT,
    interests TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    kind TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    cost_cents INTEGER NOT NULL DEFAULT 0,
    meta TEXT,
    publisher_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS wallet_tx (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    ref TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS publishers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    site_name TEXT NOT NULL,
    site_url TEXT NOT NULL,
    pub_key TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  )`);
});

module.exports = db;
```

---

## auth.js
```js
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, name }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = auth;
```

---

## server.js
```js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { nanoid } = require('nanoid');
const db = require('./db');
const auth = require('./auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Stripe (optional)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  try { stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); } catch (e) { console.warn('Stripe SDK not available'); }
}

// Static for uploaded assets
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Multer setup (images only)
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}_${nanoid(6)}${ext}`);
  }
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  const allowed = ['.png','.jpg','.jpeg','.webp','.gif'];
  const ext = path.extname(file.originalname||'').toLowerCase();
  if (!allowed.includes(ext)) return cb(new Error('Only image files are allowed'));
  cb(null, true);
}});

// --- Basic Moderation (extendable) ---
const bannedWords = ['hate','terror','naz*','weapons','porn','violence'];
function moderateText(t=''){
  const text = String(t).toLowerCase();
  const found = bannedWords.filter(w => new RegExp(w.replace('*','.*'),'i').test(text));
  return { ok: found.length === 0, flags: found };
}

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Auth routes
app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const password_hash = bcrypt.hashSync(password, 10);
  const stmt = `INSERT INTO users (name,email,password_hash) VALUES (?,?,?)`;
  db.run(stmt, [name, email.toLowerCase(), password_hash], function(err) {
    if (err) return res.status(400).json({ error: 'Email already in use' });
    const token = jwt.sign({ id: this.lastID, email: email.toLowerCase(), name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  });
});

// Create campaign
app.post('/campaigns', auth, (req, res) => {
  const { title, description = '', destination_url = '', budget_eur = 0, cpc_eur = 0.10, cpv_eur = 0.0005, location = '', interests = '' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const mod = moderateText(`${title}\n${description}\n${location}\n${interests}`);
  if (!mod.ok) return res.status(400).json({ error: 'Content not allowed', flags: mod.flags });
  const budget_cents = Math.round(Number(budget_eur) * 100);
  const cpc_cents = Math.round(Number(cpc_eur) * 100);
  const cpv_micros = Math.round(Number(cpv_eur) * 100000);
  const stmt = `INSERT INTO campaigns (owner_id, title, description, destination_url, budget_cents, cpc_cents, cpv_micros, location, interests)
               VALUES (?,?,?,?,?,?,?,?,?)`;
  db.run(stmt, [req.user.id, title, description, destination_url, budget_cents, cpc_cents, cpv_micros, location, interests], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to create' });
    res.json({ id: this.lastID });
  });
});

// List my campaigns
app.get('/campaigns', auth, (req, res) => {
  db.all('SELECT * FROM campaigns WHERE owner_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch' });
    res.json(rows);
  });
});

// Update campaign
app.put('/campaigns/:id', auth, (req, res) => {
  const { id } = req.params;
  const { title, description, destination_url, active, budget_eur, cpc_eur, cpv_eur, location, interests } = req.body;
  db.get('SELECT * FROM campaigns WHERE id = ? AND owner_id = ?', [id, req.user.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });
    const mod = moderateText(`${title ?? row.title}\n${description ?? row.description}\n${location ?? row.location}\n${interests ?? row.interests}`);
    if (!mod.ok) return res.status(400).json({ error: 'Content not allowed', flags: mod.flags });

    const newTitle = title ?? row.title;
    const newDesc = description ?? row.description;
    const newDest = destination_url ?? row.destination_url;
    const newActive = typeof active === 'number' ? active : row.active;
    const newBudget = budget_eur != null ? Math.round(Number(budget_eur) * 100) : row.budget_cents;
    const newCpc = cpc_eur != null ? Math.round(Number(cpc_eur) * 100) : row.cpc_cents;
    const newCpv = cpv_eur != null ? Math.round(Number(cpv_eur) * 100000) : row.cpv_micros;
    const newLoc = location ?? row.location;
    const newInt = interests ?? row.interests;

    db.run(`UPDATE campaigns SET title=?, description=?, destination_url=?, active=?, budget_cents=?, cpc_cents=?, cpv_micros=?, location=?, interests=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [newTitle, newDesc, newDest, newActive, newBudget, newCpc, newCpv, newLoc, newInt, id], (uErr) => {
        if (uErr) return res.status(500).json({ error: 'Update failed' });
        res.json({ ok: true });
      }
    );
  });
});

// Upload asset for a campaign
app.post('/assets/upload', auth, upload.single('file'), (req, res) => {
  const { campaign_id, kind = 'image' } = req.body;
  if (!campaign_id || !req.file) return res.status(400).json({ error: 'campaign_id and file required' });
  db.get('SELECT * FROM campaigns WHERE id = ? AND owner_id = ?', [campaign_id, req.user.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Campaign not found' });
    const url = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    db.run('INSERT INTO assets (campaign_id, kind, url) VALUES (?,?,?)', [campaign_id, kind, url], function(aErr) {
      if (aErr) return res.status(500).json({ error: 'Asset save failed' });
      res.json({ id: this.lastID, url });
    });
  });
});

// Basic feed ranking
function scoreCampaign(c, q) {
  const userLoc = (q.location || '').toLowerCase();
  const userInts = (q.interests || []).map(s => s.toLowerCase());
  const campLocs = (c.location || '').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
  const campInts = (c.interests || '').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);

  let score = 0;
  if (userLoc && campLocs.some(l => userLoc.includes(l) || l.includes(userLoc))) score += 3;
  const overlap = campInts.filter(ci => userInts.includes(ci)).length;
  score += overlap * 2;
  score += Math.min(c.budget_cents / 1000, 5);
  const created = new Date(c.created_at).getTime();
  const ageDays = (Date.now() - created) / (1000*60*60*24);
  score += Math.max(0, 3 - (ageDays/7));
  return score;
}

// Feed endpoint
app.get('/feed', (req, res) => {
  const location = (req.query.location || '').toString();
  const interests = (req.query.interests || '').toString().split(',').map(s=>s.trim()).filter(Boolean);
  db.all(`SELECT c.*, (SELECT url FROM assets WHERE campaign_id = c.id ORDER BY id DESC LIMIT 1) as asset_url
          FROM campaigns c WHERE active = 1 AND budget_cents > 0`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed feed' });
    const ranked = rows.map(c => ({ c, s: scoreCampaign(c, { location, interests }) }))
                      .sort((a,b) => b.s - a.s)
                      .map(({c,s}) => ({ ...c, score: s }));
    res.json(ranked);
  });
});

// Interaction tracking (debits budget)
app.post('/interact', (req, res) => {
  const { campaign_id, type = 'view' } = req.body;
  if (!campaign_id) return res.status(400).json({ error: 'campaign_id required' });
  db.get('SELECT * FROM campaigns WHERE id = ? AND active = 1', [campaign_id], (err, c) => {
    if (err || !c) return res.status(404).json({ error: 'Campaign not found' });

    let costCents = 0;
    if (type === 'click') costCents = c.cpc_cents;
    else if (type === 'view') costCents = Math.round(c.cpv_micros / 10000);
    else if (type === 'share') costCents = Math.round(c.cpc_cents * 1.5);

    const newBudget = Math.max(0, c.budget_cents - costCents);

    db.serialize(() => {
      db.run('INSERT INTO interactions (campaign_id, type, cost_cents) VALUES (?,?,?)', [campaign_id, type, costCents]);
      db.run('UPDATE campaigns SET budget_cents = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newBudget, campaign_id]);
    });

    res.json({ ok: true, charged_cents: costCents, remaining_budget_cents: newBudget });
  });
});

// === Publishers & Widget ===
app.post('/publisher/register', auth, (req,res)=>{
  const { site_name, site_url } = req.body;
  if(!site_name || !site_url) return res.status(400).json({ error:'site_name and site_url required' });
  const pub_key = 'pub_' + nanoid(16);
  db.run('INSERT INTO publishers (owner_id, site_name, site_url, pub_key) VALUES (?,?,?,?)', [req.user.id, site_name, site_url, pub_key], function(err){
    if (err) return res.status(500).json({ error:'Failed to create publisher' });
    res.json({ id:this.lastID, pub_key, embed:`<script src=\"${process.env.BASE_URL}/ad-widget.js\" data-pub=\"${pub_key}\" data-location=\"Piacenza\" data-interests=\"pizza,ristorante\"></script>` });
  });
});

app.get('/ad-widget.js', (req,res)=>{
  res.type('application/javascript').send(fs.readFileSync(path.join(__dirname,'public','ad-widget.js'),'utf8'));
});

app.get('/ads.json', (req,res)=>{
  const location = (req.query.location||'').toString();
  const interests = (req.query.interests||'').toString().split(',').map(s=>s.trim()).filter(Boolean);
  db.all(`SELECT c.*, (SELECT url FROM assets WHERE campaign_id = c.id ORDER BY id DESC LIMIT 1) as asset_url
          FROM campaigns c WHERE active=1 AND budget_cents>0`, [], (err,rows)=>{
    if (err) return res.status(500).json({ error:'Failed feed' });
    const ranked = rows.map(c=>({ c, s: scoreCampaign(c,{location,interests}) }))
                       .sort((a,b)=>b.s-a.s).map(({c})=>c);
    const top = ranked[0];
    if(!top) return res.json({});
    res.json({
      id: top.id,
      title: top.title,
      description: top.description,
      asset_url: top.asset_url,
      click_url: `${process.env.BASE_URL}/click?campaign_id=${top.id}&pub=${encodeURIComponent(req.query.pub||'')}`
    });
  });
});

// Click redirect with tracking + publisher revenue share (50% of CPC)
app.get('/click', (req,res)=>{
  const cid = Number(req.query.campaign_id||0);
  const pubKey = (req.query.pub||'').toString();
  if(!cid) return res.redirect('/');
  db.get('SELECT * FROM campaigns WHERE id=?', [cid], (err,c)=>{
    if(!c) return res.redirect('/');
    let publisherUserId = null;
    if (pubKey) {
      db.get('SELECT * FROM publishers WHERE pub_key=?', [pubKey], (pe, p)=>{
        if (p) publisherUserId = p.owner_id;
        handleChargeAndRedirect(c, publisherUserId, res);
      });
    } else {
      handleChargeAndRedirect(c, null, res);
    }
  });
});

function handleChargeAndRedirect(c, publisherUserId, res){
  const costCents = c.cpc_cents;
  const newBudget = Math.max(0, c.budget_cents - costCents);
  db.serialize(()=>{
    db.run('INSERT INTO interactions (campaign_id, type, cost_cents, meta, publisher_id) VALUES (?,?,?,?,?)', [c.id,'click',costCents, publisherUserId? 'pub':'', publisherUserId||null]);
    db.run('UPDATE campaigns SET budget_cents=? WHERE id=?', [newBudget,c.id]);
    if (publisherUserId) {
      const share = Math.floor(costCents * 0.5); // 50% to publisher wallet
      db.run('UPDATE users SET balance_cents = balance_cents + ? WHERE id=?', [share, publisherUserId]);
      db.run('INSERT INTO wallet_tx (user_id,type,amount_cents,ref) VALUES (?,?,?,?)', [publisherUserId,'credit',share,`revshare#${c.id}`]);
    }
  });
  const dest = c.destination_url && /^https?:\/\//i.test(c.destination_url) ? c.destination_url : '/';
  res.redirect(dest);
}

// === Billing & Wallet ===
app.get('/wallet', auth, (req, res) => {
  db.get('SELECT balance_cents FROM users WHERE id = ?', [req.user.id], (err,row)=>{
    if (err||!row) return res.status(500).json({ error:'Wallet error' });
    res.json({ balance_cents: row.balance_cents });
  });
});

app.post('/wallet/fund-campaign', auth, (req,res)=>{
  const { campaign_id, amount_eur } = req.body;
  const amount_cents = Math.max(0, Math.round(Number(amount_eur)*100));
  if (!campaign_id || !amount_cents) return res.status(400).json({ error:'campaign_id and amount_eur required' });
  db.serialize(()=>{
    db.get('SELECT balance_cents FROM users WHERE id=?', [req.user.id], (e,u)=>{
      if(e||!u) return res.status(500).json({ error:'User not found' });
      if(u.balance_cents < amount_cents) return res.status(400).json({ error:'Insufficient wallet balance' });
      db.get('SELECT * FROM campaigns WHERE id=? AND owner_id=?', [campaign_id, req.user.id], (e2,c)=>{
        if(e2||!c) return res.status(404).json({ error:'Campaign not found' });
        db.run('UPDATE users SET balance_cents = balance_cents - ? WHERE id=?', [amount_cents, req.user.id]);
        db.run('UPDATE campaigns SET budget_cents = budget_cents + ?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [amount_cents, campaign_id]);
        db.run('INSERT INTO wallet_tx (user_id,type,amount_cents,ref) VALUES (?,?,?,?)', [req.user.id,'debit',amount_cents,`fund#${campaign_id}`]);
        res.json({ ok:true });
      });
    });
  });
});

app.post('/billing/create-checkout-session', auth, async (req, res) => {
  try {
    const amount_eur = Number(req.body.amount_eur||0);
    if (!stripe) return res.status(400).json({ error:'Stripe not configured' });
    if (amount_eur < 1) return res.status(400).json({ error:'Minimum €1' });
    const amount_cents = Math.round(amount_eur*100);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: process.env.CURRENCY||'eur', product_data: { name: 'Wallet Top‑up' }, unit_amount: amount_cents }, quantity: 1 }],
      success_url: `${process.env.BASE_URL}/public/success.html`,
      cancel_url: `${process.env.BASE_URL}/public/cancel.html`,
      metadata: { user_id: String(req.user.id) }
    });
    res.json({ id: session.id, url: session.url });
  } catch (e) { res.status(500).json({ error: 'Stripe error', message: e.message }); }
});

app.post('/billing/stripe-webhook', express.raw({type:'application/json'}), (req,res)=>{
  if(!stripe) return res.status(400).end();
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`); }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = Number(session.metadata?.user_id || 0);
    const amount_cents = session.amount_total || 0;
    if (userId && amount_cents>0) {
      db.run('UPDATE users SET balance_cents = balance_cents + ? WHERE id=?', [amount_cents, userId]);
      db.run('INSERT INTO wallet_tx (user_id,type,amount_cents,ref) VALUES (?,?,?,?)', [userId,'credit',amount_cents,`stripe:${session.id}`]);
    }
  }
  res.json({received:true});
});

// === Stats ===
app.get('/stats/overview', auth, (req, res) => {
  const sql = `SELECT 
      COALESCE(SUM(c.budget_cents),0) as total_budget_cents,
      COALESCE(SUM(i.cost_cents),0) as total_spent_cents
    FROM campaigns c
    LEFT JOIN interactions i ON i.campaign_id = c.id
    WHERE c.owner_id = ?`;
  db.get(sql, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Stats failed' });
    res.json({
      total_budget_cents: row.total_budget_cents || 0,
      total_spent_cents: row.total_spent_cents || 0
    });
  });
});

app.get('/stats/campaigns', auth, (req, res) => {
  const sql = `SELECT 
      c.id, c.title, c.budget_cents,
      SUM(CASE WHEN i.type='view' THEN 1 ELSE 0 END) as views,
      SUM(CASE WHEN i.type='click' THEN 1 ELSE 0 END) as clicks,
      SUM(CASE WHEN i.type='share' THEN 1 ELSE 0 END) as shares,
      COALESCE(SUM(i.cost_cents),0) as spent_cents
    FROM campaigns c
    LEFT JOIN interactions i ON i.campaign_id = c.id
    WHERE c.owner_id = ?
    GROUP BY c.id
    ORDER BY c.created_at DESC`;
  db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Stats failed' });
    res.json(rows.map(r => ({
      id: r.id,
      title: r.title,
      budget_cents: r.budget_cents,
      spent_cents: r.spent_cents,
      remaining_cents: Math.max(0, (r.budget_cents || 0) - (r.spent_cents || 0)),
      views: r.views || 0,
      clicks: r.clicks || 0,
      shares: r.shares || 0
    })));
  });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Minimal static client
app.use('/', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`AI Ads Revolution API running on http://localhost:${port}`));
```

---

## public/index.html (client minimale)
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Ads Revolution – MVP</title>
  <style>
    body{font-family:system-ui, Arial, sans-serif; margin:20px;}
    .card{border:1px solid #ddd;border-radius:12px;padding:16px;margin-bottom:16px}
    input,textarea{width:100%;padding:8px;margin:6px 0;border:1px solid #ccc;border-radius:8px}
    button{padding:10px 14px;border:0;border-radius:10px;background:#0b5ed7;color:#fff;cursor:pointer}
    .row{display:flex;gap:16px;flex-wrap:wrap}
    .col{flex:1;min-width:280px}
    small{color:#555}
    img{max-width:100%;border-radius:10px}
    a{color:#0b5ed7}
    code{background:#f5f5f5;padding:2px 6px;border-radius:6px}
  </style>
</head>
<body>
  <h1>AI Ads Revolution – MVP</h1>
  <p><small>Backend: <code>/health</code> → <code>{ ok: true }</code> • Vai alla <a href="/dashboard">Dashboard</a></small></p>

  <div class="row">
    <div class="col card">
      <h2>1) Register / Login</h2>
      <input id="name" placeholder="Name" />
      <input id="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />
      <button onclick="register()">Register</button>
      <button onclick="login()">Login</button>
      <p><small>Token: <span id="token"></span></small></p>
      <div class="card">
        <h3>Wallet</h3>
        <p>Saldo: € <span id="balance">0.00</span></p>
        <input id="topup" type="number" step="1" placeholder="Ricarica € (Stripe)" />
        <button onclick="createCheckout()">Checkout</button>
      </div>
    </div>

    <div class="col card">
      <h2>2) Create Campaign</h2>
      <input id="title" placeholder="Title" />
      <textarea id="desc" placeholder="Description (puoi includere info promozione)"></textarea>
      <input id="dest" placeholder="Destination URL (https://...)">
      <input id="budget" type="number" step="0.01" placeholder="Budget € (e.g., 20)" />
      <input id="cpc" type="number" step="0.01" placeholder="CPC € (e.g., 0.10)" />
      <input id="cpv" type="number" step="0.0001" placeholder="CPV € (e.g., 0.0005)" />
      <input id="loc" placeholder="Locations (comma)" />
      <input id="ints" placeholder="Interests (comma)" />
      <button onclick="createCampaign()">Create</button>
      <p id="campResult"></p>
      <div>
        <h3>Upload Asset</h3>
        <input id="assetCampaignId" placeholder="Campaign ID" />
        <input id="assetFile" type="file" />
        <button onclick="uploadAsset()">Upload</button>
        <p id="assetResult"></p>
      </div>
      <div class="card">
        <h3>Fondi dalla Wallet → Campagna</h3>
        <input id="fundCid" placeholder="Campaign ID" />
        <input id="fundAmount" type="number" step="0.01" placeholder="€ (es. 10)" />
        <button onclick="fundCampaign()">Trasferisci</button>
        <p id="fundResult"></p>
      </div>
      <div class="card">
        <h3>Publisher: genera embed</h3>
        <input id="pubName" placeholder="Nome sito (es. Blog Roberto)" />
        <input id="pubUrl" placeholder="URL sito (https://...)" />
        <button onclick="createPublisher()">Crea Publisher</button>
        <p id="pubEmbed"></p>
      </div>
    </div>

    <div class="col card">
      <h2>3) Feed (Public)</h2>
      <input id="feedLoc" placeholder="Location (e.g., Milano)" />
      <input id="feedInts" placeholder="Interests (e.g., pizza,fitness)" />
      <button onclick="loadFeed()">Load Feed</button>
      <div id="feed"></div>
    </div>
  </div>

  <script>
    const BASE = '';
    let TOKEN = localStorage.getItem('token') || '';
    document.getElementById('token').textContent = TOKEN ? TOKEN.slice(0, 20) + '...' : '';

    async function meBalance(){
      if(!TOKEN) return;
      const r = await fetch(BASE + '/wallet', { headers: { 'Authorization':'Bearer '+TOKEN }});
      const j = await r.json();
      document.getElementById('balance').textContent = ((j.balance_cents||0)/100).toFixed(2);
    }

    async function register(){
      const body = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };
      const r = await fetch(BASE + '/auth/register', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
      const j = await r.json();
      if (j.token){ TOKEN = j.token; localStorage.setItem('token', TOKEN); document.getElementById('token').textContent = TOKEN.slice(0,20)+'...'; meBalance(); }
      else alert(JSON.stringify(j));
    }

    async function login(){
      const body = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };
      const r = await fetch(BASE + '/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
      const j = await r.json();
      if (j.token){ TOKEN = j.token; localStorage.setItem('token', TOKEN); document.getElementById('token').textContent = TOKEN.slice(0,20)+'...'; meBalance(); }
      else alert(JSON.stringify(j));
    }

    async function createCampaign(){
      const body = {
        title: document.getElementById('title').value,
        description: document.getElementById('desc').value,
        destination_url: document.getElementById('dest').value,
        budget_eur: parseFloat(document.getElementById('budget').value || '0'),
        cpc_eur: parseFloat(document.getElementById('cpc').value || '0.10'),
        cpv_eur: parseFloat(document.getElementById('cpv').value || '0.0005'),
        location: document.getElementById('loc').value,
        interests: document.getElementById('ints').value
      };
      const r = await fetch(BASE + '/campaigns', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN}, body: JSON.stringify(body)});
      const j = await r.json();
      document.getElementById('campResult').textContent = JSON.stringify(j);
      document.getElementById('assetCampaignId').value = j.id || '';
    }

    async function uploadAsset(){
      const cid = document.getElementById('assetCampaignId').value;
      const f = document.getElementById('assetFile').files[0];
      const fd = new FormData();
      fd.append('campaign_id', cid);
      fd.append('file', f);
      const r = await fetch(BASE + '/assets/upload', { method:'POST', headers:{'Authorization':'Bearer '+TOKEN}, body: fd });
      const j = await r.json();
      document.getElementById('assetResult').textContent = JSON.stringify(j);
    }

    async function fundCampaign(){
      const cid = document.getElementById('fundCid').value;
      const amount = parseFloat(document.getElementById('fundAmount').value||'0');
      const r = await fetch(BASE + '/wallet/fund-campaign', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN}, body: JSON.stringify({campaign_id:cid, amount_eur:amount}) });
      const j = await r.json();
      document.getElementById('fundResult').textContent = JSON.stringify(j);
      meBalance();
    }

    async function createCheckout(){
      const amount = parseFloat(document.getElementById('topup').value||'0');
      const r = await fetch(BASE + '/billing/create-checkout-session', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN}, body: JSON.stringify({ amount_eur: amount }) });
      const j = await r.json();
      if (j.url) window.location = j.url; else alert(JSON.stringify(j));
    }

    async function createPublisher(){
      const site_name = document.getElementById('pubName').value;
      const site_url = document.getElementById('pubUrl').value;
      const r = await fetch(BASE + '/publisher/register', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN}, body: JSON.stringify({site_name, site_url}) });
      const j = await r.json();
      if (j.embed) {
        document.getElementById('pubEmbed').innerHTML = `<b>Embed</b>:<br><code>${j.embed.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code>`;
      } else {
        document.getElementById('pubEmbed').textContent = JSON.stringify(j);
      }
    }

    async function loadFeed(){
      const loc = document.getElementById('feedLoc').value;
      const ints = document.getElementById('feedInts').value;
      const r = await fetch(BASE + `/feed?location=${encodeURIComponent(loc)}&interests=${encodeURIComponent(ints)}`);
      const items = await r.json();
      const wrap = document.getElementById('feed');
      wrap.innerHTML = '';
      items.forEach(it => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${it.title}</h3>
          <p>${it.description || ''}</p>
          <p><small>Score: ${it.score.toFixed(2)} | Budget: € ${(it.budget_cents/100).toFixed(2)}</small></p>
          ${it.asset_url ? `<img src="${it.asset_url}" alt="asset"/>` : ''}
          <div>
            <a href="/click?campaign_id=${it.id}" target="_blank"><button>Visita</button></a>
            <button onclick="interact(${it.id}, 'view')">View</button>
            <button onclick="interact(${it.id}, 'share')">Share</button>
          </div>`;
        wrap.appendChild(card);
      });
    }

    async function interact(id, type){
      const r = await fetch(BASE + '/interact', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({campaign_id:id, type})});
      const j = await r.json();
      alert(`${type} charged ${j.charged_cents} cents. Remaining: € ${(j.remaining_budget_cents/100).toFixed(2)}`);
    }
  </script>
</body>
</html>
```

---

## public/dashboard.html (dashboard React via CDN)
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Ads Revolution – Dashboard</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    :root{--bg:#0b1220;--card:#111827;--muted:#9ca3af;--primary:#3b82f6;--ok:#10b981}
    *{box-sizing:border-box}
    body{margin:0;background:linear-gradient(180deg,#0b1220,#0b1220 60%,#0e172a);color:#f3f4f6;font-family:Inter,system-ui,Arial}
    header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #1f2937}
    .brand{font-weight:800;letter-spacing:0.5px}
    .wrap{max-width:1100px;margin:24px auto;padding:0 16px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    .card{background:#111827;border:1px solid #1f2937;border-radius:16px;padding:16px}
    input,textarea{width:100%;padding:10px;border-radius:10px;border:1px solid #374151;background:#0b1220;color:#e5e7eb;margin:6px 0}
    button{padding:10px 14px;border-radius:10px;border:0;background:var(--primary);color:#fff;cursor:pointer}
    .muted{color:var(--muted)}
    .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .pill{background:#0b1220;border:1px solid #374151;padding:6px 10px;border-radius:999px}
    .table{width:100%;border-collapse:collapse}
    .table th,.table td{border-bottom:1px solid #1f2937;padding:8px;text-align:left}
    .ok{color:var(--ok)}
    img{max-width:100%;border-radius:10px}
  </style>
</head>
<body>
  <header>
    <div class="brand">AI Ads Revolution</div>
    <div class="muted">Dashboard MVP</div>
  </header>
  <div id="app" class="wrap"></div>

  <script type="text/babel">
    const api = {
      base: '',
      async post(path, body, token){
        const r = await fetch(this.base+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
        return r.json();
      },
      async get(path, token){
        const r = await fetch(this.base+path,{headers:{...(token?{Authorization:'Bearer '+token}:{})}});
        return r.json();
      }
    };

    function useLocalToken(){
      const [token,setToken] = React.useState(localStorage.getItem('token')||'');
      const save = t=>{ localStorage.setItem('token',t); setToken(t); };
      const clear = ()=>{ localStorage.removeItem('token'); setToken(''); };
      return {token,save,clear};
    }

    function AuthPanel({onAuth}){
      const [name,setName] = React.useState('Roberto');
      const [email,setEmail] = React.useState('roberto@example.com');
      const [password,setPassword] = React.useState('demo12345');
      return (
        <div className="card">
          <h2>Accesso</h2>
          <div className="row">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome"/>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/>
            <button onClick={async()=>{
              const j = await api.post('/auth/register',{name,email,password});
              if(j.token) onAuth(j.token); else alert(JSON.stringify(j));
            }}>Registrati</button>
            <button onClick={async()=>{
              const j = await api.post('/auth/login',{email,password});
              if(j.token) onAuth(j.token); else alert(JSON.stringify(j));
            }}>Login</button>
          </div>
          <p className="muted">Riceverai un token valido 7 giorni.</p>
        </div>
      );
    }

    function CreateCampaign({token}){
      const [title,setTitle] = React.useState('Promo Pizzeria Centro');
      const [desc,setDesc] = React.useState('2x1 Margherita questa settimana.');
      const [dest,setDest] = React.useState('https://esempio.it');
      const [budget,setBudget] = React.useState('25');
      const [cpc,setCpc] = React.useState('0.10');
      const [cpv,setCpv] = React.useState('0.0005');
      const [loc,setLoc] = React.useState('Piacenza,Fiorenzuola');
      const [ints,setInts] = React.useState('pizza,ristorante,food');
      const [createdId,setCreatedId] = React.useState('');
      return (
        <div className="card">
          <h2>Crea Campagna</h2>
          <div className="row">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titolo"/>
            <input value={dest} onChange={e=>setDest(e.target.value)} placeholder="Destination URL (https://...)"/>
          </div>
          <textarea rows="3" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descrizione"/>
          <div className="row">
            <input value={budget} onChange={e=>setBudget(e.target.value)} placeholder="Budget €"/>
            <input value={cpc} onChange={e=>setCpc(e.target.value)} placeholder="CPC €"/>
            <input value={cpv} onChange={e=>setCpv(e.target.value)} placeholder="CPV €"/>
          </div>
          <div className="row">
            <input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="Località (comma)"/>
            <input value={ints} onChange={e=>setInts(e.target.value)} placeholder="Interessi (comma)"/>
          </div>
          <div className="row">
            <button onClick={async()=>{
              const j = await api.post('/campaigns',{title,description:desc,destination_url:dest,budget_eur:+budget,cpc_eur:+cpc,cpv_eur:+cpv,location:loc,interests:ints},token);
              if(j.id){ setCreatedId(String(j.id)); alert('Campagna creata #'+j.id); }
              else alert(JSON.stringify(j));
            }}>Crea</button>
          </div>
          <AssetUploader token={token} initialId={createdId}/>
        </div>
      );
    }

    function AssetUploader({token, initialId=''}){
      const [cid,setCid] = React.useState(initialId);
      const [file,setFile] = React.useState(null);
      React.useEffect(()=>{ setCid(initialId); },[initialId]);
      const upload = async()=>{
        if(!cid||!file) return alert('Inserisci ID campagna e file');
        const fd = new FormData(); fd.append('campaign_id', cid); fd.append('file', file);
        const r = await fetch('/assets/upload',{method:'POST', headers:{Authorization:'Bearer '+token}, body: fd});
        const j = await r.json();
        if(j.url) alert('Asset caricato!'); else alert(JSON.stringify(j));
      };
      return (
        <div className="card">
          <h3>Upload Asset</h3>
          <input value={cid} onChange={e=>setCid(e.target.value)} placeholder="ID Campagna"/>
          <input type="file" onChange={e=>setFile(e.target.files[0])}/>
          <button onClick={upload}>Carica</button>
        </div>
      );
    }

    function MyStats({token}){
      const [ov,setOv] = React.useState({});
      const [rows,setRows] = React.useState([]);
      React.useEffect(()=>{(async()=>{
        setOv(await api.get('/stats/overview',token));
        setRows(await api.get('/stats/campaigns',token));
      })()},[token]);
      return (
        <div className="card">
          <h2>Statistiche</h2>
          <div className="row">
            <span className="pill">Budget totale: € {((ov.total_budget_cents||0)/100).toFixed(2)}</span>
            <span className="pill">Spesa totale: € {((ov.total_spent_cents||0)/100).toFixed(2)}</span>
          </div>
          <table className="table" style={{marginTop:12}}>
            <thead><tr><th>ID</th><th>Titolo</th><th>Views</th><th>Clicks</th><th>Shares</th><th>Speso</th><th>Rimanente</th></tr></thead>
            <tbody>
              {rows.map(r=> (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>{r.title}</td>
                  <td>{r.views}</td>
                  <td>{r.clicks}</td>
                  <td>{r.shares}</td>
                  <td>€ {(r.spent_cents/100).toFixed(2)}</td>
                  <td className="ok">€ {(r.remaining_cents/100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    function FeedTester(){
      const [loc,setLoc] = React.useState('Piacenza');
      const [ints,setInts] = React.useState('pizza,fitness');
      const [items,setItems] = React.useState([]);
      const load = async()=>{
        const r = await api.get(`/feed?location=${encodeURIComponent(loc)}&interests=${encodeURIComponent(ints)}`);
        setItems(r);
      };
      React.useEffect(()=>{ load(); },[]);
      return (
        <div className="card">
          <h2>Feed Tester (pubblico)</h2>
          <div className="row">
            <input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="Località"/>
            <input value={ints} onChange={e=>setInts(e.target.value)} placeholder="Interessi"/>
            <button onClick={load}>Ricarica</button>
          </div>
          <div className="grid" style={{marginTop:12}}>
            {items.map(it => (
              <div key={it.id} className="card">
                <h3>{it.title}</h3>
                <p className="muted">Score {it.score.toFixed(2)} • Budget € {(it.budget_cents/100).toFixed(2)}</p>
                {it.asset_url && <img src={it.asset_url} alt="asset"/>}
                <div className="row" style={{marginTop:8}}>
                  <a href={`/click?campaign_id=${it.id}`} target="_blank"><button>Visita</button></a>
                  <button onClick={async()=>{
                    const j = await api.post('/interact',{campaign_id:it.id,type:'view'});
                    alert(`view addebitato: ${j.charged_cents} cent. Rimasti: € ${(j.remaining_budget_cents/100).toFixed(2)}`);
                    load();
                  }}>View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    function App(){
      const {token,save,clear} = useLocalToken();
      return (
        <div className="grid">
          {!token ? <AuthPanel onAuth={save}/> : (
            <>
              <div className="card">
                <h2>Benvenuto</h2>
                <p className="muted">Token attivo. <button onClick={clear}>Logout</button> – Vai a <a href="/" style={{color:'#3b82f6'}}>client semplice</a></p>
                <MyStats token={token}/>
                <CreateCampaign token={token}/>
              </div>
            </>
          )}
          <FeedTester/>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
  </script>
</body>
</html>
```

---

## public/ad-widget.js (widget publisher)
```javascript
(function(){
  const script = document.currentScript;
  const pub = script.getAttribute('data-pub')||'';
  const location = script.getAttribute('data-location')||'';
  const interests = script.getAttribute('data-interests')||'';
  const base = script.src.replace(/\/ad-widget\.js.*/, '/');

  function el(tag, attrs={}, children=[]) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{ if(k==='style'){ Object.assign(e.style,v); } else e.setAttribute(k,v); });
    children.forEach(c=> e.appendChild(c));
    return e;
  }

  fetch(`${base}ads.json?pub=${encodeURIComponent(pub)}&location=${encodeURIComponent(location)}&interests=${encodeURIComponent(interests)}`)
    .then(r=>r.json())
    .then(ad=>{
      if(!ad || !ad.id){ return; }
      const box = el('div', {style:{border:'1px solid #ddd',borderRadius:'12px',padding:'12px',fontFamily:'system-ui,Arial',maxWidth:'360px',boxShadow:'0 4px 16px rgba(0,0,0,0.06)'}});
      const title = el('div',{style:{fontWeight:'700',marginBottom:'6px',fontSize:'16px'}}, [document.createTextNode(ad.title||'Sponsored')]);
      const desc = el('div',{style:{color:'#444',fontSize:'13px',marginBottom:'8px'}}, [document.createTextNode(ad.description||'')]);
      const img = ad.asset_url ? el('img',{src:ad.asset_url,style:{width:'100%',borderRadius:'10px',marginBottom:'8px'}}) : null;
      const btn = el('a',{href:ad.click_url,style:{display:'inline-block',padding:'8px 12px',background:'#0b5ed7',color:'#fff',borderRadius:'10px',textDecoration:'none'}}, [document.createTextNode('Scopri')]);
      box.appendChild(title); box.appendChild(desc); if(img) box.appendChild(img); box.appendChild(btn);
      script.parentNode.insertBefore(box, script);
    })
    .catch(()=>{});
})();
```

---

## public/success.html
```html
<!doctype html>
<html><body>
<h1>Pagamento riuscito ✅</h1>
<p>La ricarica del wallet è andata a buon fine. Torna all'app.</p>
<a href="/">Vai al client</a>
</body></html>
```

## public/cancel.html
```html
<!doctype html>
<html><body>
<h1>Pagamento annullato</h1>
<p>Nessun addebito. Puoi riprovare quando vuoi.</p>
<a href="/">Torna al client</a>
</body></html>
```

---

## render.yaml (Blueprint Render con disco persistente)
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
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
    disk:
      name: adsdb
      mountPath: /data
      sizeGB: 1
    healthCheckPath: /health
```

---

## .renderignore
```gitignore
node_modules
uploads
.env
*.db
*.sqlite
```

---

## Dockerfile (opzionale)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .
ENV PORT=4000
EXPOSE 4000
CMD ["node","server.js"]
```

---

## README.md (estratto quick start)
```md
# AI Ads Revolution – Quick Start

## Local
```bash
npm install
npm run dev
# http://localhost:4000  e  /dashboard
```

## Deploy su Render
- Carica il repo su GitHub
- Render → New → Blueprint → seleziona repo (usa `render.yaml`)
- Apri `/dashboard`, crea campagna, genera snippet publisher
```
