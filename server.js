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

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Stripe (opzionale)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  try { stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); } catch (e) { console.warn('Stripe SDK non disponibile'); }
}

// Static per /public e /uploads
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Multer immagini
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}_${nanoid(6)}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  }
});

// --- Auth middleware ---
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

// --- Moderazione basilare ---
const bannedWords = ['hate','terror','naz*','weapons','porn','violence'];
function moderateText(t=''){
  const text = String(t).toLowerCase();
  const found = bannedWords.filter(w => new RegExp(w.replace('*','.*'),'i').test(text));
  return { ok: found.length === 0, flags: found };
}

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// --- AUTH ---
app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
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
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  });
});

// --- CAMPAIGNS ---
app.post('/campaigns', auth, (req, res) => {
  const { title, description = '', destination_url = '', budget_eur = 0, cpc_eur = 0.10, cpv_eur = 0.0005, location = '', interests = '' } = req.body || {};
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

app.get('/campaigns', auth, (req, res) => {
  db.all('SELECT * FROM campaigns WHERE owner_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch' });
    res.json(rows);
  });
});

// UPDATE (fix pulito, senza backtick sporchi)
app.put('/campaigns/:id', auth, (req, res) => {
  const { id } = req.params;
  const { title, description, destination_url, active, budget_eur, cpc_eur, cpv_eur, location, interests } = req.body || {};

  db.get('SELECT * FROM campaigns WHERE id = ? AND owner_id = ?', [id, req.user.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });

    const newTitle = (title ?? row.title);
    const newDesc = (description ?? row.description);
    const newDest = (destination_url ?? row.destination_url);
    const newActive = (typeof active === 'number' || typeof active === 'boolean') ? (active ? 1 : 0) : row.active;

    const newBudgetCents = (budget_eur != null) ? Math.round(Number(budget_eur) * 100) : row.budget_cents;
    const newCpcCents    = (cpc_eur    != null) ? Math.round(Number(cpc_eur) * 100)    : row.cpc_cents;
    const newCpvMicros   = (cpv_eur    != null) ? Math.round(Number(cpv_eur) * 100000) : row.cpv_micros;

    const newLocation = (location ?? row.location);
    const newInterests = (interests ?? row.interests);

    const mod = moderateText(`${newTitle}\n${newDesc}\n${newLocation}\n${newInterests}`);
    if (!mod.ok) return res.status(400).json({ error: 'Content not allowed', flags: mod.flags });

    const sql = 'UPDATE campaigns SET title=?, description=?, destination_url=?, active=?, budget_cents=?, cpc_cents=?, cpv_micros=?, location=?, interests=?, updated_at=CURRENT_TIMESTAMP WHERE id=?';
    const params = [newTitle, newDesc, newDest, newActive, newBudgetCents, newCpcCents, newCpvMicros, newLocation, newInterests, id];

    db.run(sql, params, function (e) {
      if (e) return res.status(500).json({ error: 'Failed to update' });
      return res.json({ ok: true });
    });
  });
});

// --- ASSETS ---
app.post('/assets/upload', auth, upload.single('file'), (req, res) => {
  const { campaign_id, kind = 'image' } = req.body || {};
  if (!req.file || !campaign_id) return res.status(400).json({ error: 'Missing file or campaign_id' });
  const url = `/uploads/${req.file.filename}`;
  db.run('INSERT INTO assets (campaign_id, kind, url) VALUES (?,?,?)', [campaign_id, kind, url], function(err){
    if (err) return res.status(500).json({ error: 'Failed to save asset' });
    res.json({ id: this.lastID, url });
  });
});

// --- FEED & INTERAZIONI ---
app.get('/feed', (req, res) => {
  const { location = '', interests = '' } = req.query || {};
  // ranking semplice (per MVP): campagne attive e con budget > 0
  db.all(`SELECT c.*, (c.budget_cents - IFNULL(SUM(i.cost_cents),0)) AS remaining_cents
          FROM campaigns c
          LEFT JOIN interactions i ON i.campaign_id = c.id
          WHERE c.active = 1
          GROUP BY c.id
          HAVING remaining_cents > 0
          ORDER BY c.updated_at DESC, c.created_at DESC
          LIMIT 50`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch feed' });
    res.json(rows);
  });
});

