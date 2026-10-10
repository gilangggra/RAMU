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
  Smartphone,
  Laptop,
} from "lucide-react";
import { updatePasswordAction } from "@/app/settings/actions";
import { logout } from "@/app/(auth)/actions";

interface SecurityFormProps {
  email: string;
}

export function SecurityForm({ email }: SecurityFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Kata sandi minimal harus 6 karakter." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    const res = await updatePasswordAction(formData);
    setIsLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message || "Kata sandi berhasil diperbarui." });
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setMessage({ type: "error", text: res.error || "Gagal memperbarui kata sandi." });
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
          <span>Keamanan &amp; Akun Login</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#716B7E] leading-relaxed">
          Kelola kredensial akun, kata sandi, dan sesi perangkat yang terhubung ke platform RAMU.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Email Card */}
      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-3">
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
      </div>

      {/* Change Password Card */}
      <form onSubmit={handlePasswordChange} className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <span className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/60 inline-flex">
            <KeyRound className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
            Ubah Kata Sandi
          </h3>
        </div>

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
            disabled={isLoading || !newPassword}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#4CC9FE]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
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
            <div className="text-[11px] text-[#716B7E] mt-0.5">Akses terenkripsi SSL 256-bit Supabase Auth</div>
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
    </div>
  );
}
