import { RegisterClientForm } from "@/components/auth/RegisterClientForm";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, CheckCircle2, Zap, ArrowLeft, ShieldCheck } from "lucide-react";

interface RegisterPageProps {
  searchParams: Promise<{ error?: string; redirectTo?: string; redirect?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const error = params.error;
  const redirectTo = params.redirectTo || params.redirect || "/dashboard";

  return (
    <div className="min-h-screen bg-[#FFFDFC] text-[#27213D] relative flex flex-col justify-between selection:bg-[#4CC9FE]/30 selection:text-[#27213D] overflow-x-hidden p-4 sm:p-6 lg:p-8">

      {/* Atmospheric Ambient Glows Matching Landing Page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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

      {/* Top Quick Bar: Clean Back Button */}
      <div className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-start pb-4 sm:pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#0284c7] px-3.5 py-2 rounded-full bg-white/90 hover:bg-white border border-stone-200/90 shadow-2xs backdrop-blur-md transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-stone-400 group-hover:-translate-x-1 group-hover:text-[#4CC9FE] transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* MAIN CONTENT CONTAINER: Balanced Clean Grid */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-auto py-2">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* LEFT COLUMN: Creative Editorial Showcase with Unified Clean Canvas */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 flex-col justify-between space-y-4 pr-2">
            
            {/* Editorial Hook & Value Prop */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-stone-200/80 text-[#27213D] shadow-2xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4CC9FE] animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#27213D]">
                  Pendaftaran Ekosistem Kreatif
                </span>
              </div>

              <h1 className="text-2xl xl:text-3xl font-black text-[#27213D] tracking-tight leading-tight">
                Bergabung dengan Ekosistem Kreatif. <br />
                <span className="text-[#4CC9FE]">Mulai Kolaborasi Tanpa Batas Modal.</span>
              </h1>

              <p className="text-xs text-[#716B7E] font-normal leading-relaxed max-w-lg">
                Dapatkan akses langsung ke ribuan potensi komplementer: brand fashion, fotografer, studio idle, model, dan stylist. Produksi lookbook &amp; kampanye dengan sistem kolaborasi resource sharing serta SPK otomatis.
              </p>
            </div>

            {/* Creative Visual Showcase Box with Matching Warm Cream Background (#F9F7EA) */}
            <div className="relative w-full max-w-md xl:max-w-lg mx-auto group">
              {/* Ambient Background Aura matching Landing Page Hero */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4CC9FE]/20 via-[#FFD45A]/15 to-[#D9D2FF]/25 rounded-[32px] blur-2xl transform scale-105 pointer-events-none" />

              {/* Showcase Box: Matching Warm Cream #F9F7EA Background */}
              <div className="relative rounded-2xl overflow-hidden border border-[#EBE6D6] shadow-md bg-[#F9F7EA] p-3.5 flex flex-col items-center justify-center">
                
                {/* Visual Artwork: Seamless Pure Cream Canvas */}
                <div className="relative rounded-xl overflow-hidden bg-[#F9F7EA] w-full flex items-center justify-center py-1">
                  <Image
                    src="/images/hero-creative-art.png"
                    alt="RAMU Ekosistem Kolaborasi Kreatif — Fashion Designer, Fotografer Sinema, Model, dan Daylight Studio"
                    width={1024}
                    height={1024}
                    className="w-full max-h-[250px] xl:max-h-[280px] object-contain group-hover:scale-[1.015] transition-transform duration-500 ease-out"
                    priority
                  />
                </div>

                {/* Floating Synergy Match Badge (Top-Left) */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-sky-200/80 rounded-xl px-2.5 py-1.5 shadow-sm flex items-center gap-2 pointer-events-none">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                  </div>
                  <div>
                    <div className="text-[8px] font-bold uppercase tracking-wider text-stone-400 leading-none">
                      Ekosistem Terintegrasi
                    </div>
                    <div className="text-[11px] font-black text-[#27213D] flex items-center gap-1 mt-0.5">
                      <span>5 Peran Resmi</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Floating SPK Protection Badge (Top-Right) */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-emerald-200/80 rounded-xl px-2.5 py-1.5 shadow-sm flex items-center gap-1.5 pointer-events-none">
                  <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[8px] font-bold uppercase tracking-wider text-stone-400 leading-none">
                      Legalitas SPK
                    </div>
                    <div className="text-[10px] font-bold text-[#27213D] mt-0.5">
                      Kontrak Digital Sah
                    </div>
                  </div>
                </div>

                {/* Inset Creative Project Widget (Bottom) */}
                <div className="mt-2 w-full bg-white/85 backdrop-blur-sm border border-[#E5E0CF] rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4CC9FE] to-sky-600 text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs">
                      RM
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-[#27213D] truncate">
                          Kolaborasi Kreatif
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Aktif
                        </span>
                      </div>
                      <p className="text-[9px] text-[#716B7E] font-medium truncate">
                        Brand • Fotografer • Studio • Model • Stylist
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3 border-l border-[#E5E0CF]">
                    <span className="text-[8px] uppercase font-bold text-stone-400 block tracking-wider">Status</span>
                    <span className="text-[11px] font-black text-emerald-600 flex items-center justify-end gap-1">
                      <span>Terhubung</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Creative Trust & Guarantee Micro-Cards (SPK Otomatis, Proteksi Hak Cipta, Smart Matching Mesin) */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200/90 shadow-2xs hover:border-[#4CC9FE]/50 transition-all group">
                <div className="w-7 h-7 rounded-lg bg-[#4CC9FE]/15 text-[#0284c7] flex items-center justify-center shrink-0 group-hover:bg-[#4CC9FE] group-hover:text-white transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-[#27213D] leading-tight truncate">
                    SPK Otomatis
                  </div>
                  <div className="text-[9px] text-[#716B7E] font-medium leading-tight truncate">
                    Legal Terstandar
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200/90 shadow-2xs hover:border-emerald-300 transition-all group">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-[#27213D] leading-tight truncate">
                    Proteksi Hak Cipta
                  </div>
                  <div className="text-[9px] text-[#716B7E] font-medium leading-tight truncate">
                    Lisensi Komersial
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200/90 shadow-2xs hover:border-amber-300 transition-all group">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-[#27213D] leading-tight truncate">
                    Smart Matching Mesin
                  </div>
                  <div className="text-[9px] text-[#716B7E] font-medium leading-tight truncate">
                    100% Deterministik
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Pristine Compact Register Form */}
          <div className="lg:col-span-6 xl:col-span-6 w-full max-w-xl mx-auto">
            <RegisterClientForm initialError={error} redirectTo={redirectTo} />
          </div>

        </div>
      </main>

      {/* MINIMAL FOOTER */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto pt-4 pb-2 text-center border-t border-stone-200/50 shrink-0">
        <p className="text-[10px] text-[#716B7E]">
          &copy; {new Date().getFullYear()} RAMU — Platform Kolaborasi Berbasis Komplementaritas Resource Industri Kreatif Mode &amp; Studio. Seluruh hak cipta dilindungi.
        </p>
      </footer>

    </div>
  );
}
