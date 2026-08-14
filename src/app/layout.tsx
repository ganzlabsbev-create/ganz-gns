import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "GanZ GNS — Create your name. Own your identity.",
  description:
    "GanZ GNS is an experimental, decentralized-identity naming prototype. Create a .ganz name, prove ownership with a cryptographic signature, and publish it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangProvider>
          <div className="page">
            <Header />
            <main className="main">
              <div className="shell">{children}</div>
            </main>
            <Footer />
          </div>
        </LangProvider>
      </body>
    </html>
  );
}
