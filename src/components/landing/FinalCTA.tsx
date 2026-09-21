import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden bg-gradient-to-t from-[#FFE9DE] via-[#F3EDFF] via-50% to-[#FFFDFC]">
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none z-10 pointer-events-none">
        <svg
          className="relative block w-full h-10 sm:h-14 md:h-20 text-[#FFFDFC]"
          viewBox="0 0 1440 120"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C360,90 720,10 1080,75 C1260,110 1380,50 1440,30 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden">
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-[#FFF8E6] rounded-full blur-[130px] opacity-70" />
        <div className="absolute -bottom-10 right-10 w-[550px] h-[550px] bg-[#E0F7F0] rounded-full blur-[140px] opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white shadow-xs text-xs font-bold uppercase tracking-wider text-[#27213D]">
            <Sparkles className="w-3.5 h-3.5 text-[#E59F00]" />
            <span>Mulai Kolaborasi Hari Ini</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#27213D] tracking-tight leading-[1.1]">
            Mari buat karya luar biasa{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">bersama.</span>
              <span
                className="absolute bottom-1.5 left-0 right-0 h-3.5 -z-0 rounded-full opacity-70"
                style={{ backgroundColor: "#FFB800" }}
              />
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#554F65] font-normal leading-relaxed max-w-2xl mx-auto">
            Mulai jelajahi peluang kolaborasi atau daftarkan kapasitas studio dan koleksi Anda untuk menemukan
            tim produksi visual yang saling melengkapi dan membangun karya kampanye bernilai tinggi.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-9 py-4 rounded-full bg-[#FFB800] hover:bg-[#FFA800] active:scale-[0.98] text-[#1E1B2E] font-extrabold text-base tracking-wide shadow-[0_8px_24px_rgba(255,184,0,0.4)] transition-all hover:scale-105 flex items-center gap-2.5 group"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-4 h-4 text-[#1E1B2E] group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/opportunities"
              className="px-8 py-4 rounded-full bg-white/95 hover:bg-white border border-white/80 text-[#27213D] font-bold text-base shadow-sm transition-all hover:shadow"
            >
              Jelajahi Peluang
            </Link>
          </div>

          <div className="pt-3 text-xs text-[#716B7E]">
            Tanpa biaya awal • Analisis kecocokan deterministik • Didedikasikan untuk Ekosistem Fashion & Visual Arts Indonesia
          </div>
        </div>
      </div>
    </section>
  );
}
