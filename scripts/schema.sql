-- GanZ GNS schema
-- Run this once against your Vercel Postgres database, or just deploy —
-- the app calls ensureSchema() automatically on first API request.

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

CREATE INDEX IF NOT EXISTS idx_name_history_name ON name_history(name);
