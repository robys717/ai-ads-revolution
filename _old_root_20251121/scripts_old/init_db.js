const { Client } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL mancante. Mettila in .env o come env del processo.");
  process.exit(1);
}
(async () => {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Schema minimale: campaigns (spend, clicks, conversions, date)
  await client.query(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      spend NUMERIC(14,2) NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      day DATE NOT NULL
    );
  `);

  // Seed: 7 giorni di dati fake (una sola campagna), così vedi KPI veri dal DB
  await client.query(`DELETE FROM campaigns;`);
  const today = new Date();
  for (let i=6; i>=0; i--) {
    const d = new Date(today); d.setDate(d.getDate()-i);
    const day = d.toISOString().slice(0,10);
    const spend = (50 + Math.random()*100).toFixed(2);
    const clicks = Math.floor(200 + Math.random()*500);
    const conv = Math.floor(5 + Math.random()*25);
    await client.query(
      `INSERT INTO campaigns (name, spend, clicks, conversions, day)
       VALUES ($1,$2,$3,$4,$5)`,
      ['Launch', spend, clicks, conv, day]
    );
  }

  console.log("✅ DB pronto con dati demo realistici");
  await client.end();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
