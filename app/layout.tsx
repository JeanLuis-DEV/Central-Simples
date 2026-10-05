import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Central Simples — Aplicativos para facilitar seu dia",
  description:
    "Conheça o Finorya e o Ajudante Elétrico. Ferramentas simples, especializadas e conectadas por uma mesma ideia: facilitar sua rotina.",
  icons: { icon: "/favicon.svg" },
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
