import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { createAsset, archiveAsset } from "../assets/actions";
import { createGoal, deleteGoal } from "../goals/actions";
import { createNeed, deleteNeed } from "../needs/actions";
import { createConstraint, deleteConstraint } from "../constraints/actions";
import { AssetUploadField } from "@/components/readiness/AssetUploadField";
import { ConstraintPresetForm } from "@/components/readiness/ConstraintPresetForm";
import {
  AssetCategory,
  AssetRole,
  GoalCategory,
  NeedCategory,
  ConstraintType,
  ConstraintSeverity,
} from "@prisma/client";
import {
  Package,
  Target,
  Search,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Sliders,
  Plus,
  Globe,
  Wrench,
  TrendingUp,
  Zap,
  Palette,
  CircleDollarSign,
  Clock,
  Calendar,
  MapPin,
  Hourglass,
  ShoppingCart,
  Brain,
  Scale,
  ShieldCheck,
  Layers,
  Home,
  Truck,
} from "lucide-react";

interface ReadinessPageProps {
  searchParams: Promise<{
    tab?: string;
    error?: string;
    success?: string;
  }>;
}

// Category and Role labels for Assets
const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  PORTFOLIO_WORK: "Karya / Portofolio Visual",
  EQUIPMENT: "Peralatan (Kamera/Lighting/Gear)",
  STUDIO_SPACE: "Ruang Studio / Lokasi",
  SKILL_TALENT: "Keahlian & Talenta Model",
  WARDROBE_PROP: "Busana & Properti Lookbook",
  AUDIENCE_REACH: "Jangkauan Audiens / Komunitas",
};

// Filtered categories specifically for Physical Resource/Readiness Registration (Artworks are managed in /dashboard/showcase)
const READINESS_ASSET_CATEGORY_LABELS: Partial<Record<AssetCategory, string>> = {
  EQUIPMENT: "Peralatan (Kamera/Lighting/Gear)",
  STUDIO_SPACE: "Ruang Studio / Lokasi",
  WARDROBE_PROP: "Busana & Properti Fisik",
  SKILL_TALENT: "Keahlian & Talenta Khusus",
  AUDIENCE_REACH: "Jangkauan Audiens / Komunitas",
};

// Goal categories
const GOAL_LABELS: Record<GoalCategory, { label: string; desc: string; icon: React.ReactNode }> = {
  EDITORIAL_PUBLICATION: { label: "Publikasi Editorial", desc: "Tampil di majalah/media fesyen ternama", icon: <Globe className="w-4 h-4 text-[#1E1B2E]" /> },
  COMMERCIAL_CAMPAIGN: { label: "Kampanye Komersial", desc: "Kampanye promosi produk/brand baru", icon: <Wrench className="w-4 h-4 text-[#1E1B2E]" /> },
  PORTFOLIO_BUILDING: { label: "Kolaborasi Portofolio (TFP)", desc: "Membangun karya editorial bersama secara setara", icon: <Palette className="w-4 h-4 text-[#1E1B2E]" /> },
  BRAND_AWARENESS: { label: "Eksposur & Brand Awareness", desc: "Meningkatkan jangkauan dan rekognisi publik", icon: <Sparkles className="w-4 h-4 text-[#1E1B2E]" /> },
  REVENUE_GENERATION: { label: "Proyek Komersial Berbayar", desc: "Monetisasi dan profitabilitas bisnis", icon: <TrendingUp className="w-4 h-4 text-[#1E1B2E]" /> },
  SKILL_DEVELOPMENT: { label: "Eksplorasi Kreatif & Skill", desc: "Eksperimen teknik visual dan estetika baru", icon: <Zap className="w-4 h-4 text-[#1E1B2E]" /> },
};

// Need categories
const NEED_LABELS: Record<
  NeedCategory,
  { label: string; desc: string; icon: React.ComponentType<{ className?: string }> }
