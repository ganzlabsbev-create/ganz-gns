import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getHistory, getNameByName } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/names/[name]/history
export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  await ensureSchema();
  const name = decodeURIComponent(params.name);

  const current = await getNameByName(name);
  if (!current) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const history = await getHistory(name);
  return NextResponse.json({ history, current });
}
