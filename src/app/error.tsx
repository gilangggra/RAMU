"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, MessageSquare } from "lucide-react";
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
    <div className="min-h-screen bg-[#FDFDFC] text-stone-900 flex items-center justify-center p-6 selection:bg-stone-200">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200 uppercase tracking-wider">
            Sistem Pemulihan Aman
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Terjadi Kendala Memuat Data
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xs mx-auto">
            Halaman mengalami interupsi saat memproses data. Anda dapat mencoba memuat ulang atau kembali ke dashboard utama.
          </p>
        </div>

        {error?.digest && (
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[10px] font-mono text-stone-400 truncate">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-200/80 transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-400">
          <RamuLogo size={14} />
          <span>RAMU Collaborative Economy Platform</span>
        </div>
      </div>
    </div>
  );
}
