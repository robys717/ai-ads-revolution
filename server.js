import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";

const app = express();
app.use(express.json());

// static root: web/dist se esiste, altrimenti public
const __dirname = path.resolve();
const distWeb = path.join(__dirname, "web", "dist");
const publicDir = path.join(__dirname, "public");
const staticRoot = fs.existsSync(distWeb) ? distWeb : (fs.existsSync(publicDir) ? publicDir : __dirname);
app.use(express.static(staticRoot));

// health
app.get("/health", (_, res) => res.json({ ok: true }));

// demo in-memory
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

// upload (disco effimero)
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

// widget pubblico
app.get("/public/widget.js", (_, res) => {
  res.type("application/javascript").send(`
(async function(){
  const el = document.getElementById("ai-ads-widget") || document.body;
  const r = await fetch("/interactions"); const data = await r.json();
  const t = document.createElement("div");
  t.style.cssText = "border:1px solid #333;padding:12px;border-radius:10px;font-family:system-ui";
  const total = (data.items||[]).reduce((s,x)=>s+Number(x.spend||0),0);
  t.innerHTML = "<b>AI Ads Revolution</b><br>Spesa totale: € " + total.toFixed(2);
  el.appendChild(t);
})();`);
});

// SPA fallback (se più tardi aggiungi la SPA)
app.get(["/","/dashboard"], (req, res, next) => {
  const indexFile = path.join(staticRoot, "index.html");
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  next();
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("AI Ads Revolution listening on", PORT));
