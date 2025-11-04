const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const BUILD = (process.env.RENDER ? "cloud" : "local") + "-" +
  new Date().toISOString().replace(/[-:T.Z]/g,"").slice(0,12);

// middlewares base
try { app.use("/api", require("./server")); console.log("[API] router ./server montato su /api"); } catch(e) { console.warn("[API] nessun router ./server:", e.message); }
app.use(express.urlencoded({ extended: true }));

// API minime
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, build: BUILD, port: PORT, env: process.env.NODE_ENV || 'dev' });
});

// sceglie automaticamente quale dist servire
const webDist = path.join(__dirname, 'web', 'dist');
const rootDist = path.join(__dirname, 'dist');
const staticDir = require('fs').existsSync(webDist) ? webDist : rootDist;


// === API REALI ===
app.get('/api/ping', (_req,res)=>res.json({ok:true, msg:'pong', ts:Date.now()}));

app.get('/api/reports/summary', (_req,res)=>{
  // TODO: sostituire con dati reali da db.js
  res.json({
    ok:true,
    date:new Date().toISOString(),
    totals:{ spend: 123.45, clicks: 678, ctr: 3.21, conversions: 12 }
  });
});
// === FINE API ===
app.use(express.static(staticDir));
// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI Ads Revolution listening on ${PORT} | build=${BUILD} | staticDir=${staticDir}`);
});
