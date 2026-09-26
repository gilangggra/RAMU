"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formCollaborationAction } from "@/app/projects/actions";
import { Handshake, Rocket, ArrowRight } from "lucide-react";

interface FormCollaborationButtonProps {
  briefId: string;
  isFilled: boolean;
  acceptedCount?: number;
  collaborationId?: string | null;
}

export function FormCollaborationButton({
  briefId,
  isFilled,
  acceptedCount = 0,
  collaborationId,
}: FormCollaborationButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (collaborationId) {
    return (
      <button
        onClick={() => router.push(`/collaborations/${collaborationId}`)}
        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer group"
      >
        <Handshake className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>Buka Ruang Kolaborasi Aktif</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  }

  const canForm = isFilled || acceptedCount > 0;

  async function handleForm() {
    const confirmMsg = isFilled
      ? "Bentuk ruang kolaborasi sekarang dengan seluruh tim yang telah lengkap?"
      : `Bentuk ruang kolaborasi sekarang dengan ${acceptedCount} kolaborator yang telah diterima?`;
    if (!confirm(confirmMsg)) {
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
      disabled={loading || !canForm}
      className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
        canForm
          ? "bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white shadow-[#E66A48]/20 cursor-pointer group"
          : "bg-stone-200 text-stone-500 border border-stone-300/50 cursor-not-allowed opacity-75"
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
              : acceptedCount > 0
              ? `Mulai Workspace (${acceptedCount} Kolaborator)`
              : "Menunggu Kolaborator Diterima"}
          </span>
        </>
      )}
    </button>
  );
}
