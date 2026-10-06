import Catalog from "@/components/catalog";
import type { Metadata } from "next";

// Public Google Search Console ownership proof for jeanluis.dev@gmail.com.
// Keep this public metadata to preserve the owner's site verification.
export const metadata: Metadata = {
  verification: { google: "1VhtLY3VIDV67dtqKZV1z79KPODYS05FbPaGcfJLY5M" },
};

export default function Page() {
  return <Catalog />;
}
