const { Client } = require('pg');
require('dotenv').config();
const url = process.env.DATABASE_URL;
if(!url){ console.error("❌ DATABASE_URL mancante"); process.exit(1); }

(async ()=>{
  const c = new Client({ connectionString:url, ssl:{rejectUnauthorized:false} });
  await c.connect();
  await c.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      spend NUMERIC(14,2) NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      day DATE NOT NULL,
      account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE
    );
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE;
  `);
  console.log("✅ Migrazioni applicate");
  await c.end();
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
