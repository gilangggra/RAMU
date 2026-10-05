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
  title: "RAMU — Platform Kolaborasi Berbasis Komplementaritas Resource",
  description:
    "Ekosistem aktivasi kapasitas resource menganggur dan pencocokan komplementer terstruktur untuk industri fashion dan visual kreatif Indonesia.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${inter.variable}`}>
      <body className="font-sans antialiased selection:bg-stone-900 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
