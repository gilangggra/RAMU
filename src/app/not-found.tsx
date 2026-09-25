import Link from "next/link";
import { Home, Search, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0E0C15] text-stone-100 flex items-center justify-center px-6 relative overflow-hidden selection:bg-amber-400/30 selection:text-amber-200">
      {/* Background ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-stone-700/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto space-y-8">
        {/* RAMU Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center font-black text-stone-950 text-base shadow-[0_4px_20px_rgba(251,191,36,0.3)]">
            R
          </div>
          <span className="font-extrabold text-lg tracking-tight text-stone-100">RAMU</span>
        </Link>

        {/* 404 Display */}
        <div className="space-y-2">
          <div className="text-[120px] font-black text-stone-800/40 leading-none select-none tracking-tighter">
            404
          </div>
          <div className="-mt-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-xs font-bold text-amber-300 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Halaman Tidak Ditemukan
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight">
              Eksplorasi di Luar Jangkauan
            </h1>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm mx-auto">
              Halaman yang Anda cari tidak ada, sudah dipindahkan, atau belum tersedia. Kembali ke ekosistem kreatif RAMU.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm transition-all shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-300 font-bold text-sm transition-all shadow-sm hover:scale-105"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>Jelajahi Showcase</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-[11px] text-stone-600">
          © {new Date().getFullYear()} RAMU — Creative Visual Opportunity Engine
        </p>
      </div>
    </div>
  );
}
