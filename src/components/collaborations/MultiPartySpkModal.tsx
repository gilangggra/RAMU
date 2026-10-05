"use client";

import React, { useState, useRef, useEffect } from "react";
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
  AlertTriangle,
  Clock,
  Brain,
  Zap,
  PenTool,
  RotateCcw,
  Download,
} from "lucide-react";
import { exportElementToPdf } from "@/lib/export/pdfExporter";

export interface SpkParticipant {
  id: string;
  name: string;
  sector: string;
  roleCode: string;
  roleLabel: string;
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
    budget?: { estimatedTotal?: string; costSharingModel?: string };
    timeline?: { estimatedDuration?: string; targetLaunch?: string };
    revenueModel?: { proposedSplit?: string; brandModel?: string };
    ipRules?: { originalIp?: string; derivativeWorks?: string };
    ownershipRules?: { brandModel?: string };
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
    <h3 className="font-black text-stone-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
      <span className="w-5 h-5 bg-stone-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
        {n}
      </span>
      {title}
    </h3>
  );
}

export function MultiPartySpkModal({ isOpen, onClose, data, currentActorId, onSign }: Props) {
  const [copied, setCopied] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signMsg, setSignMsg] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printableRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const allParties: SpkParticipant[] = [data.initiator, ...data.participants];
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

  const [isPadOpen, setIsPadOpen] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

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
    ctx.strokeStyle = "#1E1B2E";
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
        setIsPadOpen(false);
        setSignMsg("Tanda tangan digital Anda berhasil dibubuhkan secara sah pada SPK.");
      } else {
        setSignMsg(r.error ?? "Gagal menandatangani dokumen.");
      }
    } catch {
      setSignMsg("Terjadi kesalahan teknis saat mencatat tanda tangan.");
    } finally {
      setIsSigning(false);
    }
  }

  async function handleExportPdf() {
    const el = printableRef.current || document.getElementById("spk-collab-printable");
    if (!el) return;
    setIsExportingPdf(true);
    try {
      const cleanTitle = (data.collaborationTitle || "Proyek").replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30);
      await exportElementToPdf(el, {
        filename: `SPK-MultiPihak-${cleanTitle}-${shortId}.pdf`,
      });
    } catch (err) {
      console.error("Gagal ekspor PDF otomatis, beralih ke print dialog:", err);
      window.print();
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
      `https://ramu.id/collaborations/${data.collaborationId}`,
    ].join("\n");
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const waText = encodeURIComponent(
    `*KESEPAKATAN KOLABORASI MULTI-PIHAK — RAMU*\n` +
    `No: ${spkNo}\n` +
    `Proyek: ${data.collaborationTitle}\n` +
    `Persetujuan: ${signedCount}/${total} pihak\n\n` +
    allParties.map((p, i) => `${i + 1}. ${p.name} (${p.roleLabel})`).join("\n") +
    `\n\nKesepakatan Kolaborasi — https://ramu.id/collaborations/${data.collaborationId}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[95vh] flex flex-col font-sans">

        <div className="print:hidden flex items-center justify-between px-6 py-3.5 border-b border-stone-200 bg-stone-50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-1.5 rounded-lg bg-stone-900 text-amber-400 shrink-0">
              <FileText className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                Collaboration Agreement Generator &bull; Draf Kesepakatan Multi-Pihak
              </h2>
              <p className="text-[11px] text-stone-500 font-mono">{spkNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {/* 1-CLICK PDF EXPORT BUTTON */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              title="Unduh Lembar SPK Resmi dalam Format Dokumen PDF"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? "animate-bounce" : ""}`} />
              <span>{isExportingPdf ? "Mengunduh PDF..." : "Unduh PDF"}</span>
            </button>
            <button onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer shadow-xs">
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <button onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Tersalin!" : "Salin"}</span>
            </button>
            <button onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="print:hidden px-6 py-3 border-b border-stone-100 bg-stone-50/50 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
              Status Tanda Tangan ({signedCount}/{total} Pihak)
            </span>
            {allSigned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Semua Pihak Menandatangani
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${
              allSigned ? "bg-emerald-500" : signedCount > 0 ? "bg-amber-400" : "bg-stone-300"
            }`} style={{ width: `${(signedCount / Math.max(total, 1)) * 100}%` }} />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {allParties.map((p, i) => (
              <div key={p.id} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                p.signedAt ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-stone-50 text-stone-500 border-stone-200"
              }`}>
                {p.signedAt
                  ? <Check className="w-2.5 h-2.5 text-emerald-600" />
                  : <Clock className="w-2.5 h-2.5 text-stone-400" />}
                <span>Pihak {roman(i + 1)}: {p.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div id="spk-collab-printable" className="overflow-y-auto p-8 sm:p-12 space-y-7 bg-white flex-1">

          <div className="flex items-start justify-between border-b-2 border-stone-900 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-stone-900 text-amber-400 flex items-center justify-center font-black text-2xl tracking-tighter">R</div>
              <div>
                <div className="text-xl font-black text-stone-950 flex items-center gap-2">
                  <span>RAMU INDONESIA</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase tracking-widest border border-amber-300">Protokol Sah</span>
                </div>
                <div className="text-[11px] text-stone-600 font-medium">Ekosistem Kolaborasi &amp; Pelindung Transaksi Kreatif Nasional</div>
                <div className="text-[10px] text-stone-400">PSE Terdaftar &bull; www.ramu.id</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-mono font-bold text-stone-950">{spkNo}</div>
              <div className="text-[11px] text-stone-500">Kelas: PKSK-KOLABORASI-KREATIF</div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /><span>Tervalidasi RAMU</span>
              </div>
            </div>
          </div>

          <div className="text-center pb-2">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-stone-950 border-b border-stone-200 pb-3 inline-block">
              PERJANJIAN KERJA SAMA KOLABORASI KREATIF (PKSK) MULTI-PIHAK
            </h1>
            <p className="text-xs font-mono text-stone-600 mt-2 font-semibold">Nomor: {spkNo}</p>
          </div>

          <div className="text-xs text-stone-700 leading-relaxed space-y-2">
            <p>Pada hari ini, <strong>{formatDateId(data.createdAt)}</strong>, telah dibuat dan disepakati Perjanjian Kerja Sama Kolaborasi Kreatif Multi-Pihak secara elektronik melalui platform RAMU oleh dan antara:</p>
            <p className="text-[11px] italic text-stone-500">
              Proyek: <strong className="text-stone-700 not-italic">{data.collaborationTitle}</strong>
              {data.plan?.objective && <> &mdash; <em>{data.plan.objective}</em></>}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
              <Users className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-bold text-stone-950 uppercase tracking-wider">
                Identitas Para Pihak ({total} Kreator)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allParties.map((party, idx) => (
                <div key={party.id} className={`p-4 border space-y-1.5 relative ${
                  idx === 0 ? "border-stone-900 bg-stone-50/80" : "border-stone-200 bg-white"
                }`}>
                  {party.signedAt && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold border border-emerald-200">
                        <Check className="w-2 h-2" /> Ditandatangani
                      </span>
                    </div>
                  )}
                  <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-b pb-1 ${
                    idx === 0 ? "text-stone-700 border-stone-300" : "text-stone-500 border-stone-100"
                  }`}>
                    {idx === 0 ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    <span>PIHAK {pihakLabel(idx)}{idx === 0 ? " (Inisiator)" : ` — ${party.roleLabel}`}</span>
                  </div>
                  <div className="text-sm font-bold text-stone-950">{party.name}</div>
                  <div className="text-[11px] text-stone-600">Profesi: {party.sector} &middot; {party.roleCode}</div>
                  {party.location && <div className="text-[11px] text-stone-500">Domisili: {party.location}</div>}
                  {party.contactPhone && <div className="text-[11px] text-stone-500">Kontak: {party.contactPhone}</div>}
                  {party.contactEmail && <div className="text-[11px] text-stone-500">Email: {party.contactEmail}</div>}
                  {party.signedAt && (
                    <div className="text-[10px] font-mono text-emerald-700 mt-1">
                      TTD: {new Date(party.signedAt).toLocaleString("id-ID")} WIB
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-stone-600 italic">
              Seluruh pihak di atas disebut <strong>&ldquo;PARA PIHAK&rdquo;</strong> dan sepakat mengikatkan diri dengan ketentuan berikut:
            </p>
          </div>

          <div className="space-y-6 text-xs text-stone-800 leading-relaxed border-t border-stone-200 pt-5">

            <div className="space-y-2">
              <ArticleHead n={1} title="PASAL 1: RUANG LINGKUP DAN TUJUAN KOLABORASI" />
              <ol className="list-decimal pl-6 space-y-1.5 text-stone-700 text-[11px]">
                <li>PARA PIHAK berkolaborasi dalam proyek: <strong>&ldquo;{data.collaborationTitle}&rdquo;</strong>.</li>
                <li>Kontribusi: {allParties.map((p) => `${p.name} sebagai ${p.roleLabel}`).join("; ")}.</li>
                {data.plan?.objective && <li>Tujuan: <strong>{data.plan.objective}</strong>.</li>}
                <li>Estimasi durasi: <strong>{tl.estimatedDuration ?? "Sesuai kesepakatan tim"}</strong>. Target rilis: <strong>{tl.targetLaunch ?? "Ditentukan bersama"}</strong>.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <ArticleHead n={2} title="PASAL 2: ANGGARAN, PEMBAGIAN BIAYA, DAN TERMIN PEMBAYARAN BERTAHAP" />
              <ol className="list-decimal pl-6 space-y-1.5 text-stone-700 text-[11px]">
                <li>Total anggaran produksi kolaborasi: <strong>{budget.estimatedTotal ?? "sesuai kesepakatan para pihak"}</strong>.</li>
                <li>Skema pembagian biaya: <strong>{budget.costSharingModel ?? "Proporsional sesuai kontribusi masing-masing"}</strong>.</li>
                <li>
                  Mekanisme termin pembayaran/pengeluaran:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>Termin I (DP 50% / Biaya Pra-Produksi)</strong>: Wajib disetorkan sebelum tanggal produksi untuk mengunci sewa studio, talenta, dan akomodasi.</li>
                    <li><strong>Termin II (Pelunasan 50% Pasca-Produksi)</strong>: Dilunasi setelah draf hasil kerja (pratinjau ber-watermark) disetujui bersama sebelum penyerahan master file resolusi penuh.</li>
                  </ul>
                </li>
                <li>Setiap pihak wajib melaporkan pengeluaran riil melalui catatan ruang kerja RAMU demi transparansi audit trail.</li>
                <li>Penambahan anggaran di luar estimasi awal harus disetujui secara tertulis oleh seluruh pihak sebelum dieksekusi.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <ArticleHead n={3} title="PASAL 3: PEMBAGIAN PENDAPATAN DAN BAGI HASIL" />
              <ol className="list-decimal pl-6 space-y-1.5 text-stone-700 text-[11px]">
                <li>Proporsi bagi hasil bersih: <strong>{rev.proposedSplit ?? "Berdasarkan kontribusi masing-masing pihak"}</strong>.</li>
                <li>Brand kolaborasi: <strong>{rev.brandModel ?? data.plan?.ownershipRules?.brandModel ?? "Co-Branding Bersama"}</strong>.</li>
                <li>Distribusi pendapatan paling lambat 14 hari kerja setelah penerimaan, disertai bukti transfer.</li>
                <li>Jika proyek tidak menghasilkan pendapatan, tidak ada pihak yang menuntut kompensasi finansial kecuali ada adendum tertulis.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <ArticleHead n={4} title="PASAL 4: HAK CIPTA, LISENSI HAK PAKAI (USAGE RIGHTS), DAN BATAS REVISI" />
              <ol className="list-decimal pl-6 space-y-1.5 text-stone-700 text-[11px]">
                <li>Karya asli pra-proyek: <strong>{ip.originalIp ?? "Hak cipta tetap milik pencipta asli masing-masing pihak"}</strong>.</li>
                <li>Karya turunan kolaborasi: Berstatus hak pakai bersama non-eksklusif untuk promosi portofolio digital dan media sosial organik selama <strong>1 (satu) tahun</strong> terhitung sejak peluncuran resmi.</li>
                <li>Pemanfaatan karya untuk iklan berbayar skala komersial (Meta/TikTok Ads, Billboard, atau komersialisasi retail) di luar kesepakatan awal <strong>wajib memperoleh izin tertulis dan adendum kompensasi bagi hasil dari seluruh pihak</strong>.</li>
                <li>Batas revisi pasca-produksi: Dibatasi maksimal <strong>2x (dua kali) putaran revisi minor</strong> untuk penyelarasan warna, retouching, dan pemotongan klip. Perubahan konsep dasar memerlukan kesepakatan bulat para pihak.</li>
                <li>Setiap publikasi karya wajib mencantumkan kredit kolaborasi lengkap sesuai format yang disepakati di tab Kredit &amp; Tag RAMU.</li>
              </ol>
            </div>

            <div className="space-y-2 border border-amber-300 p-4 bg-amber-50/60">
              <h3 className="font-black text-amber-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-5 h-5 bg-amber-600 text-white font-black flex items-center justify-center shrink-0">
                  <Brain className="w-3 h-3" />
                </span>
                PASAL 5: KLAUSUL PERLINDUNGAN DARI PENGGUNAAN AI (ANTI-AI TRAINING CLAUSE)
              </h3>
              <div className="text-[11px] text-amber-900 leading-relaxed space-y-1.5 pl-1">
                <p><strong>5.1</strong> Karya, gambar, video, rekaman suara, dan seluruh aset dari proyek ini <strong>DILARANG KERAS</strong> digunakan sebagai <em>training data</em>, <em>fine-tuning</em>, atau masukan model AI/ML dalam bentuk apapun, tanpa persetujuan <strong>tertulis dan eksplisit</strong> dari seluruh PARA PIHAK.</p>
                <p><strong>5.2</strong> Larangan ini berlaku permanen selama hak cipta atas karya masih berlaku sesuai UU No. 28 Tahun 2014 tentang Hak Cipta.</p>
                <p><strong>5.3</strong> Pelanggaran merupakan pelanggaran material yang memberi hak kepada pihak yang dirugikan untuk menuntut kompensasi dan penghentian segera penggunaan tersebut.</p>
              </div>
            </div>

            <div className="space-y-2">
              <ArticleHead n={6} title="PASAL 6: KEWAJIBAN PEMBERIAN KREDIT (CO-CREDIT PROTOCOL)" />
              <ol className="list-decimal pl-6 space-y-1.5 text-stone-700 text-[11px]">
                <li>Setiap pihak yang mempublikasikan karya proyek ini di media apapun <strong>wajib</strong> menyebutkan seluruh kontributor sesuai format kredit yang disepakati via fitur Kredit &amp; Tag RAMU.</li>
                <li>Format kredit minimal: Nama Kreator + Peran. Contoh: {allParties.slice(0, 2).map((p) => `${p.name} — ${p.roleLabel}`).join(", ")}{allParties.length > 2 ? ", dll." : ""}.</li>
                <li>Pelanggaran kewajiban kredit dapat dilaporkan melalui RAMU dan berdampak pada reputasi kreator di ekosistem.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <ArticleHead n={7} title="PASAL 7: PENGUNDURAN DIRI, PENGGANTIAN PERAN, DAN KONSEKUENSI" />
              <ol className="list-decimal pl-6 space-y-1.5 text-stone-700 text-[11px]">
                <li>Pihak yang mengundurkan diri wajib memberikan notifikasi tertulis via RAMU minimal 14 hari sebelum produksi.</li>
                <li>Pihak yang mengundurkan diri tidak berhak atas hasil karya yang diselesaikan setelah tanggalnya, kecuali ada kesepakatan lain.</li>
                <li>Hak cipta atas kontribusi yang diserahkan sebelum pengunduran diri tetap berlaku sesuai Pasal 4.</li>
                <li>Penggantian peran memerlukan persetujuan seluruh pihak tersisa melalui forum adendum RAMU.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <ArticleHead n={8} title="PASAL 8: KEADAAN MEMAKSA (FORCE MAJEURE)" />
              <p className="text-[11px] text-stone-700 pl-1">
                Dalam hal terjadi peristiwa di luar kendali PARA PIHAK (bencana alam, wabah resmi, gangguan keamanan massal, atau kondisi darurat yang dibuktikan secara resmi), PARA PIHAK bermusyawarah menentukan kelanjutan, penundaan, atau penghentian proyek tanpa pembebanan sanksi finansial kepada pihak manapun.
              </p>
            </div>

            <div className="space-y-2">
              <ArticleHead n={9} title="PASAL 9: PENYELESAIAN SENGKETA DAN KETENTUAN HUKUM" />
              <ol className="list-decimal pl-6 space-y-1.5 text-stone-700 text-[11px]">
                <li>Segala perselisihan diselesaikan melalui musyawarah mufakat, difasilitasi rekam jejak digital (<em>audit trail</em>) RAMU sebagai bukti yang sah.</li>
                <li>Perjanjian ini tunduk pada: KUHPerdata Pasal 1320 &amp; 1338, UU No. 28 Tahun 2014 tentang Hak Cipta, serta UU No. 11/2008 jo. UU No. 1/2024 tentang ITE.</li>
                <li>Jika musyawarah tidak menghasilkan mufakat dalam 30 hari, para pihak menyelesaikan melalui BANI atau jalur hukum yang berlaku.</li>
              </ol>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-stone-900 space-y-4">
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Demikian Draf Perjanjian Kerja Sama Kolaborasi Kreatif Multi-Pihak ini disusun dan disetujui secara sadar, sukarela, dan tanpa paksaan melalui platform RAMU sebagai acuan kesepakatan bersama para pihak dalam pelaksanaan proyek.
            </p>
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[10px] leading-relaxed">
              <strong>Catatan Platform:</strong> Draf kesepakatan ini disusun secara terstruktur oleh <em>RAMU Collaboration Agreement Generator</em> berdasarkan parameter yang disetujui para pihak di ruang kerja. Dokumen ini disarankan untuk ditinjau dan disesuaikan oleh pihak yang berkompeten sebelum digunakan sebagai instrumen hukum formal.
            </div>

            <div className={`grid gap-4 pt-2 ${
              total <= 2 ? "grid-cols-2" :
              total === 3 ? "grid-cols-2 sm:grid-cols-3" :
              "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            }`}>
              {allParties.map((party, idx) => (
                <div key={party.id} className="text-center space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">PIHAK {pihakLabel(idx)}</div>
                  <div className={`h-16 flex flex-col items-center justify-center border p-2 ${
                    party.signedAt ? "border-emerald-300 bg-emerald-50/60" : "border-dashed border-stone-300 bg-stone-50"
                  }`}>
                    {party.signedAt ? (
                      <>
                        <div className="font-serif italic font-bold text-sm text-[#1E1B2E] tracking-wider select-none transform -rotate-1">
                          {party.name}
                        </div>
                        <span className="text-[8px] font-mono text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 mt-1">
                          TERVERIFIKASI &bull; {new Date(party.signedAt).toLocaleDateString("id-ID")}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] font-mono text-stone-400 font-bold bg-stone-100 px-2 py-0.5 rounded border border-stone-200">MENUNGGU TTD</span>
                        <span className="text-[9px] text-stone-400 font-mono mt-1">Pihak {roman(idx + 1)}</span>
                      </>
                    )}
                  </div>
                  <div className="font-bold text-stone-950 text-[11px] border-t border-stone-300 pt-1 truncate px-1">{party.name}</div>
                  <div className="text-[10px] text-stone-500 truncate px-1">{party.roleLabel} / {party.sector}</div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-400 gap-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Dokumen kesepakatan terverifikasi &bull; Rekam Jejak RAMU &bull; {allSigned ? "DISEPAKATI SEMUA PIHAK" : `${signedCount}/${total} Pihak Menyetujui`}</span>
              </div>
              <div className="font-mono">Hash: {shortId}-COLLAB-{d.getFullYear()}</div>
            </div>
          </div>
        </div>

        <div className="print:hidden px-6 py-4 border-t border-stone-200 bg-stone-50 shrink-0 space-y-3">
          {signMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold border ${
              signMsg.includes("Gagal") || signMsg.includes("kesalahan")
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}>{signMsg}</div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-stone-500 flex items-center gap-2">
              {!allSigned && <AlertTriangle className="w-4 h-4 text-amber-500" />}
              <span>
                {allSigned
                  ? "✅ Perjanjian berlaku penuh — seluruh pihak telah membubuhkan tanda tangan sah."
                  : iSigned
                  ? `Anda telah menandatangani. Menunggu ${total - signedCount} pihak lainnya.`
                  : "Tanda tangan digital Anda diperlukan untuk mengaktifkan SPK ini secara penuh."}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {!iSigned && !allSigned && (
                <button
                  type="button"
                  onClick={() => setIsPadOpen(true)}
                  disabled={isSigning}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Bubuhkan Tanda Tangan Digital</span>
                </button>
              )}
              <button onClick={onClose}
                className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl font-bold transition-colors cursor-pointer text-sm">
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL KANVAS TANDA TANGAN ELEKTRONIK (CANVAS PAD)             */}
        {/* ============================================================ */}
        {isPadOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-stone-300 w-full max-w-md shadow-2xl p-6 space-y-4 rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                    Papan Tanda Tangan Digital RAMU
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPadOpen(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-stone-600 space-y-1">
                <p>
                  Menandatangani sebagai: <strong>{me?.name}</strong> ({me?.roleLabel})
                </p>
                <p className="text-[11px] text-stone-400">
                  Goreskan tanda tangan Anda pada kanvas di bawah menggunakan mouse atau jari:
                </p>
              </div>

              <div className="border border-stone-300 rounded-xl bg-stone-50/50 p-2 relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 bg-white border border-dashed border-stone-300 rounded-lg cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-stone-300 text-xs italic">
                    Goreskan tanda tangan Anda di sini
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 hover:bg-stone-100 text-stone-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hapus / Bersihkan</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPadOpen(false)}
                    className="px-3 py-1.5 text-xs font-bold text-stone-500 hover:text-stone-800"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSignature}
                    disabled={isSigning}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
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
    </div>
  );
}
