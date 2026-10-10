import { LoginClientForm } from "@/components/auth/LoginClientForm";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, CheckCircle2, Zap, ArrowLeft, ShieldCheck, ArrowRight } from "lucide-react";
import { RamuLogo } from "@/components/brand/RamuLogo";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string; redirectTo?: string; redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error;
  const message = params.message;
  const redirectTo = params.redirectTo || params.redirect || "/dashboard";

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#FFFDFC] text-[#27213D] relative flex flex-col justify-between selection:bg-[#4CC9FE]/30 selection:text-[#27213D]">

      {/* Atmospheric Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#4CC9FE]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-[#FFD45A]/8 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] bg-[#D9D2FF]/12 rounded-full blur-[150px]" />
        
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(#27213D 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* TOP NAVIGATION BAR: Compact, Crisp & Accessible */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 shrink-0">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <RamuLogo size={30} theme="dark" className="shrink-0 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-wider text-[#27213D] leading-none">
                RAMU
              </span>
              <span className="text-[9px] font-bold tracking-wider uppercase text-[#716B7E] mt-0.5">
                Kolektif Kreatif Mode &amp; Studio
              </span>
            </div>
          </Link>

          {/* Top Right Quick Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-[#0284c7] px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs backdrop-blur-md transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-400 group-hover:-translate-x-0.5 group-hover:text-[#4CC9FE] transition-transform" />
              <span>Beranda</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0284c7] hover:text-[#0369a1] px-3.5 py-1.5 rounded-full bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200/60 shadow-xs transition-all"
            >
              <span>Daftar Akun</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT CONTAINER: Balanced Creative Split Layout (Zero Scroll on Desktop) */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2 flex items-center min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center my-auto">
          
          {/* LEFT COLUMN: Creative Editorial Showcase (Visible on Large Screens) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between space-y-3.5 xl:space-y-4 pr-2">
            
            {/* Editorial Hook & Value Prop */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-stone-200/80 text-[#27213D] shadow-xs backdrop-blur-md w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4CC9FE] animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#27213D]">
                  Komplementaritas Resource Kreatif
                </span>
              </div>

              <h1 className="text-2xl xl:text-3xl font-black text-[#27213D] tracking-tight leading-tight">
                Kombinasikan apa yang Anda miliki. <br />
                <span className="text-[#4CC9FE]">Ciptakan karya bernilai ekonomi.</span>
              </h1>

              <p className="text-xs text-[#716B7E] font-normal leading-relaxed max-w-lg">
                Hubungkan brand fashion, fotografer, studio idle, model, dan stylist secara instan. Ubah kapasitas kosong jadi karya nyata tanpa biaya sewa tunai di muka.
              </p>
            </div>

            {/* Creative Visual Canvas with Multi-layered Overlay */}
            <div className="relative w-full max-w-md xl:max-w-lg mx-auto group">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200/90 shadow-xl bg-gradient-to-tr from-[#FAF8F5] via-white to-sky-50/60 p-2.5 xl:p-3 flex items-center justify-center">
                
                {/* Visual Artwork */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50 w-full flex items-center justify-center">
                  <Image
                    src="/images/hero-creative-art.png"
                    alt="RAMU Creative Collaboration Platform"
                    width={640}
                    height={400}
                    className="w-full max-h-[220px] xl:max-h-[260px] object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                    priority
                  />

                  {/* Gradient shade for bottom readability */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent pointer-events-none rounded-b-xl" />
                </div>

                {/* Floating Synergy Match Badge (Top-Left) */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-[#4CC9FE]/40 rounded-xl px-2.5 py-1.5 shadow-lg shadow-[#4CC9FE]/10 flex items-center gap-2 pointer-events-none">
                  <div className="w-6 h-6 rounded-lg bg-[#4CC9FE]/15 text-[#4CC9FE] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#4CC9FE]" />
                  </div>
                  <div>
                    <div className="text-[8px] font-bold uppercase tracking-wider text-stone-400 leading-none">
                      Deterministik
                    </div>
                    <div className="text-[11px] font-black text-[#27213D] flex items-center gap-1 mt-0.5">
                      <span>96% Match</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Floating Asset Idle Badge (Top-Right) */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-1.5 pointer-events-none">
                  <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Zap className="w-3 h-3 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-[8px] font-bold uppercase tracking-wider text-stone-400 leading-none">
                      Aset Idle
                    </div>
                    <div className="text-[10px] font-bold text-[#27213D] mt-0.5">
                      Studio &amp; Gear Aktif
                    </div>
                  </div>
                </div>

                {/* Inset Creative Live Project Simulation Widget (Bottom) */}
                <div className="absolute bottom-4 inset-x-4 bg-white/95 backdrop-blur-xl border border-white/80 rounded-xl p-2 shadow-lg flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4CC9FE] to-sky-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      AW
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-[#27213D] truncate">
                          Autumn Lookbook 2026
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          SPK Aktif
                        </span>
                      </div>
                      <p className="text-[9px] text-[#716B7E] font-medium truncate">
                        Brand Nala + Kamera FX6 + Studio Imaji + Model
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2 border-l border-stone-100">
                    <span className="text-[8px] uppercase font-bold text-stone-400 block">Biaya Tunai</span>
                    <span className="text-[11px] font-black text-[#4CC9FE]">Rp 0 (Barter)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Creative Trust & Guarantee Checklist (Inline Row) */}
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4CC9FE]" />
                <span className="text-[11px]">SPK Otomatis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px]">Proteksi Hak Cipta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px]">110+ Peluang Aktif</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Pristine Compact Glassmorphism Login Form */}
          <div className="lg:col-span-6 xl:col-span-5 w-full max-w-md mx-auto">
            <LoginClientForm error={error} message={message} redirectTo={redirectTo} />
          </div>

        </div>
      </main>

      {/* MINIMAL EDITORIAL FOOTER: Compact single line */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-2 text-center border-t border-stone-200/50 shrink-0">
        <p className="text-[10px] text-[#716B7E]">
          &copy; {new Date().getFullYear()} RAMU — Platform Kolaborasi Berbasis Komplementaritas Resource Industri Kreatif Mode &amp; Studio. Seluruh hak cipta dilindungi.
        </p>
      </footer>

    </div>
  );
}


