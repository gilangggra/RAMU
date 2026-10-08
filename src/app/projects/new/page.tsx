"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProjectBriefAction } from "@/app/projects/actions";
import {
  Lightbulb,
  MapPin,
  Clock,
  CircleDollarSign,
  Send,
  Check,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Camera,
  Scissors,
  Brush,
  Building,
  Palette,
  UserCircle,
  Building2,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Layers,
  FileText,
  Briefcase,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

const ROLE_BLUEPRINTS = [
  {
    id: "DESIGNER",
    label: "Fashion Designer",
    icon: Scissors,
    category: "SKILL_TALENT",
    desc: "Perancang busana, pattern maker, dan desainer koleksi lookbook.",
    specializations: [
      "Fashion Designer Utama",
      "Pattern Maker Presisi",
      "Ready-to-Wear Specialist",
      "Couture & Modest Designer",
    ],
  },
  {
    id: "PHOTOGRAPHER",
    label: "Photographer",
    icon: Camera,
    category: "SKILL_TALENT",
    desc: "Fotografer fashion, editorial lookbook, dan kampanye komersial.",
    specializations: [
      "Fashion Photographer",
      "Lookbook Specialist",
      "E-Commerce Packshot",
      "Editorial High-Fashion",
    ],
  },
  {
    id: "MODEL",
    label: "Model",
    icon: UserCircle,
    category: "SKILL_TALENT",
    desc: "Model peraga busana, editorial muse, dan talent runway.",
    specializations: [
      "Model Utama Lookbook",
      "Editorial Fashion Muse",
      "Commercial Fitting Model",
      "Runway & Campaign Talent",
    ],
  },
  {
    id: "MUA_STYLIST",
    label: "MUA/Stylist",
    icon: Brush,
    category: "SKILL_TALENT",
    desc: "Makeup & Hair artist serta penata gaya busana (wardrobe stylist).",
    specializations: [
      "Editorial Makeup Artist",
      "Fashion Wardrobe Stylist",
      "Hair Styling & Hijab Do",
      "On-Set Grooming Specialist",
    ],
  },
  {
    id: "STUDIO",
    label: "Studio Space",
    icon: Building2,
    category: "STUDIO_SPACE",
    desc: "Fasilitas studio foto sewa, cyclorama wall, dan lighting kit.",
    specializations: [
      "Studio Foto Cyclorama",
      "Daylight Loft Studio",
      "Penyewaan Alat & Lighting",
      "Studio + Ruang Fitting AC",
    ],
  },
  {
    id: "BRAND",
    label: "Fashion Brand/UMKM",
    icon: Building,
    category: "WARDROBE_PROP",
    desc: "Brand mode mitra co-branding atau penyedia koleksi busana.",
    specializations: [
      "Co-Branding Partner",
      "Wardrobe Sponsor",
      "Apparel Label",
      "Accessories Brand",
    ],
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

const CATEGORY_LABELS: Record<string, string> = {
  SKILL_TALENT: "Keahlian & Talenta",
  STUDIO_SPACE: "Studio & Ruang",
  WARDROBE_PROP: "Busana & Properti",
  EQUIPMENT: "Peralatan & Gear",
  PORTFOLIO_WORK: "Karya & Portofolio",
  AUDIENCE_REACH: "Jangkauan Audiens",
};

const PROJECT_PRESET_TEMPLATES = [
  {
    id: "lookbook",
    label: "Photoshoot Lookbook Fesyen",
    badge: "Populer",
    title: "Pemotretan Lookbook Koleksi Musiman",
    description:
      "Produksi visual lookbook katalog untuk koleksi busana terbaru, mencakup foto model on-set, styling busana terkurasi, dan hasil foto beresolusi tinggi.",
    projectType: "Campaign Iklan",
    aestheticStyle: "Minimalist",
    targetOutput: "15 Foto High-Res & 3 Video Pendek Reels",
    roles: [
      {
        id: "1",
        blueprintId: "PHOTOGRAPHER",
        roleLabel: "Fashion Photographer",
        assetCategory: "SKILL_TALENT",
        description: "Foto studio lighting bersih & editing warna natural.",
        maxCollaborators: 1,
      },
      {
        id: "2",
        blueprintId: "MODEL",
        roleLabel: "Model Utama Lookbook",
        assetCategory: "SKILL_TALENT",
        description: "Tinggi min 168cm, pengalaman lookbook katalog.",
        maxCollaborators: 1,
      },
      {
        id: "3",
        blueprintId: "MUA_STYLIST",
        roleLabel: "Editorial Makeup Artist",
        assetCategory: "SKILL_TALENT",
        description: "Makeup natural glowing & touch up on-set.",
        maxCollaborators: 1,
      },
    ],
    compensationModel: "PAID",
    estimatedTotal: "Rp 6.000.000",
  },
  {
    id: "ecommerce",
    label: "Katalog E-Commerce & Packshot",
    badge: "Komersial",
    title: "Foto Produk E-Commerce & Marketplace",
    description:
      "Sesi foto packshot produk pakaian dan aksesoris berlatar polos (putih/cyclorama) untuk keperluan etalase marketplace dan website resmi.",
    projectType: "Produksi Konten",
    aestheticStyle: "Minimalist",
    targetOutput: "30 Foto Packshot Bersih & Detail Jahitan",
    roles: [
      {
        id: "1",
        blueprintId: "PHOTOGRAPHER",
        roleLabel: "E-Commerce Packshot",
        assetCategory: "SKILL_TALENT",
        description: "Pencahayaan presisi detail bahan & warna akurat.",
        maxCollaborators: 1,
      },
      {
        id: "2",
        blueprintId: "STUDIO",
        roleLabel: "Studio Foto Cyclorama",
        assetCategory: "STUDIO_SPACE",
        description: "Studio cyclorama putih dengan fasilitas AC dan ruang ganti.",
        maxCollaborators: 1,
      },
    ],
    compensationModel: "PAID",
    estimatedTotal: "Rp 3.500.000",
  },
  {
    id: "editorial_collab",
    label: "Editorial Mode (Kolaborasi Tim)",
    badge: "Portofolio Bersama",
    title: "Editorial Fashion Spread Kolaboratif",
    description:
      "Proyek kolaborasi eksperimental untuk membangun portofolio editorial bersama, mengeksplorasi konsep busana wastra kontemporer dengan publikasi di media sosial.",
    projectType: "Kolaborasi Produk Baru",
    aestheticStyle: "High-Fashion",
    targetOutput: "Editorial Spread 8 Halaman & Short Teaser",
    roles: [
      {
        id: "1",
        blueprintId: "DESIGNER",
        roleLabel: "Fashion Designer Utama",
        assetCategory: "SKILL_TALENT",
        description: "Penyedia sampel 4 koleksi busana wastra.",
        maxCollaborators: 1,
      },
      {
        id: "2",
        blueprintId: "PHOTOGRAPHER",
        roleLabel: "Editorial High-Fashion",
        assetCategory: "SKILL_TALENT",
        description: "Konsep visual dramatis & lighting sinematik.",
        maxCollaborators: 1,
      },
      {
        id: "3",
        blueprintId: "MODEL",
        roleLabel: "Editorial Fashion Muse",
        assetCategory: "SKILL_TALENT",
        description: "Ekspresif & pose dinamis editorial.",
        maxCollaborators: 1,
      },
    ],
    compensationModel: "REVENUE_SHARE",
    estimatedTotal: "Bagi Hasil / Portofolio Bersama",
  },
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
    {
      id: "1",
      blueprintId: undefined,
      roleLabel: "",
      assetCategory: "SKILL_TALENT",
      description: "",
      maxCollaborators: 1,
    },
  ]);

  const [location, setLocation] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [targetLaunch, setTargetLaunch] = useState("");
  const [compensationModel, setCompensationModel] = useState("PAID");
  const [estimatedTotal, setEstimatedTotal] = useState("");
  const [budgetNotes, setBudgetNotes] = useState("");

  function applyTemplate(tpl: (typeof PROJECT_PRESET_TEMPLATES)[0]) {
    setTitle(tpl.title);
    setDescription(tpl.description);
    setProjectType(tpl.projectType);
    setAestheticStyle(tpl.aestheticStyle);
    setTargetOutput(tpl.targetOutput);
    setRoles(tpl.roles);
    setCompensationModel(tpl.compensationModel);
    setEstimatedTotal(tpl.estimatedTotal);
  }

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

  const stepsMeta = [
    { num: 1, label: "Info Proyek" },
    { num: 2, label: "Kebutuhan Kru" },
    { num: 3, label: "Operasional" },
    { num: 4, label: "Review & Terbit" },
  ];

  function handleGoToStep(targetStep: number) {
    if (targetStep === step) return;
    if (targetStep < step) {
      setError(null);
      setStep(targetStep);
      return;
    }
    if (targetStep >= 2 && !canProceedStep1) {
      setError("Mohon lengkapi judul, deskripsi, dan target luaran proyek terlebih dahulu.");
      return;
    }
    if (targetStep >= 3 && !canProceedStep2) {
      setError("Mohon tentukan minimal satu peran kru yang dibutuhkan sebelum melanjutkan.");
      return;
    }
    setError(null);
    setStep(targetStep);
  }

  return (
    <div className="min-h-screen app-background text-slate-800 flex flex-col relative">
      {/* TOP NAVIGATION BAR */}
      <nav className="h-14 shrink-0 border-b border-white/80 bg-white/70 backdrop-blur-md z-30 px-4 sm:px-8 sticky top-0">
        <div className="max-w-4xl mx-auto h-full flex items-center justify-between gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors text-xs px-3 py-1.5 rounded-full hover:bg-white/80 border border-transparent hover:border-white/80"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Kembali ke Galeri Proyek</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Buat Brief Kolaborasi
          </span>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col z-20">
        
        {/* CLEAN STEPPER (Cardless, Minimalis & Rapi Tanpa Aksesoris Berlebihan) */}
        <div className="w-full mb-8 px-2 sm:px-6">
          <div className="relative flex items-center justify-between">
            {/* Connecting Track Line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200/80 -z-0">
              <div
                className="h-full bg-[#4CC9FE] transition-all duration-300 ease-out"
                style={{
                  width:
                    step === 1
                      ? "0%"
                      : step === 2
                      ? "33.3%"
                      : step === 3
                      ? "66.6%"
                      : "100%",
                }}
              />
            </div>

            {stepsMeta.map((s) => {
              const isCompleted = s.num < step;
              const isCurrent = s.num === step;
              const isClickable =
                isCompleted ||
                (s.num > step &&
                  ((s.num === 2 && canProceedStep1) ||
                    (s.num === 3 && canProceedStep1 && canProceedStep2)));

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => handleGoToStep(s.num)}
                  disabled={!isClickable && !isCurrent}
                  className={`flex flex-col items-center group relative z-10 transition-all outline-hidden ${
                    isClickable
                      ? "cursor-pointer"
                      : isCurrent
                      ? "cursor-default"
                      : "cursor-not-allowed"
                  }`}
                  title={
                    isCompleted
                      ? `Kembali ke langkah ${s.num}: ${s.label}`
                      : isCurrent
                      ? `Langkah saat ini: ${s.label}`
                      : `Langkah ${s.num}: ${s.label}`
                  }
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-[#4CC9FE] text-white shadow-xs"
                        : "bg-white text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      s.num
                    )}
                  </div>

                  <span
                    className={`mt-2 text-xs transition-colors text-center ${
                      isCurrent
                        ? "font-bold text-slate-900"
                        : isCompleted
                        ? "font-semibold text-slate-700"
                        : "font-medium text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FORM CONTAINER (Clean & Rapih Tanpa Header Banner) */}
        <div className="w-full glass-card rounded-[22px] border border-white/80 shadow-md overflow-hidden flex flex-col transition-all">
          <div className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: INFORMASI PROYEK */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                {/* TEMPLATE PICKER (1-KLIK ISI FORMULIR) */}
                <div className="p-5 rounded-[22px] bg-sky-50/70 border border-sky-200/80 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Sparkles className="w-4 h-4 text-[#0284c7]" />
                      <span>Pilih Templat Cepat (1-Klik Otomatis Isi Brief):</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Klik salah satu untuk mengisi template standar industri
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PROJECT_PRESET_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="text-left p-3.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-white/90 hover:border-[#4CC9FE] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30 uppercase block w-fit mb-1.5 shadow-2xs">
                            {tpl.badge}
                          </span>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-[#0284c7] leading-snug transition-colors">
                            {tpl.label}
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2 break-words leading-tight pt-2 border-t border-slate-100">
                          {tpl.targetOutput}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Judul Proyek */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Judul Proyek *</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="misal: Campaign Video Minuman Lokal — Bali Vibes"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all shadow-2xs font-medium"
                  />
                </div>

                {/* Jenis Proyek & Tema Visual */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Jenis Proyek *</span>
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all cursor-pointer shadow-2xs font-medium"
                    >
                      {PROJECT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Tema / Gaya Visual</span>
                    </label>
                    <select
                      value={aestheticStyle}
                      onChange={(e) => setAestheticStyle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all cursor-pointer shadow-2xs font-medium"
                    >
                      {[
                        "Minimalist",
                        "Streetwear",
                        "Luxury",
                        "Cinematic",
                        "Y2K",
                        "High-Fashion",
                        "Edgy",
                        "Vintage",
                        "Editorial",
                        "Lainnya",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Output */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Target Luaran (Deliverables) *</span>
                  </label>
                  <input
                    value={targetOutput}
                    onChange={(e) => setTargetOutput(e.target.value)}
                    placeholder="misal: 15 Foto High-Res & 3 Video Pendek Reels"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all shadow-2xs font-medium"
                  />
                </div>

                {/* Deskripsi Proyek */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Deskripsi &amp; Konteks Proyek *</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan latar belakang, visi visual, dan tujuan yang ingin dicapai dari sesi kolaborasi ini..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all resize-none shadow-2xs font-normal leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: KEBUTUHAN PERAN */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-xs text-[#0284c7] flex items-center gap-2.5 shadow-2xs">
                  <Lightbulb className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <span>
                    Pilih kategori peran utama, lalu tentukan spesialisasi yang Anda butuhkan agar AI Matchmaking merekomendasikan talenta secara presisi.
                  </span>
                </div>

                {roles.map((role, idx) => {
                  const isBlueprintNotSelected = !role.blueprintId;
                  const isRoleNotSelected = role.blueprintId && !role.roleLabel;
                  const isFullySelected = role.blueprintId && role.roleLabel;

                  const selectedBlueprint = ROLE_BLUEPRINTS.find(
                    (bp) => bp.id === role.blueprintId
                  );

                  return (
                    <div
                      key={role.id}
                      className={`p-5 rounded-[22px] border transition-all duration-300 ${
                        !isFullySelected
                          ? "bg-white/95 border-[#4CC9FE]/40 shadow-md"
                          : "glass-card border-white/80 shadow-2xs"
                      } space-y-4`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#4CC9FE]/20 text-[#0284c7] flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Slot Kebutuhan Kru #{idx + 1}
                          </span>
                        </div>
                        {roles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRole(role.id)}
                            className="text-xs text-rose-600 hover:text-rose-700 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Hapus Slot</span>
                          </button>
                        )}
                      </div>

                      {/* Tahap 1: Pilih Blueprint Kategori Utama */}
                      {isBlueprintNotSelected && (
                        <div className="space-y-3 animate-fade-in">
                          <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#4CC9FE] text-white flex items-center justify-center text-[9px] font-bold">
                              1
                            </span>
                            Pilih Kategori Utama Kru:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {ROLE_BLUEPRINTS.map((bp) => {
                              const Icon = bp.icon;
                              return (
                                <button
                                  key={bp.id}
                                  type="button"
                                  onClick={() => {
                                    updateRole(role.id, "blueprintId", bp.id);
                                    updateRole(role.id, "assetCategory", bp.category);
                                  }}
                                  className="text-left p-3.5 rounded-2xl border border-white/90 bg-white/80 backdrop-blur-sm hover:border-[#4CC9FE] hover:shadow-xs transition-all group flex flex-col justify-between cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5 mb-1.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#4CC9FE]/15 group-hover:bg-[#4CC9FE]/25 flex items-center justify-center transition-colors shrink-0">
                                      <Icon className="w-4 h-4 text-[#0284c7]" />
                                    </div>
                                    <div className="font-bold text-xs text-slate-900">
                                      {bp.label}
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-slate-500 leading-tight">
                                    {bp.desc}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tahap 2: Pilih Spesialisasi */}
                      {isRoleNotSelected && selectedBlueprint && (
                        <div className="space-y-3.5 animate-fade-in">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-sky-50/70 rounded-xl border border-sky-200/80">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                              <selectedBlueprint.icon className="w-4 h-4 text-[#0284c7]" />
                              <span>{selectedBlueprint.label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateRole(role.id, "blueprintId", "")}
                              className="text-xs text-[#0284c7] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>Ubah Kategori</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-[#4CC9FE] text-white flex items-center justify-center text-[9px] font-bold">
                                2
                              </span>
                              Pilih Spesialisasi Spesifik:
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {selectedBlueprint.specializations.map((spec) => (
                                <button
                                  key={spec}
                                  type="button"
                                  onClick={() => updateRole(role.id, "roleLabel", spec)}
                                  className="px-3.5 py-1.5 rounded-full border border-slate-200/80 bg-white hover:border-[#4CC9FE] hover:bg-sky-50/50 text-xs font-semibold text-slate-800 transition-all shadow-2xs cursor-pointer"
                                >
                                  {spec}
                                </button>
                              ))}
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 font-medium">
                                atau peran kustom:
                              </span>
                              <input
                                type="text"
                                placeholder={`misal: ${selectedBlueprint.label} Spesialis Konseptual`}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#4CC9FE] focus:ring-1 focus:ring-[#4CC9FE]/20 shadow-2xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const val = (e.currentTarget.value || "").trim();
                                    if (val) updateRole(role.id, "roleLabel", val);
                                  }
                                }}
                                onBlur={(e) => {
                                  const val = (e.currentTarget.value || "").trim();
                                  if (val) updateRole(role.id, "roleLabel", val);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tahap 3: Role Terpilih */}
                      {isFullySelected && selectedBlueprint && (
                        <div className="space-y-3.5 animate-fade-in">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-sky-50/40 border border-sky-200/80 shadow-2xs">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 flex items-center justify-center text-[#0284c7] shrink-0">
                                <selectedBlueprint.icon className="w-4 h-4 text-[#0284c7]" />
                              </div>
                              <div>
                                <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                  {selectedBlueprint.label}
                                </div>
                                <div className="text-sm font-bold text-slate-900">
                                  {role.roleLabel}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#4CC9FE]/15 text-[10px] font-bold text-[#0284c7] border border-[#4CC9FE]/30 shadow-2xs">
                                Kategori: {CATEGORY_LABELS[role.assetCategory] || role.assetCategory}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateRole(role.id, "roleLabel", "")}
                                className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
                              >
                                Ubah
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-500">
                              Persyaratan / Konteks Khusus (Opsional)
                            </label>
                            <textarea
                              value={role.description}
                              onChange={(e) => updateRole(role.id, "description", e.target.value)}
                              placeholder="Contoh: Membawa perlengkapan kamera sendiri, atau memiliki pengalaman lookbook katalog..."
                              rows={2}
                              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all resize-none shadow-2xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addRole}
                  className="w-full py-3 rounded-full border border-dashed border-slate-300 hover:border-[#4CC9FE] bg-white/80 hover:bg-white text-slate-800 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <div className="w-5 h-5 rounded-full bg-[#4CC9FE] text-white flex items-center justify-center text-sm leading-none font-bold">
                    +
                  </div>
                  <span>Tambah Slot Kebutuhan Kru Lainnya</span>
                </button>
              </div>
            )}

            {/* STEP 3: DETAIL OPERASIONAL & KOMPENSASI */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-xs text-slate-700 font-normal shadow-2xs">
                  Semua rincian operasional ini bersifat opsional dan fleksibel. Anda dapat mengisinya sekarang atau menegosiasikannya kemudian di ruang diskusi proyek.
                </div>

                {/* Seksi 1: Lokasi & Jadwal */}
                <div className="p-5 rounded-[22px] bg-white/70 border border-white/80 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Lokasi &amp; Estimasi Jadwal</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Lokasi Pelaksanaan Proyek
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="misal: Jakarta Selatan, Studio Daylight Loft, atau Remote"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Estimasi Durasi</span>
                      </label>
                      <input
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        placeholder="misal: 1 Hari Sesi Foto / 2 Minggu Produksi"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Target Peluncuran (Launch)</span>
                      </label>
                      <input
                        value={targetLaunch}
                        onChange={(e) => setTargetLaunch(e.target.value)}
                        placeholder="misal: Akhir Oktober 2026"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Seksi 2: Model Kompensasi & Anggaran */}
                <div className="p-5 rounded-[22px] bg-white/70 border border-white/80 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Skema Kompensasi &amp; Anggaran</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Skema Imbalan
                      </label>
                      <select
                        value={compensationModel}
                        onChange={(e) => setCompensationModel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all cursor-pointer shadow-2xs font-medium"
                      >
                        <option value="PAID">Fee Komersial Berbayar (Paid Flat Fee)</option>
                        <option value="REVENUE_SHARE">Bagi Hasil Komersial (Revenue Share)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Estimasi Anggaran Total
                      </label>
                      <input
                        value={estimatedTotal}
                        onChange={(e) => setEstimatedTotal(e.target.value)}
                        placeholder="misal: Rp 5.000.000 / Terbuka Negosiasi"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Catatan Tambahan Mengenai Budget
                    </label>
                    <textarea
                      value={budgetNotes}
                      onChange={(e) => setBudgetNotes(e.target.value)}
                      placeholder="misal: Biaya konsumsi dan transportasi di lokasi ditanggung inisiator..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all resize-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & TERBIT */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Summary 1: Info Proyek */}
                  <div className="glass-card rounded-[22px] p-5 border border-white/80 space-y-3 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Ringkasan Proyek
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-base font-bold text-slate-900 leading-snug">
                          {title}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {projectType}
                          </span>
                          {aestheticStyle && (
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-[#0284c7] text-[10px] font-semibold border border-sky-200/80">
                              Tema: {aestheticStyle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal mt-2">
                          {description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-slate-500">Target Luaran:</span>
                      <span className="text-[11px] font-bold text-slate-800 text-right">
                        {targetOutput}
                      </span>
                    </div>
                  </div>

                  {/* Summary 2: Operasional & Budget */}
                  <div className="glass-card rounded-[22px] p-5 border border-white/80 space-y-3 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Jadwal &amp; Kompensasi
                      </div>
                      <div className="space-y-2 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{location || "Lokasi belum ditentukan"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {estimatedDuration || "Durasi fleksibel"}{" "}
                            {targetLaunch ? `(Target: ${targetLaunch})` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900">
                            {estimatedTotal
                              ? `${estimatedTotal} (${compensationModel === "PAID" ? "Fee Berbayar" : "Bagi Hasil"})`
                              : `Kompensasi: ${compensationModel}`}
                          </span>
                        </div>
                        {budgetNotes && (
                          <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                            Catatan: {budgetNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Standar SPK Digital &amp; Anti-Catfishing RAMU aktif.</span>
                    </div>
                  </div>
                </div>

                {/* Summary 3: Peran Dibutuhkan */}
                <div className="glass-card rounded-[22px] p-5 border border-white/80 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Peran Kru yang Dibutuhkan ({roles.filter((r) => r.roleLabel.trim()).length} Posisi)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {roles
                      .filter((r) => r.roleLabel.trim())
                      .map((role, idx) => (
                        <div
                          key={role.id}
                          className="p-3 bg-white/80 border border-slate-200/70 rounded-xl flex items-center gap-2.5 text-xs shadow-2xs"
                        >
                          <span className="w-6 h-6 rounded-lg bg-[#4CC9FE]/15 text-[#0284c7] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {role.roleLabel}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {CATEGORY_LABELS[role.assetCategory] || role.assetCategory}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 flex items-center gap-2.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Setelah dipublikasikan, brief proyek ini akan otomatis ditayangkan di Papan Proyek RAMU dan siap dipasangkan dengan talenta kreatif terbaik.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* CARD ACTION BAR FOOTER */}
          <div className="px-6 sm:px-8 py-4 bg-white/80 backdrop-blur-md border-t border-white/80 flex items-center justify-between gap-3 shrink-0">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={isPending}
                  className="px-4.5 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/80 shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  RAMU Anti-Catfishing System • Standar Produksi Terverifikasi
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2)
                  }
                  className="btn-primary-pill inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#4CC9FE]/20"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="btn-primary-pill inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold disabled:opacity-50 shadow-md shadow-[#4CC9FE]/20"
                >
                  <span>{isPending ? "Mempublikasikan..." : "Publikasikan Project Brief"}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
