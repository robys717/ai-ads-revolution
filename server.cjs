const express = require('express');
const path = require('path');
const net = require('net');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();

// 🔧 Trova una porta libera partendo da 3000
async function getFreePort(start = 3000) {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(start, () => {
      server.once('close', () => resolve(start));
      server.close();
    });
    server.on('error', () => resolve(getFreePort(start + 1)));
  });
}

(async () => {
  const pgPool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }) : null;
  const PORT = process.env.PORT || (await getFreePort(3000));
  const BUILD = (process.env.RENDER ? "cloud" : "local") + "-" +
    new Date().toISOString().replace(/[-:T.Z]/g,"").slice(0,12);

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // === API base ===
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, build: BUILD, port: PORT, env: process.env.NODE_ENV || 'dev' });
  });
  app.get('/api/ping', (_req, res) => res.json({ ok: true, msg: 'pong', ts: Date.now() }));
  
  app.get('/api/reports/summary', async (_req, res) => {
    try {
      if (!pgPool) {
        return res.json({ ok:true, source:'memory', date:new Date().toISOString(),
          totals:{ spend:123.45, clicks:678, ctr:3.21, conversions:12 } });
      }
      const { rows } = await pgPool.query(`
        SELECT
          COALESCE(SUM(spend),0) AS spend,
          COALESCE(SUM(clicks),0) AS clicks,
          COALESCE(SUM(conversions),0) AS conversions
        FROM campaigns;
      `);
      const r = rows[0] || { spend:0, clicks:0, conversions:0 };
      const spend = Number(r.spend)||0;
      const clicks = Number(r.clicks)||0;
      const conversions = Number(r.conversions)||0;
      const ctr = clicks>0 ? +( (conversions/ clicks) * 100 ).toFixed(2) : 0; // CTR qui come conv/clicks (%); se preferisci clicks/impressions, aggiungeremo impressions
      res.json({ ok:true, source:'postgres', date:new Date().toISOString(),
        totals:{ spend, clicks, ctr, conversions } });
    } catch (e) {
      console.error('summary error', e);
      res.status(500).json({ ok:false, error:String(e) });
    }
  });
  });

  // === Static & Fallback ===
  const webDist = path.join(__dirname, 'web', 'dist');
  const rootDist = path.join(__dirname, 'dist');
  const staticDir = fs.existsSync(webDist) ? webDist : rootDist;

  app.use(express.static(staticDir));
  app.get('*', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));

  // === Avvio dinamico con messaggio chiaro ===
  app.listen(PORT, () => {
    console.log(`✅ AI Ads Revolution avviato su porta ${PORT} | build=${BUILD}`);
    console.log(`📂 Servendo da: ${staticDir}`);
  });
})();
