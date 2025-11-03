const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

const DIST = path.join(__dirname, "dist");
const DATA_DIR = path.join(__dirname, "data");
const EVENTS_FILE = path.join(DATA_DIR, "events.jsonl");

app.use(express.json());
app.use(express.static(DIST)); // serve la SPA buildata

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(EVENTS_FILE)) fs.writeFileSync(EVENTS_FILE, "");

function ymd(ts){ const d=new Date(ts); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function parseRange(q){ const now=new Date(); const to=q.to?new Date(q.to):now; const from=q.from?new Date(q.from):new Date(to.getTime()-13*86400000); return {from,to}; }
function readEventsInRange(from,to){
  const a=from.getTime(), b=to.getTime()+86399999;
  const lines = fs.readFileSync(EVENTS_FILE,"utf8").split(/\n+/).filter(Boolean);
  const out=[]; for(const line of lines){ try{ const e=JSON.parse(line); const t=e.ts||Date.now(); if(t>=a && t<=b) out.push(e);}catch(_){} } return out;
}
function aggregate(events){
  const perDay=new Map();
  for(const e of events){
    const day=ymd(e.ts||Date.now());
    if(!perDay.has(day)) perDay.set(day,{date:day,pageview:0,click:0,conversion:0});
    const row=perDay.get(day);
    if(e.event==="pageview") row.pageview++;
    else if(e.event==="click") row.click++;
    else if(e.event==="conversion") row.conversion++;
  }
  const series=Array.from(perDay.values()).sort((a,b)=>a.date.localeCompare(b.date));
  const totals=series.reduce((acc,r)=>({impressions:acc.impressions+r.pageview,clicks:acc.clicks+r.click,conversions:acc.conversions+r.conversion}),{impressions:0,clicks:0,conversions:0});
  return {series,totals};
}

// Health (per Render)
const BUILD="2025-11-03-1";
const COMMIT=(process.env.RENDER_GIT_COMMIT||"local");
app.get("/health",(req,res)=>res.json({ ok:true, service:"AI Ads Revolution", build:BUILD, time:new Date().toISOString() }));
app.get("/api/health",(req,res)=>res.json({ ok:true, service:"AI Ads Revolution", time:new Date().toISOString() }));

// Pixel
app.post("/api/pixel",(req,res)=>{
  const e=Object.assign({},req.body||{});
  e.ts=Number(e.ts)||Date.now();
  e.event=e.event||"custom";
  e.ip=(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"").toString();
  fs.appendFileSync(EVENTS_FILE, JSON.stringify(e)+"\n");
  res.json({ok:true});
});

// KPI
app.get("/api/reports/summary",(req,res)=>{
  const {from,to}=parseRange(req.query||{});
  const ev=readEventsInRange(from,to);
  const {totals}=aggregate(ev);
  res.json({range:{from,to},kpi:{impressions:totals.impressions,clicks:totals.clicks,conversions:totals.conversions,spend_cents:0}});
});
app.get("/api/reports/timeseries",(req,res)=>{
  const {from,to}=parseRange(req.query||{});
  const ev=readEventsInRange(from,to);
  const {series}=aggregate(ev);
  res.json({range:{from,to},series});
});

// Fallback SPA: ogni rotta NON /api serve index.html
app.get(/^\/(?!api)(.*)/,(req,res)=>{
  const indexPath = path.join(DIST, "index.html");
  if (!fs.existsSync(indexPath)) return res.status(500).send("index.html non trovato (manca build)");
  res.sendFile(indexPath);
});

app.listen(PORT, ()=>console.log(`AI Ads Revolution listening on ${PORT}`));

/** ===== AI / Neural Advisor ===== */
function ewma(arr, alpha=0.35){ const out=[]; let prev=arr?.[0]??0; for(const x of arr){ const v=alpha*x+(1-alpha)*prev; out.push(v); prev=v; } return out; }
function mean(a){ return a.reduce((s,x)=>s+x,0)/(a.length||1) }
function stdev(a){ const m=mean(a); const v=mean(a.map(x=>(x-m)**2)); return Math.sqrt(v||0) }
function zscoreSeries(a){ const m=mean(a), sd=stdev(a)||1; return a.map(x=>(x-m)/sd) }

function computeKPIs(series){
  const totals = series.reduce((acc,r)=>({
    impressions: acc.impressions + (r.pageview||0),
    clicks:      acc.clicks + (r.click||0),
    conversions: acc.conversions + (r.conversion||0)
  }), {impressions:0, clicks:0, conversions:0});
  const spend_cents = 0;
  const ctr = totals.impressions ? totals.clicks / totals.impressions : 0;
  const cvr = totals.clicks ? totals.conversions / totals.clicks : 0;
  const cpc = totals.clicks ? spend_cents / totals.clicks : 0;
  const cpa = totals.conversions ? spend_cents / totals.conversions : 0;
  return { totals, spend_cents, ctr, cvr, cpc, cpa };
}

function neuralInsights(series){
  const clicks = series.map(r=>r.click||0);
  const convs  = series.map(r=>r.conversion||0);
  const ctrs   = series.map(r=>{ const i=r.pageview||0, c=r.click||0; return i? c/i : 0; });
  const ctr_smooth = ewma(ctrs, 0.35);
  const clicks_z = zscoreSeries(clicks);
  const convs_z  = zscoreSeries(convs);

  const recs = [];
  const lastCTR = ctrs.at(-1) ?? 0;
  const lastSmooth = ctr_smooth.at(-1) ?? 0;

  if(lastCTR < 0.01) recs.push("CTR basso: testa 2 headline più dirette e 1 sola CTA.");
  if(lastCTR > 0.05) recs.push("CTR ottimo: incrementa il budget nelle ore top.");
  if((convs.at(-1)??0)===0 && (clicks.at(-1)??0)>10) recs.push("Click alti ma 0 conversioni: rivedi above-the-fold e form.");

  if(lastSmooth > (ctrs[0]||0)) recs.push("Trend CTR in crescita: scala gradualmente le best creative.");
  else                          recs.push("Trend CTR in calo: lancia 2 varianti A/B subito.");

  if((clicks_z.at(-1)??0)>2)  recs.push("Picco click: verifica bot/traffico anomalo.");
  if((convs_z.at(-1)??0)<-2)  recs.push("Calo conversioni anomalo: controlla checkout e pixel.");

  return { ctrs, ctr_smooth, clicks_z, convs_z, recommendations: [...new Set(recs)] };
}

app.get("/api/ai/insights", async (req,res)=>{
  try{
    const {from,to}=parseRange(req.query||{});
    const ev=readEventsInRange(from,to);
    const {series}=aggregate(ev);
    const kpi = computeKPIs(series);
    const neural = neuralInsights(series);

    let llm = null;
    if(process.env.OPENAI_API_KEY && series.length){
      try{
        const prompt = `KPI: CTR=${(kpi.ctr*100).toFixed(2)}%, CVR=${(kpi.cvr*100).toFixed(2)}%. Dammi 4 consigli pratici e sintetici per migliorare le ads.`;
        const r = await fetch("https://api.openai.com/v1/chat/completions",{
          method:"POST",
          headers:{ "Authorization":"Bearer "+process.env.OPENAI_API_KEY, "Content-Type":"application/json" },
          body: JSON.stringify({ model:"gpt-4o-mini", messages:[{role:"user", content: prompt}], temperature:0.7 })
        });
        const j = await r.json();
        llm = j?.choices?.[0]?.message?.content || null;
      }catch(e){ llm = null; }
    }

    res.json({ ok:true, range:{from,to}, kpi, neural, llm });
  }catch(e){ res.status(500).json({ ok:false, error:String(e) }); }
});
/** ===== /AI ===== */

app.get("/debug/routes", (req,res)=>{
  try{
    const routes = [];
    app._router.stack.forEach((m)=>{
      if(m.route && m.route.path){
        routes.push({ method:Object.keys(m.route.methods)[0]?.toUpperCase()||"GET", path:m.route.path });
      }else if(m.name==="router" && m.handle.stack){
        m.handle.stack.forEach((h)=>{
          if(h.route && h.route.path){
            routes.push({ method:Object.keys(h.route.methods)[0]?.toUpperCase()||"GET", path:h.route.path });
          }
        });
      }
    });
    res.json({ ok:true, commit:(process.env.RENDER_GIT_COMMIT||"local"), routes });
  }catch(e){ res.status(500).json({ ok:false, error:String(e) }); }
});
