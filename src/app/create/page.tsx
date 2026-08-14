"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { validateLabel, validateWebsite, labelToName } from "@/lib/validate";
import { createIdentity } from "@/crypto/identity";
import { buildSignedRecord } from "@/crypto/signing";
import { loadIdentity, saveIdentity, addOwnedName } from "@/lib/storage";

type Status = "idle" | "working" | "error";

function CreateInner() {
  const { t } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [label, setLabel] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prefill = searchParams.get("name");
    if (prefill) setLabel(prefill.replace(/\.ganz$/, ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const labelError = label.length > 0 ? validateLabel(label) : null;
  const websiteError = website.length > 0 ? validateWebsite(website) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const lErr = validateLabel(label);
    const wErr = validateWebsite(website);
    if (lErr || wErr) {
      setError(lErr ?? wErr);
      return;
    }

    setStatus("working");
    try {
      let identity = loadIdentity();
      if (!identity) {
        identity = await createIdentity();
        saveIdentity(identity);
      }

      const name = labelToName(label);
      const record = await buildSignedRecord({
        name,
        website: website.trim(),
        ownerPublicKey: identity.publicKey,
        privateKeyJwk: identity.privateKeyJwk,
      });

      const res = await fetch("/api/names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.code === "ALREADY_CLAIMED") {
          setError(`"${name}" ${t("alreadyClaimed")}`);
        } else {
          setError(data.error ?? "Failed to claim name.");
        }
        setStatus("error");
        return;
      }

      addOwnedName(name);
      router.push(`/names/${encodeURIComponent(name)}`);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong while creating your identity or signing the record.");
      setStatus("error");
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="section-title">{t("createButton")}</div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="label">name</label>
          <div className="name-input">
            <input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="wanna"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="suffix">.ganz</span>
          </div>
          {labelError && <div className="error-text">{labelError}</div>}
          <div className="hint">lowercase letters, numbers, hyphens · 1–32 characters</div>
        </div>

        <div className="field">
          <label htmlFor="website">website</label>
          <input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://wanna-trip.vercel.app"
            autoComplete="off"
            spellCheck={false}
          />
          {websiteError && <div className="error-text">{websiteError}</div>}
        </div>

        <div className="hint" style={{ marginBottom: 16 }}>
          If you don&apos;t have a GanZ identity yet, one will be generated in your browser now.
          The private key never leaves this device.
        </div>

        {error && (
          <div className="error-text" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={status === "working"}>
          {status === "working" ? "Claiming…" : "Create & Claim"}
        </button>
      </form>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="hint">loading…</div>}>
      <CreateInner />
    </Suspense>
  );
}
