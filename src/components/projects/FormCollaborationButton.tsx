"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formCollaborationAction } from "@/app/projects/actions";
import { Handshake, Rocket, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/Toast";

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
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer group"
      >
        <Handshake className="w-4 h-4 group-hover:scale-105 transition-transform" />
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
        toast.success("Ruang kolaborasi berhasil dibentuk!");
        router.push(`/collaborations/${res.collaborationId}`);
      } else {
        toast.error(res.error || "Gagal membentuk kolaborasi.");
      }
    } catch {
      toast.error("Terjadi kesalahan teknis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleForm}
      disabled={loading || !canForm}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs transition-all shadow-md ${
        canForm
          ? "bg-[#4CC9FE] hover:bg-[#38b6eb] text-white shadow-[#4CC9FE]/20 cursor-pointer group"
          : "bg-slate-200 text-slate-400 border border-slate-300/50 cursor-not-allowed opacity-75"
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
          <Rocket className="w-4 h-4 group-hover:scale-105 transition-transform" />
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
