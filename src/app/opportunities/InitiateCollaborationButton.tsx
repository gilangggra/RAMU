"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initiateCollaboration } from "@/app/collaborations/actions";
import { Sparkles } from "lucide-react";

export function InitiateCollaborationButton({ opportunityId }: { opportunityId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleInitiate() {
    setLoading(true);
    try {
      const res = await initiateCollaboration(opportunityId);
      if (res.success && res.collaborationId) {
        router.push(`/collaborations/${res.collaborationId}`);
      } else {
        alert(res.error || "Gagal menginisiasi kolaborasi.");
      }
    } catch {
      alert("Terjadi kesalahan teknis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleInitiate}
      disabled={loading}
      className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm shadow-[0_6px_20px_rgba(251,191,36,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-[1.01]"
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-stone-950"
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
          <span>Mempersiapkan Ruang Kolaborasi...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform text-stone-950" />
          <span>Inisiasi Rencana Kolaborasi (Buka Workspace)</span>
        </>
      )}
    </button>
  );
}