> = {
  TALENT_NEED: { label: "Talenta Model / Peraga", desc: "Model untuk pemotretan lookbook atau video", icon: Brain },
  CREW_NEED: { label: "Kru Profesional (Fotografer / MUA / Stylist)", desc: "Keahlian teknis eksekusi visual", icon: Palette },
  LOCATION_NEED: { label: "Studio Foto / Lokasi Khusus", desc: "Ruang cyclorama, studio indoor, atau outdoor", icon: Home },
  EQUIPMENT_NEED: { label: "Peralatan Produksi & Lighting", desc: "Sewa lighting 3-phase, lensa, atau gear khusus", icon: Zap },
  WARDROBE_NEED: { label: "Busana & Properti Pendukung", desc: "Koleksi pakaian desainer atau properti artistik", icon: Layers },
  FUNDING_NEED: { label: "Dukungan Sponsor / Anggaran", desc: "Sponsor dana atau barter promosi", icon: CircleDollarSign },
  PUBLICATION_NEED: { label: "Kanal Media & Publikasi", desc: "Akses liputan ke majalah fesyen atau portal berita", icon: Truck },
};

// Constraint categories (Humanized for creative ecosystem)
const CONSTRAINT_LABELS: Record<
  ConstraintType,
  { label: string; desc: string; icon: React.ComponentType<{ className?: string }>; placeholder: string }
> = {
  BUDGET: { label: "Batas Anggaran (Budget)", desc: "Batas dana yang tersedia atau rate minimum yang diterima", icon: CircleDollarSign, placeholder: "5000000 (Rupiah)" },
  AVAILABILITY: { label: "Ketersediaan Jadwal", desc: "Hari atau periode waktu yang bisa digunakan untuk kolaborasi", icon: Calendar, placeholder: "Hanya Akhir Pekan / Q2 2026" },
  LOCATION: { label: "Jangkauan Wilayah / Kota", desc: "Batas mobilitas geografis Anda", icon: MapPin, placeholder: "Jabodetabek / Bandung" },
  TIME: { label: "Batas Waktu / Deadline", desc: "Tenggat waktu pelaksanaan proyek", icon: Clock, placeholder: "Maksimal 30 hari pengerjaan" },
  LEAD_TIME: { label: "Lead Time Persiapan", desc: "Waktu minimum persiapan sebelum sesi photoshoot/produksi", icon: Hourglass, placeholder: "7 (hari)" },
  CAPACITY: { label: "Kapasitas Produksi", desc: "Batas kemampuan volume produksi konveksi/studio", icon: Package, placeholder: "200 (pcs/bulan)" },
  MINIMUM_ORDER: { label: "Minimum Pemesanan / Order", desc: "Kuantitas pesanan minimum untuk kolaborasi manufaktur", icon: ShoppingCart, placeholder: "30 (pcs)" },
  EQUIPMENT: { label: "Peralatan / Spesifikasi Teknis", desc: "Ketentuan gear atau listrik studio", icon: Wrench, placeholder: "Daya listrik minimal 11.000 Watt" },
  CAPABILITY: { label: "Batasan Cakupan Keahlian", desc: "Layanan yang tidak Anda sediakan", icon: Brain, placeholder: "Tidak menyediakan retouch 3D" },
  LEGAL: { label: "Izin & Legalitas", desc: "Ketentuan sertifikasi atau kontrak kerja", icon: Scale, placeholder: "Wajib NDA / Kontrak Kerja Bersama" },
  IP: { label: "Hak Cipta (HAKI / IP)", desc: "Ketentuan kepemilikan karya visual", icon: ShieldCheck, placeholder: "Hak guna komersial 1 tahun" },
  MARKET: { label: "Wilayah Pasar", desc: "Batasan target distribusi produk", icon: Globe, placeholder: "Pasar ritel domestik" },
};

