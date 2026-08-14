"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { Badge } from "@/components/Badge";
import { Fingerprint } from "@/components/Fingerprint";
import { verifyRecord } from "@/crypto/verification";
import type { NameRow, VerificationResult } from "@/types";

type State =
  | { kind: "loading" }
  | { kind: "not-found"; name: string }
  | { kind: "found"; record: NameRow; verification: VerificationResult | null };

export default function NamePage() {
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name);
  const { t } = useLang();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setState({ kind: "loading" });
      try {
        const res = await fetch(`/api/names/${encodeURIComponent(name)}`);
        if (res.status === 404) {
          if (!cancelled) setState({ kind: "not-found", name });
          return;
        }
        const data = await res.json();
        const record: NameRow = data.record;
        const verification = await verifyRecord(record).catch(() => null);
        if (!cancelled) setState({ kind: "found", record, verification });
      } catch {
        if (!cancelled) setState({ kind: "not-found", name });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [name]);

  if (state.kind === "loading") {
    return <div className="hint">looking up {name}…</div>;
  }

  if (state.kind === "not-found") {
    return (
      <div className="card">
        <div className="card-title mono">{state.name}</div>
        <p className="hint" style={{ margin: "10px 0 20px" }}>
          {t("notFoundTitle")}
        </p>
        <Link className="btn btn-primary" href={`/create?name=${encodeURIComponent(state.name)}`}>
          {t("createThisName")}
        </Link>
      </div>
    );
  }

  const { record, verification } = state;
  const valid = verification?.valid ?? false;

  return (
    <div style={{ maxWidth: 620 }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title">{record.name}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Badge kind="valid">{t("claimed")}</Badge>
            <Badge kind={valid ? "valid" : "error"}>
              {valid ? t("signatureValid") : t("signatureInvalid")}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 18 }}>
          <Fingerprint seed={record.signature} valid={valid} />
          <dl className="kv" style={{ flex: 1 }}>
            <dt>website</dt>
            <dd>{record.website}</dd>
            <dt>owner</dt>
            <dd>{record.ownerPublicKey}</dd>
            <dt>created</dt>
            <dd>{new Date(record.createdAt).toLocaleString()}</dd>
            <dt>updated</dt>
            <dd>{new Date(record.updatedAt).toLocaleString()}</dd>
          </dl>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn btn-primary" href={record.website} target="_blank" rel="noreferrer">
            {t("openWebsite")}
          </a>
          <Link className="btn btn-ghost" href={`/verify?name=${encodeURIComponent(record.name)}`}>
            {t("verify")}
          </Link>
        </div>
      </div>

      {!valid && verification?.reason && (
        <div className="card" style={{ borderColor: "var(--error)" }}>
          <span className="error-text">{verification.reason}</span>
        </div>
      )}
    </div>
  );
}
