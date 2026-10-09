"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
  Building2,
  Check,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import {
  submitPaymentSlipAction,
  verifyPaymentSlipAction,
} from "@/app/api/bookings/actions";
import { toast } from "@/components/ui/Toast";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

export interface PaymentSlipItem {
  id: string;
  stage: "DP" | "PELUNASAN";
  amount: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  referenceNumber: string;
  slipUrl?: string | null;
  notes?: string;
  submittedByActorId: string;
  submittedAt: string;
  status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface PaymentSlipManagerProps {
  bookingId: string;
  refCode: string;
  isRequester: boolean;
  isTarget: boolean;
  currentActorId: string;
  slips: PaymentSlipItem[];
  agreedBudget?: string | null;
  dpPercentage?: number;
  targetBankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  } | null;
}

export function PaymentSlipManager({
  bookingId,
  refCode,
  isRequester,
  isTarget,
  currentActorId,
  slips = [],
  agreedBudget,
  dpPercentage = 50,
  targetBankDetails,
}: PaymentSlipManagerProps) {
  const router = useRouter();
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [rejectModalSlipId, setRejectModalSlipId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Form inputs
  const [stage, setStage] = useState<"DP" | "PELUNASAN">("DP");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [slipUrl, setSlipUrl] = useState("");
  const [notes, setNotes] = useState("");

  // Kalkulasi nominal acuan
  const numericBudget = parseInt((agreedBudget || "0").replace(/[^0-9]/g, ""), 10) || 0;
  const dpAmountEst = numericBudget > 0 ? (numericBudget * dpPercentage) / 100 : 0;
  const pelunasanAmountEst = numericBudget > 0 ? numericBudget - dpAmountEst : 0;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  async function handleSubmitSlip(e: React.FormEvent) {
    e.preventDefault();
    if (!amount.trim() || !bankName.trim()) {
      toast.error("Mohon masukkan nominal dan nama bank / metode transfer.");
      return;
    }

    const cleanRef = referenceNumber.trim() || `REF-${Date.now().toString().slice(-6)}`;
    const cleanAccNo = accountNumber.trim() || "QRIS / E-Wallet / m-Banking";
    const cleanAccHolder = accountHolder.trim() || "Pengirim Terverifikasi";

    setIsSubmitting(true);
    try {
      const res = await submitPaymentSlipAction({
        bookingId,
        stage,
        amount: amount.trim(),
        bankName: bankName.trim(),
        accountNumber: cleanAccNo,
        accountHolder: cleanAccHolder,
        referenceNumber: cleanRef,
        slipUrl: slipUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        toast.success(`Bukti transfer ${stage} berhasil dikirim! Menunggu konfirmasi mutasi mitra.`);
        setIsOpenForm(false);
        // Reset form
        setAmount("");
        setBankName("");
        setAccountNumber("");
        setAccountHolder("");
        setReferenceNumber("");
        setSlipUrl("");
        setNotes("");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal mengirim bukti transfer.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat mengirim bukti transfer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(slipId: string, isApproved: boolean, reason?: string) {
    setVerifyingId(slipId);
    try {
      const res = await verifyPaymentSlipAction(bookingId, slipId, isApproved, reason);
      if (res.success) {
        toast.success(
          isApproved
            ? "Pembayaran berhasil diverifikasi! Transaksi dicatat sah."
            : "Laporan penolakan mutasi telah dikirimkan kepada pemesan."
        );
        setRejectModalSlipId(null);
        setRejectionReason("");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal memproses verifikasi.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memverifikasi.");
    } finally {
      setVerifyingId(null);
    }
  }

  const hasDpVerified = slips.some((s) => s.stage === "DP" && s.status === "VERIFIED");
  const hasPelunasanVerified = slips.some((s) => s.stage === "PELUNASAN" && s.status === "VERIFIED");

  return (
    <div className="bg-white border border-slate-200/80 rounded-[22px] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Verifikasi Mutasi Transfer Perbankan
            </h3>
            <p className="text-[10px] text-slate-500">
              Konfirmasi penerimaan DP &amp; Pelunasan dua arah bebas modus slip palsu
            </p>
          </div>
        </div>

        {isRequester && (
          <button
            onClick={() => setIsOpenForm(!isOpenForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-300" />
            <span>{isOpenForm ? "Tutup Form" : "Unggah Bukti Transfer"}</span>
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Status Ringkas Pembayaran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Box DP */}
          <div className={`p-3.5 rounded-xl border flex items-start justify-between ${
            hasDpVerified
              ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-950"
              : "bg-slate-50/70 border-slate-200/80 text-slate-700"
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                Tahap 1: Uang Muka (DP {dpPercentage}%)
              </span>
              <div className="font-bold text-sm">
                {numericBudget > 0 ? formatRupiah(dpAmountEst) : `DP ${dpPercentage}%`}
              </div>
              <p className="text-[10px] leading-tight">
                {hasDpVerified ? "Dana telah masuk di rekening penyedia jasa" : "Kunci slot jadwal & persiapan produksi"}
              </p>
            </div>
            <div>
              {hasDpVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  <Check className="w-2.5 h-2.5" /> Lunas Sah
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-medium">
                  Belum Verifikasi
                </span>
              )}
            </div>
          </div>

          {/* Box Pelunasan */}
          <div className={`p-3.5 rounded-xl border flex items-start justify-between ${
            hasPelunasanVerified
              ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-950"
              : "bg-slate-50/70 border-slate-200/80 text-slate-700"
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                Tahap 2: Pelunasan Sisa ({100 - dpPercentage}%)
              </span>
              <div className="font-bold text-sm">
                {numericBudget > 0 ? formatRupiah(pelunasanAmountEst) : `Pelunasan ${100 - dpPercentage}%`}
              </div>
              <p className="text-[10px] leading-tight">
                {hasPelunasanVerified ? "Lunas 100% & Hak tayang komersial aktif" : "Sebelum penyerahan master resolusi penuh"}
              </p>
            </div>
            <div>
              {hasPelunasanVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  <Check className="w-2.5 h-2.5" /> Lunas 100%
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-medium">
                  Belum Lunas
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form Upload Slip oleh Requester */}
        {isOpenForm && isRequester && (
          <form onSubmit={handleSubmitSlip} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4 text-xs animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-slate-600" />
                <span>Form Konfirmasi Transfer Pembayaran</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">{refCode}</span>
            </div>

            {targetBankDetails && (targetBankDetails.accountNumber || targetBankDetails.bankName) && (
              <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900 space-y-0.5 text-[11px]">
                <span className="font-bold block">Rekening Tujuan Resmi Penyedia Jasa:</span>
                <div>Bank: <strong>{targetBankDetails.bankName}</strong> | No. Rek: <strong>{targetBankDetails.accountNumber}</strong> a.n <strong>{targetBankDetails.accountHolder}</strong></div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tahap Pembayaran *</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="DP">Uang Muka (DP {dpPercentage}%)</option>
                  <option value="PELUNASAN">Pelunasan Akhir ({100 - dpPercentage}%)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 block">Nominal yang Ditransfer *</label>
                  {((stage === "DP" && dpAmountEst > 0) || (stage === "PELUNASAN" && pelunasanAmountEst > 0)) && (
                    <button
                      type="button"
                      onClick={() => setAmount(formatRupiah(stage === "DP" ? dpAmountEst : pelunasanAmountEst))}
                      className="text-[11px] text-[#0284c7] hover:underline font-semibold cursor-pointer"
                    >
                      Isi Sesuai SPK ({formatRupiah(stage === "DP" ? dpAmountEst : pelunasanAmountEst)})
                    </button>
                  )}
                </div>
                <CurrencyInput
                  required
                  placeholder={stage === "DP" && numericBudget > 0 ? formatRupiah(dpAmountEst) : "Rp 2.500.000"}
                  value={amount}
                  onChange={(val) => setAmount(val)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bank Pengirim Anda *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA / Mandiri / BNI / CIMB"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Rekening Pengirim (Opsional)</label>
                <input
                  type="text"
                  placeholder="Nomor rekening (kosongkan jika via QRIS/E-Wallet)"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Pemilik Rekening Pengirim (Opsional)</label>
                <input
                  type="text"
                  placeholder="Nama pengirim sesuai mutasi bank"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Referensi Transaksi (RRN / Jurnal) (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 202610080123 (Kosongkan jika tidak ada)"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Tautan Bukti Slip Transfer (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... atau tautan gambar screenshot slip"
                  value={slipUrl}
                  onChange={(e) => setSlipUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Sudah ditransfer via BCA Mobile pada pk 14:15 WIB"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsOpenForm(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Kirim Bukti Transfer</span>
              </button>
            </div>
          </form>
        )}

        {/* Daftar Bukti Transfer yang Tersimpan */}
        {slips.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
            <p className="text-xs font-medium text-slate-600">
              Belum ada bukti transfer perbankan yang diunggah.
            </p>
            <p className="text-[10px] text-slate-400">
              {isRequester
                ? "Silakan klik tombol 'Unggah Bukti Transfer' di atas setelah melakukan transfer."
                : "Pemberi kerja akan mengunggah bukti transfer setelah transaksi diproses."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Riwayat Bukti Transfer &amp; Audit Status
            </div>

            {slips.map((slip) => {
              const isVerifyingThis = verifyingId === slip.id;
              const isPending = slip.status === "PENDING_VERIFICATION";
              const isVerified = slip.status === "VERIFIED";
              const isRejected = slip.status === "REJECTED";

              return (
                <div
                  key={slip.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isVerified
                      ? "bg-emerald-50/40 border-emerald-200"
                      : isRejected
                      ? "bg-rose-50/40 border-rose-200"
                      : "bg-white border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {slip.stage === "DP" ? `Uang Muka (DP ${dpPercentage}%)` : `Pelunasan (${100 - dpPercentage}%)`}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {slip.amount}
                      </span>
                    </div>

                    <div>
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Mutasi Terkonfirmasi Sah</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>Menunggu Cek Rekening Talenta</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Dana Belum Masuk / Ditolak</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rincian data rekening */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block font-medium">Bank Pengirim:</span>
                      <span className="font-semibold text-slate-800">{slip.bankName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">No. Rek / Pengirim:</span>
                      <span className="font-mono font-semibold text-slate-800">{slip.accountNumber}</span>
                      <span className="block text-[10px] text-slate-500">a.n {slip.accountHolder}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">No. Referensi (RRN):</span>
                      <span className="font-mono font-bold text-slate-900 break-all select-all">{slip.referenceNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Waktu Kirim:</span>
                      <span className="text-slate-600">
                        {new Date(slip.submittedAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </span>
                    </div>
                  </div>

                  {slip.slipUrl && (
                    <div className="pt-1">
                      <a
                        href={slip.slipUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                        <span>Buka Lampiran Gambar Slip Transfer</span>
                      </a>
                    </div>
                  )}

                  {slip.rejectionReason && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px]">
                      <strong>Alasan Penolakan Mutasi:</strong> {slip.rejectionReason}
                    </div>
                  )}

                  {/* Tombol aksi Talenta (Penyedia Jasa) untuk Konfirmasi Rekening */}
                  {isTarget && isPending && (
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[10px] text-slate-500">
                        Harap cek mutasi m-Banking Anda dengan nomor referensi di atas sebelum mengonfirmasi.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRejectModalSlipId(slip.id)}
                          disabled={isVerifyingThis}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Dana Belum Masuk / Tolak
                        </button>
                        <button
                          onClick={() => handleVerify(slip.id, true)}
                          disabled={isVerifyingThis}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          {isVerifyingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Konfirmasi Dana Masuk di Rekening</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Tolak / Koreksi Slip */}
      {rejectModalSlipId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-[22px] shadow-xl max-w-md w-full overflow-hidden space-y-0 text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/70">
              <span className="font-bold text-rose-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Klarifikasi Mutasi Rekening Belum Ditemukan</span>
              </span>
              <button
                onClick={() => setRejectModalSlipId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-slate-600 leading-relaxed">
                Jika dana belum masuk ke mutasi rekening Anda, mohon berikan alasan agar pihak pemesan dapat memeriksa ke pihak bank pengirim atau mengirimkan slip yang benar.
              </p>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alasan / Penjelasan *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Dicek pada mutasi pk 14:30 belum ada dana masuk dengan nominal atau ref tersebut..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalSlipId(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!rejectionReason.trim()}
                  onClick={() => handleVerify(rejectModalSlipId, false, rejectionReason)}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-50"
                >
                  Kirim Penolakan Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
