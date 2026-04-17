require('dotenv').config({ path: '.env.production' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const res = await pool.query('SELECT key, LEFT(value, 30) as val_preview FROM "AppSetting"');
  console.log("=== AppSetting rows ===");
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
}

check().catch(e => { console.error(e); pool.end(); });
