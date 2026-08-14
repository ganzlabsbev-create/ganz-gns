import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getNameByName, updateNameWebsite } from "@/lib/db";
import { verifyRecord, isAuthorizedUpdate } from "@/crypto/verification";
import { isWebsiteWellFormed } from "@/lib/validate";
import type { NameRecord } from "@/types";

export const runtime = "nodejs";

// GET /api/names/[name]
export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  await ensureSchema();
  const record = await getNameByName(decodeURIComponent(params.name));
  if (!record) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ record });
}

// PATCH /api/names/[name]  -> change the website a name points to.
// Body: a new fully-signed NameRecord (same name, same ownerPublicKey,
// same original createdAt, new website + updatedAt + signature).
export async function PATCH(req: NextRequest, { params }: { params: { name: string } }) {
  await ensureSchema();
  const name = decodeURIComponent(params.name);

  let body: NameRecord;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.name !== name) {
    return NextResponse.json({ error: "Name in body does not match URL." }, { status: 400 });
  }
  if (!isWebsiteWellFormed(body.website)) {
    return NextResponse.json({ error: "Website must be a valid http(s) URL." }, { status: 400 });
  }

  const existing = await getNameByName(name);
  if (!existing) {
    return NextResponse.json({ error: "Name does not exist yet." }, { status: 404 });
  }

  // Ownership check: the new record must be signed by the SAME owner key
  // as the existing record, over the SAME original createdAt.
  if (!isAuthorizedUpdate(existing, body)) {
    return NextResponse.json(
      { error: "Update is not authorized: owner, name, or createdAt does not match the existing record." },
      { status: 403 }
    );
  }

  const verification = await verifyRecord(body);
  if (!verification.valid) {
    return NextResponse.json(
      { error: "Signature verification failed.", details: verification },
      { status: 400 }
    );
  }

  const row = await updateNameWebsite(body);
  return NextResponse.json({ record: row });
}
