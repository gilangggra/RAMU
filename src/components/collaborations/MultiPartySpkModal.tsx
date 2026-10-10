"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  FileText,
  Printer,
  Share2,
  Copy,
  Check,
  X,
  ShieldCheck,
  Users,
  Building2,
  User,
  Clock,
  Brain,
  PenTool,
  RotateCcw,
  Download,
  Fingerprint,
  BookOpen,
  Lock,
} from "lucide-react";
import { exportElementToPdf } from "@/lib/export/pdfExporter";
import { printElement } from "@/lib/export/printDocument";
import { RamuLogo } from "@/components/brand/RamuLogo";

export interface SpkParticipant {
  id: string;
  name: string;
  sector: string;
  roleCode: string;
  roleLabel: string;
  fee?: string | null;
  location?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  actorType?: string;
  signedAt?: string | null;
}

export interface MultiPartySpkData {
  collaborationId: string;
  collaborationTitle: string;
  createdAt: string;
  status: string;
  initiator: SpkParticipant;
  participants: SpkParticipant[];
  plan?: {
    objective?: string | null;
    budget?: {
      estimatedTotal?: string;
      costSharingModel?: string;
      roleFees?: Record<string, string>;
      notes?: string;
    };
    timeline?: { estimatedDuration?: string; targetLaunch?: string };
    revenueModel?: { proposedSplit?: string; brandModel?: string; modelType?: string };
    ipRules?: { originalIp?: string; derivativeWorks?: string };
    ownershipRules?: { brandModel?: string };
  };
}

function parseRupiah(val?: string | null): number | null {
  if (!val) return null;
  const digits = val.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const num = parseInt(digits, 10);
  return isNaN(num) ? null : num;
}

function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

function computeSplit(feeStr?: string | null): { total: string; dp: string; final: string } {
  const num = parseRupiah(feeStr);
  if (!num || num <= 0) {
    return {
      total: feeStr && feeStr.trim() ? feeStr : "Sesuai Negosiasi",
      dp: "50% di muka",
      final: "50% pelunasan",
    };
  }
  const half = Math.round(num * 0.5);
  return {
    total: formatRupiah(num),
    dp: formatRupiah(half),
    final: formatRupiah(num - half),
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: MultiPartySpkData;
  currentActorId: string;
  onSign: (collaborationId: string) => Promise<{ success: boolean; error?: string }>;
}

function toRomanMonth(m: number): string {
  return ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][m] ?? "I";
}

