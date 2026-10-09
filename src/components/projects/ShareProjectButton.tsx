"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

export function ShareProjectButton({
  projectId,
  projectTitle,
  className = "",
}: {
  projectId: string;
  projectTitle: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = origin ? `${origin}/projects/${projectId}` : (typeof window !== "undefined" ? window.location.href : "");
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${projectTitle} | Brief Proyek RAMU`,
          text: `Eksplorasi brief kolaborasi resmi "${projectTitle}" di platform RAMU:`,
          url,
        });
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          // fallback to clipboard
        } else {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Gagal menyalin tautan:", e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
        copied
          ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
          : "bg-white/80 hover:bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 shadow-2xs backdrop-blur-sm"
      } ${className}`}
      title="Bagikan tautan brief proyek ini ke media sosial atau grup talenta"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tautan Proyek Tersalin!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Bagikan Brief</span>
        </>
      )}
    </button>
  );
}
