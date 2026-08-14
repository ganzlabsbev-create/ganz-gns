# GanZ GNS

> Create your name. Own your identity.

GanZ GNS is an experimental, decentralized-identity naming prototype. Users
create a free `label.ganz` name, get a cryptographic identity generated in
their own browser (Web Crypto, ECDSA P-256), sign a record binding their name
to a website, and publish it for anyone to look up and verify.

**This is not DNS, not ICANN, not blockchain, and not a wallet/token/NFT
system.** `.ganz` names do not open directly in a normal browser address bar
in this version — see `/docs` in the app for the full explanation.

---

## 1. What's inside

```
src/
  app/                  Next.js App Router pages + API routes
    page.tsx            Home (search + create CTA)
    create/              Create & claim a name
    names/[name]/        Public name lookup page
    dashboard/            "My Names" — edit website, export, verify
    verify/               Verify any name or pasted record JSON
    identity/             View/generate/export/import identity, ganz.json
    docs/                 Plain-language documentation
    api/names/            REST API (search, claim, update, history)
  components/            Header, Footer, Badge, Fingerprint, LangProvider
  crypto/                 identity.ts, signing.ts, verification.ts,
                          export.ts, import.ts, codec.ts
                          (all crypto logic lives ONLY here)
  lib/                    db.ts (Postgres), validate.ts, i18n.ts, storage.ts
  types/                  Shared TypeScript types
scripts/
  schema.sql              Reference SQL schema
  init-db.mjs             Optional manual schema setup script
```

### Architecture in one line

```
User → Cryptographic Identity → Signed Name Record → Public Verification
```

The private key is generated in the browser with the Web Crypto API and
**never** sent to the server (see `crypto/identity.ts`). The server
(`src/lib/db.ts` + `src/app/api/names/**`) only stores and indexes records —
every write independently re-verifies the signature server-side
(`crypto/verification.ts`) before touching the database, so the database can
never forge ownership even if it wanted to.

---

## 2. Run it locally

```bash
npm install
cp .env.example .env.local   # fill in Postgres vars, see step 3
npm run dev
```

Open http://localhost:3000

---

## 3. Database — Vercel Postgres (free tier)

1. Push this repo to GitHub, then import it into a new Vercel project.
2. In the Vercel dashboard: **Storage → Create Database → Postgres**
   (the free "Hobby" tier is enough for this prototype) and connect it to
   your project.
3. Vercel injects `POSTGRES_URL` and friends into your project's
   Environment Variables automatically — you don't need to copy anything
   by hand for the deployed app.
4. For local development, run `vercel env pull .env.local` (requires the
   Vercel CLI: `npm i -g vercel`, then `vercel link`) to pull the same
   variables down to your machine.
5. Tables are created automatically on first API call
   (`ensureSchema()` in `src/lib/db.ts`, `CREATE TABLE IF NOT EXISTS`).
   You do **not** need to run anything manually. If you want to create
   them ahead of time anyway, run `npm run db:init` locally, or paste
   `scripts/schema.sql` into the Vercel Postgres query editor.

No other paid infrastructure is required. No VPS, no blockchain, no
cryptocurrency.

---

## 4. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel: **Add New → Project → Import** your repo.
3. Attach Postgres storage as described above (do this before or right
   after the first deploy — either order works, just redeploy once it's
   attached so the env vars are picked up).
4. Deploy. Framework preset is auto-detected as Next.js; no build
   command changes are needed.

---

## 5. The 10 things this prototype proves

1. A person can create a name.
2. A person holds their own identity (key pair, generated client-side).
3. A person announces name + website.
4. Data is signed with the private key.
5. Anyone else can verify the signature.
6. Anyone else can search for a name.
7. Anyone else sees the website a name points to.
8. The owner can change the website while keeping the same ownership.
9. Identity can be exported/imported (backup & recovery).
10. A `.well-known/ganz.json` file can be generated to declare identity
    from the owner's own website.

---

## 6. Security notes

- Private keys never leave the browser and are never logged, displayed on
  a public page, or stored in the database.
- Public keys and signatures are meant to be public.
- Losing your private key (and not having an exported backup) means you
  can no longer prove ownership of your names — the Identity page warns
  about this before removing a key.
- This is a prototype: no rate limiting, captcha, or abuse protection is
  implemented yet. Don't treat it as production-hardened.

---

## 7. What's intentionally NOT in this version

- No real `.ganz` DNS/browser resolution.
- No blockchain, token, coin, wallet, or NFT UI.
- No automatic upload of `.well-known/ganz.json` to the owner's host —
  the user downloads and places the file themselves.
- No decentralized discovery/gossip network — the current architecture
  is written so this can be layered on later without a rewrite.
