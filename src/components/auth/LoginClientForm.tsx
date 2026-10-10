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
  Sparkles, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check,
  Shield,
  Camera,
  Building,
  User,
  Palette,
  RotateCcw,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import { RamuLogo } from "@/components/brand/RamuLogo";

interface LoginClientFormProps {
  error?: string;
  message?: string;
  redirectTo?: string;
}

const DEMO_ACCOUNTS = [
  { 
    email: "brand@ramu.id", 
    pass: "password123", 
    role: "Brand Mode", 
    name: "Nala The Label", 
    tag: "Brand Fashion",
    icon: Palette,
    accent: "text-[#0284c7] bg-sky-50 border-sky-200/80" 
  },
  { 
    email: "photographer@ramu.id", 
    pass: "password123", 
    role: "Fotografer", 
    name: "Lensa Kreatif", 
    tag: "Visual Director",
    icon: Camera,
    accent: "text-indigo-600 bg-indigo-50 border-indigo-200/80" 
  },
  { 
    email: "studio@ramu.id", 
    pass: "password123", 
    role: "Studio Foto", 
    name: "Studio Imaji", 
    tag: "Cyclorama Space",
    icon: Building,
    accent: "text-amber-600 bg-amber-50 border-amber-200/80" 
  },
  { 
    email: "model@ramu.id", 
    pass: "password123", 
    role: "Model", 
    name: "Go Young Jung", 
    tag: "Fashion Talent",
    icon: User,
    accent: "text-rose-600 bg-rose-50 border-rose-200/80" 
  },
  { 
    email: "mua@ramu.id", 
    pass: "password123", 
    role: "Stylist/MUA", 
    name: "Glow & Form", 
    tag: "Artistry & Hair",
    icon: Sparkles,
    accent: "text-purple-600 bg-purple-50 border-purple-200/80" 
  },
  { 
    email: "bernadya@gmail.com", 
    pass: "123456", 
    role: "Admin RAMU", 
    name: "Admin Portal", 
    tag: "Super Admin",
    icon: Shield,
    accent: "text-emerald-600 bg-emerald-50 border-emerald-200/80" 
  },
];

