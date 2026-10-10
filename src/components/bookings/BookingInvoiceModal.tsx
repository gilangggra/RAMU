"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  X,
  CreditCard,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Hash,
  Share2,
} from "lucide-react";
import { exportElementToPdf } from "@/lib/export/pdfExporter";
import { printElement } from "@/lib/export/printDocument";
import { BookingSpkData } from "@/components/bookings/SpkAgreementModal";
import { RamuLogo } from "@/components/brand/RamuLogo";

interface BookingInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingSpkData;
  initialType?: "INVOICE_DP" | "INVOICE_PELUNASAN" | "KWITANSI";
}

export function BookingInvoiceModal({
  isOpen,
  onClose,
  booking,
  initialType = "INVOICE_DP",
}: BookingInvoiceModalProps) {
  const [docType, setDocType] = useState<"INVOICE_DP" | "INVOICE_PELUNASAN" | "KWITANSI">(initialType);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const spkNomorResmi = `SPK-RAMU-${booking.id.slice(0, 8).toUpperCase()}`;
  const docYear = new Date(booking.startDate).getFullYear() || 2026;
  const docCode =
    docType === "INVOICE_DP"
      ? `INV-DP/RAMU/${docYear}/${booking.id.slice(0, 6).toUpperCase()}`
      : docType === "INVOICE_PELUNASAN"
      ? `INV-FINAL/RAMU/${docYear}/${booking.id.slice(0, 6).toUpperCase()}`
      : `KWT/RAMU/${docYear}/${booking.id.slice(0, 6).toUpperCase()}`;

  const details = (typeof booking.details === "object" && booking.details !== null)
    ? (booking.details as Record<string, any>)
    : {};

  const dpPercentage = details?.agreedTerms?.dpPercentage || 50;
  const rawBudget = booking.budget || "Rp 0";
  // Clean raw budget numbers if possible
  const numericBudget = parseInt(rawBudget.replace(/[^0-9]/g, ""), 10) || 0;
  const dpAmount = numericBudget > 0 ? (numericBudget * dpPercentage) / 100 : 0;
  const pelunasanAmount = numericBudget > 0 ? numericBudget - dpAmount : 0;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const currentAmountStr =
    docType === "INVOICE_DP"
      ? numericBudget > 0
        ? formatRupiah(dpAmount)
        : `DP ${dpPercentage}% dari ${rawBudget}`
      : docType === "INVOICE_PELUNASAN"
      ? numericBudget > 0
        ? formatRupiah(pelunasanAmount)
        : `Pelunasan ${100 - dpPercentage}% dari ${rawBudget}`
      : rawBudget;

  const payoutAccount = details?.payoutAccount || details?.agreedTerms?.payoutAccount || null;
  const bankName = payoutAccount?.bankName || "BCA / Mandiri Resmi Penyedia Jasa";
  const accountNumber = payoutAccount?.accountNumber || "Sesuai rincian profil / SPK";
  const accountHolder = payoutAccount?.accountHolder || booking.target.name;
  const npwpNik = payoutAccount?.taxIdentifier || "Tercatat dalam SPK resmi";

  function handlePrint() {
    printElement(printRef.current || "invoice-printable-area", docCode.replace(/[\/\\]/g, "-"));
  }

  async function handleExportPdf() {
    const el = printRef.current || document.getElementById("invoice-printable-area");
    if (!el) {
      handlePrint();
      return;
    }
    setIsExportingPdf(true);
    try {
      await exportElementToPdf(el, {
        filename: `${docCode.replace(/[\/\\]/g, "-")}.pdf`,
      });
    } catch (e) {
      console.error("Gagal ekspor PDF:", e);
      handlePrint();
    } finally {
      setIsExportingPdf(false);
    }
  }

  function handleCopyText() {
    const text = `*${docType === "KWITANSI" ? "KWITANSI TANDA TERIMA RESMI" : "INVOICE PENAGIHAN JASA RESMI"}*
Nomor: ${docCode}
Rujukan: ${spkNomorResmi}
Platform: RAMU Creative Ecosystem (PSE Terdaftar)

Penerima Pembayaran: ${booking.target.name} (${booking.target.sector})
Pembayar: ${booking.requester.name}
Nilai Tagihan: ${currentAmountStr}

Rekening Transfer:
- Bank: ${bankName}
- No. Rekening: ${accountNumber}
- A/N: ${accountHolder}

Dokumen sah digital: ${typeof window !== "undefined" ? window.location.origin : "https://ramu-gamma.vercel.app"}/dashboard/bookings/${booking.id}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!mounted) return null;

  return createPortal(
    <div className="print-modal-root fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in print:static print:inset-auto print:z-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible print:block">
      <div className="relative w-full max-w-3xl bg-white rounded-[22px] shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[94vh] flex flex-col font-sans print:max-w-none print:w-full print:border-none print:shadow-none print:rounded-none print:max-h-none print:h-auto print:overflow-visible print:block print:my-0">
        {/* Top Control Bar */}
        <div className="print:hidden flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-100/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-900 text-amber-400">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Dokumen Finansial &amp; Penagihan Resmi
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">{docCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? "animate-bounce" : ""}`} />
              <span>{isExportingPdf ? "Mengunduh..." : "Unduh PDF"}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Tersalin" : "Salin"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector Type */}
        <div className="print:hidden flex items-center gap-2 px-6 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">
            Format Dokumen:
          </span>
          <button
            type="button"
            onClick={() => setDocType("INVOICE_DP")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              docType === "INVOICE_DP"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Invoice DP ({dpPercentage}%)
          </button>
          <button
            type="button"
            onClick={() => setDocType("INVOICE_PELUNASAN")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              docType === "INVOICE_PELUNASAN"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Invoice Pelunasan ({100 - dpPercentage}%)
          </button>
          <button
            type="button"
            onClick={() => setDocType("KWITANSI")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              docType === "KWITANSI"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Kwitansi Tanda Terima Resmi
          </button>
        </div>

        {/* Printable Document Sheet */}
        <div id="invoice-printable-area" className="overflow-y-auto p-6 sm:p-10 flex-1 bg-slate-100/40 print:p-0 print:m-0 print:overflow-visible print:bg-white print:max-h-none print:h-auto">
          <div
            ref={printRef}
            className="max-w-2xl mx-auto bg-white border border-slate-300 rounded-xl p-8 sm:p-10 space-y-6 shadow-sm text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none"
          >
            {/* Header Surat */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div className="flex items-center gap-3">
                <RamuLogo size={44} className="shrink-0" />
                <div>
                  <div className="text-lg font-black text-slate-950 flex items-center gap-2">
                    <span>RAMU INDONESIA</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-widest border border-emerald-300">
                      Sah Fiskal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Ekosistem Manajemen Proyek &amp; Transaksi Kreatif Resmi</p>
                  <p className="text-[10px] text-slate-400">PSE Terdaftar &bull; Kepatuhan UU ITE &amp; Pajak Indonesia</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                  {docType === "KWITANSI" ? "KWITANSI RESMI" : "FAKTUR / INVOICE"}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700 block">{docCode}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Ref: <strong className="text-slate-600">{spkNomorResmi}</strong>
                </span>
              </div>
            </div>

            {/* Meta Tanggal & Pihak */}
            <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Diterbitkan Oleh (Penyedia Jasa):
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{booking.target.name}</h4>
                <p className="text-slate-600">{booking.target.sector}</p>
                {booking.target.location && <p className="text-slate-500">{booking.target.location}</p>}
                <p className="text-slate-500 font-mono text-[11px]">NPWP / NIK: {npwpNik}</p>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Ditagihkan Kepada (Klien / Pemesan):
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{booking.requester.name}</h4>
                <p className="text-slate-600">{booking.requester.sector}</p>
                {booking.requester.location && <p className="text-slate-500">{booking.requester.location}</p>}
                <div className="pt-2 text-[10px] text-slate-400">
                  Tanggal Dokumen:{" "}
                  <strong className="text-slate-700">
                    {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </strong>
                </div>
              </div>
            </div>

            {/* Rincian Tagihan */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Rincian Tagihan Pekerjaan
              </span>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                    <th className="py-2">Deskripsi Layanan / Termin</th>
                    <th className="py-2 text-center">Jadwal Sesi</th>
                    <th className="py-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">
                      {docType === "INVOICE_DP"
                        ? `Termin I: Uang Muka (DP ${dpPercentage}%) Jasa ${booking.target.sector}`
                        : docType === "INVOICE_PELUNASAN"
                        ? `Termin II: Pelunasan Sisa (${100 - dpPercentage}%) Jasa ${booking.target.sector}`
                        : `Pelunasan Penuh Jasa Profesional ${booking.target.sector}`}
                      <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                        {docType === "INVOICE_DP"
                          ? "Pembayaran DP untuk mengunci jadwal kerja dan persiapan on-set sesuai SPK."
                          : docType === "INVOICE_PELUNASAN"
                          ? "Pelunasan setelah penyerahan draf pratinjau watermark disetujui, sebelum master file resolusi penuh diserahkan."
                          : "Tanda terima pembayaran yang sah dan mengikat atas pelaksanaan proyek."}
                      </div>
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      {new Date(booking.startDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      {currentAmountStr}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900">
                    <th colSpan={2} className="py-3 font-bold text-slate-900 text-right uppercase tracking-wider text-xs">
                      Total Tagihan {docType === "KWITANSI" ? "Diterima" : "Harus Dibayar"}:
                    </th>
                    <th className="py-3 font-black text-slate-950 text-right text-sm">
                      {currentAmountStr}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Rekening Pembayaran */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-700" />
                <span>Instruksi Transfer Bank (Direct Settlement):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Bank Tujuan:</span>
                  <strong>{bankName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Nomor Rekening:</span>
                  <strong className="font-mono">{accountNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Atas Nama:</span>
                  <strong>{accountHolder}</strong>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 leading-relaxed">
                Mohon cantumkan berita transfer: <code className="font-bold">{spkNomorResmi}</code> agar mutasi rekening mudah diverifikasi.
              </p>
            </div>

            {/* Kolom Tanda Tangan */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pemberi Kerja (Klien)
                </span>
                <div className="h-16 flex items-center justify-center font-serif italic text-slate-700 font-bold">
                  {booking.requester.name}
                </div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">
                  {booking.requester.name}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Penyedia Jasa (Talenta / Studio)
                </span>
                <div className="h-16 flex flex-col items-center justify-center">
                  <div className="font-serif italic text-slate-900 font-bold text-sm">
                    {booking.target.name}
                  </div>
                  <span className="text-[8px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 mt-1">
                    VERIFIKASI DIGITAL RAMU
                  </span>
                </div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">
                  {booking.target.name}
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-[9px] text-slate-400 text-center pt-2 leading-relaxed">
              Dokumen ini diterbitkan secara elektronik oleh platform RAMU atas rujukan SPK sah ber-SHA256. Berfungsi sebagai instrumen penagihan resmi dan tanda terima pencatatan pembukuan keuangan.
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
