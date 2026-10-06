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
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-stone-700" />
          <span>Keamanan &amp; Akun Login</span>
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          Kelola kredensial akun, kata sandi, dan sesi perangkat yang terhubung ke platform RAMU.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-fade-in ${
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
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span>Email Akun Terdaftar</span>
            </span>
            <p className="text-xs font-mono font-medium text-stone-600">{email}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Terverifikasi</span>
          </span>
        </div>
      </div>

      {/* Change Password Card */}
      <form onSubmit={handlePasswordChange} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <KeyRound className="w-4 h-4 text-stone-600" />
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Ubah Kata Sandi
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-stone-900 focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-stone-900 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !newPassword}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memperbarui...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-stone-300" />
                <span>Simpan Kata Sandi Baru</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Active Session & Logout */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-stone-600" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Sesi Perangkat Aktif
            </h3>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sedang Digunakan
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-600">
          <div>
            <div className="font-semibold text-stone-900">Peramban Web Aktif Saat Ini</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Akses terenkripsi SSL 256-bit Supabase Auth</div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200/80 hover:bg-rose-100 transition-colors cursor-pointer"
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
