import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getNameByName, insertName, searchNames } from "@/lib/db";
import { verifyRecord } from "@/crypto/verification";
import { isNameWellFormed, isWebsiteWellFormed } from "@/lib/validate";
import type { NameRecord } from "@/types";

export const runtime = "nodejs";

// GET /api/names?q=wanna  -> search/autocomplete
export async function GET(req: NextRequest) {
  await ensureSchema();
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  const results = await searchNames(q, 10);
  return NextResponse.json({ results });
}

// POST /api/names  -> claim a brand-new name
// Body: a fully-signed NameRecord produced client-side by crypto/signing.ts.
// The server NEVER trusts the client's word for it — it independently
// re-verifies the signature before writing anything (see IMPORTANT
// ARCHITECTURE in the project brief).
export async function POST(req: NextRequest) {
  await ensureSchema();

  let body: NameRecord;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, website, ownerPublicKey, createdAt, updatedAt, signature } = body ?? {};
  if (!name || !website || !ownerPublicKey || !createdAt || !updatedAt || !signature) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!isNameWellFormed(name)) {
    return NextResponse.json({ error: "Name is not a valid .ganz name." }, { status: 400 });
  }
  if (!isWebsiteWellFormed(website)) {
    return NextResponse.json({ error: "Website must be a valid http(s) URL." }, { status: 400 });
  }

  const existing = await getNameByName(name);
  if (existing) {
    return NextResponse.json({ error: "Already claimed.", code: "ALREADY_CLAIMED" }, { status: 409 });
  }

  const verification = await verifyRecord(body);
  if (!verification.valid) {
    return NextResponse.json(
      { error: "Signature verification failed.", details: verification },
      { status: 400 }
    );
  }

  if (createdAt !== updatedAt) {
    return NextResponse.json(
      { error: "New names must have createdAt === updatedAt." },
      { status: 400 }
    );
  }

  const row = await insertName(body);
  return NextResponse.json({ record: row }, { status: 201 });
}
