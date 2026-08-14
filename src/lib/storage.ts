// lib/storage.ts
//
// Everything in this file touches ONLY localStorage in the user's own
// browser. The private key never crosses the network — this is the one
// place it is persisted, so the user doesn't have to re-generate an
// identity (and lose ownership of their names) on every visit.

import type { Identity, OwnedName } from "@/types";

const IDENTITY_KEY = "ganz:identity";
const OWNED_NAMES_KEY = "ganz:owned-names";
const LANG_KEY = "ganz:lang";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadIdentity(): Identity | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(IDENTITY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Identity;
  } catch {
    return null;
  }
}

export function saveIdentity(identity: Identity) {
  if (!isBrowser()) return;
  window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
}

export function clearIdentity() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(IDENTITY_KEY);
}

export function loadOwnedNames(): OwnedName[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(OWNED_NAMES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OwnedName[];
  } catch {
    return [];
  }
}

export function addOwnedName(name: string) {
  if (!isBrowser()) return;
  const existing = loadOwnedNames();
  if (existing.some((n) => n.name === name)) return;
  const updated = [...existing, { name, claimedAt: new Date().toISOString() }];
  window.localStorage.setItem(OWNED_NAMES_KEY, JSON.stringify(updated));
}

export function loadLang(): "en" | "th" {
  if (!isBrowser()) return "en";
  const raw = window.localStorage.getItem(LANG_KEY);
  return raw === "th" ? "th" : "en";
}

export function saveLang(lang: "en" | "th") {
  if (!isBrowser()) return;
  window.localStorage.setItem(LANG_KEY, lang);
}
