"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { labelToName } from "@/lib/validate";

export default function HomePage() {
  const { t } = useLang();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    const name = trimmed.endsWith(".ganz") ? trimmed : labelToName(trimmed.replace(/\.ganz$/, ""));
    router.push(`/names/${encodeURIComponent(name)}`);
  }

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">experimental naming system</div>
          <h1>
            {t("heroLine1")}
            <br />
            {t("heroLine2")}
            <br />
            <span className="muted">{t("heroLine3")}</span>
            <span className="cursor">&nbsp;</span>
          </h1>
          <p className="hero-sub">{t("tagline")}</p>

          <form className="search-row" onSubmit={handleSearch}>
            <div className="name-input">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button type="submit" className="btn btn-ghost">
              {t("searchButton")}
            </button>
            <Link href="/create" className="btn btn-primary">
              {t("createButton")}
            </Link>
          </form>
        </div>

        <div className="card" aria-hidden="true">
          <div className="kv">
            <dt>name</dt>
            <dd>wanna.ganz</dd>
            <dt>website</dt>
            <dd>https://wanna-trip.vercel.app</dd>
            <dt>owner</dt>
            <dd>GNS-PUB-8f2a…c91d</dd>
            <dt>status</dt>
            <dd style={{ color: "var(--valid)" }}>claimed · signed</dd>
          </div>
        </div>
      </section>

      <div className="section-title">how it works</div>
      <div className="card">
        <div className="kv">
          <dt>1. name</dt>
          <dd>Pick a free label — it becomes yours as label.ganz.</dd>
          <dt>2. identity</dt>
          <dd>A key pair is generated in your browser. The private key never leaves it.</dd>
          <dt>3. record</dt>
          <dd>Your name + website get signed with your private key.</dd>
          <dt>4. publish</dt>
          <dd>Anyone can look up the name and verify your signature.</dd>
        </div>
      </div>
    </>
  );
}
