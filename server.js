// server.js (MVP)
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";

const app = express();
app.use(express.json());

const __dirname = path.resolve();
const staticDir = fs.existsSync(path.join(__dirname, "dist")) ? "dist" : "public";
app.use(express.static(path.join(__dirname, staticDir)));

app.get("/health", (_, res) => res.json({ ok: true }));

// Demo in-memory
let interactions = [
  { id: 1, date: new Date().toISOString(), channel: "Google", ctr: 2.1, cpc: 0.34, spend: 12.4 },
  { id: 2, date: new Date().toISOString(), channel: "Meta",   ctr: 1.8, cpc: 0.28, spend: 8.9  }
];

app.get("/interactions", (_, res) => res.json({ items: interactions, total: interactions.length }));

app.post("/interactions", (req, res) => {
  const { channel, ctr, cpc, spend } = req.body || {};
  const item = {
    id: interactions.length ? interactions[interactions.length - 1].id + 1 : 1,
    date: new Date().toISOString(),
    channel: String(channel || "unknown"),
    ctr: Number(ctr) || 0,
    cpc: Number(cpc) || 0,
    spend: Number(spend) || 0
  };
  interactions.push(item);
  res.status(201).json(item);
});

// Upload semplice (storage temporaneo su Render)
const upload = multer({ dest: "/tmp" });
app.get("/assets/upload", (_, res) => {
  res.type("html").send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Upload asset</title>
<style>body{font-family:system-ui;padding:24px;max-width:720px;margin:auto}input,button{padding:8px;margin:8px 0}</style></head>
<body><h2>Carica asset</h2>
<form action="/assets/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="file" required />
  <button type="submit">Upload</button>
</form>
<p style="color:#666">Nota: su Render il disco è effimero. Per produzione useremo S3/R2.</p>
</body></html>`);
});
app.post("/assets/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok:false, error:"no_file" });
  res.json({ ok:true, filename:req.file.originalname, storedAt:req.file.path });
});

// Dashboard base
app.get("/dashboard", (_, res) => {
  res.type("html").send(`<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Dashboard – AI Ads Revolution</title>
<style>
  body{font-family:system-ui,Arial;margin:20px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
  .card{border:1px solid #ddd;border-radius:12px;padding:16px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th,td{border-bottom:1px solid #eee;padding:8px;text-align:left}
  .muted{color:#666}
  .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  input,button{padding:8px;border:1px solid #ccc;border-radius:8px}
  button{cursor:pointer}
</style></head>
<body>
  <h1>Dashboard</h1>
  <div class="grid">
    <div class="card"><div class="muted">CTR medio</div><div id="ctr" style="font-size:28px">—</div></div>
    <div class="card"><div class="muted">CPC medio</div><div id="cpc" style="font-size:28px">—</div></div>
    <div class="card"><div class="muted">Spesa totale</div><div id="spend" style="font-size:28px">—</div></div>
  </div>

  <div class="card">
    <h3>Interactions</h3>
    <div class="row">
      <input id="channel" placeholder="Canale (es. Google)"/>
      <input id="ctrIn" placeholder="CTR" type="number" step="0.01"/>
      <input id="cpcIn" placeholder="CPC" type="number" step="0.01"/>
      <input id="spendIn" placeholder="Spesa" type="number" step="0.01"/>
      <button onclick="add()">Aggiungi</button>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Data</th><th>Canale</th><th>CTR</th><th>CPC</th><th>Spesa</th></tr></thead>
      <tbody id="rows"></tbody>
    </table>
  </div>

<script>
async function load(){
  const r = await fetch('/interactions'); const data = await r.json();
  const items = data.items || [];
  const avg = (arr,k)=>arr.length?(arr.reduce((s,x)=>s+Number(x[k]||0),0)/arr.length):0;
  document.getElementById('ctr').textContent = avg(items,'ctr').toFixed(2) + '%';
  document.getElementById('cpc').textContent = '€ ' + avg(items,'cpc').toFixed(2);
  document.getElementById('spend').textContent = '€ ' + items.reduce((s,x)=>s+Number(x.spend||0),0).toFixed(2);
  document.getElementById('rows').innerHTML = items.map(x=>\`
    <tr>
      <td>\${x.id}</td>
      <td>\${new Date(x.date).toLocaleString()}</td>
      <td>\${x.channel}</td>
      <td>\${x.ctr}%</td>
      <td>€ \${x.cpc}</td>
      <td>€ \${x.spend}</td>
    </tr>\`).join('');
}
async function add(){
  const payload = {
    channel: document.getElementById('channel').value,
    ctr: document.getElementById('ctrIn').value,
    cpc: document.getElementById('cpcIn').value,
    spend: document.getElementById('spendIn').value
  };
  await fetch('/interactions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  load();
}
load();
</script>
</body></html>`);
});

// Widget pubblico
app.get("/public/widget.js", (_, res) => {
  res.type("application/javascript").send(`
(async function(){
  const el = document.getElementById("ai-ads-widget") || document.body;
  const r = await fetch("/interactions"); const data = await r.json();
  const t = document.createElement("div");
  t.style.cssText = "border:1px solid #ddd;padding:12px;border-radius:10px;font-family:system-ui";
  const total = (data.items||[]).reduce((s,x)=>s+Number(x.spend||0),0);
  t.innerHTML = "<b>AI Ads Revolution</b><br>Spesa totale: € " + total.toFixed(2);
  el.appendChild(t);
})();`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("AI Ads Revolution listening on", PORT));
