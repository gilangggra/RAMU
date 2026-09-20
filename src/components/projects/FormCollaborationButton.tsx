"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formCollaborationAction } from "@/app/projects/actions";
import { Handshake, Rocket, ArrowRight } from "lucide-react";

interface FormCollaborationButtonProps {
  briefId: string;
  isFilled: boolean;
  collaborationId?: string | null;
}

export function FormCollaborationButton({
  briefId,
  isFilled,
  collaborationId,
}: FormCollaborationButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (collaborationId) {
    return (
      <button
        onClick={() => router.push(`/collaborations/${collaborationId}`)}
        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer group"
      >
        <Handshake className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>Buka Ruang Kolaborasi Aktif</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  }

  async function handleForm() {
    if (!confirm("Bentuk ruang kolaborasi sekarang dengan kolaborator yang telah diterima?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await formCollaborationAction(briefId);
      if (res.success && res.collaborationId) {
        router.push(`/collaborations/${res.collaborationId}`);
      } else {
        alert(res.error || "Gagal membentuk kolaborasi.");
      }
    } catch {
      alert("Terjadi kesalahan teknis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleForm}
      disabled={loading || !isFilled}
      className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl ${
        isFilled
          ? "bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white shadow-violet-500/25 cursor-pointer group"
          : "bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-75"
      }`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-white"
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
          <span>Membentuk Ruang Kolaborasi...</span>
        </>
      ) : (
        <>
          <Rocket className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>
            {isFilled
              ? "Bentuk Ruang Kolaborasi Sekarang"
              : "Menunggu Semua Peran Terisi"}
          </span>
        </>
      )}
    </button>
  );
}
