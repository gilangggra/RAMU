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
    setStatusMessage("Menyelaraskan profil dan kapabilitas Anda dengan kebutuhan ekosistem...");

    try {
      const res = await runOpportunityEngine();
      if (res.success) {
        setStatusMessage(`Rekomendasi berhasil diperbarui (${res.count} peluang kolaborasi ditemukan)!`);
        router.refresh();
      } else {
        setStatusMessage(res.error || "Gagal memperbarui rekomendasi.");
      }
    } catch {
      setStatusMessage("Terjadi kendala saat menyegarkan rekomendasi.");
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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
      >
        {isRunning ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            <span>Memperbarui Rekomendasi...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Segarkan Rekomendasi Mitra</span>
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
