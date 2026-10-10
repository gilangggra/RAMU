"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
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
  ShieldCheck,
  RefreshCw,
  Clock,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import { signup, verifyOtpSignup, resendSignupOtp } from "@/app/(auth)/actions";

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
  // Step State: "FORM" = formulir registrasi awal, "OTP" = verifikasi kode 6-digit
  const [step, setStep] = useState<"FORM" | "OTP">("FORM");

  // Form Fields State
  const [selectedRole, setSelectedRole] = useState(FIVE_OFFICIAL_ROLES[0]);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [location, setLocation] = useState(POPULAR_LOCATIONS[0]);

  // Feedback & Transition State
  const [formError, setFormError] = useState(initialError || "");
  const [otpError, setOtpError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);

  // OTP State (6 Digits)
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState<number>(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown untuk kirim ulang OTP
  useEffect(() => {
    if (step !== "OTP" || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, countdown]);

  // Auto focus input pertama saat beralih ke layar OTP
  useEffect(() => {
    if (step === "OTP") {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Handle submit formulir pendaftaran awal (Step 1)
  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!displayName.trim()) {
      setFormError("Nama profil / brand / studio wajib diisi.");
      return;
    }
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setFormError("Format alamat email tidak valid (harus menyertakan domain lengkap, contoh: nama@domain.com).");
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
        } else if (res?.requiresOtp) {
          setStep("OTP");
          setOtp(["", "", "", "", "", ""]);
          setOtpError("");
          setResendSuccess("");
          setCountdown(60);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          return;
        }
        const msg = err instanceof Error ? err.message : "Gagal mendaftar akun. Silakan coba lagi.";
        setFormError(msg);
      }
    });
  };

  // Handle perubahan pada input OTP (termasuk paste 6 digit)
  const handleOtpChange = (index: number, val: string) => {
    if (otpError) setOtpError("");
    if (resendSuccess) setResendSuccess("");

    // Jika user mem-paste 6 digit angka sekaligus
    if (val.length > 1) {
      const digits = val.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length > 0) {
        const newOtp = [...otp];
        digits.forEach((d, i) => {
          if (i < 6) newOtp[i] = d;
        });
        setOtp(newOtp);
        const nextFocus = Math.min(digits.length, 5);
        inputRefs.current[nextFocus]?.focus();
        return;
      }
    }

    // Hanya izinkan angka
    const char = val.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Otomatis pindah fokus ke kotak berikutnya jika angka diisi
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle tombol navigasi keyboard (Backspace & Arrow)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle verifikasi kode OTP (Step 2)
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setResendSuccess("");

    const token = otp.join("").trim();
    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      setOtpError("Harap masukkan 6 digit kode OTP secara lengkap.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await verifyOtpSignup({
          email: email.trim(),
          token,
          displayName: displayName.trim(),
          role: selectedRole.role,
          location,
          redirectTo,
        });

        if (res?.error) {
          setOtpError(res.error);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          return;
        }
        const msg = err instanceof Error ? err.message : "Gagal memverifikasi kode OTP. Silakan periksa kembali.";
        setOtpError(msg);
      }
    });
  };

  // Handle kirim ulang kode OTP
  const handleResend = async () => {
    if (countdown > 0 || isResending || isPending) return;
    setIsResending(true);
    setOtpError("");
    setResendSuccess("");

    try {
      const res = await resendSignupOtp(email.trim());
      if (res?.error) {
        setOtpError(res.error);
      } else {
        setResendSuccess("Kode OTP baru berhasil dikirimkan ke email Anda.");
        setCountdown(60);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim ulang kode OTP.";
      setOtpError(msg);
    } finally {
      setIsResending(false);
    }
  };

  // Kembali ke formulir awal untuk mengoreksi email/data
  const handleBackToForm = () => {
    setStep("FORM");
    setOtpError("");
    setResendSuccess("");
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 xl:p-7 shadow-[0_20px_50px_-15px_rgba(39,33,61,0.08)] relative text-[#27213D] space-y-4">
      
      {/* Decorative top accent glow */}
      <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-[#4CC9FE] to-transparent rounded-full pointer-events-none" />

      {/* ============================================================== */}
      {/* STEP 2: TAMPILAN VERIFIKASI KODE OTP                          */}
      {/* ============================================================== */}
      {step === "OTP" ? (
        <div className="space-y-4 animate-fade-in">
          
          {/* Header OTP */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verifikasi Identitas SPK &amp; Akun</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
              Masukkan Kode OTP 6-Digit
            </h2>

            <p className="text-xs text-[#716B7E] font-normal leading-relaxed">
              Kami telah mengirimkan 6 digit kode keamanan ke alamat email Anda untuk memastikan keabsahan identitas akun dan hak penandatanganan SPK.
            </p>
          </div>

          {/* Email Info Badge dengan Aksi Koreksi */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200/80 text-[#0284c7] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                  Dikirimkan ke Email:
                </div>
                <div className="text-xs font-bold text-[#27213D] truncate">
                  {email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBackToForm}
              disabled={isPending}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0284c7] hover:text-[#27213D] px-2.5 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-stone-200 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              title="Koreksi alamat email jika salah ketik"
            >
              <Edit3 className="w-3 h-3" />
              <span>Ubah Email</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {otpError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-fade-in font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-snug">{otpError}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-fade-in font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-snug">{resendSuccess}</p>
            </div>
          )}

          {/* Form Input 6-Digit OTP */}
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
            <div className="space-y-2">
              <label className="block text-center text-[10px] font-bold uppercase tracking-wider text-stone-600">
                Ketikkan 6 Angka Kode OTP di Bawah Ini:
              </label>

              {/* 6 Box Input Digit */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={isPending}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border transition-all duration-150 focus:outline-none ${
                      digit
                        ? "border-[#4CC9FE] bg-white text-[#27213D] shadow-xs"
                        : "border-stone-200 bg-stone-50/80 text-[#27213D] hover:border-stone-300"
                    } focus:border-[#4CC9FE] focus:bg-white focus:ring-4 focus:ring-[#4CC9FE]/20 disabled:opacity-50`}
                  />
                ))}
              </div>
            </div>

            {/* Tombol Verifikasi Utama */}
            <button
              type="submit"
              disabled={isPending || otp.join("").length !== 6}
              className="w-full py-2.5 sm:py-3 px-6 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-[#4CC9FE]/30 hover:shadow-lg hover:shadow-[#4CC9FE]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Kode OTP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Verifikasi &amp; Buka Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Resend OTP Bar */}
          <div className="pt-2 flex flex-col items-center justify-center space-y-2 text-center border-t border-stone-100">
            <div className="text-xs text-[#716B7E] flex items-center gap-1.5">
              {countdown > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Kirim ulang kode dalam <strong className="text-[#27213D] font-bold">{countdown} detik</strong></span>
                </>
              ) : (
                <>
                  <span>Belum menerima kode OTP?</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending || isPending}
                    className="font-bold text-[#0284c7] hover:text-[#27213D] inline-flex items-center gap-1 underline underline-offset-4 decoration-[#4CC9FE]/40 hover:decoration-[#4CC9FE] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isResending ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-[#0284c7] border-t-transparent rounded-full animate-spin" />
                        Mengirim...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Kirim Ulang Kode OTP
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>

            <div className="text-[10px] text-stone-600 max-w-sm leading-relaxed">
              💡 <em>Tips:</em> Periksa juga folder <strong>Spam</strong> atau <strong>Promosi</strong> di email Anda jika kode tidak muncul di kotak masuk utama.
            </div>
          </div>

          {/* Legal Compliance Footnote */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[9px] text-stone-500">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Otentikasi Identitas Penandatanganan SPK Digital • Standar UU ITE No. 1/2024</span>
          </div>

        </div>
      ) : (
        /* ============================================================== */
        /* STEP 1: FORMULIR PENDAFTARAN AWAL                             */
        /* ============================================================== */
        <>
          {/* Header Section */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight">
              Buat Akun Kreator RAMU
            </h2>
            <p className="text-xs text-[#716B7E] font-normal leading-relaxed">
              Pilih peran Anda dan lengkapi data profil untuk membuka workspace kolaborasi.
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
          <form onSubmit={handleSubmitForm} className="space-y-3 pt-0.5">
            
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
                  Alamat Email (Untuk OTP &amp; SPK) *
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
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-stone-600">
                  Konfirmasi Sandi *
                </label>
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
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-50/80 border border-stone-200 text-xs sm:text-sm text-[#27213D] placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all font-medium"
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
                  <span>Memproses Pendaftaran...</span>
                </>
              ) : (
                <>
                  <span>Lanjutkan ke Verifikasi OTP</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="pt-1 text-center border-t border-stone-100">
            <div className="text-xs text-[#716B7E]">
              Sudah memiliki akun terdaftar?{" "}
              <Link
                href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"}
                className="font-bold text-[#0284c7] hover:text-[#27213D] underline underline-offset-4 decoration-[#4CC9FE]/40 hover:decoration-[#4CC9FE] transition-colors"
              >
                Masuk ke akun Anda →
              </Link>
            </div>
          </div>

          {/* Security Footnote */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[9px] text-stone-500">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Terproteksi Enkripsi Supabase Auth • SPK Terverifikasi UU ITE</span>
          </div>
        </>
      )}

    </div>
  );
}
