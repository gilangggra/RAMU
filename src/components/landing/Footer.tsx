import React from "react";
import Link from "next/link";
import { RamuLogo } from "@/components/brand/RamuLogo";

export function Footer() {
  return (
    <footer className="bg-[#FFFDFC] border-t border-stone-200/60 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-100">
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <RamuLogo size={32} className="shrink-0 group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-wider text-stone-900">
                  RAMU
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Platform Industri Kreatif
                </span>
              </div>
            </Link>

            <p className="text-sm font-semibold text-[#27213D] pt-1">
              Kombinasikan apa yang Anda miliki. Ciptakan nilai ekonomi bersama.
            </p>

            <p className="text-xs text-[#716B7E] leading-relaxed max-w-sm">
              Platform kolaborasi berbasis komplementaritas resource industri fashion dan visual kreatif.
              Mengaktivasi kapasitas menganggur dan meramu sinergi komplementer antar brand, desainer, fotografer, model, MUA, dan studio
              melalui analisis deterministik 4 pilar.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
              Platform
            </div>
            <ul className="space-y-2 text-xs font-medium text-[#716B7E]">
              <li>
                <Link href="/dashboard" className="hover:text-[#27213D] transition-colors">
                  Dashboard Kolaborasi
                </Link>
              </li>
              <li>
                <Link href="/collaborate" className="hover:text-[#27213D] transition-colors font-semibold text-amber-700">
                  Hub Kompatibilitas Resource
                </Link>
              </li>
              <li>
                <Link href="/directory" className="hover:text-[#27213D] transition-colors">
                  Direktori Talenta &amp; Studio
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="hover:text-[#27213D] transition-colors">
                  Karya &amp; Inspirasi
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-[#27213D] transition-colors">
                  Papan Proyek (Briefs)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/bookings" className="hover:text-[#27213D] transition-colors">
                  Pesanan Masuk (Bookings)
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
              Layanan
            </div>
            <ul className="space-y-2 text-xs font-medium text-[#716B7E]">
              <li>
                <Link href="/settings/rates" className="hover:text-[#27213D] transition-colors">
                  Paket & Tarif Layanan
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#27213D] transition-colors">
                  Cara Kerja Platform
                </Link>
              </li>
              <li>
                <Link href="/#differentiator" className="hover:text-[#27213D] transition-colors">
                  Keamanan & Transparansi
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
              Akses
            </div>
            <ul className="space-y-2 text-xs font-medium text-[#716B7E]">
              <li>
                <Link href="/login" className="hover:text-[#27213D] transition-colors">
                  Masuk Akun
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#27213D] transition-colors">
                  Daftar Profil Kreatif
                </Link>
              </li>
              <li>
                <Link href="/projects/new" className="hover:text-[#27213D] transition-colors">
                  Posting Kebutuhan Proyek
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#716B7E]">
          <div>
            &copy; {new Date().getFullYear()} RAMU — Platform Kolaborasi Berbasis Komplementaritas Resource.
          </div>
          <div className="flex items-center gap-6">
            <span>Next.js 16 • Tailwind CSS • Supabase • Prisma</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
