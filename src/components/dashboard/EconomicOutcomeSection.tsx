import Link from "next/link";
import {
  TrendingUp,
  Award,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Sparkles,
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

export function EconomicOutcomeSection({
  completedCount = 0,
  totalParticipants = 0,
  totalEconomicValue = "Rp 0",
  resourcesActivatedCount = 0,
  lookbooksPublished = 0,
  activatedResourcesList = [],
}: EconomicOutcomeSectionProps) {
  const hasOutcomes = completedCount > 0;

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0284c7]" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Ringkasan Finansial &amp; Dampak Kolaborasi
            </h2>
            <span className="text-[10px] font-bold text-[#0284c7] bg-[#4CC9FE]/15 px-2.5 py-0.5 rounded-full border border-[#4CC9FE]/30">
              {hasOutcomes ? "Terverifikasi SPK" : "Akumulasi Otomatis"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl font-normal">
            Pencatatan nilai ekonomi proyek, keterlibatan aset bersama, dan luaran karya yang terwujud di Workspace.
          </p>
        </div>

        <Link
          href="/collaborations"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#4CC9FE]/10 hover:text-[#0284c7] text-slate-700 text-xs font-semibold border border-slate-200 hover:border-[#4CC9FE]/30 transition-all shrink-0 shadow-2xs"
        >
          <span>Workspace Proyek</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Project Value */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>Total Nilai Proyek</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight tabular-nums">
            {totalEconomicValue}
          </div>
          <div className="text-xs text-slate-500">
            {hasOutcomes ? "Hasil verifikasi SPK tim" : "Belum ada proyek selesai"}
          </div>
        </div>

        {/* Metric 2: Completed Collaborations */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <PackageCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>Proyek Selesai</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight tabular-nums">
            {completedCount} Proyek
          </div>
          <div className="text-xs text-slate-500">
            {totalParticipants > 0 ? `${totalParticipants} mitra terlibat` : "Workspace aktif"}
          </div>
        </div>

        {/* Metric 3: Partner Reach / Collaboration */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
            <span>Kepastian SPK</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight tabular-nums">
            100% Digital
          </div>
          <div className="text-xs text-slate-500">
            Perjanjian resmi terikat
          </div>
        </div>

        {/* Metric 4: Deliverables Published */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Award className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>Karya Terbit Bersama</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight tabular-nums">
            {lookbooksPublished > 0 ? `${lookbooksPublished} Karya` : `${completedCount} Karya`}
          </div>
          <div className="text-xs text-slate-500">
            {hasOutcomes ? "Hak cipta terdaftar" : "Selesai di Workspace"}
          </div>
        </div>
      </div>

      {/* DYNAMIC OR EMPTY STATE BREAKDOWN */}
      {!hasOutcomes ? (
        <div className="p-4 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 max-w-md mx-auto">
            <h4 className="text-xs font-semibold text-slate-900">
              Pencatatan Nilai Ekonomi Terbuka Otomatis
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Setelah kesepakatan kolaborasi atau pesanan booking diselesaikan melalui Workspace, riwayat nilai proyek, efisiensi resource bersama, dan portofolio co-credit akan langsung tercatat di sini.
            </p>
          </div>
          <div className="pt-1">
            <Link
              href="/collaborations"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4CC9FE] hover:bg-[#38bbf5] text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>Buka Workspace Proyek</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </Link>
          </div>
        </div>
      ) : (
        activatedResourcesList.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Sumber Daya yang Diaktifkan Bersama</span>
              <span className="text-slate-400 text-xs font-normal">Terhubung via SPK Digital</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {activatedResourcesList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {item.role}
                    </span>
                    <div className="font-semibold text-slate-900 text-xs">
                      {item.resourceName}
                    </div>
                    <div className="text-xs text-slate-500 leading-snug">
                      {item.detail}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate font-medium text-slate-600">{item.provider}</span>
                    <span className="text-slate-700 font-medium shrink-0">Tersedia</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
