"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runOpportunityEngine } from "./actions";
import { RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";

export function RunEngineButton({ actorName }: { actorName?: string }) {
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleRunEngine() {
    setIsRunning(true);
    setStatusMessage("Menyelaraskan profil dan portofolio Anda dengan ekosistem...");

    try {
      const res = await runOpportunityEngine();
      if (res.success) {
        setStatusMessage(`Rekomendasi berhasil diperbarui (${res.count} peluang sinergi)!`);
        router.refresh();
      } else {
        setStatusMessage(res.error || "Gagal memperbarui rekomendasi.");
      }
    } catch {
      setStatusMessage("Terjadi kendala teknis saat menyegarkan peluang.");
    } finally {
      setIsRunning(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <button
        onClick={handleRunEngine}
        disabled={isRunning}
        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-[#E66A48] hover:from-amber-500 hover:to-[#d85c3b] text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isRunning ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
            <span>Mencari Sinergi Baru...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-100 group-hover:scale-110 transition-transform" />
            <span>Segarkan Rekomendasi AI</span>
          </>
        )}
      </button>

      {statusMessage && (
        <span className="text-xs text-emerald-800 font-bold px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 animate-fade-in shadow-2xs flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{statusMessage}</span>
        </span>
      )}
    </div>
  );
}