export default async function ReadinessHubPage({ searchParams }: ReadinessPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });
  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const activeTab = params?.tab || "assets";

  // Fetch all 4 pillars of the engine
  const [assets, goals, needs, constraints] = await Promise.all([
    prisma.asset.findMany({
      where: { actorId: actor.id, status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.goal.findMany({
      where: { actorId: actor.id, status: "ACTIVE" },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    }),
    prisma.need.findMany({
      where: { actorId: actor.id, status: "ACTIVE" },
      include: { relatedGoal: true },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    }),
    prisma.constraint.findMany({
      where: { actorId: actor.id },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  // Calculate profile readiness percentage
  const pillarsFilled = [
    assets.length > 0,
    goals.length > 0,
    needs.length > 0,
    constraints.length > 0,
  ].filter(Boolean).length;
  const readinessPercent = Math.round((pillarsFilled / 4) * 100);

  const tabs = [
    { id: "assets", label: "Aset & Modal Kreatif", count: assets.length, icon: Package },
    { id: "goals", label: "Target Capaian", count: goals.length, icon: Target },
    { id: "needs", label: "Kebutuhan Mitra", count: needs.length, icon: Search },
    { id: "constraints", label: "Ketentuan & Batasan", count: constraints.length, icon: ShieldAlert },
  ];

  return (
    <AppShell actor={actor} activeRoute="/readiness">
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        
        {/* Editorial Hero Header */}
        <section className="p-8 sm:p-10 rounded-[32px] bg-white border border-stone-200 shadow-xs relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-bold text-[#1E1B2E] shadow-2xs">
                <Sliders className="w-3.5 h-3.5 text-[#1E1B2E]" />
                Pusat Kesiapan Kolaborasi & Profil
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B2E] tracking-tight">
                Kelola Modal, Target &amp; Ketentuan Kolaborasi
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
                Empat pilar data ini digunakan oleh Opportunity Engine untuk merekomendasikan rekan kolaborator yang memiliki aset komplementer, visi yang selaras, dan jadwal operasional yang realistis bagi <strong className="text-[#1E1B2E]">{actor.name}</strong>.
              </p>
            </div>

            {/* Readiness Score Card */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-4 shrink-0">
              <div className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-stone-200 shadow-2xs">
                <span className="text-lg font-black text-[#1E1B2E]">{readinessPercent}%</span>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Skor Kesiapan Engine</div>
                <div className="text-sm font-extrabold text-[#1E1B2E] mt-0.5">
                  {readinessPercent === 100
                    ? "Profil Siap Maksimal"
                    : readinessPercent >= 50
                    ? "Cukup Siap"
                    : "Perlu Dilengkapi"}
                </div>
                <div className="text-[11px] text-stone-500">{pillarsFilled} dari 4 pilar terisi</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
            <Link
              href="/readiness?tab=assets"
              className={`p-4 rounded-2xl border transition-all ${
                activeTab === "assets"
                  ? "bg-[#1E1B2E] text-white border-[#1E1B2E]"
                  : "bg-stone-50 text-[#1E1B2E] border-stone-200 hover:bg-stone-100/80"
              }`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === "assets" ? "text-stone-300" : "text-stone-400"}`}>
                Aset Terdaftar
              </div>
              <div className="text-2xl font-black mt-1">{assets.length}</div>
            </Link>

            <Link
              href="/readiness?tab=goals"
              className={`p-4 rounded-2xl border transition-all ${
                activeTab === "goals"
                  ? "bg-[#1E1B2E] text-white border-[#1E1B2E]"
                  : "bg-stone-50 text-[#1E1B2E] border-stone-200 hover:bg-stone-100/80"
              }`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === "goals" ? "text-stone-300" : "text-stone-400"}`}>
                Target Capaian
              </div>
              <div className="text-2xl font-black mt-1">{goals.length}</div>
            </Link>

            <Link
              href="/readiness?tab=needs"
              className={`p-4 rounded-2xl border transition-all ${
                activeTab === "needs"
                  ? "bg-[#1E1B2E] text-white border-[#1E1B2E]"
                  : "bg-stone-50 text-[#1E1B2E] border-stone-200 hover:bg-stone-100/80"
              }`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === "needs" ? "text-stone-300" : "text-stone-400"}`}>
                Kebutuhan Mitra
              </div>
              <div className="text-2xl font-black mt-1">{needs.length}</div>
            </Link>

            <Link
              href="/readiness?tab=constraints"
              className={`p-4 rounded-2xl border transition-all ${
                activeTab === "constraints"
                  ? "bg-[#1E1B2E] text-white border-[#1E1B2E]"
                  : "bg-stone-50 text-[#1E1B2E] border-stone-200 hover:bg-stone-100/80"
              }`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === "constraints" ? "text-stone-300" : "text-stone-400"}`}>
                Ketentuan &amp; Batasan
              </div>
              <div className="text-2xl font-black mt-1">{constraints.length}</div>
            </Link>
          </div>
        </section>

        {params.error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <p>{params.error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-stone-200/80 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <Link
                key={tab.id}
                href={`/readiness?tab=${tab.id}`}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#1E1B2E] text-white shadow-sm"
                    : "bg-white text-stone-500 hover:text-[#1E1B2E] hover:bg-stone-50 border border-stone-200/80"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* =========================================================================
            TAB 1: ASSETS & CREATIVE RESOURCES
           ========================================================================= */}
        {activeTab === "assets" && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 animate-fade-in">
            {/* Form */}
            <div className="xl:col-span-2 space-y-4">
              {/* Notice Banner to clearly direct users looking to upload artworks */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-200/60 text-amber-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#1E1B2E]">Ingin mengunggah karya seni / foto portofolio?</span>
                    <p className="text-[11px] text-stone-600 mt-0.5">Form di bawah khusus alat &amp; sumber daya fisik pendukung.</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/showcase"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 text-[11px] font-bold hover:bg-amber-100 transition-colors shrink-0 shadow-2xs"
                >
                  <span>Kelola Portofolio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">+ Daftarkan Aset &amp; Bukti Fisik</h2>
              <div className="p-6 rounded-[28px] bg-white border border-stone-200 shadow-xs space-y-5">
                <form action={createAsset} className="space-y-4">
                  <input type="hidden" name="returnTo" value="/readiness?tab=assets" />
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Nama Aset / Peralatan *</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="misal: Sony Alpha A7R V / Lensa 85mm f/1.4 GM / Studio Cyclorama"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Kategori Aset *</label>
                    <select
                      name="category"
                      defaultValue="EQUIPMENT"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white cursor-pointer"
                    >
                      {Object.entries(READINESS_ASSET_CATEGORY_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Subtipe Peran *</label>
                    <input
                      name="subtype"
                      type="text"
                      required
                      placeholder="misal: Kamera Mirrorless, Lensa Prime Portrait, Cyclorama Studio"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white"
                    />
                  </div>

                  {/* Upload Foto Bukti Fisik Langsung */}
                  <AssetUploadField />

                  {/* Spesifikasi Teknis */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Spesifikasi Kunci (Opsional)</label>
                    <input
                      name="gearSpecs"
                      type="text"
                      placeholder="misal: 61MP Full-Frame, f/1.4 Bokeh, Daya 600Ws TTL, Luas 120m²"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white"
                    />
                  </div>

                  {/* Kondisi Fisik */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Kondisi Alat &amp; Kesiapan</label>
                    <select
                      name="condition"
                      defaultValue="Kondisi Prima (Mint 10/10) • Siap On-Set"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white cursor-pointer"
                    >
                      <option value="Kondisi Prima (Mint 10/10) • Siap On-Set">Kondisi Prima (Mint 10/10) • Siap On-Set</option>
                      <option value="Kondisi Sangat Baik (Very Good 9/10)">Kondisi Sangat Baik (Very Good 9/10)</option>
                      <option value="Fungsional Normal (Good 8/10)">Fungsional Normal (Good 8/10)</option>
                      <option value="Perlu Konfirmasi Sebelum On-Set">Perlu Konfirmasi Sebelum On-Set</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Catatan Tambahan &amp; Kapasitas</label>
                    <textarea
                      name="description"
                      rows={2}
                      placeholder="Jelaskan kondisi kelengkapan alat, fasilitas pendukung, atau keunggulan komparatif aset..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Simpan Aset &amp; Bukti Foto</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="xl:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Daftar Aset Aktif ({assets.length})</h2>
                <span className="text-xs text-stone-500 font-medium">Ditampilkan pada Profil &amp; Engine</span>
              </div>

              {assets.length === 0 ? (
                <div className="p-10 rounded-[28px] bg-white border border-dashed border-stone-300 text-center space-y-3 shadow-xs">
                  <Package className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-sm font-bold text-[#1E1B2E]">Belum Ada Aset Terdaftar</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Daftarkan peralatan kamera, lensa, studio, atau keahlian Anda beserta bukti foto agar profil Anda membuktikan kapabilitas konkret.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assets.map((asset) => {
                    const attrs = (asset.attributes && typeof asset.attributes === "object") ? (asset.attributes as Record<string, unknown>) : null;
                    
                    // Determine photo from attributes or fallback
                    let photoUrl = (attrs?.image_url as string) || (attrs?.photo_url as string) || null;
                    if (!photoUrl) {
                      if (asset.category === "EQUIPMENT" || asset.name.toLowerCase().includes("kamera") || asset.name.toLowerCase().includes("lensa")) {
                        photoUrl = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80";
                      } else if (asset.category === "STUDIO_SPACE" || asset.subtype.toLowerCase().includes("studio")) {
                        photoUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80";
                      } else if (asset.category === "WARDROBE_PROP") {
                        photoUrl = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80";
                      } else if (asset.category === "SKILL_TALENT") {
                        photoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
                      } else {
                        photoUrl = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80";
                      }
                    }

                    const gearSpecs = attrs?.gear_specs as string | undefined;
                    const condition = attrs?.condition as string | undefined;

                    return (
                      <div
                        key={asset.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all shadow-xs group flex flex-col sm:flex-row items-start gap-4"
                      >
                        {/* Visual Thumbnail */}
                        <div className="w-full sm:w-24 h-24 rounded-xl bg-stone-100 border border-stone-200 shrink-0 overflow-hidden relative">
                          <img
                            src={photoUrl}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {Boolean(attrs?.image_url) && (
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white backdrop-blur-xs">
                              Foto Asli
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-[#1E1B2E] border border-stone-200 uppercase">
                              {ASSET_CATEGORY_LABELS[asset.category] || asset.category}
                            </span>
                            <span className="text-xs font-semibold text-stone-500">· {asset.subtype}</span>
                            {condition && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {condition.split("•")[0]}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-[#1E1B2E] text-sm">{asset.name}</h3>

                          {gearSpecs && (
                            <p className="text-xs font-semibold text-blue-700 bg-blue-50/70 border border-blue-100 px-2.5 py-1 rounded-lg">
                              ⚙️ {gearSpecs}
                            </p>
                          )}

                          {asset.description && (
                            <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{asset.description}</p>
                          )}
                        </div>

                        {/* Delete Action */}
                        <form action={archiveAsset.bind(null, asset.id)} className="shrink-0 self-start sm:self-center">
                          <button
                            type="submit"
                            title="Hapus aset"
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: GOALS / COLLABORATION TARGETS
           ========================================================================= */}
        {activeTab === "goals" && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 animate-fade-in">
            {/* Form */}
            <div className="xl:col-span-2 space-y-4">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">+ Pasang Target Capaian</h2>
              <div className="p-6 rounded-[28px] bg-white border border-stone-200 shadow-xs space-y-5">
                <form action={createGoal} className="space-y-4">
                  <input type="hidden" name="returnTo" value="/readiness?tab=goals" />

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Kategori Target *</label>
                    <select
                      name="category"
                      defaultValue="PORTFOLIO_BUILDING"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white cursor-pointer"
                    >
                      {Object.entries(GOAL_LABELS).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Judul Sasaran *</label>
                    <input
                      name="title"
                      type="text"
                      required
                      placeholder="misal: Photoshoot Lookbook Ramadhan 12 Look"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Tingkat Prioritas (1-5)</label>
                    <select
                      name="priority"
                      defaultValue="4"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white cursor-pointer"
                    >
                      <option value="5">5 — Sangat Mendesak / Utama</option>
                      <option value="4">4 — Prioritas Tinggi</option>
                      <option value="3">3 — Prioritas Sedang</option>
                      <option value="2">2 — Fleksibel</option>
                      <option value="1">1 — Eksplorasi Santai</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Catatan Visi / Detail</label>
                    <textarea
                      name="description"
                      rows={2}
                      placeholder="Jelaskan output konkret yang ingin dicapai..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Simpan Target Kolaborasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="xl:col-span-3 space-y-4">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Daftar Target Kolaborasi ({goals.length})</h2>
              {goals.length === 0 ? (
                <div className="p-10 rounded-[28px] bg-white border border-dashed border-stone-300 text-center space-y-3 shadow-xs">
                  <Target className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-sm font-bold text-[#1E1B2E]">Belum Ada Target Capaian</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Pasang target capaian agar engine RAMU dapat mencocokkan Anda dengan rekan kolaborator yang memiliki visi sejalan.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const meta = GOAL_LABELS[goal.category];
                    return (
                      <div
                        key={goal.id}
                        className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all shadow-xs group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-[#1E1B2E] border border-stone-200">
                                {meta?.label || goal.category}
                              </span>
                              <span className="text-xs font-semibold text-stone-400">Prioritas {goal.priority}/5</span>
                            </div>
                            <h3 className="font-bold text-[#1E1B2E] text-sm">{goal.title}</h3>
                            {goal.description && (
                              <p className="text-xs text-stone-500 leading-relaxed">{goal.description}</p>
                            )}
                          </div>
                          <form action={deleteGoal.bind(null, goal.id)}>
                            <button
                              type="submit"
                              title="Hapus target"
                              className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: NEEDS / RESOURCE DEMANDS
           ========================================================================= */}
        {activeTab === "needs" && (
          <div className="space-y-6 animate-fade-in">
            {/* Real-World Industry Project Bridge Banner */}
            <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-amber-500/10 via-[#E66A48]/10 to-transparent border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E66A48] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E66A48]">
                    Alur Nyata Industri Kreatif
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#1E1B2E] tracking-tight">
                  Mencari Rekan untuk Sesi Pemotretan atau Proyek Tertentu?
                </h2>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Kebutuhan talenta kreatif hampir selalu terikat dengan brief proyek (misal: mencari Fotografer &amp; MUA untuk Photoshoot Lookbook). Daripada hanya mencatat kebutuhan pasif di profil, buat <strong>Open Brief di Papan Proyek</strong> agar talenta lain dapat melamar langsung dengan portofolionya.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Buat Open Brief Proyek</span>
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#1E1B2E] text-xs font-bold border border-stone-200 transition-all shadow-2xs cursor-pointer"
                >
                  <span>Jelajahi Papan Proyek</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* Form */}
              <div className="xl:col-span-2 space-y-4">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">+ Catat Kebutuhan Profil</h2>
                <div className="p-6 rounded-[28px] bg-white border border-stone-200 shadow-xs space-y-5">
                  <form action={createNeed} className="space-y-4">
                    <input type="hidden" name="returnTo" value="/readiness?tab=needs" />

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Jenis Peran / Kebutuhan *</label>
                      <select
                        name="category"
                        defaultValue="CREW_NEED"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white cursor-pointer"
                      >
                        {Object.entries(NEED_LABELS).map(([val, { label }]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Judul Kebutuhan *</label>
                      <input
                        name="title"
                        type="text"
                        required
                        placeholder="misal: Fotografer Fashion Editorial Studio"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white"
                      />
                    </div>

                    {goals.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Tautkan ke Target (Opsional)</label>
                        <select
                          name="relatedGoalId"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white cursor-pointer"
                        >
                          <option value="">— Tidak terkait target khusus —</option>
                          {goals.map((g) => (
                            <option key={g.id} value={g.id}>{g.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Kriteria &amp; Harapan Kontribusi</label>
                      <textarea
                        name="description"
                        rows={2}
                        placeholder="Sebutkan gaya visual, referensi, atau pengalaman yang diharapkan..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E] focus:bg-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Simpan Kebutuhan Profil</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* List */}
              <div className="xl:col-span-3 space-y-4">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Kebutuhan Terbuka ({needs.length})</h2>
                {needs.length === 0 ? (
                  <div className="p-10 rounded-[28px] bg-white border border-dashed border-stone-300 text-center space-y-3 shadow-xs">
                    <Search className="w-10 h-10 text-stone-400 mx-auto" />
                    <p className="text-sm font-bold text-[#1E1B2E]">Belum Ada Kebutuhan Terbuka</p>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Cantumkan keahlian atau aset yang Anda cari dari mitra untuk memicu rekomendasi kolaborasi komplementer.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {needs.map((need) => {
                      const meta = NEED_LABELS[need.category];
                      return (
                        <div
                          key={need.id}
                          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all shadow-xs group space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-[#1E1B2E] border border-stone-200">
                                  {meta?.label || need.category}
                                </span>
                                {need.relatedGoal && (
                                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    Target: {need.relatedGoal.title}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-[#1E1B2E] text-sm">{need.title}</h3>
                              {need.description && (
                                <p className="text-xs text-stone-500 leading-relaxed">{need.description}</p>
                              )}
                            </div>
                            <form action={deleteNeed.bind(null, need.id)}>
                              <button
                                type="submit"
                                title="Hapus kebutuhan"
                                className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </form>
                          </div>

                          {/* Quick Bridge to Project */}
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-stone-500">Siap rekrut untuk proyek nyata?</span>
                            <Link
                              href={`/projects/new?title=${encodeURIComponent(need.title)}`}
                              className="inline-flex items-center gap-1 font-bold text-[#E66A48] hover:underline"
                            >
                              <span>Buka Open Brief di Papan Proyek</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: CONSTRAINTS & OPERATIONAL TERMS
           ========================================================================= */}
        {activeTab === "constraints" && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 animate-fade-in">
            {/* Form */}
            <div className="xl:col-span-2 space-y-4">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">+ Pasang Preferensi &amp; Ketentuan Kerja</h2>
              <div className="p-6 rounded-[28px] bg-white border border-stone-200 shadow-xs space-y-5">
                <ConstraintPresetForm
                  action={createConstraint}
                />
              </div>
            </div>

            {/* List */}
            <div className="xl:col-span-3 space-y-4">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                Ketentuan &amp; Batasan Terdaftar ({constraints.length})
              </h2>
              {constraints.length === 0 ? (
                <div className="p-10 rounded-[28px] bg-white border border-dashed border-stone-300 text-center space-y-3 shadow-xs">
                  <ShieldAlert className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-sm font-bold text-[#1E1B2E]">Belum Ada Batasan Terdaftar</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Batasan kapasitas, jadwal, dan budget memastikan rekomendasi kolaborasi yang muncul di dashboard Anda benar-benar realistis dan sesuai jadwal kerja.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {constraints.map((c) => {
                    const meta = CONSTRAINT_LABELS[c.type] || {
                      label: c.type,
                      desc: "",
                      icon: ShieldAlert,
                    };
                    const IconComp = meta.icon;
                    const isHard = c.severity === "HARD";

                    return (
                      <div
                        key={c.id}
                        className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all shadow-xs group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3 flex-1 min-w-0">
                            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 shrink-0 mt-0.5">
                              <IconComp className="w-5 h-5 text-[#1E1B2E]" />
                            </div>
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#1E1B2E]">{meta.label}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    isHard
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : "bg-amber-50 text-amber-800 border-amber-200"
                                  }`}
                                >
                                  {isHard ? "Mutlak (Pasti)" : "Fleksibel"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 font-bold text-[#1E1B2E] text-sm">
                                <span>{typeof c.value === "object" ? JSON.stringify(c.value) : String(c.value)}</span>
                                {c.unit && <span className="text-xs text-stone-500 font-normal">{c.unit}</span>}
                              </div>
                              {c.notes && (
                                <p className="text-xs text-stone-500 leading-relaxed italic">&ldquo;{c.notes}&rdquo;</p>
                              )}
                            </div>
                          </div>

                          <form action={deleteConstraint.bind(null, c.id)}>
                            <button
                              type="submit"
                              title="Hapus batasan"
                              className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
