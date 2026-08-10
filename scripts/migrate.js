// Creates (or updates) all tables. Run locally, pointed at whichever
// DATABASE_URL you're deploying — this is a plain Node script, not a
// Vercel function, so it can hold a normal `pg` connection open for the
// duration of the run regardless of DB_DRIVER.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set (checked process.env and .env).');
    process.exit(1);
  }

  const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.sql'), 'utf8');
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(schema);
    console.log('Migration complete — all tables are up to date.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
