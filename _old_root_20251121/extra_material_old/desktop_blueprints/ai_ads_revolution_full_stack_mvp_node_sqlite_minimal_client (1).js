# Project: AI Ads Revolution – MVP

Below are the full project files. Create these in a folder (e.g., `ai-ads-revolution`) preserving paths.

---

## package.json
```json
{
  "name": "ai-ads-revolution",
  "version": "1.0.0",
  "description": "AI-like community ads platform – MVP backend + minimal client",
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

## .env (create this file)
```env
JWT_SECRET=supersecret_change_me
PORT=4000
BASE_URL=http://localhost:4000
```

---

## db.js
```js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    budget_cents INTEGER NOT NULL DEFAULT 0,
    cpc_cents INTEGER NOT NULL DEFAULT 10,
    cpv_micros INTEGER NOT NULL DEFAULT 50, -- cost per view in micros of a cent (0.0005€)
    active INTEGER NOT NULL DEFAULT 1,
    location TEXT, -- comma-separated cities/regions
    interests TEXT, -- comma-separated interests
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    kind TEXT NOT NULL, -- image|video|html
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- view|click|share
    cost_cents INTEGER NOT NULL DEFAULT 0,
    meta TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
  )`);
});

module.exports = db;
```

---

## auth.js (middleware)
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

// Static for uploaded assets
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}_${nanoid(6)}${ext}`);
  }
});
const upload = multer({ storage });

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
  const { title, description = '', budget_eur = 0, cpc_eur = 0.10, cpv_eur = 0.0005, location = '', interests = '' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const budget_cents = Math.round(Number(budget_eur) * 100);
  const cpc_cents = Math.round(Number(cpc_eur) * 100);
  const cpv_micros = Math.round(Number(cpv_eur) * 100000); // micros of a cent
  const stmt = `INSERT INTO campaigns (owner_id, title, description, budget_cents, cpc_cents, cpv_micros, location, interests)
               VALUES (?,?,?,?,?,?,?,?)`;
  db.run(stmt, [req.user.id, title, description, budget_cents, cpc_cents, cpv_micros, location, interests], function(err) {
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
  const { title, description, active, budget_eur, cpc_eur, cpv_eur, location, interests } = req.body;
  db.get('SELECT * FROM campaigns WHERE id = ? AND owner_id = ?', [id, req.user.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });
    const newTitle = title ?? row.title;
    const newDesc = description ?? row.description;
    const newActive = typeof active === 'number' ? active : row.active;
    const newBudget = budget_eur != null ? Math.round(Number(budget_eur) * 100) : row.budget_cents;
    const newCpc = cpc_eur != null ? Math.round(Number(cpc_eur) * 100) : row.cpc_cents;
    const newCpv = cpv_eur != null ? Math.round(Number(cpv_eur) * 100000) : row.cpv_micros;
    const newLoc = location ?? row.location;
    const newInt = interests ?? row.interests;

    db.run(`UPDATE campaigns SET title=?, description=?, active=?, budget_cents=?, cpc_cents=?, cpv_micros=?, location=?, interests=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [newTitle, newDesc, newActive, newBudget, newCpc, newCpv, newLoc, newInt, id], (uErr) => {
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

// Basic feed ranking (pseudo-AI scoring by overlap + budget/recency boost)
function scoreCampaign(c, q) {
  // q: { location, interests[] }
  const userLoc = (q.location || '').toLowerCase();
  const userInts = (q.interests || []).map(s => s.toLowerCase());
  const campLocs = (c.location || '').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
  const campInts = (c.interests || '').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);

  let score = 0;
  if (userLoc && campLocs.some(l => userLoc.includes(l) || l.includes(userLoc))) score += 3;
  const overlap = campInts.filter(ci => userInts.includes(ci)).length;
  score += overlap * 2;

  // Budget boost (more budget remaining => more likely to serve)
  score += Math.min(c.budget_cents / 1000, 5); // caps at +5

  // Recency boost
  const created = new Date(c.created_at).getTime();
  const ageDays = (Date.now() - created) / (1000*60*60*24);
  score += Math.max(0, 3 - (ageDays/7)); // up to +3 for recent campaigns

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
    else if (type === 'view') costCents = Math.round(c.cpv_micros / 10000); // e.g., 0 or 1 cent occasionally
    else if (type === 'share') costCents = Math.round(c.cpc_cents * 1.5);

    const newBudget = Math.max(0, c.budget_cents - costCents);

    db.serialize(() => {
      db.run('INSERT INTO interactions (campaign_id, type, cost_cents) VALUES (?,?,?)', [campaign_id, type, costCents]);
      db.run('UPDATE campaigns SET budget_cents = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newBudget, campaign_id]);
    });

    res.json({ ok: true, charged_cents: costCents, remaining_budget_cents: newBudget });
  });
});

