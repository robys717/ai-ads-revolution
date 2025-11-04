const express = require('express');
const path = require('path');
const net = require('net');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// porta libera auto
async function getFreePort(start = 3000) {
  return new Promise(resolve => {
    const srv = net.createServer();
    srv.listen(start, () => srv.close(()=>resolve(start)));
    srv.on('error', () => resolve(getFreePort(start+1)));
  });
}

(async ()=>{
  const PORT = process.env.PORT || (await getFreePort(3000));
  const BUILD = (process.env.RENDER ? "cloud" : "local") + "-" + new Date().toISOString().replace(/[-:T.Z]/g,"").slice(0,12);

  // DB opzionale (se manca DATABASE_URL -> demo)
  const pgPool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    : null;

  // middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 })); // 120 req/min

  // ========== AUTH ========== //
  function authRequired(req,res,next){
    const h=req.headers.authorization||'';
    const token=h.startsWith('Bearer ')?h.slice(7):null;
    if(!token) return res.status(401).json({ok:false,error:'token mancante'});
    try{ req.user=jwt.verify(token,SECRET); next(); }
    catch{ return res.status(401).json({ok:false,error:'token invalido'}); }
  }

  app.post('/api/auth/register', async (req,res)=>{
    try{
      if(!pgPool) return res.status(400).json({ok:false,error:'DATABASE_URL mancante: abilita il DB per registrarti'});
      const {email,password,name,company} = req.body;
      if(!email||!password) return res.status(400).json({ok:false,error:'email e password obbligatorie'});
      const hash = await bcrypt.hash(password,10);

      const u = await pgPool.query(
        'INSERT INTO users(email,password_hash,name) VALUES($1,$2,$3) ON CONFLICT (email) DO NOTHING RETURNING id',
        [email,hash,name||null]
      );
      if(!u.rowCount) return res.status(409).json({ok:false,error:'email già registrata'});
      const uid = u.rows[0].id;

      const a = await pgPool.query(
        'INSERT INTO accounts(user_id,company_name) VALUES($1,$2) RETURNING id',
        [uid, company||'Account']
      );
      const token = jwt.sign({uid,aid:a.rows[0].id}, SECRET, {expiresIn:'2d'});
      res.json({ok:true,token});
    }catch(e){ res.status(500).json({ok:false,error:String(e)}); }
  });

  app.post('/api/auth/login', async (req,res)=>{
    try{
      if(!pgPool) return res.status(400).json({ok:false,error:'DATABASE_URL mancante: abilita il DB per login'});
      const {email,password} = req.body;
      const r = await pgPool.query('SELECT * FROM users WHERE email=$1',[email]);
      if(!r.rowCount) return res.status(401).json({ok:false,error:'utente non trovato'});
      const u=r.rows[0];
      if(!await bcrypt.compare(password,u.password_hash)) return res.status(401).json({ok:false,error:'password errata'});
      // trova o crea account
      const acc = await pgPool.query('SELECT id FROM accounts WHERE user_id=$1 LIMIT 1',[u.id]);
      const aid = acc.rowCount ? acc.rows[0].id : (await pgPool.query('INSERT INTO accounts(user_id,company_name) VALUES($1,$2) RETURNING id',[u.id,'Account'])).rows[0].id;
      const token=jwt.sign({uid:u.id,aid},SECRET,{expiresIn:'2d'});
      res.json({ok:true,token});
    }catch(e){ res.status(500).json({ok:false,error:String(e)}); }
  });

  app.get('/api/me', authRequired, async (req,res)=>{
    try{
      if(!pgPool) return res.status(400).json({ok:false,error:'DATABASE_URL mancante'});
      const {uid,aid}=req.user;
      const u = await pgPool.query('SELECT id,email,name FROM users WHERE id=$1',[uid]);
      const a = await pgPool.query('SELECT id,company_name FROM accounts WHERE id=$1',[aid]);
      res.json({ok:true,user:u.rows[0],account:a.rows[0]});
    }catch(e){ res.status(500).json({ok:false,error:String(e)}); }
  });

  // ========== HEALTH ========== //
  app.get('/api/health', (_req,res)=>{
    res.set({'Cache-Control':'no-store','Pragma':'no-cache'}).type('application/json')
      .json({ ok:true, build:BUILD, port:PORT, env:process.env.NODE_ENV||'dev' });
  });
  app.get('/api/ping', (_req,res)=>{
    res.set({'Cache-Control':'no-store','Pragma':'no-cache'}).type('application/json')
      .json({ ok:true, msg:'pong', ts:Date.now() });
  });

  // ========== REPORTS ========== //
  app.get('/api/reports/summary', async (_req,res)=>{
    try{
      if(!pgPool){
        return res.json({ ok:true, source:'memory', date:new Date().toISOString(),
          totals:{spend:123.45, clicks:678, ctr:3.21, conversions:12} });
      }
      const q = await pgPool.query(`
        SELECT
          COALESCE(SUM(spend),0)::float AS spend,
          COALESCE(SUM(clicks),0)::int AS clicks,
          COALESCE(SUM(conversions),0)::int AS conversions
        FROM campaigns;
      `);
      const r=q.rows[0]||{spend:0,clicks:0,conversions:0};
      const ctr = (Number(r.clicks)||0) > 0 ? +(((Number(r.conversions)||0)/Number(r.clicks))*100).toFixed(2) : 0;
      res.json({ ok:true, source:'postgres', date:new Date().toISOString(),
        totals:{ spend:Number(r.spend)||0, clicks:Number(r.clicks)||0, ctr, conversions:Number(r.conversions)||0 } });
    }catch(e){
      console.error('summary error',e);
      res.status(500).json({ ok:false, error:String(e) });
    }
  });

  app.get('/api/reports/timeseries', async (_req,res)=>{
    try{
      if(!pgPool){
        const today=new Date();
        const data=[...Array(7)].map((_,i)=>{
          const d=new Date(today); d.setDate(d.getDate()-(6-i));
          return { day:d.toISOString().slice(0,10), spend:+(50+Math.random()*100).toFixed(2), clicks:200+Math.floor(Math.random()*500), conversions:5+Math.floor(Math.random()*25) };
        });
        return res.json({ ok:true, source:'memory', data });
      }
      const q=await pgPool.query(`
        SELECT
          to_char(day,'YYYY-MM-DD') AS day,
          SUM(spend)::float AS spend,
          SUM(clicks)::int AS clicks,
          SUM(conversions)::int AS conversions
        FROM campaigns
        GROUP BY day
        ORDER BY day ASC;
      `);
      res.json({ ok:true, source:'postgres', data:q.rows });
    }catch(e){
      console.error('timeseries error', e);
      res.status(500).json({ ok:false, error:String(e) });
    }
  });

  // static + SPA fallback
  const webDist = path.join(__dirname,'web','dist');
  const rootDist = path.join(__dirname,'dist');
  const staticDir = fs.existsSync(webDist)?webDist:rootDist;
  app.use(express.static(staticDir));
  app.get('*', (_req,res)=>res.sendFile(path.join(staticDir,'index.html')));

  app.listen(PORT, ()=> {
    console.log(`✅ AI Ads Revolution avviato su porta ${PORT} | build=${BUILD}`);
    console.log(`📂 Serving: ${staticDir}`);
  });
})();
