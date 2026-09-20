"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runOpportunityEngine } from "./actions";
import { Zap } from "lucide-react";

export function RunEngineButton({ actorName }: { actorName?: string }) {
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleRunEngine() {
    setIsRunning(true);
    setStatusMessage("Menjalankan 12-tahap pipeline pencocokan deterministik...");

    try {
      const res = await runOpportunityEngine();
      if (res.success) {
        setStatusMessage(`Berhasil menemukan ${res.count} peluang kolaborasi terstruktur!`);
        router.refresh();
      } else {
        setStatusMessage(res.error || "Gagal menghasilkan peluang.");
      }
    } catch {
      setStatusMessage("Terjadi kesalahan teknis saat menjalankan engine.");
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
        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isRunning ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-slate-950"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Menganalisis Komplementaritas...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Jalankan Opportunity Engine</span>
          </>
        )}
      </button>

      {statusMessage && (
        <span className="text-xs text-amber-400/90 font-medium px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-fade-in">
          {statusMessage}
        </span>
      )}
    </div>
  );
}
