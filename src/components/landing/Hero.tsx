"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sliders, 
  X, 
  ChevronRight,
  TrendingUp,
  Layers
} from "lucide-react";

interface SimulationRole {
  role: string;
  has: string;
  needs: string;
  partner: string;
  score: number;
  savings: string;
  synergy: string;
}

const simulationPresets: SimulationRole[] = [
  {
    role: "Brand Mode / UMKM",
    has: "Koleksi Kapsul 12 Looks Baru",
    needs: "Fotografer Editorial & Studio Daylight",
    partner: "Studio Loft Sudirman & Fotografer Analog 35mm",
    score: 96,
    savings: "Rp 18.500.000",
    synergy: "Lookbook Editorial Majalah & Konten E-Commerce",
  },
  {
    role: "Studio Foto & Venue",
    has: "Daylight Studio 120m² (Kapasitas Idle Hari Kerja)",
    needs: "Brand Busana & Model Profesional",
    partner: "Atelier Mode Nusantara & Model Editorial",
    score: 94,
    savings: "Rp 14.000.000",
    synergy: "Aktivasi Ruang Idle menjadi Portofolio Komersial",
  },
  {
    role: "Fotografer Editorial",
    has: "Gear Sony FX3, Lensa GM & Lighting Lengkap",
    needs: "Fashion Stylist & Brand Pakaian",
    partner: "Label Streetwear Lokal & Senior Stylist",
    score: 92,
    savings: "Rp 11.200.000",
    synergy: "Kampanye Visual Brand & Rilis Digital Bersama",
  },
];

