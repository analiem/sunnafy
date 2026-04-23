import type { Metadata } from "next";
import { Playfair_Display, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const arabicFont = Noto_Naskh_Arabic({ subsets: ["arabic"], variable: "--font-arabic", display: "swap", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Sunnafy – Sunnah in your pocket",
  description: "Temukan hadis Nabi Muhammad ﷺ berdasarkan tema atau kata kunci, lengkap dengan penjelasan AI dalam 11 bahasa",
  keywords: ["hadis", "hadith", "sunnah", "islam", "sunnafy"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${playfair.variable} ${arabicFont.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
