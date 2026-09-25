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
  Globe,
  Phone,
  Plus,
  X,
  Building,
  Bell,
  Check,
  User,
  Camera,
  Sparkles,
  Palette,
  Video,
  Scissors,
  Star,
  Brush,
  Package,
  ChevronDown,
} from "lucide-react";
import { signup } from "@/app/(auth)/actions";

interface RegisterClientFormProps {
  initialError?: string;
}

const ACTOR_TYPES = [
  {
    id: "INDIVIDUAL",
    icon: User,
    title: "Individual Creative",
    desc: "Fotografer, model, stylist, MUA, dan seniman mandiri.",
  },
  {
    id: "STUDIO",
    icon: Package,
    title: "Studio / Tim",
    desc: "Studio foto, tim produksi, atau grup kreatif terorganisir.",
  },
  {
    id: "MSME",
    icon: Building,
    title: "Brand / Label / MSME",
    desc: "Fashion label, agensi, atau bisnis kreatif terstruktur.",
  },
];

const ROLES_BY_TYPE: Record<string, { icon: React.ElementType; label: string; desc: string }[]> = {
  INDIVIDUAL: [
    { icon: Camera, label: "Fashion Photographer", desc: "Fotografi editorial & kampanye" },
    { icon: Star, label: "Model / Visual Talent", desc: "Pemodelan dan talent visual" },
    { icon: Scissors, label: "Fashion Stylist", desc: "Styling dan wardrobe editorial" },
    { icon: Brush, label: "Makeup & Hair Artist (MUA)", desc: "Kecantikan & riasan profesional" },
    { icon: Video, label: "Videographer / Fashion Film", desc: "Film fesyen & konten video" },
    { icon: Palette, label: "Creative & Art Director", desc: "Konsep & arah visual kreatif" },
    { icon: Package, label: "Set Designer / Props", desc: "Dekorasi set dan properti" },
    { icon: Sparkles, label: "Lainnya", desc: "Peran kreatif lainnya" },
  ],
  STUDIO: [
    { icon: Camera, label: "Studio Fotografi", desc: "Penyewaan & produksi studio foto" },
    { icon: Video, label: "Studio Videografi", desc: "Produksi film & konten video" },
    { icon: Palette, label: "Creative Studio", desc: "Agensi kreatif & art direction" },
    { icon: Package, label: "Production House", desc: "Rumah produksi multi-disiplin" },
    { icon: Sparkles, label: "Lainnya", desc: "Studio atau layanan lainnya" },
  ],
  MSME: [
    { icon: Scissors, label: "Fashion Designer / Label", desc: "Brand & label fashion lokal" },
    { icon: Palette, label: "Fashion Agency / Producer", desc: "Agensi & produser fesyen" },
    { icon: Star, label: "Model Agency", desc: "Agensi manajemen talent & model" },
    { icon: Package, label: "Textile & Material Brand", desc: "Brand bahan & tekstil" },
    { icon: Sparkles, label: "Lainnya", desc: "Bisnis kreatif lainnya" },
  ],
};

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

const SUGGESTED_SKILLS = [
  "Analog 35mm & Medium Format",
  "High-End Beauty Retouching",
  "Creative Set Design & Props",
  "Visual Identity & Concept",
  "Commercial Fashion Film",
];

