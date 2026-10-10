"use client";

import React from "react";
import Link from "next/link";
import { RamuLogo } from "@/components/brand/RamuLogo";

export function Footer() {
  return (
    <footer className="bg-[#FFFDFC] border-t border-stone-200/60 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-100">
          
          {/* Logo & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <RamuLogo size={32} className="shrink-0 group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-wider text-[#27213D]">
                  RAMU
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#716B7E]">
                  Platform Industri Kreatif
                </span>
              </div>
            </Link>

            <p className="text-sm font-bold text-[#27213D] pt-1">
              Kombinasikan apa yang Anda miliki. Ciptakan nilai ekonomi bersama.
            </p>

            <p className="text-xs text-[#716B7E] leading-relaxed max-w-sm">
              Platform kolaborasi terpadu industri fashion dan visual kreatif.
              Memadukan keahlian, peralatan kamera, dan ruang studio antar brand mode, fotografer, model, MUA, stylist, dan daylight studio
              secara aman, transparan, dan terukur.
            </p>
          </div>

          {/* Nav Links: Platform */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
              Platform &amp; Fitur
            </div>
            <ul className="space-y-2 text-xs font-medium text-[#716B7E]">
              <li>
                <Link href="/dashboard" className="hover:text-[#27213D] transition-colors">
                  Dashboard Kolaborasi
                </Link>
              </li>
              <li>
                <Link href="/directory?tab=matched" className="hover:text-[#27213D] transition-colors font-semibold text-[#0284c7]">
                  Pencocokan Deterministik (Rekomendasi)
                </Link>
              </li>
              <li>
                <Link href="/directory" className="hover:text-[#27213D] transition-colors">
                  Direktori Talenta &amp; Studio
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="hover:text-[#27213D] transition-colors">
                  Showcase Portofolio
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-[#27213D] transition-colors">
                  Eksplorasi Proyek Produksi
                </Link>
              </li>
              <li>
                <Link href="/collaborations?section=contracts" className="hover:text-[#27213D] transition-colors">
                  Smart SPK &amp; Hak Cipta
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Links: Alur & Solusi */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
              Navigasi Halaman
            </div>
            <ul className="space-y-2 text-xs font-medium text-[#716B7E]">
              <li>
                <Link href="/#problem" className="hover:text-[#27213D] transition-colors">
                  Tantangan Industri
                </Link>
              </li>
              <li>
                <Link href="/#solution" className="hover:text-[#27213D] transition-colors">
                  Solusi &amp; Layanan
                </Link>
              </li>
              <li>
                <Link href="/#portfolio" className="hover:text-[#27213D] transition-colors">
                  Bukti Portofolio
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="hover:text-[#27213D] transition-colors">
                  Testimoni Kolaborator
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#27213D] transition-colors">
                  Tanya Jawab (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Links: Akses Akun */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
              Akses Cepat
            </div>
            <ul className="space-y-2 text-xs font-medium text-[#716B7E]">
              <li>
                <Link href="/login" className="hover:text-[#27213D] transition-colors">
                  Masuk Akun
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#27213D] transition-colors font-bold text-[#0284c7]">
                  Daftar Profil Gratis
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

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#716B7E]">
          <div>
            &copy; {new Date().getFullYear()} RAMU — Platform Kolaborasi Berbasis Komplementaritas Resource. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-6">
            <span>Next.js 16 • Tailwind CSS • Supabase • Prisma</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
