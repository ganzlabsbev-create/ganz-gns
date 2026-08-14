"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";

export function Header() {
  const { lang, setLang, t } = useLang();

  return (
    <header className="header">
      <div className="shell header-inner">
        <Link href="/" className="logo">
          <span className="dot" />
          GanZ<span style={{ color: "var(--text-faint)" }}>GNS</span>
        </Link>

        <nav className="nav">
          <Link href="/">{t("navHome")}</Link>
          <Link href="/create">{t("navCreate")}</Link>
          <Link href="/dashboard">{t("navDashboard")}</Link>
          <Link href="/verify">{t("navVerify")}</Link>
          <Link href="/identity">{t("navIdentity")}</Link>
          <Link href="/docs">{t("navDocs")}</Link>
        </nav>

        <div className="lang-toggle">
          <button data-active={lang === "en"} onClick={() => setLang("en")}>
            EN
          </button>
          <button data-active={lang === "th"} onClick={() => setLang("th")}>
            TH
          </button>
        </div>
      </div>
    </header>
  );
}
