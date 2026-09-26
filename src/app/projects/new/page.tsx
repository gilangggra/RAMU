"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProjectBriefAction } from "@/app/projects/actions";
import { Lightbulb, MapPin, Clock, CircleDollarSign, Send, Check, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Camera, Palette, UserCircle, Building2, ChevronDown } from "lucide-react";

const ROLE_BLUEPRINTS = [
  { 
    id: "FOTO", 
    label: "Fotografer & Videografer", 
    icon: Camera, 
    category: "SKILL_TALENT", 
    desc: "Pencipta visual untuk kampanye dan katalog.",
    specializations: ["Fotografer Produk", "Fotografer Fesyen", "Videografer Komersial", "Art Director"]
  },
  { 
    id: "DESAIN", 
    label: "Desainer Kreatif", 
    icon: Palette, 
    category: "SKILL_TALENT", 
    desc: "Perancang identitas visual dan aset grafis.",
    specializations: ["Desainer Grafis (Branding)", "Desainer Kemasan", "UI/UX Designer", "Illustrator 2D/3D"]
  },
  { 
    id: "MODEL", 
    label: "Model & Talent", 
    icon: UserCircle, 
    category: "SKILL_TALENT", 
    desc: "Talenta profesional di depan layar atau mikrofon.",
    specializations: ["Model Fesyen Utama", "Karakter Pendukung", "Aktor Iklan Komersial", "Voice Over Talent"]
  },
  { 
    id: "STUDIO", 
    label: "Infrastruktur & Ruang", 
    icon: Building2, 
    category: "STUDIO_SPACE", 
    desc: "Fasilitas, ruang kerja, atau peralatan teknis.",
    specializations: ["Studio Foto (Cyclorama)", "Studio Rekaman (Audio)", "Penyewaan Alat/Lighting", "Set Lokasi Shooting"]
  },
];

const PROJECT_TYPES = [
  "Campaign Iklan",
  "Peluncuran Produk",
  "Produksi Konten",
  "Branding & Visual Identity",
  "Kolaborasi Produk Baru",
  "Ekshibisi & Event",
  "Riset & Pengembangan",
  "Lainnya",
];

const ASSET_CATEGORIES = [
  { value: "SKILL_TALENT", label: "Keahlian & Talenta Kreatif (Skill & Talent)" },
  { value: "EQUIPMENT", label: "Peralatan Produksi (Equipment & Gear)" },
  { value: "STUDIO_SPACE", label: "Fasilitas & Lokasi Studio (Studio Space)" },
  { value: "WARDROBE_PROP", label: "Koleksi Busana & Properti (Wardrobe & Props)" },
  { value: "AUDIENCE_REACH", label: "Akses Komunitas & Audiens (Audience Reach)" },
];

interface RoleInput {
  id: string;
  blueprintId?: string;
  roleLabel: string;
  assetCategory: string;
  description: string;
  maxCollaborators: number;
}

