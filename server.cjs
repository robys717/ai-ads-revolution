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