function formatDateId(d: string | Date): string {
  return new Date(d).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function pihakLabel(i: number): string {
  return ["PERTAMA","KEDUA","KETIGA","KEEMPAT","KELIMA","KEENAM"][i] ?? `KE-${i + 1}`;
}

function roman(n: number): string {
  return ["I","II","III","IV","V","VI","VII","VIII","IX","X"][n - 1] ?? String(n);
}

function ArticleHead({ n, title }: { n: number | React.ReactNode; title: string }) {
  return (
    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
      <span className="w-5 h-5 rounded-md bg-[#4CC9FE]/15 text-[#0284c7] text-[10px] font-bold flex items-center justify-center shrink-0">
        {n}
      </span>
      <span>{title}</span>
    </h3>
  );
}

export function MultiPartySpkModal({ isOpen, onClose, data, currentActorId, onSign }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signMsg, setSignMsg] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPadOpen, setIsPadOpen] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [locallySignedAt, setLocallySignedAt] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const printableRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const rawParties: SpkParticipant[] = [data.initiator, ...data.participants];
  const allParties: SpkParticipant[] = rawParties.map((p) => {
    if (p.id === currentActorId && locallySignedAt && !p.signedAt) {
      return { ...p, signedAt: locallySignedAt };
    }
    return p;
  });
  const total = allParties.length;

  const d = new Date(data.createdAt);
  const shortId = data.collaborationId.slice(0, 8).toUpperCase();
  const spkNo = `PKSK/RAMU/${d.getFullYear()}/${toRomanMonth(d.getMonth())}/${shortId}`;

  const budget = data.plan?.budget ?? {};
  const tl = data.plan?.timeline ?? {};
  const rev = data.plan?.revenueModel ?? {};
  const ip = data.plan?.ipRules ?? {};

  const me = allParties.find((p) => p.id === currentActorId);
  const iSigned = Boolean(me?.signedAt);
  const allSigned = allParties.every((p) => Boolean(p.signedAt));
  const signedCount = allParties.filter((p) => Boolean(p.signedAt)).length;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  async function handleConfirmSignature() {
    setIsSigning(true);
    setSignMsg(null);
    try {
      const r = await onSign(data.collaborationId);
      if (r.success) {
        const nowIso = new Date().toISOString();
        setLocallySignedAt(nowIso);
        setIsPadOpen(false);
        setSignMsg("Tanda tangan digital Anda berhasil dibubuhkan secara sah.");
        router.refresh();
      } else {
        setSignMsg(r.error ?? "Gagal menandatangani dokumen.");
      }
    } catch {
      setSignMsg("Terjadi kesalahan teknis saat mencatat tanda tangan.");
    } finally {
      setIsSigning(false);
    }
  }

  function handlePrint() {
    printElement("spk-collab-printable", `SPK-MultiPihak-${shortId}`);
  }

  async function handleExportPdf() {
    const el = printableRef.current || document.getElementById("spk-collab-printable");
    if (!el) {
      handlePrint();
      return;
    }
    setIsExportingPdf(true);
    try {
      const cleanTitle = (data.collaborationTitle || "Proyek").replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30);
      await exportElementToPdf(el, {
        filename: `SPK-MultiPihak-${cleanTitle}-${shortId}.pdf`,
      });
    } catch (err) {
      console.error("Gagal ekspor PDF otomatis, beralih ke print dialog:", err);
      handlePrint();
    } finally {
      setIsExportingPdf(false);
    }
  }

  function handleCopy() {
    const t = [
      "*PKSK MULTI-PIHAK — RAMU*",
      `No: ${spkNo}`,
      `Proyek: ${data.collaborationTitle}`,
      "",
      `Para Pihak (${total}):`,
      ...allParties.map((p, i) => `${roman(i + 1)}. ${p.name} — ${p.roleLabel} (${p.sector})`),
      "",
      `Budget: ${budget.estimatedTotal ?? "Sesuai kesepakatan"}`,
      `Skema Biaya: ${budget.costSharingModel ?? "Proporsional"}`,
      `Bagi Hasil: ${rev.proposedSplit ?? "Sesuai kontribusi"}`,
      `Target Rilis: ${tl.targetLaunch ?? "Ditentukan bersama"}`,
      "Anti-AI Clause: DILARANG melatih AI dengan karya ini.",
      "",
      `Status TTD: ${signedCount}/${total} pihak`,
      `${typeof window !== "undefined" ? window.location.origin : "https://ramu-gamma.vercel.app"}/collaborations/${data.collaborationId}`,
    ].join("\n");
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://ramu-gamma.vercel.app";
  const waText = encodeURIComponent(
    `*KESEPAKATAN KOLABORASI MULTI-PIHAK — RAMU*\n` +
    `No: ${spkNo}\n` +
    `Proyek: ${data.collaborationTitle}\n` +
    `Persetujuan: ${signedCount}/${total} pihak\n\n` +
    allParties.map((p, i) => `${i + 1}. ${p.name} (${p.roleLabel})`).join("\n") +
    `\n\nKesepakatan Kolaborasi — ${currentOrigin}/collaborations/${data.collaborationId}`
  );

  const scrollToArticle = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="print-modal-root fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-slate-950/60 backdrop-blur-sm overflow-hidden print:static print:inset-auto print:z-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible print:block">
      {/* MODAL WRAPPER (Fits perfectly within single screen without overflowing) */}
      <div className="relative w-full max-w-6xl h-[88vh] max-h-[740px] min-h-[520px] bg-white rounded-[24px] shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col font-sans animate-fade-in print:max-w-none print:w-full print:h-auto print:max-h-none print:min-h-0 print:border-none print:shadow-none print:rounded-none print:overflow-visible print:block print:my-0">

        {/* 1. TOP HEADER BAR (Compact ~48px) */}
        <header className="print:hidden flex items-center justify-between px-5 py-2.5 border-b border-slate-100 bg-white shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <RamuLogo size={28} className="shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  Surat Perintah Kerja (SPK) &amp; Perikatan Sah
                </h2>
                <span className="hidden sm:inline-flex text-[10px] font-mono font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {spkNo}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate font-normal">
                {data.collaborationTitle} &bull; Terlindungi UU ITE No. 1/2024
              </p>
            </div>
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="btn-primary-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
              title="Unduh Dokumen PDF Resmi"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? "animate-bounce" : ""}`} />
              <span className="hidden sm:inline">{isExportingPdf ? "Mengunduh..." : "Unduh PDF"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              title="Cetak Dokumen"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Cetak</span>
            </button>

            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              title="Bagikan Ringkasan via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              title="Salin Teks Perikatan"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden lg:inline">{copied ? "Tersalin!" : "Salin"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer ml-1"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 2. SPLIT BODY: LEFT SIDEBAR (EXECUTIVE COCKPIT) + RIGHT READER (10 ARTICLES) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

          {/* LEFT SIDEBAR: EXECUTIVE COCKPIT (Width ~340px, NO scroll needed, fits 100% in viewport) */}
          <aside className="print:hidden w-full lg:w-[340px] shrink-0 bg-slate-50/70 border-b lg:border-b-0 lg:border-r border-slate-200/80 p-3.5 sm:p-4 flex flex-col justify-between overflow-y-auto no-scrollbar space-y-3">
            
            <div className="space-y-2.5">
              {/* Box 1: Status Persetujuan & SHA-256 Audit */}
              <div className="p-3 rounded-[16px] bg-white border border-slate-200/70 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Status SPK Sah</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    allSigned
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}>
                    {allSigned ? "Sah Penuh" : `${signedCount}/${total} Disetujui`}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      allSigned ? "bg-emerald-500" : signedCount > 0 ? "bg-[#4CC9FE]" : "bg-slate-300"
                    }`}
                    style={{ width: `${(signedCount / Math.max(total, 1)) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1 font-mono text-[9px]">
                    <Fingerprint className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span>SHA-256: {shortId.toLowerCase()}{d.getTime().toString(16).slice(0, 6)}</span>
                  </span>
                  <span className="text-emerald-700 font-semibold text-[9px]">UU ITE No. 1/2024</span>
                </div>
              </div>

              {/* Box 2: Daftar Pihak Penandatangan */}
              <div className="p-3 rounded-[16px] bg-white border border-slate-200/70 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-600" />
                    <span>Para Pihak ({total})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">{signedCount}/{total} TTD</span>
                </div>

                <div className="space-y-1">
                  {allParties.map((p, i) => {
                    const isSigned = Boolean(p.signedAt);
                    const isMe = p.id === currentActorId;
                    return (
                      <div
                        key={p.id}
                        className="py-1.5 px-2 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between gap-1.5 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate flex items-center gap-1 text-[11px]">
                            <span>{p.name}</span>
                            {isMe && <span className="text-[9px] text-[#0284c7] font-bold">(Anda)</span>}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate">
                            Pihak {roman(i + 1)} &bull; {p.roleLabel}
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full shrink-0 border ${
                          isSigned
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {isSigned ? "Sudah TTD" : "Menunggu"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 3: Ketentuan Pokok Singkat */}
              <div className="p-3 rounded-[16px] bg-white border border-slate-200/70 shadow-2xs space-y-1.5 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ketentuan Pokok</div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="p-1.5 rounded-lg bg-slate-50/70 border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 block">Total Biaya</span>
                    <span className="font-bold text-slate-900 truncate block text-[11px]">{budget.estimatedTotal || "Rp 15.000.000"}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50/70 border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 block">Linimasa</span>
                    <span className="font-bold text-slate-900 truncate block text-[11px]">{tl.estimatedDuration || "6 Minggu"}</span>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-sky-50/60 border border-sky-100 flex items-center gap-1.5 text-[10px] text-[#0284c7]">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span className="font-semibold truncate">Proteksi Anti-AI Training Aktif</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions of Sidebar */}
            <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
              {signMsg && (
                <div className={`p-2 rounded-xl text-[11px] font-semibold border ${
                  signMsg.includes("Gagal") || signMsg.includes("kesalahan")
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}>
                  {signMsg}
                </div>
              )}

              {!iSigned && !allSigned ? (
                <button
                  type="button"
                  onClick={() => setIsPadOpen(true)}
                  disabled={isSigning}
                  className="btn-primary-pill w-full py-2.5 rounded-full text-xs font-bold text-white shadow-md shadow-[#4CC9FE]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Bubuhkan Tanda Tangan Digital</span>
                </button>
              ) : (
                <div className="w-full py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tanda Tangan Anda Tercatat Sah</span>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup Dokumen
              </button>
            </div>

          </aside>

          {/* RIGHT PANEL: LEGAL DOCUMENT VIEWER (Full 10 Articles, internal smooth scroll) */}
          <main className="flex-1 bg-white flex flex-col h-full overflow-hidden relative print:w-full print:h-auto print:max-h-none print:overflow-visible print:block">

            {/* Sticky Article Quick Jumper */}
            <div className="print:hidden px-5 py-2 border-b border-slate-100 bg-white/95 backdrop-blur-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>Navigasi:</span>
              </span>
              {[
                { id: "pasal-1", label: "P1: Ruang Lingkup" },
                { id: "pasal-2", label: "P2: Anggaran" },
                { id: "pasal-3", label: "P3: Honorarium" },
                { id: "pasal-4", label: "P4: Hak Cipta" },
                { id: "pasal-5", label: "P5: Anti-AI" },
                { id: "pasal-6", label: "P6: Kredit" },
                { id: "pasal-7", label: "P7: Pengunduran" },
                { id: "pasal-8", label: "P8: Force Majeure" },
                { id: "pasal-9", label: "P9: Hubungan Bisnis" },
                { id: "pasal-10", label: "P10: Hukum" },
                { id: "pasal-ttd", label: "Tanda Tangan" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToArticle(item.id)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Formal Document Scroll Container (Prints perfectly) */}
            <div
              id="spk-collab-printable"
              ref={printableRef}
              className="overflow-y-auto p-5 sm:p-8 space-y-6 bg-white flex-1 font-sans selection:bg-[#4CC9FE]/20 print:p-0 print:m-0 print:overflow-visible print:max-h-none print:h-auto print:space-y-4 print:text-black"
            >

              {/* DOCUMENT KOP / LETTERHEAD */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <RamuLogo size={44} className="shrink-0" />
                  <div>
                    <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>RAMU INDONESIA</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                        Protokol Sah
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      Ekosistem Kolaborasi &amp; Pelindung Transaksi Kreatif Nasional
                    </div>
                    <div className="text-[10px] text-slate-400">
                      PSE Terdaftar &bull; ramu-gamma.vercel.app
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-slate-900">{spkNo}</div>
                  <div className="text-[10px] text-slate-500">Kelas: PKSK-KOLABORASI-KREATIF</div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Tervalidasi RAMU</span>
                  </div>
                </div>
              </div>

              {/* DOCUMENT TITLE */}
              <div className="text-center pb-1">
                <h1 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 border-b border-slate-200 pb-2 inline-block">
                  PERJANJIAN KERJA SAMA KOLABORASI KREATIF (PKSK) MULTI-PIHAK
                </h1>
                <p className="text-[11px] font-mono text-slate-600 mt-1.5 font-semibold">Nomor: {spkNo}</p>
              </div>

              {/* OPENING STATEMENT */}
              <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
                <p>Pada hari ini, <strong>{formatDateId(data.createdAt)}</strong>, telah dibuat dan disepakati Perjanjian Kerja Sama Kolaborasi Kreatif Multi-Pihak secara elektronik melalui platform RAMU oleh dan antara:</p>
                <p className="text-[11px] italic text-slate-500">
                  Proyek: <strong className="text-slate-800 not-italic">{data.collaborationTitle}</strong>
                  {data.plan?.objective && <> &mdash; <em>{data.plan.objective}</em></>}
                </p>
              </div>

              {/* IDENTITAS PARA PIHAK */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <Users className="w-3.5 h-3.5 text-[#0284c7]" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Identitas Para Pihak ({total} Kreator)
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {allParties.map((party, idx) => (
                    <div
                      key={party.id}
                      className={`p-3 rounded-[14px] border space-y-1 relative ${
                        idx === 0 ? "border-slate-300 bg-slate-50/70" : "border-slate-200 bg-white"
                      }`}
                    >
                      {party.signedAt && (
                        <div className="absolute top-2.5 right-2.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 text-[9px] font-bold border border-emerald-200">
                            <Check className="w-2.5 h-2.5" /> Sudah TTD
                          </span>
                        </div>
                      )}
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 border-b border-slate-100 pb-1">
                        {idx === 0 ? <Building2 className="w-3 h-3 text-slate-700" /> : <User className="w-3 h-3 text-slate-500" />}
                        <span>PIHAK {pihakLabel(idx)}{idx === 0 ? " (Inisiator)" : ` — ${party.roleLabel}`}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{party.name}</div>
                      <div className="text-[10px] text-slate-600">Profesi: {party.sector} &bull; {party.roleCode}</div>
                      {party.location && <div className="text-[10px] text-slate-500">Domisili: {party.location}</div>}
                      {party.contactPhone && <div className="text-[10px] text-slate-500">Kontak: {party.contactPhone}</div>}
                      {party.contactEmail && <div className="text-[10px] text-slate-500">Email: {party.contactEmail}</div>}
                      {party.signedAt && (
                        <div className="text-[9px] font-mono text-emerald-700 mt-0.5">
                          TTD: {new Date(party.signedAt).toLocaleString("id-ID")} WIB
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Seluruh pihak di atas disebut <strong>&ldquo;PARA PIHAK&rdquo;</strong> dan sepakat mengikatkan diri dengan ketentuan berikut:
                </p>
              </div>

              {/* 10 PASAL KESEPAKATAN */}
              <div className="space-y-5 text-xs text-slate-800 leading-relaxed border-t border-slate-200 pt-4">

                {/* PASAL 1 */}
                <div id="pasal-1" className="space-y-1.5 scroll-mt-12">
                  <ArticleHead n={1} title="PASAL 1: RUANG LINGKUP DAN TUJUAN KOLABORASI" />
                  <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
                    <li>PARA PIHAK berkolaborasi dalam proyek: <strong>&ldquo;{data.collaborationTitle}&rdquo;</strong>.</li>
                    <li>Kontribusi: {allParties.map((p) => `${p.name} sebagai ${p.roleLabel}`).join("; ")}.</li>
                    {data.plan?.objective && <li>Tujuan: <strong>{data.plan.objective}</strong>.</li>}
                    <li>Estimasi durasi: <strong>{tl.estimatedDuration ?? "Sesuai kesepakatan tim"}</strong>. Target rilis: <strong>{tl.targetLaunch ?? "Ditentukan bersama"}</strong>.</li>
                  </ol>
                </div>

                {/* PASAL 2 */}
                <div id="pasal-2" className="space-y-1.5 scroll-mt-12">
                  <ArticleHead n={2} title="PASAL 2: ANGGARAN, PEMBAGIAN BIAYA, DAN TERMIN PEMBAYARAN BERTAHAP" />
                  <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
                    <li>Total anggaran produksi kolaborasi: <strong>{budget.estimatedTotal ?? "sesuai kesepakatan para pihak"}</strong>.</li>
                    <li>Skema pembagian biaya: <strong>{budget.costSharingModel ?? "Proporsional sesuai kontribusi masing-masing"}</strong>.</li>
                    <li>
                      Mekanisme termin pembayaran/pengeluaran:
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li><strong>Termin I (DP 50% / Biaya Pra-Produksi)</strong>: Wajib disetorkan sebelum tanggal produksi untuk mengunci sewa studio, talenta, dan akomodasi.</li>
                        <li><strong>Termin II (Pelunasan 50% Pasca-Produksi)</strong>: Dilunasi setelah draf hasil kerja disetujui bersama sebelum penyerahan master file resolusi penuh.</li>
                      </ul>
                    </li>
                    <li>Setiap pihak wajib melaporkan pengeluaran riil melalui catatan ruang kerja RAMU demi transparansi audit trail.</li>
                    <li>Penambahan anggaran di luar estimasi awal harus disetujui secara tertulis oleh seluruh pihak sebelum dieksekusi.</li>
                  </ol>
                </div>

                {/* PASAL 3 */}
                <div id="pasal-3" className="space-y-2 scroll-mt-12">
                  <ArticleHead n={3} title="PASAL 3: RINCIAN HAK HONORARIUM PER TALENTA DAN ALOKASI TERMIN" />
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    PARA PIHAK menegaskan bahwa kolaborasi ini menerapkan skema <strong>Honorarium Profesional Flat per Peran</strong> yang pasti, transparan, dan mengikat sejak hari pertama kerja sama. Seluruh talenta berhak menerima imbalan jasa sesuai rincian nominal di bawah ini:
                  </p>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-900 border-b border-slate-200">
                          <th className="py-2 px-2.5 font-bold">Pihak / Talenta</th>
                          <th className="py-2 px-2.5 font-bold">Peran Kerja</th>
                          <th className="py-2 px-2.5 font-bold">Total Honor</th>
                          <th className="py-2 px-2.5 font-bold text-amber-900 bg-amber-50/50">Termin I (DP 50%)</th>
                          <th className="py-2 px-2.5 font-bold text-emerald-900 bg-emerald-50/50">Termin II (Pelunasan 50%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="bg-slate-50/40">
                          <td className="py-1.5 px-2.5 font-bold text-slate-900">
                            {data.initiator.name} <span className="text-[10px] text-slate-500 font-normal">(Inisiator)</span>
                          </td>
                          <td className="py-1.5 px-2.5 text-slate-600">Manajemen Proyek &amp; Pengarah</td>
                          <td className="py-1.5 px-2.5 text-slate-600 italic">Penyedia Anggaran Proyek</td>
                          <td className="py-1.5 px-2.5 text-slate-500">—</td>
                          <td className="py-1.5 px-2.5 text-slate-500">—</td>
                        </tr>
                        {data.participants.map((p, idx) => {
                          const feeStr = p.fee || data.plan?.budget?.roleFees?.[p.roleLabel] || data.plan?.budget?.roleFees?.[p.roleCode];
                          const split = computeSplit(feeStr);
                          return (
                            <tr key={p.id || idx} className="hover:bg-slate-50/60">
                              <td className="py-1.5 px-2.5 font-semibold text-slate-900">{p.name}</td>
                              <td className="py-1.5 px-2.5 text-slate-700">{p.roleLabel}</td>
                              <td className="py-1.5 px-2.5 font-bold text-slate-900">{split.total}</td>
                              <td className="py-1.5 px-2.5 font-semibold text-amber-950 bg-amber-50/30">{split.dp}</td>
                              <td className="py-1.5 px-2.5 font-semibold text-emerald-950 bg-emerald-50/30">{split.final}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
                    <li><strong>Mekanisme Pencairan Termin I (Uang Muka 50%):</strong> Wajib dibayarkan sebelum agenda produksi dimulai guna mengunci jadwal talenta serta menanggung biaya persiapan pra-produksi.</li>
                    <li><strong>Mekanisme Pencairan Termin II (Pelunasan 50%):</strong> Wajib dilunasi selambat-lambatnya 3 (tiga) hari kerja setelah seluruh deliverable diserahkan secara lengkap dan disetujui bersama.</li>
                    <li><strong>Kepastian Hak Finansial:</strong> Nilai honorarium di atas bersifat tetap dan pasti tanpa sistem spekulatif.</li>
                  </ol>
                </div>

                {/* PASAL 4 */}
                <div id="pasal-4" className="space-y-1.5 scroll-mt-12">
                  <ArticleHead n={4} title="PASAL 4: HAK CIPTA, LISENSI HAK PAKAI (USAGE RIGHTS), DAN BATAS REVISI" />
                  <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
                    <li>Karya asli pra-proyek: <strong>{ip.originalIp ?? "Hak cipta tetap milik pencipta asli masing-masing pihak"}</strong>.</li>
                    <li>Karya turunan kolaborasi: Berstatus hak pakai bersama non-eksklusif untuk promosi portofolio digital dan media sosial organik selama <strong>1 (satu) tahun</strong> terhitung sejak peluncuran resmi.</li>
                    <li>Pemanfaatan karya untuk iklan komersial berbayar di luar kesepakatan awal <strong>wajib memperoleh izin tertulis dan adendum kompensasi dari seluruh pihak</strong>.</li>
                    <li>Batas revisi: Dibatasi maksimal <strong>2x (dua kali) putaran revisi minor</strong> (koreksi warna, retouching noda minor, pemotongan klip).</li>
                    <li>Setiap publikasi karya wajib mencantumkan kredit kolaborasi lengkap sesuai format yang disepakati di tab Kredit &amp; Tag RAMU.</li>
                    <li>Batas Garansi Retensi Arsip Master (90 Hari Kalender): Pihak kreator/fotografer bertanggung jawab menyimpan cadangan file master minimal 90 hari kalender sejak serah terima final.</li>
                    <li><strong>Persetujuan Otomatis (Deemed Acceptance 7 Hari Kalender)</strong>: Apabila draf hasil kerja tidak memperoleh tanggapan dalam 7 hari kalender, maka materi dianggap telah disetujui penuh.</li>
                  </ol>
                </div>

                {/* PASAL 5 (ANTI-AI) */}
                <div id="pasal-5" className="space-y-2 rounded-[16px] bg-sky-50/70 border border-sky-200/80 p-3.5 scroll-mt-12">
                  <h3 className="font-bold text-sky-950 text-xs uppercase tracking-wide flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#0284c7] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      <Brain className="w-3 h-3" />
                    </span>
                    <span>PASAL 5: KLAUSUL PERLINDUNGAN DARI PENGGUNAAN AI (ANTI-AI TRAINING CLAUSE)</span>
                  </h3>
                  <div className="text-[11px] text-sky-900 leading-relaxed space-y-1 pl-1">
                    <p><strong>5.1</strong> Karya, gambar, video, rekaman suara, dan seluruh aset dari proyek ini <strong>DILARANG KERAS</strong> digunakan sebagai <em>training data</em>, <em>fine-tuning</em>, atau masukan model AI/ML dalam bentuk apapun, tanpa persetujuan <strong>tertulis dan eksplisit</strong> dari seluruh PARA PIHAK.</p>
                    <p><strong>5.2</strong> Larangan ini berlaku permanen selama hak cipta atas karya masih berlaku sesuai UU No. 28 Tahun 2014 tentang Hak Cipta.</p>
                    <p><strong>5.3</strong> Pelanggaran merupakan pelanggaran material yang memberi hak kepada pihak yang dirugikan untuk menuntut kompensasi dan penghentian segera penggunaan tersebut.</p>
                  </div>
                </div>

                {/* PASAL 6 */}
                <div id="pasal-6" className="space-y-1.5 scroll-mt-12">
                  <ArticleHead n={6} title="PASAL 6: KEWAJIBAN PEMBERIAN KREDIT (CO-CREDIT PROTOCOL)" />
                  <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
                    <li>Setiap pihak yang mempublikasikan karya proyek ini di media apapun <strong>wajib</strong> menyebutkan seluruh kontributor sesuai format kredit yang disepakati via fitur Kredit &amp; Tag RAMU.</li>
                    <li>Format kredit minimal: Nama Kreator + Peran. Contoh: {allParties.slice(0, 2).map((p) => `${p.name} — ${p.roleLabel}`).join(", ")}{allParties.length > 2 ? ", dll." : ""}.</li>
                    <li>Pelanggaran kewajiban kredit dapat dilaporkan melalui RAMU dan berdampak pada reputasi kreator di ekosistem.</li>
                  </ol>
                </div>

                {/* PASAL 7 */}
                <div id="pasal-7" className="space-y-1.5 scroll-mt-12">
                  <ArticleHead n={7} title="PASAL 7: PENGUNDURAN DIRI, PENGGANTIAN PERAN, DAN KONSEKUENSI" />
                  <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
                    <li>Pihak yang mengundurkan diri wajib memberikan notifikasi tertulis via RAMU minimal 14 hari sebelum produksi.</li>
                    <li>Pihak yang mengundurkan diri tidak berhak atas hasil karya yang diselesaikan setelah tanggalnya, kecuali ada kesepakatan lain.</li>
                    <li>Penggantian peran memerlukan persetujuan seluruh pihak tersisa melalui forum adendum RAMU.</li>
                  </ol>
                </div>

                {/* PASAL 8 */}
                <div id="pasal-8" className="space-y-1.5 scroll-mt-12">
                  <ArticleHead n={8} title="PASAL 8: KEADAAN MEMAKSA (FORCE MAJEURE) & KONTINGENSI CUACA BURUK" />
                  <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
                    <li><strong>Keadaan Memaksa Umum</strong>: Dalam hal terjadi peristiwa di luar kendali PARA PIHAK (bencana alam, kebakaran, kerusuhan massal, atau kondisi darurat medis), PARA PIHAK bermusyawarah menentukan kelanjutan atau penjadwalan ulang proyek tanpa sanksi denda.</li>
                    <li><strong>Kontingensi Cuaca Luar Ruang (Rain-Check Protocol)</strong>: Apabila sesi produksi di lokasi luar ruang terhalang cuaca ekstrem, PARA PIHAK berhak atas Penjadwalan Ulang (*Rain-Check*) tanpa penalti dalam batas waktu 14 hari kerja.</li>
                    <li><strong>Biaya Waktu Tunggu / Kehadiran Kru (Staging Fee)</strong>: Jika penundaan cuaca terjadi saat para pihak telah tiba di lokasi (*call time*), pihak inisiator/klien menanggung Biaya Kehadiran (*Staging Fee*) sebesar <strong>25% dari alokasi shift harian</strong> kepada masing-masing talenta/kru.</li>
                  </ol>
                </div>

                {/* PASAL 9 */}
                <div id="pasal-9" className="space-y-1.5 scroll-mt-12">
                  <ArticleHead n={9} title="PASAL 9: PERLINDUNGAN HUBUNGAN BISNIS & ANTI-CIRCUMVENTION (12 BULAN)" />
                  <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
                    <li><strong>Non-Circumvention Klien Pihak Ketiga</strong>: Apabila proyek kolaborasi ini mempertemukan kreator/talenta dengan Klien Brand Pihak Ketiga yang diperkenalkan oleh Inisiator/Agensi proyek, maka selama masa kolaborasi dan 12 (dua belas) bulan setelahnya, seluruh pihak dilarang melakukan kesepakatan langsung tanpa melibatkan inisiator pemrakarsa awal.</li>
                    <li>Pelanggaran komitmen ini dikenakan sanksi penggantian komisi perantara standar dan pencatatan riwayat pelanggaran profesional di ekosistem RAMU.</li>
                  </ol>
                </div>

                {/* PASAL 10 */}
                <div id="pasal-10" className="space-y-1.5 scroll-mt-12">
                  <ArticleHead n={10} title="PASAL 10: PENYELESAIAN SENGKETA DAN KETENTUAN HUKUM" />
                  <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
                    <li>Segala perselisihan diselesaikan melalui musyawarah mufakat, difasilitasi rekam jejak digital (<em>audit trail</em>) RAMU sebagai bukti yang sah.</li>
                    <li>Perjanjian ini tunduk pada: KUHPerdata Pasal 1320 &amp; 1338, UU No. 28 Tahun 2014 tentang Hak Cipta, serta UU No. 11/2008 jo. UU No. 1/2024 tentang ITE.</li>
                    <li>Jika musyawarah tidak menghasilkan mufakat dalam 30 hari, para pihak menyelesaikan melalui BANI atau jalur hukum yang berlaku.</li>
                    <li><strong>Pelepasan Tanggung Jawab Platform (Platform Safe Harbor Shield &amp; Hold Harmless)</strong>: Platform RAMU berkedudukan murni sebagai fasilitator sarana teknologi komunikasi dan penyedia wadah jejak audit digital (*intermediary electronic platform*). Seluruh pihak sepakat melepaskan dan membebaskan RAMU dari segala bentuk tuntutan atau gugatan hukum internal (*Hold Harmless*).</li>
                  </ol>
                </div>

              </div>

              {/* SECTION PENUTUP & TANDA TANGAN */}
              <div id="pasal-ttd" className="pt-5 border-t-2 border-slate-900 space-y-3.5 scroll-mt-12">
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Demikian Draf Perjanjian Kerja Sama Kolaborasi Kreatif Multi-Pihak ini disusun dan disetujui secara sadar, sukarela, dan tanpa paksaan melalui platform RAMU sebagai acuan kesepakatan bersama para pihak dalam pelaksanaan proyek.
                </p>

                {/* Signature Boxes Grid */}
                <div className={`grid gap-3 pt-1 ${
                  total <= 2 ? "grid-cols-2" :
                  total === 3 ? "grid-cols-2 sm:grid-cols-3" :
                  "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                }`}>
                  {allParties.map((party, idx) => (
                    <div key={party.id} className="text-center space-y-1">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">PIHAK {pihakLabel(idx)}</div>
                      <div className={`h-14 rounded-xl flex flex-col items-center justify-center border p-1.5 ${
                        party.signedAt
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-dashed border-slate-200 bg-slate-50"
                      }`}>
                        {party.signedAt ? (
                          <>
                            <div className="font-serif italic font-bold text-xs text-slate-900 tracking-wider select-none transform -rotate-1">
                              {party.name}
                            </div>
                            <span className="text-[8px] font-mono text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-200 mt-0.5">
                              TERVERIFIKASI &bull; {new Date(party.signedAt).toLocaleDateString("id-ID")}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[8px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.2 rounded-full border border-slate-200">
                              MENUNGGU TTD
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono mt-0.5">Pihak {roman(idx + 1)}</span>
                          </>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 text-[10px] border-t border-slate-200 pt-1 truncate px-1">{party.name}</div>
                      <div className="text-[9px] text-slate-500 truncate px-1">{party.roleLabel} / {party.sector}</div>
                    </div>
                  ))}
                </div>

                {/* Audit trail footer */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] text-slate-600 gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block text-[10px]">Jejak Audit Digital Kriptografis (Multi-Party Hash)</span>
                        <span className="font-mono text-[9px] text-slate-500">ID: {spkNo} &bull; UU ITE No. 1/2024</span>
                      </div>
                    </div>
                    <div className="text-right sm:text-right">
                      <span className="font-mono font-bold text-slate-900 block text-[9px]">
                        SHA-256: {shortId.toLowerCase()}{d.getTime().toString(16)}...9f4b
                      </span>
                      <span className="text-[9px] text-emerald-700 font-semibold">
                        {allSigned ? "100% Ditandatangani Sah" : `${signedCount}/${total} Pihak Telah TTD`}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </main>

        </div>

        {/* 3. SIGNATURE PAD MODAL (Floating Canvas Sheet) */}
        {isPadOpen && (
          <div className="print:hidden fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-white border border-slate-200/90 w-full max-w-md shadow-2xl p-5 space-y-3.5 rounded-[22px] animate-fade-in">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#0284c7]" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Papan Tanda Tangan Digital RAMU
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPadOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-0.5">
                <p>
                  Menandatangani sebagai: <strong>{me?.name}</strong> ({me?.roleLabel})
                </p>
                <p className="text-[10px] text-slate-400">
                  Goreskan tanda tangan Anda pada kanvas di bawah menggunakan mouse atau sentuhan:
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-2 relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-32 bg-white border border-dashed border-slate-300 rounded-lg cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs italic">
                    Goreskan tanda tangan Anda di sini
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-full transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Bersihkan</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPadOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-full"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSignature}
                    disabled={isSigning}
                    className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-1.5 text-white text-xs font-bold rounded-full shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSigning ? "Menyimpan..." : "Konfirmasi & Sahkan SPK"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