app.post('/interact', (req, res) => {
  const { campaign_id, type = 'view', publisher_id = null, meta = {} } = req.body || {};
  if (!campaign_id) return res.status(400).json({ error: 'Missing campaign_id' });

  db.get('SELECT * FROM campaigns WHERE id = ?', [campaign_id], (err, c) => {
    if (err || !c) return res.status(404).json({ error: 'Campaign not found' });

    let cost = 0;
    if (type === 'click') cost = c.cpc_cents;
    else if (type === 'view') cost = Math.round(c.cpv_micros / 10000); // micros di cent a centesimi approx

    db.run('INSERT INTO interactions (campaign_id, type, cost_cents, meta, publisher_id) VALUES (?,?,?,?,?)',
      [campaign_id, type, cost, JSON.stringify(meta), publisher_id],
      function(e){
        if (e) return res.status(500).json({ error: 'Failed to log interaction' });
        return res.json({ ok: true, id: this.lastID, charged_cents: cost });
      });
  });
});

// click con redirect
app.get('/click', (req, res) => {
  const { campaign_id, pub } = req.query || {};
  if (!campaign_id) return res.status(400).send('Missing campaign_id');
  db.get('SELECT * FROM campaigns WHERE id = ?', [campaign_id], (err, c) => {
    if (err || !c) return res.status(404).send('Campaign not found');

    const publisher_id = null; // (MVP) mappa pub -> publishers.id se disponibile
    db.run('INSERT INTO interactions (campaign_id, type, cost_cents, meta, publisher_id) VALUES (?,?,?,?,?)',
      [campaign_id, 'click', c.cpc_cents, JSON.stringify({ via:'click-endpoint', pub }), publisher_id],
      function(e){
        const dest = c.destination_url || '#';
        res.redirect(dest);
      });
  });
});

// --- WALLET (MVP semplificato) ---
app.get('/wallet', auth, (req, res) => {
  db.all('SELECT * FROM wallet_tx WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed' });
    const balance = rows.reduce((acc, tx) => acc + (tx.type === 'credit' ? tx.amount_cents : -tx.amount_cents), 0);
    res.json({ balance_cents: balance, history: rows });
  });
});

app.post('/wallet/fund-campaign', auth, (req, res) => {
  const { campaign_id, amount_eur } = req.body || {};
  if (!campaign_id || !amount_eur) return res.status(400).json({ error: 'Missing fields' });
  const amount_cents = Math.round(Number(amount_eur) * 100);

  db.get('SELECT * FROM campaigns WHERE id = ? AND owner_id = ?', [campaign_id, req.user.id], (err, c) => {
    if (err || !c) return res.status(404).json({ error: 'Campaign not found' });

    db.run('UPDATE campaigns SET budget_cents = budget_cents + ? WHERE id = ?', [amount_cents, campaign_id], function(e){
      if (e) return res.status(500).json({ error: 'Failed to fund' });
      db.run('INSERT INTO wallet_tx (user_id, type, amount_cents, ref) VALUES (?,?,?,?)',
        [req.user.id, 'debit', amount_cents, `manual_fund_campaign_${campaign_id}`],
        function(e2){
          if (e2) return res.status(500).json({ error: 'Failed wallet log' });
          res.json({ ok: true });
        });
    });
  });
});

// --- STRIPE (opzionale) ---
app.post('/billing/create-checkout-session', auth, async (req, res) => {
  if (!stripe) return res.status(400).json({ error: 'Stripe not configured' });
  const { amount_eur = 10 } = req.body || {};
  const amount = Math.max(1, Math.round(Number(amount_eur) * 100));

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: process.env.CURRENCY || 'eur', product_data: { name: 'Wallet top-up' }, unit_amount: amount }, quantity: 1 }],
      success_url: `${process.env.BASE_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.BASE_URL}/dashboard?payment=cancel`,
      metadata: { user_id: String(req.user.id) }
    });
    res.json({ id: session.id, url: session.url });
  } catch (e) {
    res.status(500).json({ error: 'Stripe error' });
  }
});

app.post('/billing/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe) return res.sendStatus(400);
  let event = null;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = Number(session.metadata?.user_id || 0);
    const amount = session.amount_total || 0;
    if (userId && amount > 0) {
      db.run('INSERT INTO wallet_tx (user_id, type, amount_cents, ref) VALUES (?,?,?,?)',
        [userId, 'credit', amount, `stripe_${session.id}`], () => {});
    }
  }
  res.json({ received: true });
});

// Serve la Dashboard (pagina HTML)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(publicDir, 'dashboard', 'index.html'));
});

// --- CATCH-ALL: serve index.html (home/landing) ---
app.get('*', (req, res, next) => {
  // lascia passare le API e gli static
  if (req.path.startsWith('/auth') || req.path.startsWith('/campaigns') || req.path.startsWith('/assets') ||
      req.path.startsWith('/feed') || req.path.startsWith('/interact') || req.path.startsWith('/click') ||
      req.path.startsWith('/wallet') || req.path.startsWith('/billing') || req.path.startsWith('/uploads') ||
      req.path.startsWith('/public') || req.path.startsWith('/site') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// --- START ---
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`AI Ads Revolution server running on http://localhost:${PORT}`);
});
