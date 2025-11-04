const express = require('express');
const path = require('path');
const net = require('net');
const fs = require('fs');

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
  app.get('/api/reports/summary', (_req, res) => {
    res.json({
      ok: true,
      date: new Date().toISOString(),
      totals: { spend: 123.45, clicks: 678, ctr: 3.21, conversions: 12 },
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
