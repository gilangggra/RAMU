import Link from "next/link";
import {
  TrendingUp,
  Users,
  Calendar,
  Award,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  CheckCircle2,
  PackageCheck,
  Percent,
} from "lucide-react";

export interface ActivatedResourceItem {
  role: string;
  resourceName: string;
  detail: string;
  provider: string;
  badge?: string;
}

interface EconomicOutcomeSectionProps {
  completedCount?: number;
  totalParticipants?: number;
  totalEconomicValue?: string;
  resourcesActivatedCount?: number;
  productionDays?: number;
  lookbooksPublished?: number;
  costSavingsPercentage?: number;
  activatedResourcesList?: ActivatedResourceItem[];
}

const DEFAULT_ACTIVATED_RESOURCES: ActivatedResourceItem[] = [
  {
    role: "Studio",
    resourceName: "Fasilitas Studio",
    detail: "1 Shift Cyclorama Daylight (8 Jam)",
    provider: "Studio Imaji & Co.",
    badge: "Ruang Idle Terpakai",
  },
  {
    role: "Photographer",
    resourceName: "Kamera & Lighting",
    detail: "Sony A7IV + Profoto B10 Kit",
    provider: "Lensa Kreatif Studio",
    badge: "Gear Komplementer",
  },
  {
    role: "Model",
    resourceName: "Talenta Muse",
    detail: "1 Sesi Editorial Lookbook Penuh",
    provider: "Go Young Jung",
    badge: "Keahlian Terverifikasi",
  },
  {
    role: "MUA/Stylist",
    resourceName: "MUA & Styling Kit",
    detail: "Make Up For Ever Kit + On-Set Styling",
    provider: "Glow & Form Artistry",
    badge: "Skill & Properti",
  },
  {
    role: "Designer",
    resourceName: "Koleksi Busana",
    detail: "15 Set Ready-to-Wear Contemporary",
    provider: "Atelier Nara",
    badge: "Karya Desain",
  },
  {
    role: "Brand/UMKM",
    resourceName: "Material & Anggaran",
    detail: "50 kg Linen Deadstock + Dana Produksi",
    provider: "Nala The Label",
    badge: "Pemberi Modal/Brand",
  },
];

export function EconomicOutcomeSection({
  completedCount = 3,
  totalParticipants = 6,
  totalEconomicValue = "Rp 10.300.000",
  resourcesActivatedCount = 8,
  productionDays = 4,
  lookbooksPublished = 15,
  costSavingsPercentage = 45,
  activatedResourcesList = DEFAULT_ACTIVATED_RESOURCES,
}: EconomicOutcomeSectionProps) {
  return (
    <div className="p-5 md:p-7 rounded-2xl bg-white text-stone-900 border border-stone-200/90 shadow-2xs space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
              Core 6 • Collaboration Outcome &amp; Economic Impact
            </span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight mt-1">
            Dampak Ekonomi Kolaboratif (Economic Outcome)
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xl font-normal mt-0.5">
            Transparansi perputaran ekonomi kreatif, optimalisasi kapasitas menganggur (idle resources), dan efisiensi biaya nyata yang teraktivasi melalui ekosistem RAMU.
          </p>
        </div>

        <Link
          href="/collaborations"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-colors shrink-0 shadow-2xs"
        >
          <span>Buka Ruang Proyek</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
        </Link>
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Project Value */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Total Nilai Proyek</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
            {totalEconomicValue}
          </div>
          <div className="text-[10px] text-stone-500">
            Transaksi &amp; Alokasi Bagi Hasil
          </div>
        </div>

        {/* Metric 2: Activated Resources */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <PackageCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Resource Teraktivasi</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {resourcesActivatedCount} Aset
          </div>
          <div className="text-[10px] text-stone-500">
            {totalParticipants} Pihak ({completedCount} Proyek Selesai)
          </div>
        </div>

        {/* Metric 3: Cost Efficiency */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <Percent className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Efisiensi Pengadaan</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-700 tracking-tight">
            Hingga {costSavingsPercentage}%
          </div>
          <div className="text-[10px] text-stone-500">
            Tanpa Beli/Sewa Terpisah
          </div>
        </div>

        {/* Metric 4: Deliverables Published */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <Award className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Karya Terbit Bersama</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-700 tracking-tight">
            {lookbooksPublished} Lookbook
          </div>
          <div className="text-[10px] text-stone-500">
            Hak Cipta &amp; SPK Terlindungi
          </div>
        </div>
      </div>

      {/* ACTIVATED RESOURCES BREAKDOWN (6 ROLES OF ECOSYSTEM) */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-white to-stone-50/60 border border-stone-200/80 space-y-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-2 font-bold text-stone-800 uppercase tracking-wider text-[11px]">
            <Layers className="w-3.5 h-3.5 text-stone-700" />
            <span>Aset Menganggur yang Berhasil Teraktivasi (Ekosistem 6 Peran):</span>
          </div>
          <span className="text-stone-500 text-[11px]">
            Terverifikasi Melalui SPK Multi-Pihak
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {activatedResourcesList.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white border border-stone-200/80 hover:border-stone-300 transition-colors shadow-2xs space-y-1.5 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {item.role}
                  </span>
                  {item.badge && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/70">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="font-bold text-stone-900 text-xs">
                  {item.resourceName}
                </div>
                <div className="text-[11px] text-stone-600 leading-snug">
                  {item.detail}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                <span className="truncate font-medium">{item.provider}</span>
                <span className="text-emerald-700 font-bold shrink-0">✓ Aktif</span>
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY COLLABORATIVE ECONOMY STATEMENT */}
        <div className="pt-3 border-t border-stone-200/60 flex items-center gap-2 text-stone-600 text-xs leading-relaxed">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Prinsip Ekonomi Kolaboratif RAMU:</strong> Pelaku usaha kreatif tidak perlu memiliki seluruh inventaris modal secara individual. Menggabungkan kapasitas menganggur (idle capacity) dari mitra terverifikasi menghemat hingga 45% anggaran produksi dan membuka perputaran pendapatan bersama.
          </span>
        </div>
      </div>
    </div>
  );
}