export function LoginClientForm({ error, message, redirectTo = "/dashboard" }: LoginClientFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState(error || "");
  const [activePersona, setActivePersona] = useState<typeof DEMO_ACCOUNTS[0] | null>(null);
  const [showForgotTip, setShowForgotTip] = useState(false);
  const [isPending, startTransition] = useTransition();

  function fillDemoAccount(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email);
    setPassword(acc.pass);
    setActivePersona(acc);
    setFormError("");
  }

  function clearPersona() {
    setEmail("");
    setPassword("");
    setActivePersona(null);
    setFormError("");
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
    <div className="w-full bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 xl:p-6 shadow-[0_20px_50px_-15px_rgba(39,33,61,0.08)] relative text-[#27213D] space-y-2.5 sm:space-y-3">
      
      {/* Decorative top accent glow */}
      <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-[#4CC9FE] to-transparent rounded-full pointer-events-none" />

      {/* Header Title Section */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200/60 text-[9px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4CC9FE] animate-pulse" />
            <span>Workspace ID Access</span>
          </div>

          <span className="text-[10px] font-medium text-stone-400">
            Versi 2.4
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-[#27213D] tracking-tight">
          Masuk ke Workspace
        </h2>
        <p className="text-[11px] sm:text-xs text-[#716B7E] font-normal leading-tight">
          Pilih akun demo (1-klik isi cepat) atau masukkan email Anda.
        </p>
      </div>

      {/* Creative 1-Click Role Switcher Deck (Compact & Clean) */}
      <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1 text-[#0284c7]">
            <KeyRound className="w-3 h-3 text-[#4CC9FE]" />
            <span>Akses Cepat Penguji &amp; Juri</span>
          </span>
          <span className="text-[9px] font-semibold text-stone-400">1-Klik Auto-Fill</span>
        </div>

        {/* 6-Role Creative Persona Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {DEMO_ACCOUNTS.map((acc) => {
            const isSelected = email.toLowerCase() === acc.email.toLowerCase();
            const Icon = acc.icon;
            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemoAccount(acc)}
                className={`p-1.5 sm:p-2 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between border ${
                  isSelected
                    ? "bg-white border-2 border-[#4CC9FE] text-[#0284c7] shadow-xs ring-2 ring-[#4CC9FE]/20"
                    : "bg-white/80 hover:bg-white hover:border-[#4CC9FE]/40 border-stone-200/70 text-stone-700"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${acc.accent}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold truncate leading-tight text-[#27213D]">
                      {acc.name}
                    </div>
                    <div className="text-[9px] text-stone-400 font-medium truncate leading-none mt-0.5">
                      {acc.role}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-3 h-3 text-[#4CC9FE] shrink-0 stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Persona Confirmation Banner */}
        {activePersona && (
          <div className="pt-1.5 border-t border-stone-200/60 flex items-center justify-between gap-2 text-[11px] animate-fade-in">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate text-stone-700">
                Akun aktif: <strong className="text-[#27213D]">{activePersona.name}</strong> ({activePersona.role})
              </span>
            </div>
            <button
              type="button"
              onClick={clearPersona}
              className="text-[10px] font-bold text-stone-400 hover:text-stone-700 inline-flex items-center gap-1 shrink-0 cursor-pointer hover:underline"
              title="Ketik manual kredensial lain"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Feedback Alerts */}
      {formError && (
        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-fade-in font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{formError}</p>
        </div>
      )}

      {message && (
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{message}</p>
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        
        {/* Email Input */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-[10px] font-bold uppercase tracking-wider text-stone-600"
          >
            Alamat Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
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
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs sm:text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-[10px] font-bold uppercase tracking-wider text-stone-600"
            >
              Kata Sandi
            </label>
            <button
              type="button"
              onClick={() => setShowForgotTip(!showForgotTip)}
              className="text-[10px] text-[#0284c7] hover:text-[#0369a1] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Bantuan Sandi?</span>
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
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
              placeholder="Masukkan kata sandi Anda"
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs sm:text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Password Helper Notice */}
          {showForgotTip && (
            <div className="p-2 rounded-lg bg-sky-50/90 border border-sky-200 text-[10px] text-sky-800 animate-fade-in leading-snug">
              💡 <strong>Akun Demo:</strong> Gunakan kata sandi <code className="font-mono bg-white px-1 py-0.5 rounded border border-sky-300">password123</code> (atau <code className="font-mono bg-white px-1 py-0.5 rounded border border-sky-300">123456</code> untuk Admin).
            </div>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between text-[11px] text-stone-600">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#4CC9FE] border-stone-300 focus:ring-[#4CC9FE]/30 cursor-pointer"
            />
            <span>Ingat saya</span>
          </label>
          <span className="text-[10px] text-stone-400">Proteksi SSL 256-bit</span>
        </div>

        {/* Submit CTA Button - Vibrant RAMU Blue (#4CC9FE) */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 sm:py-3 px-6 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-[#4CC9FE]/30 hover:shadow-lg hover:shadow-[#4CC9FE]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Memverifikasi Akses...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Register Link */}
      <div className="pt-1 text-center text-[11px] text-[#716B7E]">
        Belum memiliki akun terdaftar?{" "}
        <Link
          href="/register"
          className="font-bold text-[#0284c7] hover:text-[#27213D] underline underline-offset-4 decoration-[#4CC9FE]/40 hover:decoration-[#4CC9FE] transition-colors"
        >
          Daftar akun baru — Gratis →
        </Link>
      </div>

      {/* Security & Verification Footnote */}
      <div className="pt-1 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[9px] text-stone-400">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span>Terproteksi Enkripsi Supabase Auth • SPK Terverifikasi</span>
      </div>

    </div>
  );
}