const SPECIALIZATIONS_BY_ROLE: Record<string, { label: string; desc: string }[]> = {
  "Fashion Photographer": [
    { label: "Editorial & High-Fashion", desc: "Pemotretan majalah dan kampanye high-end" },
    { label: "Commercial & Lookbook", desc: "Katalog produk dan kampanye komersial brand" },
    { label: "Runway & Backstage", desc: "Dokumentasi acara fashion show dan live event" },
    { label: "Street Style & Portrait", desc: "Gaya jalanan dan potret individu" },
  ],
  "Model / Visual Talent": [
    { label: "Fashion & Runway", desc: "Model panggung peragaan dan fashion show" },
    { label: "Commercial & Print", desc: "Iklan cetak, katalog, dan kampanye komersial" },
    { label: "Beauty & Parts", desc: "Spesialisasi wajah, rambut, kosmetik, atau bagian tubuh" },
    { label: "Alternative & Inclusive", desc: "Karakter unik, plus-size, androgini, dll" },
  ],
  "Fashion Stylist": [
    { label: "Editorial Styling", desc: "Penataan gaya untuk publikasi dan majalah" },
    { label: "Commercial & Advertising", desc: "Penataan gaya untuk kampanye iklan brand" },
    { label: "Personal & Celebrity", desc: "Penataan gaya pribadi untuk tokoh atau artis" },
    { label: "Wardrobe & TV/Film", desc: "Manajemen kostum untuk produksi audiovisual" },
  ],
  "Fashion Designer / Label": [
    { label: "Ready-to-Wear (RTW)", desc: "Pakaian siap pakai untuk produksi massal/terbatas" },
    { label: "Haute Couture & Custom", desc: "Pakaian rancangan khusus dan pesanan eksklusif" },
    { label: "Accessories & Jewelry", desc: "Perhiasan, tas, sepatu, dan aksesoris fashion" },
    { label: "Streetwear & Urban", desc: "Gaya jalanan kasual kontemporer" },
  ],
  "Makeup & Hair Artist (MUA)": [
    { label: "Editorial & Avant-Garde", desc: "Riasan eksperimental untuk fashion show/majalah" },
    { label: "Commercial Beauty", desc: "Riasan bersih untuk katalog dan iklan" },
    { label: "Bridal & Glamour", desc: "Riasan pernikahan dan acara formal" },
    { label: "SFX & Theatrical", desc: "Efek khusus dan riasan karakter" },
  ]
};

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS = ["Tipe Akun", "Peran", "Spesialisasi", "Kredensial", "Profil"];

