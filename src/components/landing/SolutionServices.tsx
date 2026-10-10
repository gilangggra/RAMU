"use client";

import React, { useState } from "react";
import { 
  Boxes, 
  Cpu, 
  FileCheck2, 
  Sparkles, 
  ArrowRight, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  Sliders,
  Scale,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export function SolutionServices() {
  const [activeTab, setActiveTab] = useState<"services" | "workflow">("services");

  const coreServices = [
    {
      icon: Boxes,
      badge: "Layanan 01",
      title: "Aktivasi Kapasitas Idle",
      desc: "Ubah ruang studio daylight, perlengkapan kamera Sony/Canon/RED, lighting Profoto, dan sampel busana yang menganggur di hari kerja menjadi aset produktif bernilai ekonomi.",
      bullets: [
        "Monetisasi waktu kosong tanpa biaya overhead baru",
        "Katalog inventaris gear & studio terverifikasi",
        "Mekanisme kolaborasi komplementer bernilai ekuivalen",
      ],
      accentColor: "bg-[#4CC9FE]/15 text-[#4CC9FE] border-[#4CC9FE]/30",
    },
    {
      icon: Cpu,
      badge: "Layanan 02",
      title: "Mesin Pencocokan Deterministik",
      desc: "Sistem pencocokan matematis 4 pilar objektif tanpa spekulasi atau bias, menghubungkan kebutuhan proyek Anda dengan mitra yang memiliki sumber daya komplementer yang tepat.",
      bullets: [
        "Resource Fit (40%) & Need Coverage (25%)",
        "Feasibility Jadwal/Kota (20%) & Readiness (15%)",
        "Transparansi skor kompatibilitas hingga 100%",
      ],
      accentColor: "bg-[#FFD45A]/20 text-amber-700 border-amber-200",
    },
    {
      icon: FileCheck2,
      badge: "Layanan 03",
      title: "Smart SPK & Hak Cipta Otomatis",
      desc: "Generator Surat Perjanjian Kerja (SPK) digital yang otomatis menetapkan pembagian peran, hak guna komersial, batas rilis, kredit nama fotografer/model, dan klausul ganti rugi.",
      bullets: [
        "Perjanjian hukum digital sah & mengikat",
        "Perlindungan kepemilikan hak cipta karya",
        "Klausul anti-ghosting & penalti pembatalan",
      ],
      accentColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      icon: TrendingUp,
      badge: "Layanan 04",
      title: "Shared Production & Showcase",
      desc: "Ruang kolaborasi terpadu untuk menyelaraskan moodboard, jadwal pemotretan, daftar deliverables, serta panggung showcase kurasi karya visual untuk portofolio bisnis.",
      bullets: [
        "Tracking progres pra-produksi hingga rilis",
        "Showcase bersama yang terhubung ke profil",
        "Eksposur ke ribuan calon klien & investor",
      ],
      accentColor: "bg-[#D9D2FF]/30 text-purple-700 border-purple-200",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Daftar & Petakan Aset Idle",
      desc: "Unggah daftar peralatan, ketersediaan jadwal studio, atau koleksi sampel busana yang siap dikolaborasikan.",
    },
    {
      step: "02",
      title: "Spesifikasikan Kebutuhan Proyek",
      desc: "Tentukan peran yang Anda cari (fotografer, model, stylist, studio) lengkap dengan moodboard dan target rilis.",
    },
    {
      step: "03",
      title: "Pencocokan 4 Pilar Otomatis",
      desc: "Mesin RAMU langsung merekomendasikan mitra dengan tingkat kompatibilitas resource tertinggi.",
    },
    {
      step: "04",
      title: "Sepakati SPK Legal Digital",
      desc: "Tanda tangani perjanjian otomatis perihal hak cipta, hak pakai, dan komitmen jadwal secara transparan.",
    },
    {
      step: "05",
      title: "Produksi & Publikasi Karya",
      desc: "Eksekusi proyek bersama, pangkas biaya hingga 65%, dan tayangkan hasil karya di Showcase komersial.",
    },
  ];

  return (
    <section id="solution" className="py-20 sm:py-28 bg-white relative border-b border-stone-200/60 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-[#4CC9FE]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#FFD45A]/10 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 text-[#0284c7] mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#4CC9FE] shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#27213D]">
              Solusi &amp; Layanan Terpadu RAMU
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#27213D] tracking-tight leading-[1.12]">
            Menjawab setiap tantangan produksi <br className="hidden sm:block" />
            dengan <span className="text-[#4CC9FE]">simbiosis mutualisme terukur.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#716B7E] font-normal leading-relaxed">
            RAMU menghadirkan infrastruktur digital lengkap untuk memadukan keahlian, ruang fisik, dan peralatan antar pelaku industri kreatif tanpa beban modal sepihak.
          </p>

          {/* Toggle Buttons: Layanan Inti vs Alur Kerja */}
          <div className="mt-8 inline-flex p-1 rounded-full bg-stone-100 border border-stone-200/80">
            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "services"
                  ? "bg-[#4CC9FE] text-white shadow-md shadow-[#4CC9FE]/30"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              4 Pilar Layanan Inti
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("workflow")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "workflow"
                  ? "bg-[#4CC9FE] text-white shadow-md shadow-[#4CC9FE]/30"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Alur Kerja (5 Langkah)
            </button>
          </div>
        </div>

        {/* Tab 1: 4 Core Services */}
        {activeTab === "services" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 animate-fade-in">
            {coreServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] rounded-[28px] border border-stone-200/80 p-7 sm:p-8 flex flex-col justify-between hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1 transition-all duration-300 relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${service.accentColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 bg-white px-3 py-1 rounded-full border border-stone-200/60 shadow-2xs">
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#27213D] tracking-tight mb-3">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed mb-6">
                      {service.desc}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-stone-200/60">
                      {service.bullets.map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-[#27213D]">
                          <CheckCircle2 className="w-4 h-4 text-[#4CC9FE] shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-stone-200/60 flex items-center justify-between">
                    <Link
                      href="/directory"
                      className="text-xs font-bold text-[#0284c7] hover:text-[#27213D] flex items-center gap-1.5 transition-colors group/link"
                    >
                      <span>Pelajari Selengkapnya</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: 5-Step Workflow Pipeline */}
        {activeTab === "workflow" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {workflowSteps.map((ws, i) => (
                <div
                  key={i}
                  className="bg-[#FAF8F5] rounded-[24px] border border-stone-200/80 p-5 flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="text-3xl font-black text-[#4CC9FE] mb-3">
                      {ws.step}
                    </div>
                    <h4 className="text-sm font-bold text-[#27213D] mb-2 leading-snug">
                      {ws.title}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-normal">
                      {ws.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Callout Banner - Clean Light Design (NO DARK COLORS) */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-[28px] bg-gradient-to-r from-sky-50 via-white to-sky-50 border-2 border-[#4CC9FE]/30 text-[#27213D] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-[#4CC9FE]/5">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-lg sm:text-xl font-bold tracking-tight text-[#27213D]">
              Punya studio kosong atau butuh fotografer untuk lookbook?
            </div>
            <div className="text-xs sm:text-sm text-[#716B7E] font-normal">
              Daftar dalam 2 menit. Sistem deterministik RAMU akan langsung menganalisis mitra yang cocok.
            </div>
          </div>

          <Link
            href="/register"
            className="px-8 py-3.5 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#4CC9FE]/30 hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2"
          >
            <span>Mulai Gratis Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