export function Hero() {
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const active = simulationPresets[selectedPreset];

  return (
    <section
      id="hero"
      className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 bg-[#FFFDFC] overflow-hidden selection:bg-[#4CC9FE]/30 selection:text-[#27213D]"
    >
      {/* Ambient background glows matching design system palette */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 right-10 w-[550px] h-[550px] bg-[#4CC9FE]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-[#FFD45A]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-[#D9D2FF]/15 rounded-full blur-[100px]" />
        
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(#27213D 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Clean Editorial Headline, Subtext, & CTA   */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-start space-y-5 sm:space-y-6 text-left">
            
            {/* Top Live Ecosystem Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-50 border border-stone-200/80 text-[#27213D] shadow-2xs backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#4CC9FE] animate-pulse" />
              <span className="text-[11px] font-bold tracking-wide uppercase text-[#27213D]">
                Platform Komplementer Resource Kreatif
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-[11px] text-[#4CC9FE] font-semibold">100% Deterministik</span>
            </div>

            {/* Giant 3-Line Display Title matching Reference Layout */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4.15rem] font-black text-[#27213D] tracking-[-0.035em] leading-[1.05]">
              Kolaborasi Kreatif <br className="hidden sm:block" />
              Kapasitas Idle Jadi <br className="hidden sm:block" />
              <span className="text-[#4CC9FE]">
                Karya Nyata.
              </span>
            </h1>

            {/* Editorial Descriptive Paragraph */}
            <p className="text-base sm:text-lg text-[#716B7E] font-normal leading-relaxed max-w-xl">
              RAMU menghubungkan brand mode, studio foto, peralatan kamera, dan talenta kreatif untuk saling melengkapi kapasitas aset dan keahlian menjadi proyek kolaborasi komersial terukur tanpa spekulasi.
            </p>

            {/* CTA Button Group: Pill Button + Circular Arrow Button (Exact Reference Match) */}
            <div className="pt-1 flex items-center gap-3">
              {/* Primary Pill Button - Vibrant Brand Blue as requested */}
              <Link
                href="/register"
                className="px-8 py-4 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] text-white font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-xl shadow-[#4CC9FE]/30 hover:shadow-2xl hover:shadow-[#4CC9FE]/45 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 group"
              >
                <span>Mulai Kolaborasi Sekarang</span>
                <span className="w-2 h-2 rounded-full bg-white group-hover:scale-125 transition-transform" />
              </Link>

              {/* Accompanying Circular Arrow Button */}
              <Link
                href="/directory"
                aria-label="Jelajahi Direktori Kolaborasi"
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-[#4CC9FE] bg-white text-[#0284c7] hover:bg-[#4CC9FE] hover:text-white transition-all duration-300 flex items-center justify-center shadow-xs hover:shadow-lg hover:shadow-[#4CC9FE]/20 hover:-translate-y-0.5 active:translate-y-0 group shrink-0"
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Secondary Action: Interactive Compatibility Simulator Trigger */}
            <div className="pt-1 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-500 font-medium">
              <button
                type="button"
                onClick={() => setShowSimModal(true)}
                className="inline-flex items-center gap-2 text-stone-700 hover:text-[#0284c7] font-semibold transition-colors group cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-[#4CC9FE]/15 text-[#0284c7] flex items-center justify-center group-hover:bg-[#4CC9FE] group-hover:text-white transition-colors">
                  <Sliders className="w-3 h-3" />
                </div>
                <span className="underline decoration-stone-300 decoration-1 underline-offset-4 group-hover:decoration-[#4CC9FE]">
                  Uji Simulasi Kompatibilitas Instan
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-stone-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>SPK Legal Otomatis</span>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Ultra-Creative Illustrated Hero Art Visual */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 xl:col-span-5 relative flex items-center justify-center">
            
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#4CC9FE]/20 via-[#FFD45A]/15 to-[#D9D2FF]/25 rounded-[40px] blur-3xl transform scale-105 pointer-events-none" />

            {/* Main Visual Container */}
            <div className="relative w-full max-w-[500px] sm:max-w-[540px] lg:max-w-[580px] mx-auto group">
              
              {/* Creator Collage Image - Ultra-Creative Collaborative Visual */}
              <div className="relative rounded-[32px] overflow-hidden transition-transform duration-500 group-hover:scale-[1.015]">
                <Image
                  src="/images/hero-creative-art.png"
                  alt="RAMU Ekosistem Kolaborasi Kreatif — Fashion Designer, Fotografer Sinema, Model, dan Daylight Studio"
                  width={1024}
                  height={1024}
                  priority
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>

              {/* Floating Glassmorphic Micro-Badge 1: Match Score (Repositioned to the side) */}
              <div className="hidden sm:flex absolute top-6 -left-6 lg:-left-8 bg-white/95 backdrop-blur-md border border-[#4CC9FE]/30 rounded-2xl px-4 py-3 shadow-xl shadow-[#4CC9FE]/10 items-center gap-2.5 animate-float pointer-events-none z-10">
                <div className="w-8 h-8 rounded-xl bg-[#4CC9FE]/15 text-[#4CC9FE] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#4CC9FE]" />
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                    Sistem Deterministik
                  </div>
                  <div className="text-xs font-extrabold text-[#27213D] flex items-center gap-1">
                    <span>96% Match Akurat</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Floating Glassmorphic Micro-Badge 2: Idle Resource (Bottom Corner) */}
              <div className="hidden sm:flex absolute -bottom-2 -right-3 sm:-right-4 bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-2xl px-4 py-3 shadow-xl shadow-stone-900/5 items-center gap-2.5 animate-float-delayed pointer-events-none z-10">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                    Aktivasi Kapasitas
                  </div>
                  <div className="text-xs font-extrabold text-[#27213D]">
                    Studio &amp; Gear Idle Aktif
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE COMPATIBILITY SIMULATOR MODAL (NO DARK COLORS)*/}
      {/* ======================================================== */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-2xl bg-white rounded-[28px] border border-stone-200 p-6 sm:p-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4CC9FE]/15 flex items-center justify-center text-[#4CC9FE]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#27213D] tracking-tight">
                    Simulasi Kompatibilitas Instan RAMU
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Pilih peran untuk menguji kecocokan resource secara deterministik
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tutup modal simulasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preset Selector */}
            <div className="pt-5 pb-3">
              <div className="text-[11px] uppercase tracking-wider font-bold text-stone-400 mb-2">
                Pilih Profil Simulasi:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {simulationPresets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPreset(i)}
                    className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                      selectedPreset === i
                        ? "bg-[#4CC9FE] text-white shadow-md shadow-[#4CC9FE]/30"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60"
                    }`}
                  >
                    <div className="text-[10px] opacity-80 font-normal">Kasus #{i + 1}</div>
                    <div className="truncate font-bold">{p.role.split("/")[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resource Mapping Cards */}
            <div className="space-y-2.5 py-2">
              <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/60">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1">
                  <span>Aset Idle / Keahlian Anda</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-md">Tersedia</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#27213D]">
                  {active.has}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/60">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1">
                  <span>Kebutuhan Proyek yang Dicari</span>
                  <span className="text-amber-800 font-semibold bg-amber-100/70 px-2 py-0.5 rounded-md">Dicocokkan</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#27213D]">
                  {active.needs}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#4CC9FE]/10 border border-[#4CC9FE]/30">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#0284c7] mb-1">
                  Rekomendasi Mitra Komplementer
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#27213D] flex items-center justify-between">
                  <span>{active.partner}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#4CC9FE] shrink-0 ml-2" />
                </div>
              </div>
            </div>

            {/* Score & Savings Metric Bar - Clean Light Card (NO DARK COLORS) */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-white to-sky-50 border border-[#4CC9FE]/30 text-[#27213D] flex items-center justify-between shadow-xs">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#0284c7] tracking-tight">
                    {active.score}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7]">
                    Tingkat Kompatibilitas
                  </span>
                </div>
                <div className="text-[11px] text-[#716B7E] mt-0.5 font-medium">
                  Estimasi Efisiensi Biaya: <strong className="text-emerald-600 font-bold">{active.savings}</strong>
                </div>
              </div>

              <Link
                href="/directory?tab=matched"
                onClick={() => setShowSimModal(false)}
                className="px-5 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/30 shrink-0"
              >
                <span>Cari Mitra</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Modal Footer Note */}
            <div className="mt-3 text-center">
              <span className="text-[10px] text-stone-500 font-medium">
                Dihitung dari 4 pilar: Resource Fit (40%), Need Coverage (25%), Feasibility (20%), Readiness (15%)
              </span>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}

