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
  Scissors,
  Star,
  Brush,
  Package,
  Building,
  Camera,
  ChevronDown,
  Mail,
  Lock,
  Sparkles,
} from "lucide-react";
import { signup } from "@/app/(auth)/actions";

interface RegisterClientFormProps {
  initialError?: string;
  redirectTo?: string;
}

const FIVE_OFFICIAL_ROLES = [
  {
    role: "Fashion Brand/UMKM",
    badge: "Brand & Klien",
    icon: Building,
    desc: "Label mode & apparel",
    placeholder: "misal: Maison Nusantara",
  },
  {
    role: "Photographer",
    badge: "Visual & Kamera",
    icon: Camera,
    desc: "Fotografer fashion & editorial",
    placeholder: "misal: Lensa Kreatif Studio",
  },
  {
    role: "Model",
    badge: "Model & Muse",
    icon: Star,
    desc: "Talent visual & muse busana",
    placeholder: "misal: Clara Salsabila",
  },
  {
    role: "MUA/Stylist",
    badge: "Beauty & Style",
    icon: Brush,
    desc: "Makeup & wardrobe stylist",
    placeholder: "misal: Glow & Form Artistry",
  },
  {
    role: "Studio",
    badge: "Venue & Gear",
    icon: Package,
    desc: "Studio foto & ruang produksi",
    placeholder: "misal: Studio Imaji Space",
  },
];

const POPULAR_LOCATIONS = [
  "Jakarta Selatan, Indonesia",
  "Jakarta Pusat, Indonesia",
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
      setFormError("Nama profil / studio / brand wajib diisi.");
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
    <div className="w-full max-w-4xl mx-auto bg-white/85 backdrop-blur-2xl border border-white/90 rounded-2xl sm:rounded-[28px] p-4 sm:p-7 shadow-[0_20px_50px_rgba(28,40,70,0.06)] relative text-slate-900 transition-all">

      {/* Grid Responsif: Desktop 2 Kolom Seimbang, Mobile Rapi & Terstruktur */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">

        {/* Bagian 1: Pilih Peran (5 Kolom di Desktop) */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center md:hidden">1</span>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Pilih Peran Anda
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                1 dari 6 peran resmi di ekosistem RAMU
              </p>
            </div>
            <Link
              href="/"
              className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100/80 active:scale-95 transition-all"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid 5 Peran: 2 Kolom dengan feedback sentuhan (active:scale-[0.98]) */}
          <div className="grid grid-cols-2 gap-2">
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
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer relative flex flex-col justify-between gap-1.5 active:scale-[0.98] ${
                    isSelected
                      ? "bg-white border-2 border-[#4CC9FE] shadow-sm ring-2 ring-[#4CC9FE]/20"
                      : "bg-white/60 hover:bg-white/90 border border-slate-100 hover:border-[#4CC9FE]/30 shadow-2xs"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-[#4CC9FE] text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-100 shadow-2xs"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {item.role}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate font-medium">
                      {item.desc}
                    </div>
                  </div>

                  <div className="pt-0.5">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#4CC9FE] text-white"
                          : "border border-slate-300 bg-white/60"
                      }`}
                    >
                      {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Pendukung */}
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100/70 text-[11px] text-slate-600 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="leading-tight">
              Peran menentukan kecocokan peluang kolaborasi otomatis di direktori.
            </span>
          </div>
        </div>

        {/* Bagian 2: Formulir Data Akun (7 Kolom di Desktop, Pembatas Bersih di Mobile) */}
        <div className="md:col-span-7 md:pl-5 md:border-l md:border-slate-200/70 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 space-y-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center md:hidden">2</span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Lengkapi Data Akun
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Identitas dasar untuk profil resmi dan akses workspace RAMU.
            </p>
          </div>

          {formError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-snug">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">

            {/* Nama Profil */}
            <div className="space-y-1">
              <label htmlFor="displayName" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Nama Profil / Label / Studio *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                  className="w-full pl-8.5 pr-3 py-2.5 sm:py-2 rounded-xl bg-white/70 border border-slate-200 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Alamat Email *
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
                  className="w-full pl-8.5 pr-3 py-2.5 sm:py-2 rounded-xl bg-white/70 border border-slate-200 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Kata Sandi & Konfirmasi Sandi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Kata Sandi *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Min. 6 kar.</span>
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
                    minLength={6}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formError) setFormError("");
                    }}
                    placeholder="Kata sandi"
                    className="w-full pl-8.5 pr-8 py-2.5 sm:py-2 rounded-xl bg-white/70 border border-slate-200 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="confirmPassword" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Konfirmasi *
                  </label>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[10px] font-bold ${password === confirmPassword ? "text-emerald-600" : "text-rose-500"}`}>
                      {password === confirmPassword ? "✓ Cocok" : "✗ Beda"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                    placeholder="Ulangi sandi"
                    className={`w-full pl-8.5 pr-8 py-2.5 sm:py-2 rounded-xl bg-white/70 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all font-medium border ${
                      confirmPassword.length > 0
                        ? password === confirmPassword
                          ? "border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/10"
                          : "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-[#4CC9FE] focus:ring-[#4CC9FE]/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showConfirmPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Lokasi */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Basis Kota / Lokasi *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-8.5 pr-8 py-2.5 sm:py-2 rounded-xl bg-white/70 border border-slate-200 text-base sm:text-sm text-slate-900 appearance-none focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium cursor-pointer"
                >
                  {POPULAR_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-white text-slate-900">{loc}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Tombol Submit Nyaman Dijangkau Jempol */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 sm:py-2.5 px-4 rounded-xl bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-[#4CC9FE]/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Akun &amp; Buka Workspace</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Link ke Login */}
          <div className="pt-1.5 text-center text-xs text-slate-500">
            Sudah memiliki akun terdaftar?{" "}
            <Link
              href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"}
              className="font-bold text-[#0284c7] hover:text-[#0369a1] hover:underline"
            >
              Masuk ke akun Anda →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
