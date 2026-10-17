import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Central Simples — Aplicativos para facilitar seu dia",
  description:
    "Conheça Finorya, Ajudante Elétrico, Meu Negócio e Lingua Memory. Aplicativos para finanças, serviços, vendas e idiomas em uma só central.",
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
