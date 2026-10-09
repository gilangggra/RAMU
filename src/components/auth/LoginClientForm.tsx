"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "@/app/(auth)/actions";
import { AlertCircle, CheckCircle2, Mail, Lock, ArrowRight, ArrowLeft, Sparkles, KeyRound, Eye, EyeOff, Check } from "lucide-react";
import { RamuLogo } from "@/components/brand/RamuLogo";

interface LoginClientFormProps {
  error?: string;
  message?: string;
  redirectTo?: string;
}

const DEMO_ACCOUNTS = [
  { email: "brand@ramu.id", pass: "password123", role: "Fashion Brand/UMKM", name: "Nala The Label" },
  { email: "photographer@ramu.id", pass: "password123", role: "Photographer", name: "Lensa Kreatif" },
  { email: "model@ramu.id", pass: "password123", role: "Model", name: "Go Young Jung" },
  { email: "mua@ramu.id", pass: "password123", role: "MUA/Stylist", name: "Glow & Form" },
  { email: "studio@ramu.id", pass: "password123", role: "Studio", name: "Studio Imaji" },
  { email: "bernadya@gmail.com", pass: "password123", role: "Administrator", name: "bernadya (Admin)" },
];

export function LoginClientForm({ error, message, redirectTo = "/dashboard" }: LoginClientFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(error || "");
  const [demoNotice, setDemoNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function fillDemoAccount(demoEmail: string, demoPass: string, label: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFormError("");
    setDemoNotice(`Akun ${label} diterapkan. Silakan klik tombol "Masuk ke Workspace".`);
    setTimeout(() => setDemoNotice(null), 5000);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password) {
      setFormError("Email dan kata sandi wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.set("email", email.trim());
    formData.set("password", password);
    formData.set("redirectTo", redirectTo);

    startTransition(async () => {
      try {
        const res = await login(formData);
        if (res?.error) {
          setFormError(res.error);
        }
      } catch (err: any) {
        if (err?.message?.includes("NEXT_REDIRECT")) {
          return;
        }
        setFormError(err?.message || "Gagal masuk ke workspace. Silakan periksa kredensial Anda.");
      }
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/85 backdrop-blur-2xl border border-white/90 rounded-[28px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(28,40,70,0.06)] relative text-slate-900 space-y-4">

      {/* Header Form */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RamuLogo size={32} theme="dark" variant="horizontal" />
        </div>
        <Link
          href="/"
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100/80 transition-colors"
          title="Kembali ke Beranda"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Masuk ke Workspace
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Akses mesin analitik sinergi dan kolaborasi proyek studio Anda.
        </p>
      </div>

      {/* Akun Demo Cepat */}
      <div className="p-3 rounded-xl bg-white/70 border border-slate-200/80 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5 text-blue-700">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Pilih 1 Akun Resmi (Demo &amp; Juri)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-normal">Klik untuk mengisi</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100">
          {DEMO_ACCOUNTS.map((acc) => {
            const isSelected = email.toLowerCase() === acc.email.toLowerCase();
            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemoAccount(acc.email, acc.pass, `${acc.name} (${acc.role})`)}
                className={`px-2.5 py-1.5 rounded-lg text-left transition-all group cursor-pointer border ${
                  isSelected
                    ? "bg-white border-2 border-[#4CC9FE] text-slate-900 shadow-xs ring-1 ring-[#4CC9FE]/20"
                    : "bg-white/70 hover:bg-white hover:border-[#4CC9FE]/30 border-slate-200/70 text-slate-700"
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span className={`truncate ${isSelected ? "text-blue-700" : "text-slate-800 group-hover:text-blue-600"}`}>
                    {acc.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <span className="text-[9px] text-blue-600 font-semibold">{acc.role}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue-600 stroke-[3]" />}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
              </button>
            );
          })}
        </div>
      </div>

      {demoNotice && (
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2 animate-in fade-in duration-200 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{demoNotice}</p>
        </div>
      )}

      {formError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in duration-200 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{formError}</p>
        </div>
      )}

      {message && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in duration-200 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-700"
          >
            Alamat Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="nama@studioanda.id"
              className="w-full pl-8.5 pr-3 py-2 rounded-xl bg-white/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-700"
            >
              Kata Sandi
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="Masukkan kata sandi"
              className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-white/70 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Tombol Standar & Rapi */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 rounded-xl bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#4CC9FE]/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Memverifikasi Akses...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Workspace</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </form>

      <div className="pt-1 text-center text-xs text-slate-500">
        Belum memiliki akun terdaftar?{" "}
        <Link
          href="/register"
          className="font-bold text-[#0284c7] hover:text-[#0369a1] hover:underline"
        >
          Daftar akun baru →
        </Link>
      </div>
    </div>
  );
}
