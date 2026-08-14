// lib/validate.ts
//
// Re-exports the well-formedness checks from crypto/verification.ts under
// friendlier names for form validation, plus a helper that turns a raw
// label typed into the "Create Name" form into a full "label.ganz" name.

import { isNameWellFormed, isWebsiteWellFormed } from "@/crypto/verification";

export { isNameWellFormed, isWebsiteWellFormed };

export function labelToName(label: string): string {
  return `${label.trim().toLowerCase()}.ganz`;
}

export function validateLabel(label: string): string | null {
  const trimmed = label.trim().toLowerCase();
  if (trimmed.length === 0) return "Name cannot be empty.";
  if (trimmed.length > 32) return "Name must be 32 characters or fewer.";
  if (!/^[a-z0-9-]+$/.test(trimmed)) return "Only lowercase letters, numbers, and hyphens are allowed.";
  if (trimmed.startsWith("-") || trimmed.endsWith("-")) return "Name cannot start or end with a hyphen.";
  if (trimmed.includes(".")) return "Name cannot contain a dot — the .ganz suffix is added automatically.";
  return null;
}

export function validateWebsite(website: string): string | null {
  if (website.trim().length === 0) return "Website cannot be empty.";
  if (!isWebsiteWellFormed(website.trim())) return "Enter a valid http(s):// URL.";
  return null;
}
