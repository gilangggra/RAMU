import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Layers, Users } from "lucide-react";

function IsometricStudioShowcase() {
  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto select-none">
      <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-[#FFD45A]/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-8 w-80 h-80 rounded-full bg-[#D9D2FF]/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/4 w-72 h-72 rounded-full bg-[#BFE9DD]/35 blur-3xl pointer-events-none" />

      <div className="absolute -top-6 left-8 z-20 animate-float pointer-events-none">
        <div
          className="w-12 h-12 rounded-full shadow-[0_12px_24px_rgba(249,150,120,0.35)]"
          style={{
            background: "radial-gradient(circle at 35% 30%, #FFF2EB 0%, #FFAF94 60%, #E66A48 100%)",
          }}
        />
      </div>

      <div className="absolute -top-4 right-14 z-20 animate-float-delayed pointer-events-none">
        <div
          className="w-14 h-14 rounded-full shadow-[0_14px_28px_rgba(167,139,250,0.35)]"
          style={{
            background: "radial-gradient(circle at 32% 28%, #FFFFFF 0%, #C4B5FD 55%, #7C3AED 100%)",
          }}
        />
      </div>

      <div className="absolute top-1/2 -right-5 z-20 animate-float pointer-events-none">
        <div
          className="w-10 h-10 rounded-full shadow-[0_10px_20px_rgba(255,184,0,0.35)]"
          style={{
            background: "radial-gradient(circle at 35% 30%, #FFFDE6 0%, #FFD45A 60%, #E59F00 100%)",
          }}
        />
      </div>

      <div className="absolute bottom-6 -left-4 z-20 animate-float-delayed pointer-events-none">
        <div
          className="w-9 h-9 rounded-full shadow-[0_8px_18px_rgba(45,212,191,0.3)]"
          style={{
            background: "radial-gradient(circle at 35% 30%, #F0FDF9 0%, #99F6E4 60%, #0D9488 100%)",
          }}
        />
      </div>

      <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-[36px] p-6 sm:p-8 border border-white/80 shadow-[0_24px_64px_rgba(39,33,61,0.08)]">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF8080]" />
            <span className="w-3 h-3 rounded-full bg-[#FFD45A]" />
            <span className="w-3 h-3 rounded-full bg-[#6EE7B7]" />
            <span className="ml-2 text-xs font-mono font-bold text-[#716B7E]">
              RAMU STUDIO
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#EDFAF5] text-[#134e40] border border-[#BFE9DD]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            96% Keselarasan
          </span>
        </div>

        <div className="relative rounded-2xl bg-gradient-to-b from-[#FAF8F5] to-[#F3EFFE]/60 p-5 sm:p-6 border border-stone-200/60 overflow-hidden">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="iso-grid" width="40" height="24" patternUnits="userSpaceOnUse">
                  <path d="M0 12 L20 0 L40 12 L20 24 Z" fill="none" stroke="#27213D" strokeWidth="0.5" strokeOpacity="0.08" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#iso-grid)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-full max-w-md bg-[#27213D] rounded-t-2xl pt-2 px-2 shadow-[0_16px_32px_rgba(39,33,61,0.25)] border-t border-x border-white/20">
              <div className="flex justify-center pb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
              </div>

              <div className="rounded-t-lg bg-[#FFFDFC] p-3 sm:p-4 text-[#27213D] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#FFD45A] flex items-center justify-center font-black text-[10px] text-[#27213D]">
                      R
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#27213D] leading-none">
                        Modern Heritage Capsule
                      </div>
                      <div className="text-[9px] text-[#716B7E] font-medium">
                        3 Mitra Komplementer • Terverifikasi
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#EDFAF5] text-[#134e40] border border-[#BFE9DD]">
                    Siap Produksi
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-[#F5F0FF] border border-[#DDD6FE] text-center">
                    <div className="w-7 h-7 mx-auto rounded-lg bg-[#D9D2FF] text-[#27213D] font-bold text-[10px] flex items-center justify-center">
                      BT
                    </div>
                    <div className="text-[10px] font-bold text-[#27213D] mt-1 truncate">
                      Batik Atelier
                    </div>
                    <div className="text-[8px] text-[#716B7E]">Bahan Wastra</div>
                    <div className="text-[9px] font-mono font-bold text-[#27213D] mt-0.5">35%</div>
                  </div>

                  <div className="p-2 rounded-xl bg-[#FFF2EB] border border-[#FCDCD4] text-center">
                    <div className="w-7 h-7 mx-auto rounded-lg bg-[#F9D8C4] text-[#27213D] font-bold text-[10px] flex items-center justify-center">
                      LT
                    </div>
                    <div className="text-[10px] font-bold text-[#27213D] mt-1 truncate">
                      Leather Guild
                    </div>
                    <div className="text-[8px] text-[#716B7E]">Artisan Kulit</div>
                    <div className="text-[9px] font-mono font-bold text-[#27213D] mt-0.5">35%</div>
                  </div>

                  <div className="p-2 rounded-xl bg-[#EDFAF5] border border-[#BFE9DD] text-center">
                    <div className="w-7 h-7 mx-auto rounded-lg bg-[#BFE9DD] text-[#134e40] font-bold text-[10px] flex items-center justify-center">
                      VS
                    </div>
                    <div className="text-[10px] font-bold text-[#27213D] mt-1 truncate">
                      Visual Studio
                    </div>
                    <div className="text-[8px] text-[#716B7E]">Lookbook</div>
                    <div className="text-[9px] font-mono font-bold text-[#27213D] mt-0.5">30%</div>
                  </div>
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="flex justify-between text-[8px] font-semibold text-[#716B7E]">
                    <span>Konsensus Skema Bagi Hasil Adil</span>
                    <span className="text-[#134e40] font-bold">100% Sepakat</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden flex">
                    <div className="bg-[#D9D2FF] h-full w-[35%]" />
                    <div className="bg-[#F9D8C4] h-full w-[35%]" />
                    <div className="bg-[#BFE9DD] h-full w-[30%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[104%] h-4 bg-stone-300 rounded-b-xl relative shadow-md border-t border-stone-200">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-stone-400/70 rounded-b-md" />
            </div>

            <div className="w-full flex items-end justify-between mt-4 pt-2">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 48 56"
                  className="w-12 h-14 drop-shadow-sm shrink-0"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 36V18" stroke="#134e40" strokeWidth="2" strokeLinecap="round" />
                  <path
                    d="M24 24C16 22 14 12 24 10C24 16 26 22 24 24Z"
                    fill="#34D399"
                    stroke="#134e40"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M24 28C32 26 34 16 24 14C24 20 22 26 24 28Z"
                    fill="#10B981"
                    stroke="#134e40"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M24 20C18 16 20 6 26 6C28 12 26 18 24 20Z"
                    fill="#6EE7B7"
                    stroke="#134e40"
                    strokeWidth="1.2"
                  />
                  <polygon points="14,36 34,36 31,52 17,52" fill="#F97316" stroke="#27213D" strokeWidth="1.3" />
                  <rect x="12" y="34" width="24" height="4" rx="1.5" fill="#FB923C" stroke="#27213D" strokeWidth="1.3" />
                </svg>
                <div className="text-[10px] text-[#716B7E]">
                  <div className="font-bold text-[#27213D]">Ekosistem Nyata</div>
                  <div>Tanpa Halusinasi</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#FFF8E6] border border-[#FDE68A] flex items-center justify-center text-[#27213D]">
                  <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-[#27213D]">
                    HKI Terlindungi
                  </div>
                  <div className="text-[9px] text-[#716B7E]">
                    Bagi Hasil Transparan
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 text-xs text-[#716B7E]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span className="font-medium">Feasibility Teruji</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span className="font-medium">6 Dimensi Evaluasi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span className="font-medium">Konsensus Kolaboratif</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-br from-[#FFE9DE] via-[#F3EDFF] via-60% to-[#E2F4FD]"
    >
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/3 w-[600px] h-[600px] bg-[#FFF8E6] rounded-full blur-[140px] opacity-80" />
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-[#FFE4D6] rounded-full blur-[130px] opacity-70" />
        <div className="absolute top-1/3 right-1/4 w-[550px] h-[550px] bg-[#EDE8FF] rounded-full blur-[140px] opacity-80" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-[#E0F7F0] rounded-full blur-[130px] opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-7 text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white shadow-xs text-xs font-bold uppercase tracking-wider text-[#27213D]">
              <Sparkles className="w-3.5 h-3.5 text-[#E59F00]" />
              <span>Creative Opportunity Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-[#27213D] tracking-tight leading-[1.1]">
              Ramu apa yang Anda miliki menjadi karya yang{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">diciptakan bersama.</span>
                <span
                  className="absolute bottom-1.5 left-0 right-0 h-3.5 -z-0 rounded-full opacity-70"
                  style={{ backgroundColor: "#FFB800" }}
                />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#554F65] font-normal leading-relaxed max-w-xl">
              RAMU menghubungkan aset, keahlian kriya, dan kapasitas studio para pelaku ekonomi kreatif menjadi formula kolaborasi bilateral yang nyata dan siap eksekusi.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-full bg-[#FFB800] hover:bg-[#FFA800] active:scale-[0.98] text-[#1E1B2E] font-extrabold text-sm tracking-wide shadow-[0_8px_24px_rgba(255,184,0,0.4)] transition-all hover:scale-105 flex items-center gap-2.5 group"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight className="w-4 h-4 text-[#1E1B2E] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/opportunities"
                className="px-7 py-4 rounded-full bg-white/90 hover:bg-white active:scale-[0.98] border border-white/80 text-[#27213D] font-bold text-sm shadow-sm transition-all hover:shadow"
              >
                Jelajahi Peluang
              </Link>
            </div>

            <div className="pt-5 border-t border-[#27213D]/10 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                <div className="h-9 w-9 rounded-full ring-2 ring-white bg-[#D9D2FF] flex items-center justify-center text-[10px] font-bold text-[#27213D] shadow-xs">
                  BT
                </div>
                <div className="h-9 w-9 rounded-full ring-2 ring-white bg-[#F9D8C4] flex items-center justify-center text-[10px] font-bold text-[#27213D] shadow-xs">
                  LT
                </div>
                <div className="h-9 w-9 rounded-full ring-2 ring-white bg-[#BFE9DD] flex items-center justify-center text-[10px] font-bold text-[#134e40] shadow-xs">
                  VS
                </div>
                <div className="h-9 w-9 rounded-full ring-2 ring-white bg-[#FFD45A] flex items-center justify-center text-[10px] font-bold text-[#27213D] shadow-xs">
                  +120
                </div>
              </div>
              <p className="text-xs text-[#554F65]">
                <strong className="font-bold text-[#27213D]">120+ kreator & studio</strong> aktif membangun kolaborasi lintas sektor
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            <IsometricStudioShowcase />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none z-10 pointer-events-none">
        <svg
          className="relative block w-full h-12 sm:h-16 md:h-24 text-[#FFFDFC]"
          viewBox="0 0 1440 120"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,64 C320,120 480,20 800,75 C1080,125 1280,40 1440,70 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}
