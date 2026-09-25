import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative py-28 md:py-36 bg-[#1E1B2E] overflow-hidden">
      
      {/* Abstract Background Element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[800px] bg-stone-800/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-3">
             <span className="w-8 h-px bg-stone-600"></span>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
               Jadilah Bagian Dari Pergerakan
             </span>
             <span className="w-8 h-px bg-stone-600"></span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-[1.1]">
            Mari ciptakan karya <span className="font-serif italic text-stone-400">monumental</span> bersama.
          </h2>

          <p className="text-base sm:text-lg text-stone-400 font-light leading-relaxed max-w-2xl mx-auto">
            Kurasi aset Anda hari ini dan temukan talenta visioner yang siap meramu konsep Anda menjadi kampanye visual kelas dunia.
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/register"
              className="px-9 py-4 rounded-full bg-white hover:bg-stone-200 text-[#1E1B2E] font-semibold text-xs tracking-widest uppercase transition-all flex items-center gap-3 group"
            >
              <span>Bergabung Sekarang</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/directory"
              className="px-8 py-4 rounded-full bg-transparent hover:bg-stone-800 border border-stone-600 text-white font-semibold text-xs tracking-widest uppercase transition-all"
            >
              Jelajahi Ekosistem
            </Link>
          </div>

          <div className="pt-6 text-[10px] uppercase tracking-[0.2em] font-medium text-stone-600">
            Didedikasikan untuk Industri Visual & Kreatif
          </div>
        </div>
      </div>
    </section>
  );
}
