"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/app/(auth)/actions";
import { AlertCircle, CheckCircle2, Mail, Lock, ArrowRight, Sparkles, KeyRound } from "lucide-react";

interface LoginClientFormProps {
  error?: string;
  message?: string;
  redirectTo?: string;
}

export function LoginClientForm({ error, message, redirectTo = "/dashboard" }: LoginClientFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  function fillDemoAccount(demoEmail: string, demoPass: string, label: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setDemoNotice(`Akun ${label} diterapkan. Silakan klik tombol "Masuk ke Workspace".`);
    setTimeout(() => setDemoNotice(null), 6000);
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-[#171523]/90 backdrop-blur-xl border border-stone-800/90 rounded-[32px] p-8 sm:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all space-y-6">
      {/* Precision corner marks */}
      <div className="absolute top-4 left-4 text-[10px] font-mono font-bold text-stone-700 select-none">┌</div>
      <div className="absolute top-4 right-4 text-[10px] font-mono font-bold text-stone-700 select-none">┐</div>
      <div className="absolute bottom-4 left-4 text-[10px] font-mono font-bold text-stone-700 select-none">└</div>
      <div className="absolute bottom-4 right-4 text-[10px] font-mono font-bold text-stone-700 select-none">┘</div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Workspace Access</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
          Masuk ke Workspace
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm mx-auto">
          Akses mesin analitik sinergi, portofolio kreatif, dan kolaborasi proyek studio Anda
        </p>
      </div>

      {/* Quick Demo Helper for Competition / Jury */}
      <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400">
          <span className="flex items-center gap-1.5 text-amber-300">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Akses Cepat Pengujian / Demo</span>
          </span>
          <span className="text-[10px] text-stone-500 font-normal">Klik untuk mengisi</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount("demo@ramu.id", "Password123!", "Demo Curator")}
            className="px-3 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 hover:border-amber-400/40 border border-stone-700/60 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-stone-200 group-hover:text-amber-300 flex items-center justify-between">
              <span>Demo Curator</span>
              <span className="text-[10px] text-stone-500">1-Klik</span>
            </div>
            <div className="text-[10px] text-stone-400 truncate">demo@ramu.id</div>
          </button>

          <button
            type="button"
            onClick={() => fillDemoAccount("studiodemo@ramu.id", "password123", "Studio Demo")}
            className="px-3 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 hover:border-amber-400/40 border border-stone-700/60 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-stone-200 group-hover:text-amber-300 flex items-center justify-between">
              <span>Studio Demo</span>
              <span className="text-[10px] text-stone-500">1-Klik</span>
            </div>
            <div className="text-[10px] text-stone-400 truncate">studiodemo@ramu.id</div>
          </button>
        </div>
      </div>

      {demoNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-300 flex items-start gap-2.5 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{demoNotice}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{error}</p>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{message}</p>
        </div>
      )}

      <form action={login} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-wider text-stone-300"
          >
            Alamat Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@studioanda.id"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#110F1A] border border-stone-800 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-stone-300"
            >
              Kata Sandi
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#110F1A] border border-stone-800 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 px-6 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-stone-950 font-black text-sm tracking-wide shadow-[0_8px_24px_rgba(251,191,36,0.3)] transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer mt-3"
        >
          <span>Masuk ke Workspace</span>
          <ArrowRight className="w-4 h-4 text-stone-950" />
        </button>
      </form>

      <div className="pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-stone-400">
          Belum memiliki akun terdaftar?
        </span>
        <Link
          href="/register"
          className="font-bold text-amber-300 hover:text-amber-200 underline decoration-amber-400/40 decoration-2 transition-colors"
        >
          Daftar akun baru →
        </Link>
      </div>
    </div>
  );
}
