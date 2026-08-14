// scripts/init-db.mjs
//
// Optional: manually create tables ahead of time.
// `npm run db:init` (requires DATABASE_URL in your environment —
// pull it with `vercel env pull .env.local` after connecting the Neon
// Postgres integration to your project).
//
// Not required for normal use: the app also calls ensureSchema()
// automatically the first time any /api/names route runs.

import { neon } from "@neondatabase/serverless";

const url = process.env.GANZ_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("GANZ_DATABASE_URL (or DATABASE_URL) is not set. Run `vercel env pull .env.local` first, or export it manually.");
  process.exit(1);
}

const sql = neon(url);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS names (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      website TEXT NOT NULL,
      owner_public_key TEXT NOT NULL,
      signature TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'claimed'
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS name_history (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL REFERENCES names(name) ON DELETE CASCADE,
      website TEXT NOT NULL,
      owner_public_key TEXT NOT NULL,
      signature TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      version INT NOT NULL
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_name_history_name ON name_history(name);`;
  console.log("GanZ GNS schema ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
