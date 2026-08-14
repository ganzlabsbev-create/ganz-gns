// lib/i18n.ts
//
// Minimal, dependency-free i18n. UI copy is English-first per the brief,
// but every string flows through t() so Thai (or any other language) can
// be filled in and switched on later without restructuring components.

export type Lang = "en" | "th";

export const dictionary = {
  en: {
    tagline: "Create your name. Own your identity.",
    heroLine1: "Create a name.",
    heroLine2: "Prove ownership.",
    heroLine3: "Publish your identity.",
    searchPlaceholder: "search a .ganz name",
    searchButton: "Search",
    createButton: "Create a name",
    navHome: "Home",
    navCreate: "Create",
    navDashboard: "Dashboard",
    navVerify: "Verify",
    navIdentity: "Identity",
    navDocs: "Docs",
    notFoundTitle: "No GanZ Name found.",
    createThisName: "Create this name",
    claimed: "Claimed",
    alreadyClaimed: "Already claimed.",
    signatureValid: "Signature Valid",
    signatureInvalid: "Signature Invalid",
    openWebsite: "Open Website",
    verify: "Verify",
    editWebsite: "Edit Website",
    exportIdentity: "Export Identity",
    exportRecord: "Export Name Record",
  },
  th: {
    tagline: "สร้างชื่อของคุณ เป็นเจ้าของตัวตนของคุณ",
    heroLine1: "สร้างชื่อ",
    heroLine2: "พิสูจน์ความเป็นเจ้าของ",
    heroLine3: "ประกาศตัวตนของคุณ",
    searchPlaceholder: "ค้นหาชื่อ .ganz",
    searchButton: "ค้นหา",
    createButton: "สร้างชื่อ",
    navHome: "หน้าแรก",
    navCreate: "สร้างชื่อ",
    navDashboard: "แดชบอร์ด",
    navVerify: "ตรวจสอบ",
    navIdentity: "ตัวตน",
    navDocs: "เอกสาร",
    notFoundTitle: "ไม่พบ GanZ Name นี้",
    createThisName: "สร้างชื่อนี้",
    claimed: "ถูก Claim แล้ว",
    alreadyClaimed: "มีผู้ Claim ไปแล้ว",
    signatureValid: "ลายเซ็นถูกต้อง",
    signatureInvalid: "ลายเซ็นไม่ถูกต้อง",
    openWebsite: "เปิดเว็บไซต์",
    verify: "ตรวจสอบ",
    editWebsite: "แก้ไขเว็บไซต์",
    exportIdentity: "ส่งออกตัวตน",
    exportRecord: "ส่งออก Name Record",
  },
} as const;

export type DictKey = keyof typeof dictionary["en"];

export function t(lang: Lang, key: DictKey): string {
  return dictionary[lang][key] ?? dictionary.en[key];
}
