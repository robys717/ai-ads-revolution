const { Client } = require('pg');
require('dotenv').config();
const url = process.env.DATABASE_URL;
if(!url){ console.error("❌ DATABASE_URL mancante"); process.exit(1); }

(async ()=>{
  const c = new Client({ connectionString:url, ssl:{rejectUnauthorized:false} });
  await c.connect();

  // 1) utente + account demo (se non esistono)
  const email = 'demo@azienda.it';
  const user = await c.query("INSERT INTO users(email,password_hash,name) VALUES($1,'seed', 'Demo') ON CONFLICT (email) DO UPDATE SET name='Demo' RETURNING id",[email]);
  const uid = user.rows[0].id;
  const acc  = await c.query("INSERT INTO accounts(user_id,company_name) VALUES($1,'Azienda Demo') ON CONFLICT DO NOTHING RETURNING id",[uid]);
  let aid;
  if (acc.rowCount) aid = acc.rows[0].id;
  else aid = (await c.query("SELECT id FROM accounts WHERE user_id=$1 LIMIT 1",[uid])).rows[0].id;

  // 2) cancella gli ultimi 10 giorni e inserisci 7 giorni di dati
  await c.query("DELETE FROM campaigns WHERE day >= CURRENT_DATE - INTERVAL '10 days' AND account_id=$1",[aid]);

  const today = new Date();
  for (let i=6;i>=0;i--){
    const d = new Date(today); d.setDate(d.getDate()-i);
    const day = d.toISOString().slice(0,10);
    const spend = (50 + Math.random()*100).toFixed(2);
    const clicks = 200 + Math.floor(Math.random()*500);
    const conversions = 5 + Math.floor(Math.random()*25);
    await c.query(
      "INSERT INTO campaigns(name,spend,clicks,conversions,day,account_id) VALUES($1,$2,$3,$4,$5,$6)",
      [`Campagna ${day}`, spend, clicks, conversions, day, aid]
    );
  }

  console.log("✅ Seed completato con 7 giorni di dati per account", aid);
  await c.end(); process.exit(0);
})().catch(e=>{ console.error(e); process.exit(1); });
