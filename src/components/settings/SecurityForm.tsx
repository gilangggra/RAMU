"use client";

import React, { useState } from "react";
import {
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  LogOut,
  Laptop,
  EyeOff,
  Download,
  Trash2,
  FileText,
  Shield,
  Smartphone,
  Info,
} from "lucide-react";
import {
  updatePasswordAction,
  updatePrivacySettingsAction,
  exportUserDataAction,
  requestAccountDeletionAction,
} from "@/app/settings/actions";
import { logout } from "@/app/(auth)/actions";

interface SecurityFormProps {
  email: string;
  initialPrivacy?: {
    hideContactPhone?: boolean;
    hideContactEmail?: boolean;
    verifiedOnlyInquiry?: boolean;
  };
  hasActorProfile?: boolean;
}

export function SecurityForm({
  email,
  initialPrivacy,
  hasActorProfile = true,
}: SecurityFormProps) {
  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Privacy toggles state
  const [hideContactPhone, setHideContactPhone] = useState<boolean>(
    initialPrivacy?.hideContactPhone ?? false
  );
  const [hideContactEmail, setHideContactEmail] = useState<boolean>(
    initialPrivacy?.hideContactEmail ?? false
  );
  const [verifiedOnlyInquiry, setVerifiedOnlyInquiry] = useState<boolean>(
    initialPrivacy?.verifiedOnlyInquiry ?? false
  );
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Data Subject Rights state (UU PDP)
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Kata sandi minimal harus 6 karakter.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Konfirmasi kata sandi tidak cocok.",
      });
      return;
    }

    setIsPasswordLoading(true);
    setPasswordMessage(null);

    const formData = new FormData();
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    const res = await updatePasswordAction(formData);
    setIsPasswordLoading(false);

    if (res.success) {
      setPasswordMessage({
        type: "success",
        text: res.message || "Kata sandi berhasil diperbarui.",
      });
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage({
        type: "error",
        text: res.error || "Gagal memperbarui kata sandi.",
      });
    }
  }

  async function handlePrivacySave(e: React.FormEvent) {
    e.preventDefault();
    setIsPrivacyLoading(true);
    setPrivacyMessage(null);

    const formData = new FormData();
    formData.append("hideContactPhone", String(hideContactPhone));
    formData.append("hideContactEmail", String(hideContactEmail));
    formData.append("verifiedOnlyInquiry", String(verifiedOnlyInquiry));

    const res = await updatePrivacySettingsAction(formData);
    setIsPrivacyLoading(false);

    if (res.success) {
      setPrivacyMessage({
        type: "success",
        text: res.message || "Preferensi privasi berhasil disimpan.",
      });
    } else {
      setPrivacyMessage({
        type: "error",
        text: res.error || "Gagal menyimpan preferensi privasi.",
      });
    }
  }

  async function handleExportUserData() {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const res = await exportUserDataAction();
      if (res.success && res.data) {
        const jsonString = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ramu-data-pribadi-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setExportMessage("Salinan data pribadi Anda (.JSON) berhasil diunduh.");
      } else {
        setExportMessage(res.error || "Gagal mengekspor data akun.");
      }
    } catch {
      setExportMessage("Terjadi kendala saat menyiapkan berkas ekspor.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText.trim().toUpperCase() !== "HAPUS") {
      setDeleteMessage({
        type: "error",
        text: "Ketik kata 'HAPUS' untuk mengonfirmasi penutupan akun.",
      });
      return;
    }

    setIsDeleting(true);
    setDeleteMessage(null);

    const res = await requestAccountDeletionAction();
    setIsDeleting(false);

    if (res.success) {
      setDeleteMessage({
        type: "success",
        text: res.message || "Akun dan data sensitif berhasil dinonaktifkan.",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } else {
      setDeleteMessage({
        type: "error",
        text: res.error || "Gagal memproses permohonan penghapusan.",
      });
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-[#27213D] tracking-tight flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/60 inline-flex">
            <Lock className="w-4 h-4" />
          </span>
          <span>Keamanan, Privasi &amp; Data Pribadi</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#716B7E] leading-relaxed">
          Kelola kredensial akun, kata sandi, visibilitas kontak publik, serta hak perlindungan data Anda sesuai UU Perlindungan Data Pribadi (UU PDP No. 27/2022).
        </p>
      </div>

      {/* Account Email & Trust Card */}
      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#27213D] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#716B7E]" />
              <span>Email Akun Terdaftar</span>
            </span>
            <p className="text-xs font-mono font-bold text-[#27213D]">{email}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terverifikasi</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
          <div className="text-xs text-sky-950 space-y-0.5">
            <p className="font-bold">Standar Enkripsi &amp; Keamanan Transaksi RAMU</p>
            <p className="text-sky-800/90 text-[11px] leading-relaxed">
              Seluruh sesi transmisi data dilindungi enkripsi SSL 256-bit. Nomor Pokok Wajib Pajak (NPWP / NIK) dan detail rekening bank disimpan terenkripsi di server dan disamarkan secara ketat (masked) pada dokumen publik &amp; invoice e-Bupot.
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <form
        onSubmit={handlePasswordChange}
        className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <span className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/60 inline-flex">
            <KeyRound className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
            Ubah Kata Sandi
          </h3>
        </div>

        {passwordMessage && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
              passwordMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {passwordMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#27213D] mb-1.5">
              Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-[#27213D] text-xs font-medium focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 focus:outline-hidden transition-all placeholder:text-[#716B7E]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#27213D] mb-1.5">
              Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-[#27213D] text-xs font-medium focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 focus:outline-hidden transition-all placeholder:text-[#716B7E]/50"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPasswordLoading || !newPassword}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#4CC9FE]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isPasswordLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memperbarui...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Simpan Kata Sandi Baru</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Privacy & Public Contact Control (UU PDP Anti-Harassment & Anti-Spam) */}
      {hasActorProfile && (
        <form
          onSubmit={handlePrivacySave}
          className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-5"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <span className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/60 inline-flex">
              <EyeOff className="w-3.5 h-3.5" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
                Kendali Privasi &amp; Kontak Publik
              </h3>
              <p className="text-[11px] text-[#716B7E]">
                Lindungi nomor pribadi talenta dari spam, penipuan, dan kontak tak berizin di internet.
              </p>
            </div>
          </div>

          {privacyMessage && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
                privacyMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {privacyMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{privacyMessage.text}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Toggle 1: Sembunyikan Nomor Telepon & WhatsApp */}
            <label className="flex items-start justify-between gap-4 p-3.5 rounded-2xl border border-stone-200/70 hover:border-[#4CC9FE]/40 transition-colors cursor-pointer bg-stone-50/40">
              <div className="space-y-1 pr-2">
                <span className="text-xs font-bold text-[#27213D] block">
                  Sembunyikan Nomor Telepon &amp; WhatsApp dari Profil Direktori
                </span>
                <span className="text-[11px] text-[#716B7E] leading-relaxed block">
                  Saat diaktifkan, nomor telepon Anda tidak terlihat publik dan tombol WhatsApp eksternal disembunyikan. Klien dan brand wajib menggunakan sistem <strong>Chat &amp; Booking Resmi RAMU</strong> yang terverifikasi dan terlindungi SPK.
                </span>
              </div>
              <input
                type="checkbox"
                checked={hideContactPhone}
                onChange={(e) => setHideContactPhone(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[#4CC9FE] focus:ring-[#4CC9FE] border-stone-300 shrink-0 cursor-pointer"
              />
            </label>

            {/* Toggle 2: Sembunyikan Email Kontak */}
            <label className="flex items-start justify-between gap-4 p-3.5 rounded-2xl border border-stone-200/70 hover:border-[#4CC9FE]/40 transition-colors cursor-pointer bg-stone-50/40">
              <div className="space-y-1 pr-2">
                <span className="text-xs font-bold text-[#27213D] block">
                  Sembunyikan Email Kontak dari Pengunjung Publik
                </span>
                <span className="text-[11px] text-[#716B7E] leading-relaxed block">
                  Mencegah bot crawler dan spammer luar mengambil alamat email Anda dari halaman direktori publik.
                </span>
              </div>
              <input
                type="checkbox"
                checked={hideContactEmail}
                onChange={(e) => setHideContactEmail(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[#4CC9FE] focus:ring-[#4CC9FE] border-stone-300 shrink-0 cursor-pointer"
              />
            </label>

            {/* Toggle 3: Wajibkan Akun Terverifikasi */}
            <label className="flex items-start justify-between gap-4 p-3.5 rounded-2xl border border-stone-200/70 hover:border-[#4CC9FE]/40 transition-colors cursor-pointer bg-stone-50/40">
              <div className="space-y-1 pr-2">
                <span className="text-xs font-bold text-[#27213D] block">
                  Hanya Terima Brief &amp; Booking dari Brand/Kreator Terverifikasi
                </span>
                <span className="text-[11px] text-[#716B7E] leading-relaxed block">
                  Menyaring proyek masuk agar hanya klien dengan lencana verifikasi identitas resmi RAMU yang dapat memulai transaksi booking langsung dengan Anda.
                </span>
              </div>
              <input
                type="checkbox"
                checked={verifiedOnlyInquiry}
                onChange={(e) => setVerifiedOnlyInquiry(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[#4CC9FE] focus:ring-[#4CC9FE] border-stone-300 shrink-0 cursor-pointer"
              />
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isPrivacyLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#27213D] hover:bg-[#1f1a30] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isPrivacyLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4CC9FE]" />
                  <span>Simpan Pengaturan Privasi</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* UU PDP Compliance & Data Subject Rights Card */}
      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex">
            <Shield className="w-3.5 h-3.5" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
              Hak Subjek Data Pribadi (UU PDP No. 27/2022)
            </h3>
            <p className="text-[11px] text-[#716B7E]">
              RAMU menjamin hak portabilitas, transparansi, dan hak penghapusan data pengguna.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Hak Akses & Portabilitas Data (Pasal 23 UU PDP) */}
          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#27213D] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Hak Portabilitas Data (Pasal 23 UU PDP)</span>
              </span>
              <p className="text-[11px] text-[#716B7E]">
                Unduh salinan arsip digital seluruh data profil, portofolio, dan riwayat booking Anda dalam format JSON terstruktur.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportUserData}
              disabled={isExporting}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-stone-200 hover:border-[#4CC9FE] hover:text-[#0284c7] text-[#27213D] text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengekspor...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Data (.JSON)</span>
                </>
              )}
            </button>
          </div>

          {exportMessage && (
            <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200/60">
              {exportMessage}
            </p>
          )}

          {/* Hak Penghapusan Data (Pasal 24 UU PDP) */}
          <div className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Hak Penghapusan / Penutupan Akun (Pasal 24 UU PDP)</span>
              </span>
              <p className="text-[11px] text-rose-800/80">
                Nonaktifkan profil publik dan hapus permanen data sensitif rekening &amp; NPWP/NIK Anda dari direktori RAMU.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Tutup Akun &amp; Hapus Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Session & Logout */}
      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/60 inline-flex">
              <Laptop className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
              Sesi Perangkat Aktif
            </h3>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sedang Digunakan
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#716B7E]">
          <div>
            <div className="font-bold text-[#27213D]">Peramban Web Aktif Saat Ini</div>
            <div className="text-[11px] text-[#716B7E] mt-0.5">
              Akses aman terenkripsi TLS 1.3 / AES-256 Supabase Auth Guard
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dari Akun</span>
            </button>
          </form>
        </div>
      </div>

      {/* Modal Dialog: Konfirmasi Penutupan Akun */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-[24px] p-6 shadow-2xl border border-stone-200 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#27213D]">
                  Konfirmasi Penutupan Akun &amp; Penghapusan Data
                </h4>
                <p className="text-[11px] text-[#716B7E]">
                  Sesuai Hak Menghapus Data (Pasal 24 UU PDP No. 27/2022)
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs text-rose-900 space-y-1.5">
              <p className="font-bold">Konsekuensi tindakan:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-800">
                <li>Profil kreator Anda akan segera diarsipkan dari direktori publik RAMU.</li>
                <li>Data rekening pencairan dan nomor pokok pajak (NPWP/NIK) akan dihapus permanen.</li>
                <li>Kontrak SPK yang telah selesai tetap disimpan sesuai kewajiban hukum perpajakan transaksi komersial.</li>
              </ul>
            </div>

            {deleteMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold ${
                  deleteMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {deleteMessage.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#27213D] mb-1.5">
                Ketik <span className="font-mono text-rose-600">HAPUS</span> di bawah ini untuk konfirmasi:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="HAPUS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-[#27213D] focus:bg-white focus:border-rose-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setDeleteMessage(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold text-[#716B7E] hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== "HAPUS"}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Konfirmasi Tutup Akun</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