export default function NewProjectBriefPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [aestheticStyle, setAestheticStyle] = useState("Minimalist");
  const [targetOutput, setTargetOutput] = useState("");

  const [roles, setRoles] = useState<RoleInput[]>([
    { id: "1", blueprintId: undefined, roleLabel: "", assetCategory: "SKILL_TALENT", description: "", maxCollaborators: 1 },
  ]);

  const [location, setLocation] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [targetLaunch, setTargetLaunch] = useState("");
  const [compensationModel, setCompensationModel] = useState("PAID");
  const [estimatedTotal, setEstimatedTotal] = useState("");
  const [budgetNotes, setBudgetNotes] = useState("");

  function addRole() {
    setRoles((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        blueprintId: undefined,
        roleLabel: "",
        assetCategory: "SKILL_TALENT",
        description: "",
        maxCollaborators: 1,
      },
    ]);
  }

  function updateRole(id: string, field: keyof RoleInput, value: string | number) {
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function removeRole(id: string) {
    if (roles.length === 1) return;
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSubmit() {
    setError(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("projectType", projectType);
    formData.set("targetOutput", targetOutput);
    formData.set("location", location);
    formData.set("estimatedDuration", estimatedDuration);
    formData.set("targetLaunch", targetLaunch);
    formData.set("compensationModel", compensationModel);
    formData.set("estimatedTotal", estimatedTotal);
    formData.set("budgetNotes", budgetNotes);
    formData.set("aestheticStyle", aestheticStyle);
    formData.set(
      "neededRoles",
      JSON.stringify(
        roles
          .filter((r) => r.roleLabel.trim())
          .map(({ roleLabel, assetCategory, description, maxCollaborators }) => ({
            roleLabel: roleLabel.trim(),
            assetCategory,
            description: description.trim() || undefined,
            maxCollaborators,
          }))
      )
    );

    startTransition(async () => {
      const res = await createProjectBriefAction(formData);
      if (res.success && res.briefId) {
        router.push(`/projects/${res.briefId}`);
      } else {
        setError(res.error || "Gagal membuat project brief.");
        setStep(1);
      }
    });
  }

  const canProceedStep1 =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    targetOutput.trim().length >= 3;

  const canProceedStep2 = roles.some((r) => r.roleLabel.trim().length > 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B2E] selection:bg-[#1E1B2E]/30 selection:text-[#1E1B2E] flex flex-col relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />

      <nav className="border-b border-stone-200/80 bg-[#FAF8F5]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-2 text-stone-500 hover:text-[#1E1B2E] font-bold transition-colors text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Proyek</span>
          </Link>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s === step
                    ? "bg-[#1E1B2E] text-white shadow-xs"
                    : s < step
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-stone-200/80 text-stone-500"
                }`}
              >
                {s < step ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E]">
              Langkah {step} dari 4
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B2E] tracking-tight">
              {step === 1 && "Informasi Proyek"}
              {step === 2 && "Peran yang Dibutuhkan"}
              {step === 3 && "Detail Operasional"}
              {step === 4 && "Review & Publikasi"}
            </h1>
            <p className="text-sm text-stone-500">
              {step === 1 && "Jelaskan proyek yang ingin Anda garap bersama kolaborator."}
              {step === 2 && "Tentukan peran apa saja yang dibutuhkan dalam proyek ini."}
              {step === 3 && "Isi detail timeline dan budget (opsional)."}
              {step === 4 && "Pastikan semua informasi sudah benar sebelum dipublikasikan."}
            </p>
          </div>

          <div className="p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.05)] space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Judul Proyek *
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="misal: Campaign Video Minuman Lokal — Bali Vibes"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] placeholder-[#9E98A8] focus:outline-none focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/10 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Jenis Proyek *
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/10 transition-colors cursor-pointer"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Tema / Gaya Visual
                  </label>
                  <select
                    value={aestheticStyle}
                    onChange={(e) => setAestheticStyle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/10 transition-colors cursor-pointer"
                  >
                    {["Minimalist", "Streetwear", "Luxury", "Cinematic", "Y2K", "High-Fashion", "Edgy", "Vintage", "Editorial", "Lainnya"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Target Output *
                  </label>
                  <input
                    value={targetOutput}
                    onChange={(e) => setTargetOutput(e.target.value)}
                    placeholder="misal: Video iklan 60 detik + 10 foto produk berkualitas tinggi"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] placeholder-[#9E98A8] focus:outline-none focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/10 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Deskripsi Proyek *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan konteks, tujuan, dan apa yang ingin dicapai dari proyek ini..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] placeholder-[#9E98A8] focus:outline-none focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/10 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-amber-900 flex items-center gap-2.5">
                  <Lightbulb className="w-4 h-4 text-[#1E1B2E] shrink-0" />
                  <span>Ikuti panduan dua langkah ini agar pencocokan spesifikasi dengan profil kolaborator 100% akurat.</span>
                </div>

                {roles.map((role, idx) => {
                  const isBlueprintNotSelected = !role.blueprintId;
                  const isRoleNotSelected = role.blueprintId && !role.roleLabel;
                  const isFullySelected = role.blueprintId && role.roleLabel;
                  
                  const selectedBlueprint = ROLE_BLUEPRINTS.find(bp => bp.id === role.blueprintId);
                  
                  return (
                  <div key={role.id} className={`p-5 rounded-3xl border transition-all duration-300 ${!isFullySelected ? 'bg-white border-[#E66A48]/30 shadow-md' : 'bg-stone-50/80 border-stone-200/70'} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
                        Slot Kebutuhan #{idx + 1}
                      </span>
                      {roles.length > 1 && (
                        <button
                          onClick={() => removeRole(role.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer"
                        >
                          Hapus Slot
                        </button>
                      )}
                    </div>

                    {isBlueprintNotSelected && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <label className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-[#1E1B2E] text-white flex items-center justify-center text-[8px]">1</span>
                          Pilih Kategori Utama (Pilar)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {ROLE_BLUEPRINTS.map((bp) => {
                            const Icon = bp.icon;
                            return (
                              <button
                                key={bp.id}
                                onClick={() => {
                                  updateRole(role.id, "blueprintId", bp.id);
                                  updateRole(role.id, "assetCategory", bp.category);
                                }}
                                className="text-left p-4 rounded-2xl border border-stone-200/80 bg-white hover:border-[#E66A48] hover:shadow-[0_4px_12px_rgba(230,106,72,0.1)] transition-all group flex flex-col justify-between"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 rounded-full bg-stone-50 group-hover:bg-stone-50 flex items-center justify-center transition-colors">
                                    <Icon className="w-4 h-4 text-[#1E1B2E] group-hover:text-[#1E1B2E] transition-colors" />
                                  </div>
                                  <div className="font-bold text-sm text-[#1E1B2E]">{bp.label}</div>
                                </div>
                                <div className="text-[10px] text-stone-500 leading-relaxed ml-11">{bp.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {isRoleNotSelected && selectedBlueprint && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-stone-100 rounded-xl border border-stone-200/60">
                           <div className="flex items-center gap-2 text-xs font-bold text-[#1E1B2E]">
                              <selectedBlueprint.icon className="w-3.5 h-3.5 text-stone-500" />
                              {selectedBlueprint.label}
                           </div>
                           <button 
                             onClick={() => updateRole(role.id, "blueprintId", "")}
                             className="text-[10px] text-stone-500 hover:text-[#1E1B2E] font-bold underline"
                           >
                             Ubah Kategori
                           </button>
                        </div>
                        
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#1E1B2E] text-white flex items-center justify-center text-[8px]">2</span>
                            Pilih Spesialisasi Spesifik (Job)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedBlueprint.specializations.map(spec => (
                              <button
                                key={spec}
                                onClick={() => updateRole(role.id, "roleLabel", spec)}
                                className="px-4 py-2 rounded-xl border border-stone-200/80 bg-white hover:border-[#E66A48] hover:bg-stone-50/30 text-xs font-bold text-[#1E1B2E] transition-all shadow-sm"
                              >
                                {spec}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {isFullySelected && selectedBlueprint && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-[#1E1B2E] text-white shadow-md relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                          <div className="flex-1 space-y-1 relative z-10">
                            <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider flex items-center gap-2">
                                <selectedBlueprint.icon className="w-3 h-3" />
                                {selectedBlueprint.label}
                            </div>
                            <div className="text-base font-black text-white">
                                {role.roleLabel}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 relative z-10">
                             <div className="px-3 py-1.5 rounded-lg bg-white/10 text-[10px] font-bold text-stone-300 border border-white/10">
                               Kategori: {role.assetCategory}
                             </div>
                             <button 
                               onClick={() => updateRole(role.id, "roleLabel", "")}
                               className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                               title="Ubah Spesialisasi"
                             >
                               <ArrowLeft className="w-3.5 h-3.5 text-white" />
                             </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <label className="text-[10px] font-bold uppercase text-stone-500">
                            Persyaratan / Konteks Khusus (Opsional)
                          </label>
                          <textarea
                            value={role.description}
                            onChange={(e) => updateRole(role.id, "description", e.target.value)}
                            placeholder={`Contoh: Harus membawa perlengkapan sendiri, atau memiliki pengalaman spesifik...`}
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] placeholder-[#9E98A8] focus:outline-none focus:border-[#E66A48] focus:ring-2 focus:ring-[#E66A48]/10 transition-colors resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )})}

                <button
                  onClick={addRole}
                  className="w-full py-4 rounded-2xl border border-dashed border-[#E66A48]/30 hover:border-[#E66A48] bg-white hover:bg-stone-50/40 text-[#1E1B2E] text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-[#1E1B2E] text-white flex items-center justify-center text-lg leading-none pb-0.5">+</div>
                  <span>Tambah Slot Kebutuhan Lainnya</span>
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-stone-500">
                  Semua field di langkah ini opsional. Anda bisa mengisi, menentukan detail, atau membahasnya nanti bersama kolaborator.
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Lokasi Proyek
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="misal: Bali, atau Remote"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] placeholder-[#9E98A8] focus:outline-none focus:border-[#E66A48] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Estimasi Durasi
                    </label>
                    <input
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      placeholder="misal: 3 Minggu"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] placeholder-[#9E98A8] focus:outline-none focus:border-[#E66A48] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Target Peluncuran
                    </label>
                    <input
                      value={targetLaunch}
                      onChange={(e) => setTargetLaunch(e.target.value)}
                      placeholder="misal: Oktober 2026"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] placeholder-[#9E98A8] focus:outline-none focus:border-[#E66A48] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Model Kompensasi
                    </label>
                    <select
                      value={compensationModel}
                      onChange={(e) => setCompensationModel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] transition-colors cursor-pointer"
                    >
                      <option value="PAID">Paid (Berbayar)</option>
                      <option value="TFP">TFP / Barter Portofolio</option>
                      <option value="REVENUE_SHARE">Bagi Hasil (Revenue Share)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Estimasi Anggaran Total
                    </label>
                    <input
                      value={estimatedTotal}
                      onChange={(e) => setEstimatedTotal(e.target.value)}
                      placeholder="misal: Rp 5.000.000 (jika paid)"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] placeholder-[#9E98A8] focus:outline-none focus:border-[#E66A48] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Catatan Budget
                  </label>
                  <textarea
                    value={budgetNotes}
                    onChange={(e) => setBudgetNotes(e.target.value)}
                    placeholder="misal: Bagi hasil 50:50, biaya produksi ditanggung bersama..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200/80 text-sm text-[#1E1B2E] placeholder-[#9E98A8] focus:outline-none focus:border-[#E66A48] transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-3">
                  <div className="text-xs font-bold uppercase text-stone-500">Informasi Proyek</div>
                  <div className="space-y-1">
                    <div className="text-base font-bold text-[#1E1B2E]">{title}</div>
                    <div className="text-xs font-bold text-[#1E1B2E]">{projectType}</div>
                    <div className="text-xs text-stone-500 leading-relaxed">{description}</div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60">
                    <span className="text-[10px] font-bold text-stone-500">TARGET:</span>
                    <span className="text-xs font-bold text-[#1E1B2E]">{targetOutput}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-3">
                  <div className="text-xs font-bold uppercase text-stone-500">Peran Dibutuhkan ({roles.filter(r => r.roleLabel).length})</div>
                  <div className="space-y-2">
                    {roles
                      .filter((r) => r.roleLabel.trim())
                      .map((role, idx) => (
                        <div key={role.id} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-800">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-[#1E1B2E]">{role.roleLabel}</span>
                          <span className="text-stone-300">·</span>
                          <span className="text-stone-500">{role.assetCategory}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {(location || estimatedDuration || estimatedTotal) && (
                  <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-2">
                    <div className="text-xs font-bold uppercase text-stone-500">Detail Operasional</div>
                    <div className="text-xs text-[#1E1B2E] space-y-1.5">
                      {location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#1E1B2E] shrink-0" />
                          <span>{location}</span>
                        </div>
                      )}
                      {estimatedDuration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#1E1B2E] shrink-0" />
                          <span>{estimatedDuration}</span>
                        </div>
                      )}
                      {estimatedTotal && (
                        <div className="flex items-center gap-2">
                          <CircleDollarSign className="w-3.5 h-3.5 text-[#1E1B2E] shrink-0" />
                          <span>{estimatedTotal}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Setelah dipublikasikan, proyek ini akan muncul di galeri publik dan dapat dilihat oleh semua kreator di RAMU.</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B2E] font-bold text-sm transition-colors cursor-pointer"
                >
                  ← Kembali
                </button>
              )}

              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2)
                  }
                  className="flex-1 py-3 rounded-xl bg-[#1E1B2E] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-[#1E1B2E] hover:bg-black disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-[#E66A48]/25 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>{isPending ? "Mempublikasikan..." : "Publikasikan Project Brief"}</span>
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