export function RegisterClientForm({ initialError }: RegisterClientFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [actorType, setActorType] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [specialization, setSpecialization] = useState("");
  
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState(POPULAR_LOCATIONS[0]);
  
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState("");
  const [isPending, startTransition] = useTransition();

  const specializationsForRole = SPECIALIZATIONS_BY_ROLE[selectedRole] || [];
  const hasSpecializationStep = specializationsForRole.length > 0;

  const validateAndNext = () => {
    setStepError("");
    if (step === 1 && !actorType) { setStepError("Pilih satu tipe akun untuk melanjutkan."); return; }
    if (step === 2 && !selectedRole) { setStepError("Pilih peran yang menggambarkan Anda."); return; }
    
    // Skip Step 3 if no specializations defined for the selected role
    if (step === 2 && !hasSpecializationStep) {
      setStep(4);
      return;
    }
    
    if (step === 3 && !specialization) { setStepError("Pilih setidaknya satu spesialisasi utama."); return; }
    
    if (step === 4) {
      if (!displayName.trim()) { setStepError("Nama profil wajib diisi."); return; }
      if (!email.trim() || !email.includes("@")) { setStepError("Alamat email tidak valid."); return; }
      if (password.length < 6) { setStepError("Kata sandi minimal 6 karakter."); return; }
    }
    
    setStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    setStepError("");
    if (step === 4 && !hasSpecializationStep) {
      setStep(2);
    } else {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const handleAddSkill = (val?: string) => {
    const v = (val || skillInput).trim();
    if (v && !skills.includes(v)) { setSkills([...skills, v]); setSkillInput(""); }
  };

  const handleFinalSubmit = (skipOptional: boolean = false) => {
    setIsSubmitting(true);
    setStepError("");

    const formData = new FormData();
    formData.set("displayName", displayName.trim());
    formData.set("email", email.trim());
    formData.set("password", password);
    formData.set("role", selectedRole);
    formData.set("specialization", specialization);
    formData.set("actorType", actorType || "INDIVIDUAL");
    formData.set("location", location);

    if (!skipOptional) {
      formData.set("bio", bio.trim());
      formData.set("address", address.trim());
      formData.set("skills", JSON.stringify(skills));
      formData.set("website", website.trim());
      formData.set("phone", phone.trim());
    } else {
      formData.set("bio", "");
      formData.set("address", "");
      formData.set("skills", JSON.stringify([]));
      formData.set("website", "");
      formData.set("phone", "");
    }
    formData.set("receiveNotifications", receiveNotifications ? "true" : "false");

    startTransition(async () => {
      try {
        await signup(formData);
      } catch (err: any) {
        if (err?.message?.includes("NEXT_REDIRECT")) {
          // Normal Next.js redirect
          return;
        }
        setIsSubmitting(false);
        setStepError(err?.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      }
    });
  };

  const rolesForType = actorType ? (ROLES_BY_TYPE[actorType] || []) : [];

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-3">
          {(() => {
            const visualLabels = hasSpecializationStep 
              ? STEP_LABELS 
              : STEP_LABELS.filter(l => l !== "Spesialisasi");

            return visualLabels.map((label, index) => {
              const visualStepNum = index + 1; // 1, 2, 3, 4 (or 5)
              
              // Map visual step back to actual step state
              let actualStepForVisual = visualStepNum as Step;
              if (!hasSpecializationStep && visualStepNum > 2) {
                actualStepForVisual = (visualStepNum + 1) as Step;
              }

              const done = step > actualStepForVisual;
              const active = step === actualStepForVisual;

              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                      done ? "bg-amber-400 text-stone-950 shadow-[0_4px_12px_rgba(251,191,36,0.4)]"
                      : active ? "bg-[#1E1B2E] text-white ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent"
                      : "bg-stone-100 text-stone-400"
                    }`}>
                      {done ? <Check className="w-4 h-4" /> : <span>{visualStepNum}</span>}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                      active ? "text-[#1E1B2E]" : done ? "text-amber-600" : "text-stone-400"
                    }`}>{label}</span>
                  </div>
                  {index < visualLabels.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-stone-200 overflow-hidden rounded-full">
                      <div className={`h-full bg-amber-400 transition-all duration-500 ${done ? "w-full" : "w-0"}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            });
          })()}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-[28px] shadow-[0_16px_48px_rgba(39,33,61,0.10)] border border-stone-100 overflow-hidden">

        {/* Card Header */}
        <div className="px-8 pt-8 pb-6 border-b border-stone-100">
          <h1 className="text-xl sm:text-2xl font-black text-[#1E1B2E] tracking-tight">
            {step === 1 && "Pilih Tipe Akun"}
            {step === 2 && "Pilih Peran Anda"}
            {step === 3 && `Spesialisasi ${selectedRole}`}
            {step === 4 && "Buat Akun"}
            {step === 5 && "Lengkapi Profil"}
          </h1>
          <p className="text-sm text-stone-500 mt-1 leading-relaxed">
            {step === 1 && "Pilih kategori yang paling menggambarkan bentuk operasional Anda."}
            {step === 2 && "Pilih satu peran yang paling sesuai dengan pekerjaan utama Anda."}
            {step === 3 && "Pilih sub-kategori spesialisasi utama Anda untuk pencocokan yang lebih akurat."}
            {step === 4 && "Masukkan detail akun Anda untuk bergabung ke ekosistem RAMU."}
            {step === 5 && "Tambahkan detail profil agar kreator lain mudah menemukan Anda. (Opsional)"}
          </p>
        </div>

        {/* Card Body */}
        <div className="px-8 py-7">
          {/* Step Error */}
          {(stepError || (step === 4 && initialError)) && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{stepError || initialError}</span>
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            {/* ─── STEP 1: TIPE AKUN ─── */}
            {step === 1 && (
              <div className="space-y-3">
                {ACTOR_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = actorType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setActorType(type.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#1E1B2E] bg-[#1E1B2E]"
                          : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-amber-400" : "bg-white border border-stone-200"
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? "text-stone-950" : "text-stone-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold tracking-tight ${isSelected ? "text-white" : "text-[#1E1B2E]"}`}>
                          {type.title}
                        </div>
                        <div className={`text-xs mt-0.5 leading-snug ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                          {type.desc}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? "border-amber-400 bg-amber-400" : "border-stone-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-stone-950" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── STEP 2: PERAN ─── */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {rolesForType.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.label;
                  return (
                    <button
                      key={role.label}
                      type="button"
                      onClick={() => setSelectedRole(role.label)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#1E1B2E] bg-[#1E1B2E]"
                          : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? "bg-amber-400" : "bg-white border border-stone-200"
                      }`}>
                        <Icon className={`w-4 h-4 ${isSelected ? "text-stone-950" : "text-stone-500"}`} />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isSelected ? "text-white" : "text-[#1E1B2E]"}`}>{role.label}</div>
                        <div className={`text-[11px] mt-0.5 leading-snug ${isSelected ? "text-stone-400" : "text-stone-500"}`}>{role.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── STEP 3: SPESIALISASI ─── */}
            {step === 3 && hasSpecializationStep && (
              <div className="space-y-3">
                {specializationsForRole.map((spec) => {
                  const isSelected = specialization === spec.label;
                  return (
                    <button
                      key={spec.label}
                      type="button"
                      onClick={() => setSpecialization(spec.label)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#1E1B2E] bg-stone-50 shadow-sm"
                          : "border-stone-200 bg-white hover:border-stone-300"
                      }`}
                    >
                      <div className="flex-1 pr-4">
                        <div className={`text-sm font-bold tracking-tight ${isSelected ? "text-[#1E1B2E]" : "text-stone-700"}`}>
                          {spec.label}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-1 leading-snug">
                          {spec.desc}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? "border-[#1E1B2E] bg-[#1E1B2E]" : "border-stone-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── STEP 4: KREDENSIAL ─── */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="displayNameInput" className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Nama Profil / Label / Studio *
                  </label>
                  <input
                    id="displayNameInput"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        validateAndNext();
                      }
                    }}
                    placeholder="misal: Maison Nusantara / Studio Arkha / Nadia Kirana"
                    className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border-2 border-stone-200 text-sm text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:border-[#1E1B2E] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="emailInput" className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Alamat Email *
                  </label>
                  <input
                    id="emailInput"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        validateAndNext();
                      }
                    }}
                    placeholder="nama@studioanda.id"
                    className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border-2 border-stone-200 text-sm text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:border-[#1E1B2E] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="passwordInput" className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Kata Sandi *
                    </label>
                    <span className="text-[11px] text-stone-400">Min. 6 karakter</span>
                  </div>
                  <div className="relative">
                    <input
                      id="passwordInput"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          validateAndNext();
                        }
                      }}
                      placeholder="Masukkan kata sandi"
                      className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-stone-50 border-2 border-stone-200 text-sm text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:border-[#1E1B2E] focus:bg-white transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    Lokasi / Basis Studio *
                  </label>
                  <div className="relative">
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-stone-50 border-2 border-stone-200 text-sm text-[#1E1B2E] appearance-none focus:outline-none focus:border-[#1E1B2E] focus:bg-white transition-all font-medium cursor-pointer"
                    >
                      {POPULAR_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 5: DETAIL PROFIL ─── */}
            {step === 5 && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                  <strong>Opsional:</strong> Informasi ini membantu Engine RAMU mencocokkan Anda dengan peluang kolaborasi yang lebih tepat. Anda juga dapat melewatinya sekarang dan mengisinya nanti di Pengaturan Akun.
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bio" className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Bio / Deskripsi Kreatif
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ceritakan estetika, fokus karya, atau konsep visual yang biasa Anda garap..."
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border-2 border-stone-200 text-sm text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:border-[#1E1B2E] focus:bg-white transition-all font-medium resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Keahlian & Spesialisasi
                    </label>
                    <span className="text-[10px] text-stone-400">Tekan Enter untuk menambah</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
                      placeholder="e.g. Editorial, Analog 35mm, Runway..."
                      className="w-full pl-4 pr-12 py-3 rounded-2xl bg-stone-50 border-2 border-stone-200 text-sm text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:border-[#1E1B2E] focus:bg-white transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      className="absolute inset-y-1.5 right-1.5 w-8 rounded-xl bg-stone-200 hover:bg-[#1E1B2E] hover:text-white text-stone-500 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1E1B2E] text-xs font-bold text-white">
                          {skill}
                          <button type="button" onClick={() => setSkills(skills.filter(s => s !== skill))} className="text-stone-400 hover:text-white ml-0.5 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SUGGESTED_SKILLS.map((sug) => !skills.includes(sug) && (
                      <button key={sug} type="button" onClick={() => handleAddSkill(sug)}
                        className="text-[10px] px-2.5 py-1 rounded-full border border-stone-200 text-stone-500 hover:border-[#1E1B2E] hover:text-[#1E1B2E] transition-colors cursor-pointer">
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Website / Portofolio</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                      <input 
                        type="url" 
                        value={website} 
                        onChange={(e) => setWebsite(e.target.value)} 
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleFinalSubmit(false);
                          }
                        }}
                        placeholder="https://instagram.com/..."
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-stone-50 border-2 border-stone-200 text-sm text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:border-[#1E1B2E] focus:bg-white transition-all font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">WhatsApp / Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleFinalSubmit(false);
                          }
                        }}
                        placeholder="+62 812-3456-7890"
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-stone-50 border-2 border-stone-200 text-sm text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:border-[#1E1B2E] focus:bg-white transition-all font-medium" 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[#1E1B2E] flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-500" />
                      Notifikasi Kolaborasi
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">Dapatkan info peluang kolaborasi & matchmaking.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiveNotifications(!receiveNotifications)}
                    role="switch"
                    aria-checked={receiveNotifications}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${receiveNotifications ? "bg-[#1E1B2E]" : "bg-stone-300"}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${receiveNotifications ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            )}

            {/* ─── NAVIGATION BUTTONS ─── */}
            <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-stone-100">
              <div className="flex items-center gap-2">
                {step > 1 ? (
                  <button
                    key={`back-btn-step-${step}`}
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting || isPending}
                    className="flex items-center gap-1.5 px-5 py-3 rounded-2xl border-2 border-stone-200 text-sm font-bold text-stone-500 hover:border-stone-300 hover:text-[#1E1B2E] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                ) : (
                  <Link href="/" className="flex items-center gap-1.5 px-5 py-3 rounded-2xl border-2 border-stone-200 text-sm font-bold text-stone-500 hover:border-stone-300 hover:text-[#1E1B2E] transition-all">
                    <ArrowLeft className="w-4 h-4" /> Beranda
                  </Link>
                )}
                {step === 5 && (
                  <button 
                    key="skip-btn-step-5"
                    type="button" 
                    onClick={() => handleFinalSubmit(true)} 
                    disabled={isSubmitting || isPending} 
                    className="text-xs font-semibold text-stone-400 hover:text-stone-700 px-3 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Lewati Tahap Ini
                  </button>
                )}
              </div>

              {step < 5 ? (
                <button
                  key={`next-btn-step-${step}`}
                  type="button"
                  onClick={validateAndNext}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#1E1B2E] hover:bg-black text-white text-sm font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer"
                >
                  Lanjut <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  key="submit-btn-step-5"
                  type="button"
                  onClick={() => handleFinalSubmit(false)}
                  disabled={isSubmitting || isPending}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-sm font-black shadow-[0_8px_24px_rgba(251,191,36,0.35)] hover:shadow-[0_12px_30px_rgba(251,191,36,0.45)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {(isSubmitting || isPending) ? "Mendaftarkan Profil..." : "Selesaikan & Buka Akun"} {!(isSubmitting || isPending) && <ArrowRight className="w-4 h-4" />}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-stone-500 mt-6">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold text-[#1E1B2E] hover:text-amber-600 transition-colors underline decoration-stone-300">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
