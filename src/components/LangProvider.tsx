"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { loadLang, saveLang } from "@/lib/storage";
import { t as translate, type Lang, type DictKey } from "@/lib/i18n";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(loadLang());
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    saveLang(next);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: (key) => translate(lang, key) }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
