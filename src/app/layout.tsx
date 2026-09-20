import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RAMU — Creative Opportunity Engine",
  description:
    "Platform analisis komplementaritas aset dan pembentuk peluang kolaborasi terstruktur untuk pelaku ekonomi kreatif Indonesia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${inter.variable}`}>
      <body className="font-sans antialiased selection:bg-amber-500/30 selection:text-amber-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
