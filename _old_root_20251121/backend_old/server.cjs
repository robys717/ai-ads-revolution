/**
 * AI Ads Revolution - Backend
 * Express (CJS). Ordine delle route corretto:
 * 1) API (health / advise / metrics)
 * 2) Static / Catch-all (SPA)
 */
const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3003;
const HOST = "0.0.0.0";

app.use(express.json());

// --- Health ---
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "backend", port: PORT });
});

// --- Helper fetch (Node >=18 ok; altrimenti node-fetch) ---
async function httpPostJson(url, payload) {
  const _fetch = (typeof fetch !== "undefined")
    ? fetch
    : (await import("node-fetch")).default;
  const resp = await _fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || resp.statusText || "AI error");
  return data;
}

// --- AI Advise (con fallback se l'AI è offline) ---
app.post("/api/ai/advise", async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [];
  const AI_URL = process.env.AI_URL || "http://localhost:8001/advise";
  try {
    const out = await httpPostJson(AI_URL, payload);
    return res.json(out);
  } catch (e) {
    console.warn("[AI offline] uso fallback:", e.message);
    // Fallback semplice: calcolo CTR/CPC per canale e do suggerimento
    const byCh = {};
    for (const p of payload) {
      const ch = p.channel || "unknown";
      byCh[ch] = byCh[ch] || { imp:0, clk:0, spend:0 };
      byCh[ch].imp += p.impressions||0;
      byCh[ch].clk += p.clicks||0;
      byCh[ch].spend += p.spend||0;
    }
    const ctr = Object.fromEntries(Object.entries(byCh).map(([k,v]) => [k, v.clk/Math.max(v.imp,1)]));
    const cpc = Object.fromEntries(Object.entries(byCh).map(([k,v]) => [k, v.spend/Math.max(v.clk,1) || 1e9]));
    const keys = Object.keys(byCh);
    const best = keys.reduce((a,b)=> (ctr[a]||-1)>(ctr[b]||-1)?a:b, keys[0]||"");
    const worst= keys.reduce((a,b)=> (cpc[a]||-1)>(cpc[b]||-1)?a:b, keys[0]||"");
    const advice = [];
    if (best && worst && best!==worst) advice.push(`Sposta ~15% budget da ${worst} a ${best}`);
    if (best)  advice.push(`Miglior CTR: ${best} (${((ctr[best]||0)*100).toFixed(2)}%)`);
    if (worst) advice.push(`Peggior CPC: ${worst} (€${(cpc[worst]||0).toFixed(2)})`);
    return res.json({ advice, fallback: true });
  }
});

// --- Metrics Mock (KPI + timeseries) ---
app.get("/api/metrics", (_req, res) => {
  const kpi = {
    spend: 482.30, impressions: 120000, clicks: 3600, conversions: 180, revenue: 5200.00
  };
  const ctr  = kpi.clicks / Math.max(kpi.impressions, 1);
  const cpc  = kpi.spend / Math.max(kpi.clicks, 1);
  const cpa  = kpi.spend / Math.max(kpi.conversions, 1);
  const roas = kpi.revenue / Math.max(kpi.spend, 1);

  const today = new Date();
  const daily = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const imp = 6000 + Math.round(Math.random()*4000);
    const clk = Math.round(imp * (0.025 + Math.random()*0.01));
    const sp  = +(clk * (0.10 + Math.random()*0.08)).toFixed(2);
    const conv= Math.max(1, Math.round(clk * (0.04 + Math.random()*0.01)));
    daily.push({
      date: d.toISOString().slice(0,10),
      impressions: imp,
      clicks: clk,
      spend: sp,
      conversions: conv,
      ctr: clk/imp,
      cpc: sp/Math.max(clk,1),
      cpa: sp/Math.max(conv,1),
      roas: (conv*28) / Math.max(sp,1)
    });
  }

  const hourly = [];
  for (let h=0; h<24; h++) {
    const imp = 300 + Math.round(Math.random()*200);
    const clk = Math.round(imp * (0.025 + Math.random()*0.012));
    const sp  = +(clk * (0.12 + Math.random()*0.08)).toFixed(2);
    const conv= Math.max(0, Math.round(clk * (0.04 + Math.random()*0.015)));
    hourly.push({
      hour: h,
      impressions: imp,
      clicks: clk,
      spend: sp,
      conversions: conv,
      ctr: clk/imp,
      cpc: sp/Math.max(clk,1),
      cpa: sp/Math.max(conv,1),
    });
  }

  res.json({ kpi: { ...kpi, ctr, cpc, cpa, roas }, daily, hourly });
});

// --- Static & Catch-all (tenere SEMPRE dopo le API) ---
const staticDir = path.resolve(__dirname, "..", "web", "dist");
app.use(express.static(staticDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend online su http://${HOST}:${PORT}`);
});
