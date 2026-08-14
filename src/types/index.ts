// Core data shapes shared between crypto/, lib/, api routes and UI.

/** A GanZ Name record as stored/published. This is the object that gets signed. */
export interface NameRecord {
  name: string; // e.g. "wanna.ganz"
  website: string; // e.g. "https://wanna-trip.vercel.app"
  ownerPublicKey: string; // e.g. "GNS-PUB-...."
  createdAt: string; // ISO 8601, set once at first claim
  updatedAt: string; // ISO 8601, bumped on every change
  signature: string; // base64url ECDSA signature over the canonical payload
}

/** Row shape returned from the `names` table (adds status). */
export interface NameRow extends NameRecord {
  status: "claimed";
}

/** A single historical version of a name's website, kept in `name_history`. */
export interface NameHistoryEntry extends NameRecord {
  version: number;
}

/** Result of verify(record). */
export interface VerificationResult {
  valid: boolean;
  checks: {
    signatureValid: boolean;
    ownerMatchesSignature: boolean;
    nameWellFormed: boolean;
    websiteWellFormed: boolean;
  };
  reason?: string;
}

/** A locally-generated cryptographic identity. Private key never leaves the browser. */
export interface Identity {
  publicKey: string; // "GNS-PUB-..."
  privateKeyJwk: JsonWebKey;
  publicKeyJwk: JsonWebKey;
}

/** Exported identity file shape, downloaded as JSON for backup/import. */
export interface IdentityExport {
  format: "ganz-identity-v1";
  publicKey: string;
  privateKeyJwk: JsonWebKey;
  publicKeyJwk: JsonWebKey;
  exportedAt: string;
}

/** A locally-tracked "my name" pointer stored in localStorage. */
export interface OwnedName {
  name: string;
  claimedAt: string;
}
