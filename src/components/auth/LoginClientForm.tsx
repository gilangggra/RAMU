"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "@/app/(auth)/actions";
import { 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Eye, 
  EyeOff, 
  ShieldCheck 
} from "lucide-react";

interface LoginClientFormProps {
  error?: string;
  message?: string;
  redirectTo?: string;
}

export function LoginClientForm({ error, message, redirectTo = "/dashboard" }: LoginClientFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState(error || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password) {
      setFormError("Email dan kata sandi wajib diisi.");
      return;
    }

    const isAdminEmail =
      email.trim().toLowerCase() === "bernadya@gmail.com" ||
      email.trim().toLowerCase() === "admin@ramu.id";

    const formData = new FormData();
    formData.set("email", email.trim());
    formData.set("password", password);
    formData.set("redirectTo", isAdminEmail ? "/admin" : redirectTo);

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
        setFormError(err?.message || "Gagal masuk ke akun. Silakan periksa kredensial Anda.");
      }
    });
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-[24px] sm:rounded-[28px] p-6 sm:p-7 xl:p-8 shadow-[0_20px_50px_-15px_rgba(39,33,61,0.08)] relative text-[#27213D] space-y-4 sm:space-y-5">
      
      {/* Decorative top accent glow */}
      <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-[#4CC9FE] to-transparent rounded-full pointer-events-none" />

      {/* Header Title Section */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
          Masuk ke Akun Anda
        </h2>
        <p className="text-xs sm:text-sm text-[#716B7E] font-normal leading-relaxed">
          Silakan masukkan alamat email dan kata sandi akun RAMU Anda untuk melanjutkan.
        </p>
      </div>

      {/* Feedback Alerts */}
      {formError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-fade-in font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{formError}</p>
        </div>
      )}

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{message}</p>
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* Email Input */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-[11px] font-bold uppercase tracking-wider text-stone-600"
          >
            Alamat Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="nama@studioanda.id"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-[11px] font-bold uppercase tracking-wider text-stone-600"
            >
              Kata Sandi
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="Masukkan kata sandi Anda"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between text-xs text-stone-600 pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#4CC9FE] border-stone-300 focus:ring-[#4CC9FE]/30 cursor-pointer"
            />
            <span>Ingat saya</span>
          </label>
          <span className="text-[11px] text-stone-400">Proteksi Enkripsi SSL</span>
        </div>

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-6 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-md shadow-[#4CC9FE]/30 hover:shadow-lg hover:shadow-[#4CC9FE]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Memverifikasi Akses...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Register Link & Back Action */}
      <div className="pt-2 text-center space-y-2 border-t border-stone-100">
        <div className="text-xs text-[#716B7E]">
          Belum memiliki akun terdaftar?{" "}
          <Link
            href="/register"
            className="font-bold text-[#0284c7] hover:text-[#27213D] underline underline-offset-4 decoration-[#4CC9FE]/40 hover:decoration-[#4CC9FE] transition-colors"
          >
            Daftar akun baru — Gratis →
          </Link>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-stone-700 transition-colors py-1 px-3 rounded-lg hover:bg-stone-100/70"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Batal &amp; kembali ke beranda</span>
          </Link>
        </div>
      </div>

      {/* Security & Verification Footnote */}
      <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Terproteksi Enkripsi Supabase Auth • SPK Terverifikasi</span>
      </div>

    </div>
  );
}
