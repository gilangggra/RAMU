import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getGlobalLearningSignals } from "@/application/outcomeService";
import { AppShell } from "@/components/layout/AppShell";
import {
  Package,
  Megaphone,
  Handshake,
  Globe,
  CircleDollarSign,
  TrendingUp,
  Palette,
  Sparkles,
  BarChart3,
  Star,
  Trophy,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

export default async function EngineInsightsPage() {
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

  const signals = await getGlobalLearningSignals();

  const outcomeTypeLabels: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
    PRODUCT: { label: "Produk Fisik / Digital", icon: <Package className="w-3.5 h-3.5" />, badge: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    CAMPAIGN: { label: "Kampanye / Pameran", icon: <Megaphone className="w-3.5 h-3.5" />, badge: "bg-purple-50 text-purple-800 border-purple-200" },
    SERVICE: { label: "Layanan Kolaboratif", icon: <Handshake className="w-3.5 h-3.5" />, badge: "bg-blue-50 text-blue-800 border-blue-200" },
    MARKET_ACCESS: { label: "Akses Pasar / Ritel", icon: <Globe className="w-3.5 h-3.5" />, badge: "bg-teal-50 text-teal-800 border-teal-200" },
    REVENUE: { label: "Realisasi Omzet", icon: <CircleDollarSign className="w-3.5 h-3.5" />, badge: "bg-amber-50 text-amber-800 border-amber-200" },
    AUDIENCE_GROWTH: { label: "Pertumbuhan Audiens", icon: <TrendingUp className="w-3.5 h-3.5" />, badge: "bg-rose-50 text-rose-800 border-rose-200" },
    CREATIVE_ASSET: { label: "Aset Kreatif / HKI", icon: <Palette className="w-3.5 h-3.5" />, badge: "bg-indigo-50 text-indigo-800 border-indigo-200" },
    OTHER: { label: "Luaran Lainnya", icon: <Sparkles className="w-3.5 h-3.5" />, badge: "bg-stone-100 text-stone-700 border-stone-200" },
  };

  return (
    <AppShell actor={actor} activeRoute="/engine-insights">
      <div className="space-y-10 max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="p-8 sm:p-10 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E66A48]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 max-w-3xl relative z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#E66A48] border border-[#F9D8C4] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E66A48] animate-pulse" />
                Phase 5: Closed-Loop Learning Flywheel
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Data Nyata & Transparan (No Fake Precision)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#27213D] tracking-tight leading-tight">
              Sinyal Pembelajaran Engine & Validasi Luaran Ekosistem
            </h1>
            <p className="text-sm text-[#716B7E] leading-relaxed">
              Selamat datang di pusat pemantauan efektivitas Creative Opportunity Engine. Phase 5 menutup siklus penuh produk dari analisis komplementaritas deterministik hingga pembuktian realisasi luaran nyata dan kalibrasi umpan balik dari pelaku ekonomi kreatif.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 relative z-10">
            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <span className="text-[11px] text-[#716B7E] uppercase font-bold tracking-wider block">Peluang Diramu</span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {signals.conversionFunnel.opportunities}
              </div>
              <span className="text-[10px] text-[#716B7E]">Rekomendasi 12-tahap</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <span className="text-[11px] text-[#716B7E] uppercase font-bold tracking-wider block">Kolaborasi Terbentuk</span>
              <div className="text-2xl font-black text-purple-600 mt-1">
                {signals.conversionFunnel.collaborations}
              </div>
              <span className="text-[10px] text-[#716B7E]">
                Konversi {signals.conversionFunnel.conversionRate}% dari peluang
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <span className="text-[11px] text-[#716B7E] uppercase font-bold tracking-wider block">Proyek Selesai</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {signals.conversionFunnel.completedCollaborations}
              </div>
              <span className="text-[10px] text-[#716B7E]">
                Rasio tuntas {signals.conversionFunnel.completionRate}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <span className="text-[11px] text-[#716B7E] uppercase font-bold tracking-wider block">Luaran Terverifikasi</span>
              <div className="text-2xl font-black text-teal-600 mt-1">
                {signals.conversionFunnel.outcomesAchieved}
              </div>
              <span className="text-[10px] text-[#716B7E]">
                {signals.ecosystemMetrics.totalUnitsProduced > 0
                  ? `${signals.ecosystemMetrics.totalUnitsProduced} unit fisik`
                  : "Hasil riil tercatat"}
              </span>
            </div>
          </div>
        </section>

        {/* 4-Dimension Satisfaction Ratings */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#27213D] tracking-tight flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-current" />
                <span>Evaluasi Kepuasan 4-Dimensi Pelaku Kreatif</span>
              </h2>
              <p className="text-xs text-[#716B7E]">
                Rata-rata ulasan nyata dari kolaborator yang mengeksekusi rekomendasi engine.
              </p>
            </div>
            <div className="text-xs font-bold text-[#716B7E] bg-stone-100 px-3.5 py-1 rounded-full border border-stone-200">
              Total {signals.averageScores.count} Ulasan Terkumpul
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#716B7E]">Relevansi Peluang</span>
                <span className="text-amber-800 font-black text-xs">
                  {signals.averageScores.relevance > 0 ? `${signals.averageScores.relevance} / 5.0` : "N/A"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(signals.averageScores.relevance / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-[#716B7E] leading-relaxed">
                Kecocokan visi brand dan segmentasi pasar antar mitra.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#716B7E]">Kelayakan Eksekusi</span>
                <span className="text-emerald-800 font-black text-xs">
                  {signals.averageScores.feasibility > 0 ? `${signals.averageScores.feasibility} / 5.0` : "N/A"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${(signals.averageScores.feasibility / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-[#716B7E] leading-relaxed">
                Kemudahan pembagian peran dan kepatuhan terhadap batasan kapasitas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#716B7E]">Kebaruan Solusi</span>
                <span className="text-purple-800 font-black text-xs">
                  {signals.averageScores.novelty > 0 ? `${signals.averageScores.novelty} / 5.0` : "N/A"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${(signals.averageScores.novelty / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-[#716B7E] leading-relaxed">
                Orisinalitas ide produk kolaborasi yang belum terpikirkan sebelumnya.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#716B7E]">Kemanfaatan Nyata</span>
                <span className="text-teal-800 font-black text-xs">
                  {signals.averageScores.usefulness > 0 ? `${signals.averageScores.usefulness} / 5.0` : "N/A"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${(signals.averageScores.usefulness / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-[#716B7E] leading-relaxed">
                Pertumbuhan bisnis, perluasan portofolio, dan nilai komersial nyata.
              </p>
            </div>
          </div>
        </section>

        {/* Pattern Performance Table */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#27213D] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <span>Matriks Efektivitas Pola Kolaborasi (Pattern Performance)</span>
            </h2>
            <p className="text-xs text-[#716B7E]">
              Evaluasi kinerja 6 pola kolaborasi utama berdasarkan jumlah luaran riil dan kepuasan aktor.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-stone-200/80 bg-white/95 shadow-[0_10px_30px_rgba(39,33,61,0.03)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 text-[#716B7E] uppercase text-[10px] tracking-wider border-b border-stone-200/70">
                <tr>
                  <th className="p-4 font-bold">Kode & Nama Pola</th>
                  <th className="p-4 font-bold">Kategori Subsektor</th>
                  <th className="p-4 text-center font-bold">Luaran Riil</th>
                  <th className="p-4 text-center font-bold">Jumlah Ulasan</th>
                  <th className="p-4 text-right font-bold">Skor Kepuasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {signals.patternPerformance.map((item) => (
                  <tr key={item.code} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#27213D] text-sm">{item.name}</div>
                      <div className="text-[11px] text-[#716B7E] font-mono">{item.code}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-[#27213D] border border-stone-200">
                        {item.category || "Cross-Sector"}
                      </span>
                    </td>
                    <td className="p-4 text-center font-black text-teal-700">
                      {item.outcomeCount > 0 ? `${item.outcomeCount} Hasil` : "0"}
                    </td>
                    <td className="p-4 text-center text-[#716B7E] font-medium">
                      {item.feedbackCount > 0 ? `${item.feedbackCount} feedback` : "-"}
                    </td>
                    <td className="p-4 text-right">
                      {item.averageSatisfaction > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <span>{item.averageSatisfaction} / 5.0</span>
                          <Star className="w-3 h-3 fill-current" />
                        </span>
                      ) : (
                        <span className="text-[#9E98A8]">Belum diulas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Outcomes Portfolio */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#27213D] tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Portofolio Luaran Kolaborasi Terkini</span>
              </h2>
              <p className="text-xs text-[#716B7E]">
                Hasil nyata yang telah direalisasikan oleh jejaring pelaku ekonomi kreatif di platform RAMU.
              </p>
            </div>
            <Link
              href="/collaborations"
              className="text-xs font-bold text-[#E66A48] hover:underline inline-flex items-center gap-1.5"
            >
              <span>Lihat Ruang Kolaborasi Anda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {signals.recentOutcomes.length === 0 ? (
            <div className="p-10 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-stone-400" />
                </div>
              </div>
              <h4 className="text-sm font-bold text-[#27213D]">Belum Ada Luaran Ekosistem yang Dicatat</h4>
              <p className="text-xs text-[#716B7E] max-w-md mx-auto">
                Buka ruang kerja kolaborasi aktif Anda dan catat luaran pertama melalui tab &quot;Luaran & Evaluasi&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.recentOutcomes.map((item: any) => {
                const typeInfo = outcomeTypeLabels[item.outcomeType] || outcomeTypeLabels.OTHER;
                const metrics = (item.metrics as any) || {};

                return (
                  <div
                    key={item.id}
                    className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${typeInfo.badge}`}>
                        <span>{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </span>
                      <span className="text-[11px] text-[#716B7E]">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-[#27213D]">{item.title}</h4>
                      <p className="text-xs text-[#716B7E] leading-relaxed">{item.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                        <span className="text-[10px] text-[#716B7E] uppercase font-bold block">Unit Produksi</span>
                        <span className="font-bold text-[#27213D] mt-0.5 block">
                          {metrics.unitsProduced ? `${metrics.unitsProduced} Unit` : "Belum dicatat"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                        <span className="text-[10px] text-[#716B7E] uppercase font-bold block">Nilai Finansial</span>
                        <span className="font-bold text-amber-800 mt-0.5 block">
                          {metrics.revenueAmount || "Belum dicatat"}
                        </span>
                      </div>
                    </div>

                    {item.collaboration && (
                      <div className="text-[11px] text-[#716B7E] pt-2 flex items-center justify-between border-t border-stone-100">
                        <span>Proyek: <strong className="text-[#27213D]">{item.collaboration.title}</strong></span>
                        <Link
                          href={`/collaborations/${item.collaboration.id}`}
                          className="text-[#E66A48] hover:underline font-bold inline-flex items-center gap-1"
                        >
                          <span>Buka Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* How Flywheel Works */}
        <section className="p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] space-y-4">
          <h2 className="text-base font-bold text-[#27213D] tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <span>Bagaimana Flywheel Pembelajaran Deterministik Bekerja?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-2">
              <div className="font-bold text-[#27213D]">1. Transparan & Terlacak</div>
              <p className="text-[#716B7E] leading-relaxed">
                Setiap luaran dan feedback disimpan dengan audit trail lengkap. Data tidak diubah oleh black-box realtime untuk menjaga stabilitas pipeline deterministik.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-2">
              <div className="font-bold text-[#27213D]">2. Validasi Lapangan</div>
              <p className="text-[#716B7E] leading-relaxed">
                Umpan balik 4-dimensi (Relevansi, Kelayakan, Kebaruan, Manfaat) membuktikan apakah kombinasi aset berhasil dieksekusi oleh pelaku kreatif nyata.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-2">
              <div className="font-bold text-[#27213D]">3. Kalibrasi Versi Engine</div>
              <p className="text-[#716B7E] leading-relaxed">
                Data feedback diagregasi menjadi dataset validasi untuk mengalibrasi bobot 6D scoring dan melahirkan versi engine baru yang semakin presisi.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
