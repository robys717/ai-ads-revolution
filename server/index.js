import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Database from "better-sqlite3";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === DB path compatibile locale + Render ===
const DB_PATH = process.env.DB_FILE || "./data/data.db";
const db = new Database(DB_PATH);

// === MIGRAZIONI SEMPLICI ===
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  metadata TEXT,
  ts INTEGER NOT NULL
);
`);

// seed utente demo se non esiste
const userCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE email=?").get("test@example.com").c;
if (userCount === 0) {
  db.prepare("INSERT INTO users (email,password) VALUES (?,?)").run("test@example.com","123");
  console.log("Seeded user: test@example.com / 123");
}

// === AUTH reale su DB (semplice per dev) ===
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok:false, error:"Missing creds" });
  const row = db.prepare("SELECT id,email,password FROM users WHERE email=?").get(email);
  if (!row || row.password !== password) return res.status(401).json({ ok:false, error:"Invalid credentials" });
  return res.json({ ok: true, token: "demo-token", user: { email: row.email } });
});

// === KPI demo operativi ===
app.get("/api/metrics", (req, res) => {
  const today = new Date().toISOString().slice(0,10);
  const totals = { spend: 4120.55, impressions: 921345, clicks: 18234, leads: 734, revenue: 9630.10 };
  res.json({
    dateRange: { from: "2025-10-26", to: today },
    totals,
    kpis: {
      ctr:  (totals.clicks/totals.impressions)*100,
      cpc:  totals.spend/totals.clicks,
      cpl:  totals.spend/totals.leads,
      roi:  ((totals.revenue-totals.spend)/totals.spend)*100
    },
    series: [
      { date:"2025-10-26", spend:180, clicks:720, impressions:36210, leads:31, revenue:420 },
      { date:"2025-10-27", spend:210, clicks:760, impressions:40110, leads:29, revenue:460 },
      { date:"2025-10-28", spend:195, clicks:740, impressions:39220, leads:27, revenue:430 },
      { date:"2025-10-29", spend:205, clicks:780, impressions:41005, leads:33, revenue:480 },
      { date:"2025-10-30", spend:220, clicks:820, impressions:43210, leads:35, revenue:520 },
      { date:"2025-10-31", spend:240, clicks:860, impressions:45020, leads:38, revenue:560 },
      { date:"2025-11-01", spend:260, clicks:900, impressions:47200, leads:40, revenue:600 }
    ],
    breakdownByCampaign: [
      { id:"CMP-UTS-IT",   name:"UTS Italia",   spend: 980.20, clicks: 4150, leads: 172, revenue: 2100.00 },
      { id:"CMP-UTS-EU",   name:"UTS Europa",   spend: 1270.50, clicks: 5520, leads: 210, revenue: 3050.00 },
      { id:"CMP-KEY-DRIVE",name:"KeyDrive AI",  spend: 820.10, clicks: 3620, leads: 138, revenue: 1900.00 },
      { id:"CMP-NETROX",   name:"NetroxAI",     spend: 1049.75, clicks: 4944, leads: 214, revenue: 2580.10 }
    ]
  });
});

// === TRACKING eventi (persistente) ===
app.post("/api/events", (req, res) => {
  const { type, metadata } = req.body || {};
  const ts = Date.now();
  db.prepare("INSERT INTO events (type, metadata, ts) VALUES (?,?,?)")
    .run(type || "unknown", metadata ? JSON.stringify(metadata) : null, ts);
  console.log("EVENT:", type, metadata);
  res.json({ ok: true });
});

// Leggi ultimi eventi (debug/monitor)
app.get("/api/events/recent", (req, res) => {
  const limit = Math.max(1, Math.min(parseInt(req.query.limit || "20",10), 200));
  const rows = db.prepare("SELECT id,type,metadata,ts FROM events ORDER BY id DESC LIMIT ?").all(limit);
  const mapped = rows.map(r => ({
    id: r.id,
    type: r.type,
    ts: r.ts,
    metadata: r.metadata ? JSON.parse(r.metadata) : null
  }));
  res.json({ ok:true, count:mapped.length, items:mapped });
});

// === Forecast (AI lineare 7 giorni) ===
function linReg(points) {
  const n = points.length;
  const sumX = points.reduce((s,p)=>s+p.x,0);
  const sumY = points.reduce((s,p)=>s+p.y,0);
  const sumXY= points.reduce((s,p)=>s+p.x*p.y,0);
  const sumX2= points.reduce((s,p)=>s+p.x*p.x,0);
  const denom= n*sumX2 - sumX*sumX || 1e-9;
  const a = (n*sumXY - sumX*sumY) / denom;
  const b = (sumY - a*sumX) / n;
  return { a, b };
}
app.get("/api/forecast", (req,res)=>{
  const base = [
    { date:"2025-10-26", spend:180, clicks:720, impressions:36210, leads:31, revenue:420 },
    { date:"2025-10-27", spend:210, clicks:760, impressions:40110, leads:29, revenue:460 },
    { date:"2025-10-28", spend:195, clicks:740, impressions:39220, leads:27, revenue:430 },
    { date:"2025-10-29", spend:205, clicks:780, impressions:41005, leads:33, revenue:480 },
    { date:"2025-10-30", spend:220, clicks:820, impressions:43210, leads:35, revenue:520 },
    { date:"2025-10-31", spend:240, clicks:860, impressions:45020, leads:38, revenue:560 },
    { date:"2025-11-01", spend:260, clicks:900, impressions:47200, leads:40, revenue:600 }
  ];
  const pts = (key)=> base.map((row,i)=>({x:i+1, y: row[key]}));
  const rg = {
    clicks: linReg(pts("clicks")),
    impressions: linReg(pts("impressions")),
    spend: linReg(pts("spend")),
    revenue: linReg(pts("revenue"))
  };
  const n = base.length;
  const addDays = (iso, d)=>{const dt=new Date(iso);dt.setDate(dt.getDate()+d);return dt.toISOString().slice(0,10);};
  const startDate = base[base.length-1].date;

  const future = Array.from({length:7}, (_,k)=>{
    const x = n + (k+1);
    const clicks = Math.max(0, Math.round(rg.clicks.a*x + rg.clicks.b));
    const impressions = Math.max(1, Math.round(rg.impressions.a*x + rg.impressions.b));
    const spend = Math.max(0, Math.round((rg.spend.a*x + rg.spend.b)*100)/100);
    const revenue = Math.max(0, Math.round((rg.revenue.a*x + rg.revenue.b)*100)/100);
    const ctr = (clicks / impressions) * 100;
    const roi = spend > 0 ? ((revenue - spend)/spend)*100 : 0;
    return { date:addDays(startDate,k+1), clicks, impressions, spend, revenue, ctr, roi };
  });

  const summary = {
    avgCTR: future.reduce((s,r)=>s+r.ctr,0)/future.length,
    avgROI: future.reduce((s,r)=>s+r.roi,0)/future.length,
    totalSpend: future.reduce((s,r)=>s+r.spend,0),
    totalRevenue: future.reduce((s,r)=>s+r.revenue,0),
    totalClicks: future.reduce((s,r)=>s+r.clicks,0)
  };
  res.json({ horizonDays: 7, summary, series: future });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("AI Ads Revolution API on", PORT, "DB:", DB_PATH));