// Minimal static client
app.use('/', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`AI Ads Revolution API running on http://localhost:${port}`));
```

---

## public/index.html (minimal working client)
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
  </style>
</head>
<body>
  <h1>AI Ads Revolution – MVP</h1>
  <p><small>Backend: <code>/health</code> should return <code>{ ok: true }</code>.</small></p>

  <div class="row">
    <div class="col card">
      <h2>1) Register / Login</h2>
      <input id="name" placeholder="Name" />
      <input id="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />
      <button onclick="register()">Register</button>
      <button onclick="login()">Login</button>
      <p><small>Token: <span id="token"></span></small></p>
    </div>

    <div class="col card">
      <h2>2) Create Campaign</h2>
      <input id="title" placeholder="Title" />
      <textarea id="desc" placeholder="Description"></textarea>
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

    async function register(){
      const body = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };
      const r = await fetch(BASE + '/auth/register', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
      const j = await r.json();
      if (j.token){ TOKEN = j.token; localStorage.setItem('token', TOKEN); document.getElementById('token').textContent = TOKEN.slice(0,20)+'...'; }
      else alert(JSON.stringify(j));
    }

    async function login(){
      const body = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };
      const r = await fetch(BASE + '/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
      const j = await r.json();
      if (j.token){ TOKEN = j.token; localStorage.setItem('token', TOKEN); document.getElementById('token').textContent = TOKEN.slice(0,20)+'...'; }
      else alert(JSON.stringify(j));
    }

    async function createCampaign(){
      const body = {
        title: document.getElementById('title').value,
        description: document.getElementById('desc').value,
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
            <button onclick="interact(${it.id}, 'view')">View</button>
            <button onclick="interact(${it.id}, 'click')">Click</button>
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

## README.md
```md
# AI Ads Revolution – MVP

A real, working MVP for a people-powered ads platform.

### Stack
- Node.js + Express
- SQLite (file DB) – no external services
- JWT auth, file uploads
- Minimal static client

### Setup
```bash
npm install
npm run dev
```
Open: http://localhost:4000

### Flow
1. Register or login → get JWT
2. Create a campaign (budget, CPC/CPV, location, interests)
3. Upload an image asset
4. Load the Feed (public) and simulate interactions → budget is debited in real-time

### Notes
- Costs use cents to avoid float issues. CPV is stored as micros of a cent.
- Ranking is a simple pseudo-AI overlap; replace with a proper ML model later.
- Production: put behind HTTPS and a reverse proxy, store uploads on S3, add validation & moderation.


---

## server.js (append new analytics endpoints and dashboard route)
```js
// === Added: Stats endpoints ===
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

// === Added: convenience route for dashboard ===
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
```

---

## public/dashboard.html (new React dashboard)
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

    function CreateCampaign({token,onCreated}){
      const [title,setTitle] = React.useState('Promo Pizzeria Centro');
      const [desc,setDesc] = React.useState('2x1 Margherita questa settimana.');
      const [budget,setBudget] = React.useState('25');
      const [cpc,setCpc] = React.useState('0.10');
      const [cpv,setCpv] = React.useState('0.0005');
      const [loc,setLoc] = React.useState('Piacenza,Fiorenzuola');
      const [ints,setInts] = React.useState('pizza,ristorante,food');
      return (
        <div className="card">
          <h2>Crea Campagna</h2>
          <div className="grid">
            <div>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titolo"/>
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
              <button onClick={async()=>{
                const j = await api.post('/campaigns',{title,description:desc,budget_eur:+budget,cpc_eur:+cpc,cpv_eur:+cpv,location:loc,interests:ints},token);
                if(j.id){ onCreated(j.id); alert('Campagna creata #'+j.id); }
                else alert(JSON.stringify(j));
              }}>Crea</button>
            </div>
            <AssetUploader token={token}/>
          </div>
        </div>
      );
    }

    function AssetUploader({token}){
      const [cid,setCid] = React.useState('');
      const [file,setFile] = React.useState(null);
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
      const interact = async(id,type)=>{
        const j = await api.post('/interact',{campaign_id:id,type});
        alert(`${type} addebitato: ${j.charged_cents} cent. Rimasti: € ${(j.remaining_budget_cents/100).toFixed(2)}`);
        load();
      };
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
                  <button onClick={()=>interact(it.id,'view')}>View</button>
                  <button onClick={()=>interact(it.id,'click')}>Click</button>
                  <button onClick={()=>interact(it.id,'share')}>Share</button>
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
              </div>
              <CreateCampaign token={token} onCreated={()=>{}}/>
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

## Dockerfile (optional deploy)
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

## README.md (append)
```md

## Dashboard React (CDN)
Open http://localhost:4000/dashboard for a richer UI (no build step).

## Quick Deploy
### Docker
```bash
docker build -t ai-ads-revolution .
docker run -p 4000:4000 --env-file .env ai-ads-revolution
```
```
