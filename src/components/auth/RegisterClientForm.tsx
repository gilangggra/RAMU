"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertCircle,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Building,
  Camera,
  Star,
  Brush,
  Package,
  ChevronDown,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { signup } from "@/app/(auth)/actions";

interface RegisterClientFormProps {
  initialError?: string;
  redirectTo?: string;
}

const FIVE_OFFICIAL_ROLES = [
  {
    role: "Fashion Brand/UMKM",
    badge: "Brand",
    icon: Building,
    desc: "Label mode & UMKM apparel",
    placeholder: "misal: Maison Nusantara",
    accent: "text-[#0284c7] bg-sky-50 border-sky-200/80",
  },
  {
    role: "Photographer",
    badge: "Kamera",
    icon: Camera,
    desc: "Fotografer fashion & editorial",
    placeholder: "misal: Lensa Kreatif Studio",
    accent: "text-indigo-600 bg-indigo-50 border-indigo-200/80",
  },
  {
    role: "Model",
    badge: "Talent",
    icon: Star,
    desc: "Model busana & peraga visual",
    placeholder: "misal: Clara Salsabila",
    accent: "text-rose-600 bg-rose-50 border-rose-200/80",
  },
  {
    role: "MUA/Stylist",
    badge: "Stylist",
    icon: Brush,
    desc: "Makeup artist & wardrobe stylist",
    placeholder: "misal: Glow & Form Artistry",
    accent: "text-purple-600 bg-purple-50 border-purple-200/80",
  },
  {
    role: "Studio",
    badge: "Ruang",
    icon: Package,
    desc: "Studio foto & ruang produksi",
    placeholder: "misal: Studio Imaji Space",
    accent: "text-amber-600 bg-amber-50 border-amber-200/80",
  },
];

const POPULAR_LOCATIONS = [
  "Jakarta Selatan, Indonesia",
  "Jakarta Pusat, Indonesia",
  "Jakarta Barat, Indonesia",
  "Jakarta Utara, Indonesia",
  "Jakarta Timur, Indonesia",
  "Tangerang / BSD, Banten",
  "Bandung, Jawa Barat",
  "DI Yogyakarta, Indonesia",
  "Denpasar & Canggu, Bali",
  "Surabaya, Jawa Timur",
  "Surakarta (Solo), Jawa Tengah",
  "Semarang, Jawa Tengah",
  "Medan, Sumatera Utara",
];

