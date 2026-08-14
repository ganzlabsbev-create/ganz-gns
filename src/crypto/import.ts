// crypto/import.ts
//
// Restores an Identity from a previously-exported backup JSON file.
// Validates shape before trusting it, and re-derives the public key
// string from the JWK so a tampered/corrupted file is caught early.

import type { Identity, IdentityExport } from "@/types";
import { encodePublicKey } from "./identity";

export class InvalidIdentityFileError extends Error {}

export function parseIdentityExport(raw: unknown): IdentityExport {
  if (typeof raw !== "object" || raw === null) {
    throw new InvalidIdentityFileError("File is not a valid JSON object.");
  }
  const obj = raw as Record<string, unknown>;

  if (obj.format !== "ganz-identity-v1") {
    throw new InvalidIdentityFileError(
      "Unrecognized identity file format. Expected a GanZ identity backup."
    );
  }
  if (typeof obj.publicKey !== "string" || !obj.publicKey.startsWith("GNS-PUB-")) {
    throw new InvalidIdentityFileError("Identity file is missing a valid public key.");
  }
  if (typeof obj.privateKeyJwk !== "object" || obj.privateKeyJwk === null) {
    throw new InvalidIdentityFileError("Identity file is missing the private key.");
  }
  if (typeof obj.publicKeyJwk !== "object" || obj.publicKeyJwk === null) {
    throw new InvalidIdentityFileError("Identity file is missing the public key JWK.");
  }

  return obj as unknown as IdentityExport;
}

/** Re-imports the key pair and cross-checks the public key derived from it matches the declared one. */
export async function importIdentity(raw: unknown): Promise<Identity> {
  const parsed = parseIdentityExport(raw);
  const subtle = (globalThis as any).crypto.subtle as SubtleCrypto;

  const publicKey = await subtle.importKey(
    "jwk",
    parsed.publicKeyJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"]
  );
  const raw2 = new Uint8Array(await subtle.exportKey("raw", publicKey));
  const derived = encodePublicKey(raw2);

  if (derived !== parsed.publicKey) {
    throw new InvalidIdentityFileError(
      "Public key in file does not match its key material. File may be corrupted."
    );
  }

  return {
    publicKey: parsed.publicKey,
    privateKeyJwk: parsed.privateKeyJwk,
    publicKeyJwk: parsed.publicKeyJwk,
  };
}
