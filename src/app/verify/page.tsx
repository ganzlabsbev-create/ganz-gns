"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Fingerprint } from "@/components/Fingerprint";
import { verifyRecord } from "@/crypto/verification";
import type { NameRecord, VerificationResult } from "@/types";

function VerifyInner() {
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name") ?? "";

  const [name, setName] = useState(initialName);
  const [pasted, setPasted] = useState("");
  const [record, setRecord] = useState<NameRecord | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function verifyByName(n: string) {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/names/${encodeURIComponent(n)}`);
      if (!res.ok) {
        setError("No GanZ Name found.");
        return;
      }
      const data = await res.json();
      setRecord(data.record);
      setResult(await verifyRecord(data.record));
    } catch {
      setError("Lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyPasted() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const parsed = JSON.parse(pasted) as NameRecord;
      setRecord(parsed);
      setResult(await verifyRecord(parsed));
    } catch {
      setError("Could not parse that as a JSON name record.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initialName) verifyByName(initialName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 620 }}>
      <div className="section-title">verify a record</div>

      <div className="card">
        <div className="field">
          <label>lookup by name</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="wanna.ganz"
              autoComplete="off"
              spellCheck={false}
            />
            <button className="btn btn-primary" disabled={busy || !name} onClick={() => verifyByName(name)}>
              Verify
            </button>
          </div>
        </div>

        <div className="hint" style={{ margin: "8px 0 16px" }}>
          — or paste a full name record JSON (e.g. from a ganz.json file) —
        </div>

        <div className="field">
          <label>record JSON</label>
          <textarea
            rows={6}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder='{"name":"wanna.ganz","website":"https://...","ownerPublicKey":"GNS-PUB-...","createdAt":"...","updatedAt":"...","signature":"..."}'
            spellCheck={false}
          />
        </div>
        <button className="btn" disabled={busy || !pasted} onClick={verifyPasted}>
          Verify pasted record
        </button>
      </div>

      {error && (
        <div className="card">
          <span className="error-text">{error}</span>
        </div>
      )}

      {record && result && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">{record.name}</div>
            <Badge kind={result.valid ? "valid" : "error"}>
              {result.valid ? "Signature Valid" : "Signature Invalid"}
            </Badge>
          </div>

          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 16 }}>
            <Fingerprint seed={record.signature} valid={result.valid} />
            <dl className="kv" style={{ flex: 1 }}>
              <dt>website</dt>
              <dd>{record.website}</dd>
              <dt>owner</dt>
              <dd>{record.ownerPublicKey}</dd>
            </dl>
          </div>

          <div className="kv">
            <dt>name format</dt>
            <dd>{result.checks.nameWellFormed ? "ok" : "invalid"}</dd>
            <dt>website format</dt>
            <dd>{result.checks.websiteWellFormed ? "ok" : "invalid"}</dd>
            <dt>signature</dt>
            <dd>{result.checks.signatureValid ? "valid" : "invalid"}</dd>
            <dt>owner match</dt>
            <dd>{result.checks.ownerMatchesSignature ? "matches" : "mismatch"}</dd>
          </div>

          {!result.valid && result.reason && (
            <p className="error-text" style={{ marginTop: 12 }}>
              {result.reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="hint">loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
