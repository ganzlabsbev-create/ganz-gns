"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { Badge } from "@/components/Badge";
import { loadIdentity, loadOwnedNames } from "@/lib/storage";
import { buildSignedRecord } from "@/crypto/signing";
import { buildWellKnownDeclaration, downloadJson } from "@/crypto/export";
import { validateWebsite } from "@/lib/validate";
import type { NameRow, Identity } from "@/types";

export default function DashboardPage() {
  const { t } = useLang();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [names, setNames] = useState<NameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftWebsite, setDraftWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorFor, setErrorFor] = useState<string | null>(null);

  useEffect(() => {
    setIdentity(loadIdentity());
    const owned = loadOwnedNames();

    (async () => {
      const results = await Promise.all(
        owned.map(async (o) => {
          try {
            const res = await fetch(`/api/names/${encodeURIComponent(o.name)}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.record as NameRow;
          } catch {
            return null;
          }
        })
      );
      setNames(results.filter((r): r is NameRow => r !== null));
      setLoading(false);
    })();
  }, []);

  function startEdit(record: NameRow) {
    setEditing(record.name);
    setDraftWebsite(record.website);
    setErrorFor(null);
  }

  async function saveEdit(record: NameRow) {
    if (!identity) return;
    const err = validateWebsite(draftWebsite);
    if (err) {
      setErrorFor(err);
      return;
    }

    setSaving(true);
    setErrorFor(null);
    try {
      const newRecord = await buildSignedRecord({
        name: record.name,
        website: draftWebsite.trim(),
        ownerPublicKey: identity.publicKey,
        privateKeyJwk: identity.privateKeyJwk,
        createdAt: record.createdAt,
      });

      const res = await fetch(`/api/names/${encodeURIComponent(record.name)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorFor(data.error ?? "Failed to update website.");
        setSaving(false);
        return;
      }

      const data = await res.json();
      setNames((prev) => prev.map((n) => (n.name === record.name ? data.record : n)));
      setEditing(null);
    } catch (e: any) {
      setErrorFor(e?.message ?? "Failed to update website.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="hint">loading your names…</div>;

  if (!identity || names.length === 0) {
    return (
      <div className="card">
        <div className="card-title mono">My Names</div>
        <p className="hint" style={{ margin: "10px 0 20px" }}>
          You don&apos;t have any GanZ names on this device yet.
        </p>
        <Link className="btn btn-primary" href="/create">
          {t("createButton")}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="section-title">my names</div>

      {names.map((record) => (
        <div className="card" key={record.name}>
          <div className="card-header">
            <div className="card-title">{record.name}</div>
            <Badge kind="valid">{t("claimed")}</Badge>
          </div>

          {editing === record.name ? (
            <>
              <div className="field">
                <label>website</label>
                <input
                  value={draftWebsite}
                  onChange={(e) => setDraftWebsite(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                {errorFor && <div className="error-text">{errorFor}</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => saveEdit(record)} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <dl className="kv" style={{ marginBottom: 16 }}>
                <dt>website</dt>
                <dd>{record.website}</dd>
                <dt>updated</dt>
                <dd>{new Date(record.updatedAt).toLocaleString()}</dd>
              </dl>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-sm" onClick={() => startEdit(record)}>
                  {t("editWebsite")}
                </button>
                <Link className="btn btn-sm" href={`/verify?name=${encodeURIComponent(record.name)}`}>
                  {t("verify")}
                </Link>
                <Link className="btn btn-sm" href="/identity">
                  {t("exportIdentity")}
                </Link>
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    downloadJson(`${record.name}-record.json`, buildWellKnownDeclaration(record))
                  }
                >
                  {t("exportRecord")}
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
