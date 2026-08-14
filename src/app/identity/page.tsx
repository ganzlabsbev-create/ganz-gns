"use client";

import { useEffect, useRef, useState } from "react";
import { createIdentity } from "@/crypto/identity";
import { buildIdentityExport, buildWellKnownDeclaration, downloadJson } from "@/crypto/export";
import { importIdentity } from "@/crypto/import";
import { clearIdentity, loadIdentity, loadOwnedNames, saveIdentity } from "@/lib/storage";
import type { Identity, NameRow } from "@/types";

export default function IdentityPage() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [owned, setOwned] = useState<{ name: string }[]>([]);
  const [records, setRecords] = useState<Record<string, NameRow>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIdentity(loadIdentity());
    setOwned(loadOwnedNames());
  }, []);

  useEffect(() => {
    owned.forEach(async (o) => {
      const res = await fetch(`/api/names/${encodeURIComponent(o.name)}`);
      if (res.ok) {
        const data = await res.json();
        setRecords((prev) => ({ ...prev, [o.name]: data.record }));
      }
    });
  }, [owned]);

  async function handleGenerate() {
    const id = await createIdentity();
    saveIdentity(id);
    setIdentity(id);
    setMessage("New identity generated on this device.");
  }

  function handleExport() {
    if (!identity) return;
    downloadJson("ganz-identity-backup.json", buildIdentityExport(identity));
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const restored = await importIdentity(parsed);
      saveIdentity(restored);
      setIdentity(restored);
      setMessage("Identity restored from backup.");
    } catch (err: any) {
      setError(err?.message ?? "Could not import that file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleClear() {
    const ok = window.confirm(
      "This removes your private key from this device. If you have not backed it up, you will not be able to prove ownership of your GanZ names again. Continue?"
    );
    if (!ok) return;
    clearIdentity();
    setIdentity(null);
    setMessage("Identity removed from this device.");
  }

  return (
    <div style={{ maxWidth: 620 }}>
      <div className="section-title">identity</div>

      <div className="card">
        {identity ? (
          <>
            <div className="field">
              <label>public key</label>
              <div className="mono" style={{ wordBreak: "break-all", fontSize: 13 }}>
                {identity.publicKey}
              </div>
            </div>

            <div className="warning-box" style={{ marginBottom: 18 }}>
              Anyone who gets your private key can control your GanZ identity. Keep your exported
              backup file somewhere safe and private.
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-sm" onClick={handleExport}>
                Export Identity
              </button>
              <button className="btn btn-sm" onClick={() => fileInputRef.current?.click()}>
                Import Identity
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleClear} style={{ color: "var(--error)" }}>
                Remove from this device
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                hidden
                onChange={handleImportFile}
              />
            </div>
          </>
        ) : (
          <>
            <p className="hint" style={{ marginBottom: 16 }}>
              No identity on this device yet. Generate one, or import a backup you exported earlier.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={handleGenerate}>
                Generate New Identity
              </button>
              <button className="btn btn-sm" onClick={() => fileInputRef.current?.click()}>
                Import Identity
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                hidden
                onChange={handleImportFile}
              />
            </div>
          </>
        )}

        {message && (
          <p className="hint" style={{ marginTop: 14, color: "var(--valid)" }}>
            {message}
          </p>
        )}
        {error && (
          <p className="error-text" style={{ marginTop: 14 }}>
            {error}
          </p>
        )}
      </div>

      {identity && owned.length > 0 && (
        <>
          <div className="section-title">publish .well-known/ganz.json</div>
          {owned.map((o) => {
            const record = records[o.name];
            return (
              <div className="card" key={o.name}>
                <div className="card-title" style={{ marginBottom: 10 }}>
                  {o.name}
                </div>
                <p className="hint" style={{ marginBottom: 14 }}>
                  Download this file and place it at{" "}
                  <code className="mono">{record ? new URL(record.website).origin : "https://your-site"}</code>
                  <code className="mono">/.well-known/ganz.json</code> to declare {o.name} from your own
                  website.
                </p>
                <button
                  className="btn btn-sm"
                  disabled={!record}
                  onClick={() => record && downloadJson("ganz.json", buildWellKnownDeclaration(record))}
                >
                  Generate ganz.json
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
