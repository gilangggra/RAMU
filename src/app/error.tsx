"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { RamuLogo } from "@/components/brand/RamuLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("RAMU Uncaught Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen app-background text-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#4CC9FE]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-rose-400/5 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 w-full max-w-md glass-card rounded-[22px] border border-white/80 p-8 sm:p-9 shadow-xl space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-2xs">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30 uppercase tracking-wider">
            Sistem Pemulihan Aman
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Terjadi Kendala Memuat Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto font-normal">
            Halaman mengalami interupsi saat memproses data. Anda dapat mencoba memuat ulang atau kembali ke dashboard utama.
          </p>
        </div>

        {error?.digest && (
          <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-[10px] font-mono text-slate-500 truncate">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary-pill w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#4CC9FE]/20 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200/80 transition-all shadow-2xs cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <RamuLogo size={14} />
          <span>RAMU Collaborative Economy Platform</span>
        </div>
      </div>
    </div>
  );
}
