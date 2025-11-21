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

// --- Place Stripe raw body BEFORE json() to support webhooks ---
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  try { stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); } catch (e) { console.warn('Stripe SDK not available'); }
}
app.use('/billing/stripe-webhook', express.raw({ type: 'application/json' }));

// CORS & JSON
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Static uploads
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Multer for images
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

// Basic moderation
const bannedWords = ['hate','terror','naz*','weapons','porn','violence'];
function moderateText(t=''){
  const text = String(t).toLowerCase();
  const found = bannedWords.filter(w => new RegExp(w.replace('*','.*'),'i').test(text));
  return { ok: found.length === 0, flags: found };
}

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Auth
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

// List campaigns
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

// Upload asset
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

// Ranking util
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

// Feed
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

// Interactions + debit
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

// Publishers
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

// Click redirect + publisher revenue share
function handleChargeAndRedirect(c, publisherUserId, res){
  const costCents = c.cpc_cents;
  const newBudget = Math.max(0, c.budget_cents - costCents);
  db.serialize(()=>{
    db.run('INSERT INTO interactions (campaign_id, type, cost_cents, meta, publisher_id) VALUES (?,?,?,?,?)', [c.id,'click',costCents, publisherUserId? 'pub':'', publisherUserId||null]);
    db.run('UPDATE campaigns SET budget_cents=? WHERE id=?', [newBudget,c.id]);
    if (publisherUserId) {
      const share = Math.floor(costCents * 0.5); // 50% to publisher
      db.run('UPDATE users SET balance_cents = balance_cents + ? WHERE id=?', [share, publisherUserId]);
      db.run('INSERT INTO wallet_tx (user_id,type,amount_cents,ref) VALUES (?,?,?,?)', [publisherUserId,'credit',share,`revshare#${c.id}`]);
    }
  });
  const dest = c.destination_url && /^https?:\/\//i.test(c.destination_url) ? c.destination_url : '/';
  res.redirect(dest);
}

app.get('/click', (req,res)=>{
  const cid = Number(req.query.campaign_id||0);
  const pubKey = (req.query.pub||'').toString();
  if(!cid) return res.redirect('/');
  db.get('SELECT * FROM campaigns WHERE id=?', [cid], (err,c)=>{
    if(!c) return res.redirect('/');
    if (pubKey) {
      db.get('SELECT * FROM publishers WHERE pub_key=?', [pubKey], (pe, p)=>{
        const publisherUserId = p ? p.owner_id : null;
        handleChargeAndRedirect(c, publisherUserId, res);
      });
    } else {
      handleChargeAndRedirect(c, null, res);
    }
  });
});

// Wallet
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

// Stripe create checkout
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

// Stripe webhook (raw body)
app.post('/billing/stripe-webhook', (req,res)=>{
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

// Stats
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

// Static client
app.use('/', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`AI Ads Revolution API running on http://localhost:${port}`));
