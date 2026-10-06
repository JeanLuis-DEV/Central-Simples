import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalDocument({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="legal-document">
      <Link className="legal-back" href="/">← Central Simples</Link>
      <h1>{title}</h1>
      <p className="legal-date">Atualizado em 5 de outubro de 2026</p>
      {children}
      <nav aria-label="Documentos da Central Simples">
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/termos">Termos de uso</Link>
      </nav>
    </main>
  );
}
