import Link from "next/link";
import { login } from "@/app/(auth)/actions";
import { Navbar } from "@/components/landing/Navbar";
import { AlertCircle, CheckCircle2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string; redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error;
  const message = params.message;
  const redirectTo = params.redirectTo || "/dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE9DE] via-[#F3EDFF] via-60% to-[#E2F4FD] text-[#27213D] relative overflow-hidden selection:bg-[#FFB800]/40 selection:text-[#27213D] flex flex-col justify-between">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#FFE4D6] rounded-full blur-[130px] opacity-70" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-[#EDE8FF] rounded-full blur-[140px] opacity-80" />
        <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-[#E0F7F0] rounded-full blur-[130px] opacity-70" />

        <div className="absolute top-24 left-16 z-10 animate-float">
          <div
            className="w-12 h-12 rounded-full shadow-[0_12px_24px_rgba(249,150,120,0.35)]"
            style={{
              background: "radial-gradient(circle at 35% 30%, #FFF2EB 0%, #FFAF94 60%, #E66A48 100%)",
            }}
          />
        </div>

        <div className="absolute top-36 right-20 z-10 animate-float-delayed">
          <div
            className="w-14 h-14 rounded-full shadow-[0_14px_28px_rgba(167,139,250,0.35)]"
            style={{
              background: "radial-gradient(circle at 32% 28%, #FFFFFF 0%, #C4B5FD 55%, #7C3AED 100%)",
            }}
          />
        </div>

        <div className="absolute bottom-28 right-24 z-10 animate-float">
          <div
            className="w-10 h-10 rounded-full shadow-[0_10px_20px_rgba(255,184,0,0.35)]"
            style={{
              background: "radial-gradient(circle at 35% 30%, #FFFDE6 0%, #FFD45A 60%, #E59F00 100%)",
            }}
          />
        </div>

        <div className="absolute bottom-32 left-20 z-10 animate-float-delayed">
          <div
            className="w-9 h-9 rounded-full shadow-[0_8px_18px_rgba(45,212,191,0.3)]"
            style={{
              background: "radial-gradient(circle at 35% 30%, #F0FDF9 0%, #99F6E4 60%, #0D9488 100%)",
            }}
          />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 max-w-lg mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24 w-full my-auto">
        <div className="rounded-[36px] bg-white/95 backdrop-blur-md border border-white/80 p-8 sm:p-10 shadow-[0_24px_64px_rgba(39,33,61,0.08)] relative space-y-6">
          <div className="absolute top-4 left-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">┌</div>
          <div className="absolute top-4 right-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">┐</div>
          <div className="absolute bottom-4 left-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">└</div>
          <div className="absolute bottom-4 right-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">┘</div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold uppercase tracking-wider text-[#27213D] mb-1 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E59F00]" />
              <span>Workspace Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#27213D] tracking-tight">
              Masuk ke Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#716B7E] leading-relaxed">
              Akses mesin analitik sinergi dan kolaborasi proyek kreatif Anda
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-4 rounded-2xl bg-[#EDFAF5] border border-[#BFE9DD] text-xs text-[#134e40] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#134e40] shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{message}</p>
            </div>
          )}

          <form action={login} className="space-y-5">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
              >
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="nama@studioanda.id"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                >
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-full bg-[#FFB800] hover:bg-[#FFA800] active:scale-[0.98] text-[#1E1B2E] font-extrabold text-sm tracking-wide shadow-[0_8px_24px_rgba(255,184,0,0.35)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Masuk ke Workspace</span>
              <ArrowRight className="w-4 h-4 text-[#1E1B2E]" />
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#716B7E]">
              Belum memiliki akun terdaftar?
            </span>
            <Link
              href="/register"
              className="font-bold text-[#27213D] underline decoration-[#FFB800] decoration-2 hover:text-black transition-colors"
            >
              Daftar akun baru →
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-stone-200/60 py-6 text-center text-xs text-[#716B7E] bg-white/40 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} RAMU — Creative Opportunity Engine. Hak cipta dilindungi.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="hover:text-[#27213D]">Beranda</Link>
            <span>•</span>
            <Link href="/#how-it-works" className="hover:text-[#27213D]">Cara Kerja</Link>
            <span>•</span>
            <Link href="/register" className="hover:text-[#27213D]">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
