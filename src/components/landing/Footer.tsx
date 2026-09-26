import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#FFFDFC] border-t border-stone-200/60 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-100">
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#FFB800] flex items-center justify-center shadow-sm font-black text-[#1E1B2E] text-lg">
                R
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-[#27213D]">
                  RAMU
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#716B7E]">
                  Fashion & Visual Production Engine
                </span>
              </div>
            </Link>

            <p className="text-sm font-semibold text-[#27213D] pt-1">
              Ramu aset. Ciptakan peluang.
            </p>

            <p className="text-xs text-[#716B7E] leading-relaxed max-w-sm">
              Platform sintesis kolaboratif industri fashion, fotografi, dan seni visual.
              Meramu sinergi komplementer antar desainer, talenta model, fotografer, dan studio
              melalui analisis terstruktur dan deterministik.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
              Platform
            </div>
            <ul className="space-y-2 text-xs font-medium text-[#716B7E]">
              <li>
                <Link href="/dashboard" className="hover:text-[#27213D] transition-colors">
                  Dashboard Kreator
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-[#27213D] transition-colors">
                  Katalog Peluang
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-[#27213D] transition-colors">
                  Project Briefs & Kebutuhan
                </Link>
              </li>
              <li>
                <Link href="/collaborations" className="hover:text-[#27213D] transition-colors">
                  Ruang Kolaborasi
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
              Metode
            </div>
            <ul className="space-y-2 text-xs font-medium text-[#716B7E]">
              <li>
                <Link href="/#how-it-works" className="hover:text-[#27213D] transition-colors">
                  12-Tahap Engine
                </Link>
              </li>
              <li>
                <Link href="/#differentiator" className="hover:text-[#27213D] transition-colors">
                  Matriks Sinergi
                </Link>
              </li>
              <li>
                <Link href="/#differentiator" className="hover:text-[#27213D] transition-colors">
                  Evaluasi 6 Dimensi
                </Link>
              </li>
              <li>
                <Link href="/engine-insights" className="hover:text-[#27213D] transition-colors">
                  Engine Insights
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
            &copy; 2026 RAMU. Ramu aset. Ciptakan peluang.
          </div>
          <div className="flex items-center gap-6">
            <span>Next.js 16 • Tailwind CSS • Supabase • Prisma</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
