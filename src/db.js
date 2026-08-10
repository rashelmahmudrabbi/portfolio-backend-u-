// Thin wrapper that exposes a single `sql` query function, usable both as
// a tagged template (sql`SELECT * FROM x WHERE id = ${id}`) and as a plain
// call (sql('SELECT * FROM x WHERE id = $1', [id])) — the same interface
// @neondatabase/serverless's neon() gives you.
//
// Driver selection:
//   - Default (production / Vercel): Neon's HTTP driver. Vercel functions
//     are stateless and short-lived, so a classic TCP connection pool gets
//     thrown away on every cold start anyway — Neon's HTTP driver sends
//     each query as a single fetch() with no connection setup, which is
//     both faster to cold-start and avoids exhausting Postgres connections
//     under bursty serverless traffic.
//   - DB_DRIVER=pg (local development only): a plain `pg` Pool, so you can
//     point this at a local Postgres instance without needing a Neon
//     project while developing. Not intended for production use.
const { neon } = require('@neondatabase/serverless');

let sql;

function getSql() {
  if (sql) return sql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add it in your Vercel project settings ' +
      '(or a local .env file) — see README.md.'
    );
  }

  if (process.env.DB_DRIVER === 'pg') {
    sql = buildPgSql(url);
  } else {
    sql = neon(url);
  }
  return sql;
}

function buildPgSql(url) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: url });

  function sqlFn(strings, ...values) {
    if (Array.isArray(strings) && Object.prototype.hasOwnProperty.call(strings, 'raw')) {
      // Tagged-template usage: sql`SELECT * FROM x WHERE id = ${id}`
      let text = strings[0];
      for (let i = 0; i < values.length; i++) {
        text += `$${i + 1}` + strings[i + 1];
      }
      return pool.query(text, values).then((r) => r.rows);
    }
    // Plain call usage: sql('SELECT ...', [params])
    const text = strings;
    const params = values[0] || [];
    return pool.query(text, params).then((r) => r.rows);
  }
  return sqlFn;
}

module.exports = { getSql };