export function RegisterClientForm({ initialError, redirectTo }: RegisterClientFormProps) {
  const [selectedRole, setSelectedRole] = useState(FIVE_OFFICIAL_ROLES[0]);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [location, setLocation] = useState(POPULAR_LOCATIONS[0]);

  const [formError, setFormError] = useState(initialError || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!displayName.trim()) {
      setFormError("Nama profil / brand / studio wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Format alamat email tidak valid.");
      return;
    }
    if (password.length < 6) {
      setFormError("Kata sandi minimal harus 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    const formData = new FormData();
    formData.set("displayName", displayName.trim());
    formData.set("email", email.trim());
    formData.set("password", password);
    formData.set("role", selectedRole.role);
    formData.set("location", location);
    if (redirectTo) {
      formData.set("redirectTo", redirectTo);
    }

    startTransition(async () => {
      try {
        const res = await signup(formData);
        if (res?.error) {
          setFormError(res.error);
        }
      } catch (err: any) {
        if (err?.message?.includes("NEXT_REDIRECT")) {
          return;
        }
        setFormError(err?.message || "Gagal mendaftar akun. Silakan coba lagi.");
      }
    });
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 xl:p-7 shadow-[0_20px_50px_-15px_rgba(39,33,61,0.08)] relative text-[#27213D] space-y-3.5">
      
      {/* Decorative top accent glow */}
      <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-[#4CC9FE] to-transparent rounded-full pointer-events-none" />

      {/* Header Section */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
          Buat Akun Kreator RAMU
        </h2>
        <p className="text-xs text-[#716B7E] font-normal leading-relaxed">
          Pilih peran Anda dan lengkapi data profil untuk membuka workspace.
        </p>
      </div>

      {/* Feedback Alerts */}
      {formError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-fade-in font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{formError}</p>
        </div>
      )}

      {/* Step 1: Compact Role Selection Grid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-600">
          <span>1. Pilih Peran Ekosistem</span>
          <span className="text-[#0284c7] lowercase font-semibold">({selectedRole.role})</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {FIVE_OFFICIAL_ROLES.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole.role === item.role;

            return (
              <button
                key={item.role}
                type="button"
                onClick={() => {
                  setSelectedRole(item);
                  if (formError) setFormError("");
                }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative flex items-center gap-2 ${
                  isSelected
                    ? "bg-white border-2 border-[#4CC9FE] shadow-xs ring-2 ring-[#4CC9FE]/20"
                    : "bg-[#FAF8F5]/80 hover:bg-white border-stone-200/70 hover:border-[#4CC9FE]/40 text-stone-700"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.accent}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-[#27213D] leading-tight truncate">
                    {item.role}
                  </div>
                  <div className="text-[9px] text-[#716B7E] font-medium leading-none truncate mt-0.5">
                    {item.desc}
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-3 h-3 text-[#4CC9FE] shrink-0 stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Main Registration Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-0.5">
        
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
          2. Informasi Akun &amp; Lokasi
        </div>

        {/* Display Name Input */}
        <div className="space-y-1">
          <label htmlFor="displayName" className="block text-[10px] font-bold uppercase tracking-wider text-stone-600">
            Nama Profil / Label Brand / Studio *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder={selectedRole.placeholder}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs sm:text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Email & Location in Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-stone-600">
              Alamat Email *
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
                autoComplete="email"
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

          {/* Location */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600">
              Basis Lokasi / Kota *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-[#0284c7]" />
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-7 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs sm:text-sm text-[#27213D] appearance-none focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium cursor-pointer"
              >
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-white text-[#27213D]">
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Passwords in 2 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-stone-600">
                Kata Sandi *
              </label>
              <span className="text-[9px] text-stone-400">Min. 6 Karakter</span>
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
                minLength={6}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError("");
                }}
                placeholder="Buat kata sandi"
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs sm:text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                title={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-stone-600">
                Konfirmasi Sandi *
              </label>
              {confirmPassword.length > 0 && (
                <span className={`text-[9px] font-bold ${password === confirmPassword ? "text-emerald-600" : "text-rose-500"}`}>
                  {password === confirmPassword ? "✓ Cocok" : "✗ Beda"}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formError) setFormError("");
                }}
                placeholder="Ulangi kata sandi"
                className={`w-full pl-9 pr-8 py-2 rounded-xl bg-stone-50/80 text-xs sm:text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-2 transition-all font-medium border ${
                  confirmPassword.length > 0
                    ? password === confirmPassword
                      ? "border-emerald-500/70 focus:border-emerald-500 focus:ring-emerald-500/20"
                      : "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-stone-200 focus:border-[#4CC9FE] focus:ring-[#4CC9FE]/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                title={showConfirmPassword ? "Sembunyikan sandi" : "Lihat sandi"}
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 sm:py-3 px-6 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-[#4CC9FE]/30 hover:shadow-lg hover:shadow-[#4CC9FE]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group mt-1.5"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Mendaftarkan Akun Anda...</span>
            </>
          ) : (
            <>
              <span>Daftar Akun &amp; Buka Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Login Link & Back Action */}
      <div className="pt-1 text-center space-y-1.5 border-t border-stone-100">
        <div className="text-xs text-[#716B7E]">
          Sudah memiliki akun terdaftar?{" "}
          <Link
            href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"}
            className="font-bold text-[#0284c7] hover:text-[#27213D] underline underline-offset-4 decoration-[#4CC9FE]/40 hover:decoration-[#4CC9FE] transition-colors"
          >
            Masuk ke akun Anda →
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

      {/* Security Footnote */}
      <div className="pt-1 flex items-center justify-center gap-1.5 text-[9px] text-stone-400">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span>Terproteksi Enkripsi Supabase Auth • SPK Terverifikasi</span>
      </div>

    </div>
  );
}
