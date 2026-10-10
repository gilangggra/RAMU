"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative py-24 sm:py-32 bg-gradient-to-b from-white via-[#F0F9FF] to-[#E0F2FE]/50 overflow-hidden text-[#27213D] border-t border-sky-100">

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-[#4CC9FE]/15 rounded-full blur-[150px]" />
        <div className="absolute -bottom-20 right-10 w-[400px] h-[400px] bg-[#FFD45A]/15 rounded-full blur-[120px]" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(#27213D 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-7">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#4CC9FE]/30 text-[#0284c7] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#4CC9FE]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#27213D]">
              Mulai Kolaborasi Saling Melengkapi
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#27213D] tracking-tight leading-[1.08]">
            Hentikan pemborosan modal, <br />
            aktifkan <span className="text-[#4CC9FE]">aset idle Anda sekarang.</span>
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#716B7E] font-normal leading-relaxed max-w-2xl mx-auto">
            Daftarkan keahlian, ruang studio foto, perlengkapan kamera, atau koleksi busana Anda hari ini. Temukan mitra komplementer untuk mewujudkan kampanye visual bernilai komersial tanpa modal besar.
          </p>

          {/* Actions - Vibrant Blue Button */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-9 py-4 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center gap-2.5 shadow-xl shadow-[#4CC9FE]/30 hover:scale-105 active:scale-95 group"
            >
              <span>Daftar Akun Sekarang — Gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            
            <Link
              href="/directory"
              className="px-8 py-4 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[#27213D] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xs hover:border-[#4CC9FE] hover:text-[#0284c7]"
            >
              Jelajahi Direktori
            </Link>
          </div>

          {/* Trust Checkpoints */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-stone-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4CC9FE]" />
              <span>100% Bebas Biaya Pendaftaran</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4CC9FE]" />
              <span>SPK &amp; Hak Cipta Otomatis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4CC9FE]" />
              <span>Pencocokan 4 Pilar Deterministik</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
