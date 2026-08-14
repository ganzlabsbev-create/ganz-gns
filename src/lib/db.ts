// lib/db.ts
//
// Thin data-access layer over Postgres, using the Neon serverless driver.
// (Vercel's own "Vercel Postgres" product was discontinued — Vercel now
// offers Postgres through the Marketplace, backed by Neon. Connect it via
// Storage → Marketplace → Neon in your Vercel project, which injects a
// DATABASE_URL env var. See README.md.)
//
// IMPORTANT (see IMPORTANT ARCHITECTURE in the project brief): this layer
// is a dumb store + index. It never decides ownership — every write here
// is only reached after crypto/verification.ts has already confirmed the
// signature server-side (see api/names routes). The database cannot forge
// a valid signature, so it cannot forge ownership either.

import { neon } from "@neondatabase/serverless";
import type { NameRecord, NameRow, NameHistoryEntry } from "@/types";

function getSql() {
  // Vercel Marketplace (Neon) was connected with a "GANZ" prefix to avoid
  // colliding with a pre-existing env var of the same base name, so the
  // connection string arrives as GANZ_DATABASE_URL instead of DATABASE_URL.
  const url = process.env.GANZ_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "GANZ_DATABASE_URL (or DATABASE_URL) is not set. Connect a Postgres database (Storage → Marketplace → Neon) to your Vercel project, or set it locally."
    );
  }
  return neon(url);
}

export async function ensureSchema() {
  const sql = getSql();
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
}

function rowToRecord(row: any): NameRow {
  return {
    name: row.name,
    website: row.website,
    ownerPublicKey: row.owner_public_key,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    signature: row.signature,
    status: row.status,
  };
}

export async function getNameByName(name: string): Promise<NameRow | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM names WHERE name = ${name} LIMIT 1;`;
  if (rows.length === 0) return null;
  return rowToRecord(rows[0]);
}

export async function searchNames(query: string, limit = 10): Promise<NameRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM names
    WHERE name ILIKE ${"%" + query + "%"}
    ORDER BY name ASC
    LIMIT ${limit};
  `;
  return rows.map(rowToRecord);
}

export async function insertName(record: NameRecord): Promise<NameRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO names (name, website, owner_public_key, signature, created_at, updated_at, status)
    VALUES (${record.name}, ${record.website}, ${record.ownerPublicKey}, ${record.signature}, ${record.createdAt}, ${record.updatedAt}, 'claimed')
    RETURNING *;
  `;
  return rowToRecord(rows[0]);
}

/** Applies a website update: archives the current row into history, then updates it in place. */
export async function updateNameWebsite(newRecord: NameRecord): Promise<NameRow> {
  const sql = getSql();

  const historyRows = await sql`
    SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM name_history WHERE name = ${newRecord.name};
  `;
  const nextVersion = historyRows[0].next_version as number;

  const current = await getNameByName(newRecord.name);
  if (current) {
    await sql`
      INSERT INTO name_history (name, website, owner_public_key, signature, created_at, updated_at, version)
      VALUES (${current.name}, ${current.website}, ${current.ownerPublicKey}, ${current.signature}, ${current.createdAt}, ${current.updatedAt}, ${nextVersion});
    `;
  }

  const rows = await sql`
    UPDATE names
    SET website = ${newRecord.website},
        signature = ${newRecord.signature},
        updated_at = ${newRecord.updatedAt}
    WHERE name = ${newRecord.name}
    RETURNING *;
  `;
  return rowToRecord(rows[0]);
}

export async function getHistory(name: string): Promise<NameHistoryEntry[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM name_history WHERE name = ${name} ORDER BY version ASC;
  `;
  return rows.map((row: any) => {
    const entry: NameHistoryEntry = {
      name: row.name,
      website: row.website,
      ownerPublicKey: row.owner_public_key,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      signature: row.signature,
      version: row.version,
    };
    return entry;
  });
}
