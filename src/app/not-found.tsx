import Link from "next/link";
import { Home, Search, ArrowRight } from "lucide-react";
import { RamuLogo } from "@/components/brand/RamuLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen app-background text-slate-800 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#4CC9FE]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-slate-300/20 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto space-y-8 glass-card p-8 sm:p-10 rounded-[22px] border border-white/80 shadow-xl">
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <RamuLogo size="lg" variant="horizontal" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="text-7xl sm:text-8xl font-black text-slate-200 tracking-tighter select-none">
            404
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 text-xs font-bold text-[#0284c7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
              <span>Halaman Tidak Ditemukan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Eksplorasi di Luar Jangkauan
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto font-normal">
              Halaman yang Anda cari tidak tersedia atau telah dipindahkan. Silakan kembali ke pusat ekosistem RAMU.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="btn-primary-pill w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#4CC9FE]/20"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <Link
            href="/projects"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 text-xs font-semibold transition-all shadow-2xs"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Papan Proyek</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        <p className="text-[11px] text-slate-500 font-normal">
          &copy; {new Date().getFullYear()} RAMU — Platform Kolaborasi Berbasis Komplementaritas Resource
        </p>
      </div>
    </div>
  );
}
