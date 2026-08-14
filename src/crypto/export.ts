// crypto/export.ts
//
// Turns a locally-held Identity into a downloadable JSON backup file, and
// a downloadable /.well-known/ganz.json declaration for a name record.
// Nothing here talks to a server — both are pure client-side file builders.

import type { Identity, IdentityExport, NameRecord } from "@/types";

export function buildIdentityExport(identity: Identity): IdentityExport {
  return {
    format: "ganz-identity-v1",
    publicKey: identity.publicKey,
    privateKeyJwk: identity.privateKeyJwk,
    publicKeyJwk: identity.publicKeyJwk,
    exportedAt: new Date().toISOString(),
  };
}

export function buildWellKnownDeclaration(record: NameRecord) {
  return {
    name: record.name,
    website: record.website,
    ownerPublicKey: record.ownerPublicKey,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    signature: record.signature,
  };
}

/** Triggers a browser download of a JSON object. Browser-only. */
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
