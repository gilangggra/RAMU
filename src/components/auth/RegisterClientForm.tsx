"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  MapPin,
  ChevronDown,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Globe,
  Phone,
  Plus,
  X,
  Building,
  FileText,
  Bell,
  Check,
} from "lucide-react";
import { signup } from "@/app/(auth)/actions";

interface RegisterClientFormProps {
  initialError?: string;
}

export function RegisterClientForm({ initialError }: RegisterClientFormProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const [displayName, setDisplayName] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("Fashion Designer / Label");
  const [location, setLocation] = useState("Jakarta Selatan, Indonesia");
  const [customLocation, setCustomLocation] = useState("");
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step1Error, setStep1Error] = useState("");

  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [skills, setSkills] = useState<string[]>(["Editorial High-Fashion", "Lookbook & E-Commerce"]);
  const [skillInput, setSkillInput] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const functions = [
    "Fashion Designer / Label",
    "Creative & Art Director",
    "Fashion Photographer",
    "Fashion Stylist",
    "Model / Visual Talent",
    "Videographer / Fashion Film",
    "Makeup & Hair Artist (MUA)",
    "Set Designer / Props",
    "Fashion Agency / Producer",
    "Lainnya",
  ];

  const popularLocations = [
    "Jakarta Selatan, Indonesia",
    "Jakarta Pusat, Indonesia",
    "Bandung, Jawa Barat",
    "DI Yogyakarta, Indonesia",
    "Denpasar & Canggu, Bali",
    "Surabaya, Jawa Timur",
    "Surakarta (Solo), Jawa Tengah",
    "Semarang, Jawa Tengah",
    "Medan, Sumatera Utara",
    "Ketik kota lainnya...",
  ];

  const suggestedSkills = [
    "Editorial High-Fashion",
    "Lookbook & E-Commerce",
    "Analog 35mm & Medium Format",
    "Creative Direction & Moodboard",
    "Runway & Catwalk",
    "Wardrobe & Prop Styling",
    "Studio Lighting & Strobe",
    "Color Grading & Retouching",
  ];

  const handleLocationChange = (val: string) => {
    if (val === "Ketik kota lainnya...") {
      setIsCustomLocation(true);
      setLocation("");
    } else {
      setIsCustomLocation(false);
      setLocation(val);
    }
  };

  const finalLocation = isCustomLocation ? customLocation : location;

  const handleAddSkill = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter" && e.key !== ",") return;
    if (e) e.preventDefault();

    const trimmed = skillInput.trim().replace(/,$/, "");
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddSuggestedSkill = (suggested: string) => {
    if (!skills.includes(suggested)) {
      setSkills([...skills, suggested]);
    }
  };

  const handleProceedToStep2 = () => {
    setStep1Error("");
    if (!displayName.trim()) {
      setStep1Error("Nama profil / studio wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setStep1Error("Alamat email tidak valid.");
      return;
    }
    if (password.length < 6) {
      setStep1Error("Kata sandi minimal harus 6 karakter.");
      return;
    }
    if (!finalLocation.trim()) {
      setStep1Error("Lokasi / asal daerah wajib dipilih.");
      return;
    }
    setStep(2);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-[36px] p-8 sm:p-11 shadow-[0_24px_64px_rgba(39,33,61,0.08)] border border-white/80 relative overflow-hidden transition-all duration-300">
      <div className="absolute top-4 left-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">┌</div>
      <div className="absolute top-4 right-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">┐</div>
      <div className="absolute bottom-4 left-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">└</div>
      <div className="absolute bottom-4 right-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">┘</div>

      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold uppercase tracking-wider text-[#27213D] shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#E59F00]" />
          <span>Registrasi Akun Kreatif Fashion & Visual</span>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200 text-[#27213D]">
          Tahap {step} / 2
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#27213D] tracking-tight mb-1.5">
        {step === 1 ? "Identitas & Peran Fashion Visual" : "Profil Studio & Kapasitas Produksi"}
      </h1>
      <p className="text-xs sm:text-sm text-[#716B7E] mb-6 leading-relaxed">
        {step === 1
          ? "Tentukan kredensial akun dan peran spesifik Anda untuk memulai pencocokan tim kampanye lookbook & editorial."
          : "Informasi atelier, ketersediaan studio, dan spesialisasi visual Anda diselaraskan oleh Engine RAMU untuk meramu tim kolaborasi."}
      </p>

      {(initialError || step1Error) && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{step1Error || initialError}</p>
        </div>
      )}

      <form
        action={signup}
        onSubmit={() => setIsSubmitting(true)}
        className="space-y-6"
      >
        <input type="hidden" name="displayName" value={displayName} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="password" value={password} />
        <input type="hidden" name="role" value={selectedFunction} />
        <input type="hidden" name="location" value={finalLocation} />
        <input type="hidden" name="bio" value={bio} />
        <input type="hidden" name="address" value={address} />
        <input type="hidden" name="skills" value={JSON.stringify(skills)} />
        <input type="hidden" name="website" value={website} />
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="receiveNotifications" value={receiveNotifications ? "true" : "false"} />

        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <label
                htmlFor="displayNameInput"
                className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
              >
                Nama Profil / Label / Studio *
              </label>
              <input
                id="displayNameInput"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="misal: Maison Nusantara / Studio Visual Arkha / Nadia Kirana"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#27213D]">
                Peran / Keahlian Utama *
              </label>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {functions.map((func) => {
                  const isSelected = selectedFunction === func;
                  return (
                    <button
                      key={func}
                      type="button"
                      onClick={() => setSelectedFunction(func)}
                      className={`px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#27213D] text-[#FFFDFC] border-2 border-[#27213D] font-bold shadow-xs scale-102"
                          : "bg-[#FAF8F5] text-[#27213D] border border-stone-200/80 hover:bg-[#FFF7ED] hover:border-[#F9D8C4] font-medium"
                      }`}
                    >
                      {isSelected && <span className="text-[#FFB800] mr-1.5">✦</span>}
                      <span>{func}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="locationSelect"
                className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
              >
                Lokasi / Basis Studio *
              </label>
              {!isCustomLocation ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                    <MapPin className="w-4 h-4 text-[#27213D]" />
                  </div>
                  <select
                    id="locationSelect"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] appearance-none focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all cursor-pointer font-medium"
                  >
                    {popularLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#716B7E]">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                      <MapPin className="w-4 h-4 text-[#27213D]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Ketik nama kota / asal daerah Anda..."
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomLocation(false)}
                    className="text-xs text-[#716B7E] hover:text-[#27213D] underline cursor-pointer"
                  >
                    ← Pilih dari daftar kota populer
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-2">
                <label
                  htmlFor="emailInput"
                  className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                >
                  Alamat Email *
                </label>
                <input
                  id="emailInput"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@studioanda.id"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="passwordInput"
                    className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                  >
                    Kata Sandi *
                  </label>
                  <span className="text-[11px] font-mono text-[#716B7E]">Min. 6 Karakter</span>
                </div>
                <div className="relative">
                  <input
                    id="passwordInput"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#716B7E] hover:text-[#27213D] cursor-pointer"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="h-1.5 bg-stone-200/60 rounded-full w-full overflow-hidden mb-6">
                <div className="h-full bg-[#FFB800] rounded-full w-1/2 transition-all duration-300" />
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="px-6 py-3 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-[#27213D] text-xs sm:text-sm font-bold transition-all shadow-xs"
                >
                  Kembali
                </Link>

                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="px-8 py-3.5 rounded-full bg-[#FFB800] hover:bg-[#FFA800] active:scale-[0.98] text-[#1E1B2E] text-xs sm:text-sm font-extrabold shadow-[0_8px_24px_rgba(255,184,0,0.35)] transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <span>Lanjut ke Profil Studio</span>
                  <ArrowRight className="w-4 h-4 text-[#1E1B2E]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="bio"
                  className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                >
                  Bio / Deskripsi Kreatif
                </label>
                <span className="text-[10px] font-medium text-[#716B7E]">Membantu kurasi sinergi tim</span>
              </div>
              <textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan estetika desain, fokus koleksi busana, ketersediaan kamera/studio, atau konsep visual yang biasa Anda garap..."
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="address"
                className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
              >
                Alamat Studio / Atelier / Basecamp Produksi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                  <Building className="w-4 h-4 text-[#27213D]" />
                </div>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, gedung, atelier, kompleks studio foto, atau kecamatan..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="skillInput"
                  className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                >
                  Keahlian & Spesialisasi Visual (Skills & Expertise)
                </label>
                <span className="text-[10px] text-[#716B7E]">Tekan Enter untuk menambah</span>
              </div>

              <div className="relative">
                <input
                  id="skillInput"
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="e.g. Editorial, Analog 35mm, Runway, Retouching — tekan Enter untuk menambah"
                  className="w-full pl-4 pr-12 py-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="absolute inset-y-1 right-1 px-3 rounded-xl bg-stone-200/60 hover:bg-[#FFB800] text-[#27213D] transition-colors flex items-center justify-center cursor-pointer"
                  title="Tambahkan Keahlian"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 min-h-[32px]">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold text-[#27213D] shadow-2xs group"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#716B7E] hover:text-rose-600 cursor-pointer transition-colors"
                      aria-label={`Hapus ${skill}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#716B7E] block mb-1.5">
                  Rekomendasi Spesialisasi Proyek:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddSuggestedSkill(sug)}
                      disabled={skills.includes(sug)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        skills.includes(sug)
                          ? "bg-stone-100 text-stone-400 border-stone-200 cursor-default"
                          : "bg-white hover:bg-[#FFF7ED] text-[#27213D] border-stone-200 hover:border-[#F9D8C4]"
                      }`}
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-2">
                <label
                  htmlFor="website"
                  className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                >
                  Website / Portofolio (opsional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                    <Globe className="w-4 h-4 text-[#27213D]" />
                  </div>
                  <input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://instagram.com/studioanda"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                >
                  WhatsApp / Telepon (opsional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                    <Phone className="w-4 h-4 text-[#27213D]" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#27213D] flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#E59F00]" />
                  <span>Receive notifications and messages</span>
                </div>
                <p className="text-[11px] text-[#716B7E]">
                  Stay updated with new requests, sinergi bilateral, and matchmaking alerts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReceiveNotifications(!receiveNotifications)}
                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                  receiveNotifications ? "bg-[#FFB800]" : "bg-stone-300"
                }`}
                role="switch"
                aria-checked={receiveNotifications}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    receiveNotifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-4">
              <div className="h-1.5 bg-stone-200/60 rounded-full w-full overflow-hidden mb-6">
                <div className="h-full bg-[#FFB800] rounded-full w-full transition-all duration-300" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-[#27213D] text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-3 text-xs font-semibold text-[#716B7E] hover:text-[#27213D] cursor-pointer transition-colors"
                  >
                    Lewati tahap ini
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-full bg-[#FFB800] hover:bg-[#FFA800] active:scale-[0.98] text-[#1E1B2E] text-xs sm:text-sm font-extrabold shadow-[0_8px_24px_rgba(255,184,0,0.35)] transition-all hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>{isSubmitting ? "Mendaftarkan Profil..." : "Selesaikan & Masuk Workspace"}</span>
                  <ArrowRight className="w-4 h-4 text-[#1E1B2E]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      <div className="text-center pt-6 mt-6 border-t border-stone-100 text-xs text-[#716B7E]">
        Sudah memiliki akun terdaftar?{" "}
        <Link
          href="/login"
          className="font-bold text-[#27213D] underline decoration-[#FFB800] decoration-2 hover:text-black transition-colors"
        >
          Masuk di sini →
        </Link>
      </div>
    </div>
  );
}
